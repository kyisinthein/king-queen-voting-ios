create or replace function public.get_admin_full_results_secure(univ_id uuid, plain_password text)
returns table (
  university_id uuid,
  category_id uuid,
  gender text,
  type text,
  candidate_id uuid,
  waist_number int,
  name text,
  votes int
)
language sql
security definer
set search_path = public, extensions
as $$
  -- Verify admin password for the requested university
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  )
  select afr.university_id, afr.category_id, afr.gender, afr.type, afr.candidate_id, afr.waist_number, afr.name, afr.votes
  from public.admin_full_results afr,
       ok
  where ok.pass_ok = true
    and afr.university_id = univ_id;
$$;

-- Allow client to call this RPC (it validates password internally)
revoke all on function public.get_admin_full_results_secure(uuid, text) from public;
grant execute on function public.get_admin_full_results_secure(uuid, text) to anon, authenticated;

-- List categories for a university (secure by password)
create or replace function public.admin_list_categories_secure(univ_id uuid, plain_password text)
returns table (
  id uuid,
  university_id uuid,
  gender text,
  type text,
  is_active boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  )
  select c.id, c.university_id, c.gender, c.type, c.is_active, c.created_at
  from public.categories c, ok
  where ok.pass_ok = true
    and c.university_id = univ_id
  order by c.gender, c.type;
$$;

revoke all on function public.admin_list_categories_secure(uuid, text) from public;
grant execute on function public.admin_list_categories_secure(uuid, text) to anon, authenticated;

-- Upsert category (create or update) securely
create or replace function public.admin_upsert_category_secure(
  univ_id uuid,
  plain_password text,
  category_id uuid,
  gender_in text,
  type_in text,
  is_active_in boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $func$
declare
  pass_ok boolean;
  normalized_gender text;
  normalized_type text;
  existing_id uuid;
  new_id uuid;
begin
  select coalesce((
    select a.password_hash = extensions.crypt(plain_password, a.password_hash)
    from public.admins a
    where a.university_id = univ_id
    limit 1
  ), false) into pass_ok;

  if not pass_ok then
    raise exception 'Unauthorized';
  end if;

  normalized_gender := lower(coalesce(gender_in, ''));
  normalized_type := lower(coalesce(type_in, ''));

  if normalized_gender not in ('male','female') then
    raise exception 'Invalid gender: %', gender_in;
  end if;

  if normalized_type not in ('king','style','popular','innocent') then
    raise exception 'Invalid type: %', type_in;
  end if;

  if category_id is null then
    -- Try to find existing category for (university, gender, type)
    select id into existing_id
    from public.categories
    where university_id = univ_id
      and gender = normalized_gender
      and type = normalized_type
    limit 1;

    if existing_id is null then
      insert into public.categories (university_id, gender, type, is_active)
      values (univ_id, normalized_gender, normalized_type, coalesce(is_active_in, true))
      returning id into new_id;
      return new_id;
    else
      update public.categories
        set is_active = coalesce(is_active_in, true)
      where id = existing_id;
      return existing_id;
    end if;
  else
    update public.categories
      set gender = normalized_gender,
          type = normalized_type,
          is_active = coalesce(is_active_in, true)
    where id = category_id
      and university_id = univ_id;
    return category_id;
  end if;
end;
$func$;

revoke all on function public.admin_upsert_category_secure(uuid, text, uuid, text, text, boolean) from public;
grant execute on function public.admin_upsert_category_secure(uuid, text, uuid, text, text, boolean) to anon, authenticated;

-- Delete category (restricted to same university)
create or replace function public.admin_delete_category_secure(univ_id uuid, plain_password text, category_id uuid)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  ),
  del as (
    delete from public.categories c
    using ok
    where ok.pass_ok = true
      and c.id = category_id
      and c.university_id = univ_id
    returning 1
  )
  select exists(select 1 from del);
$$;

revoke all on function public.admin_delete_category_secure(uuid, text, uuid) from public;
grant execute on function public.admin_delete_category_secure(uuid, text, uuid) to anon, authenticated;

-- List candidates for a university (secure by password)
create or replace function public.admin_list_candidates_secure(univ_id uuid, plain_password text)
returns table (
  id uuid,
  university_id uuid,
  gender text,
  waist_number int,
  name text,
  birthday date,
  height_cm int,
  hobby text,
  image_url text,
  is_active boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  )
  select c.id, c.university_id, c.gender, c.waist_number, c.name, c.birthday, c.height_cm, c.hobby, c.image_url, c.is_active, c.created_at
  from public.candidates c, ok
  where ok.pass_ok = true
    and c.university_id = univ_id
  order by lower(c.gender), c.waist_number;
$$;

revoke all on function public.admin_list_candidates_secure(uuid, text) from public;
grant execute on function public.admin_list_candidates_secure(uuid, text) to anon, authenticated;

-- Upsert candidate (insert if candidate_id is null, else update)
create or replace function public.admin_upsert_candidate_secure(
  univ_id uuid,
  plain_password text,
  candidate_id uuid,
  gender_in text,
  waist_number_in int,
  name_in text,
  birthday_in date,
  height_cm_in int,
  hobby_in text,
  image_url_in text,
  is_active_in boolean
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $func$
declare
  pass_ok boolean;
  normalized_gender text := lower(gender_in);
  new_id uuid;
begin
  select coalesce((
    select a.password_hash = extensions.crypt(plain_password, a.password_hash)
    from public.admins a
    where a.university_id = univ_id
    limit 1
  ), false) into pass_ok;

  if not pass_ok then
    raise exception 'Unauthorized';
  end if;

  if normalized_gender not in ('male','female') then
    raise exception 'Invalid gender: %', gender_in;
  end if;

  if candidate_id is null then
    insert into public.candidates (university_id, gender, waist_number, name, birthday, height_cm, hobby, image_url, is_active)
    values (univ_id, normalized_gender, waist_number_in, name_in, birthday_in, height_cm_in, hobby_in, image_url_in, coalesce(is_active_in, true))
    returning id into new_id;
    return new_id;
  else
    update public.candidates
      set gender = normalized_gender,
          waist_number = waist_number_in,
          name = name_in,
          birthday = birthday_in,
          height_cm = height_cm_in,
          hobby = hobby_in,
          image_url = image_url_in,
          is_active = coalesce(is_active_in, true)
    where id = candidate_id
      and university_id = univ_id;
    return candidate_id;
  end if;
end;
$func$;

revoke all on function public.admin_upsert_candidate_secure(uuid, text, uuid, text, int, text, date, int, text, text, boolean) from public;
grant execute on function public.admin_upsert_candidate_secure(uuid, text, uuid, text, int, text, date, int, text, text, boolean) to anon, authenticated;

-- Delete candidate (restricted to same university)
create or replace function public.admin_delete_candidate_secure(univ_id uuid, plain_password text, candidate_id uuid)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  ),
  del as (
    delete from public.candidates c
    using ok
    where ok.pass_ok = true
      and c.id = candidate_id
      and c.university_id = univ_id
    returning 1
  )
  select exists(select 1 from del);
$$;

revoke all on function public.admin_delete_candidate_secure(uuid, text, uuid) from public;
grant execute on function public.admin_delete_candidate_secure(uuid, text, uuid) to anon, authenticated;

-- Export raw votes joined with candidate and category info (secure)
create or replace function public.admin_export_votes_secure(univ_id uuid, plain_password text)
returns table (
  vote_id uuid,
  university_id uuid,
  device_id text,
  category_id uuid,
  category_gender text,
  category_type text,
  candidate_id uuid,
  candidate_name text,
  candidate_gender text,
  waist_number int
)
language sql
security definer
set search_path = public, extensions
as $$
  with ok as (
    select coalesce((
      select a.password_hash = extensions.crypt(plain_password, a.password_hash)
      from public.admins a
      where a.university_id = univ_id
      limit 1
    ), false) as pass_ok
  )
  select
    v.id as vote_id,
    v.university_id,
    v.device_id,
    v.category_id,
    cat.gender as category_gender,
    cat.type as category_type,
    v.candidate_id,
    cand.name as candidate_name,
    cand.gender as candidate_gender,
    cand.waist_number
  from public.votes v
  join public.categories cat on cat.id = v.category_id
  join public.candidates cand on cand.id = v.candidate_id,
  ok
  where ok.pass_ok = true
    and cat.university_id = univ_id
    and cand.university_id = univ_id
;
$$;

revoke all on function public.admin_export_votes_secure(uuid, text) from public;
grant execute on function public.admin_export_votes_secure(uuid, text) to anon, authenticated;
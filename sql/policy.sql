-- Enable Row Level Security
alter table public.universities enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;

-- Universities: public read active
drop policy if exists "public read active universities" on public.universities;
create policy "public read active universities"
on public.universities for select
to anon, authenticated
using (is_active = true);

-- Admins: no direct reads/writes from public
drop policy if exists "no direct select for admins" on public.admins;
create policy "no direct select for admins"
on public.admins for select
to anon, authenticated
using (false);

drop policy if exists "no direct insert/update/delete for admins" on public.admins;
create policy "no direct insert/update/delete for admins"
on public.admins for all
to anon, authenticated
using (false)
with check (false);

-- Categories: public read active
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);

-- Candidates: public read active
drop policy if exists "public read active candidates" on public.candidates;
create policy "public read active candidates"
on public.candidates for select
to anon, authenticated
using (is_active = true);

-- Votes: block select/update/delete from public
drop policy if exists "no public select votes" on public.votes;
create policy "no public select votes"
on public.votes for select
to anon, authenticated
using (false);

drop policy if exists "no update delete votes" on public.votes;
create policy "no update delete votes"
on public.votes for update
to anon, authenticated
using (false)
with check (false);

drop policy if exists "no delete votes" on public.votes;
create policy "no delete votes"
on public.votes for delete
to anon, authenticated
using (false);

-- Votes: allow insert only when scope is consistent and category/candidate are active and gender-matched
drop policy if exists "insert vote within scope" on public.votes;
create policy "insert vote within scope"
on public.votes for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.categories c
    where c.id = category_id
      and c.university_id = university_id
      and c.is_active = true
  )
  and exists (
    select 1
    from public.candidates cand
    where cand.id = candidate_id
      and cand.university_id = university_id
      and cand.is_active = true
  )
  and exists (
    select 1
    from public.categories c2
    join public.candidates cand2 on cand2.id = candidate_id
    where c2.id = category_id
      and lower(c2.gender) = lower(cand2.gender)
  )
);

-- Helper RPC: per-device ticket usage by gender for a university
-- (Used by client before inserting a vote; security definer to bypass RLS safely)
drop function if exists public.get_device_ticket_usage(uuid, text);

create or replace function public.get_device_ticket_usage(univ_id uuid, p_device_id text)
returns table (
  university_id uuid,
  gender text,
  total_categories int,
  used_tickets int,
  remaining_tickets int
)
language sql
security definer
set search_path = public, extensions
as $$
  with categories_per_gender as (
    select c.university_id, lower(c.gender) as gender, count(*)::int as total_categories
    from public.categories c
    where c.university_id = univ_id
      and c.is_active = true
    group by c.university_id, lower(c.gender)
  ),
  used as (
    select lower(c.gender) as gender, count(distinct v.category_id)::int as used_tickets
    from public.votes v
    join public.categories c on c.id = v.category_id
    where v.university_id = univ_id
      and v.device_id = p_device_id
    group by lower(c.gender)
  )
  select
    univ_id as university_id,
    cpg.gender,
    cpg.total_categories,
    coalesce(u.used_tickets, 0) as used_tickets,
    greatest(cpg.total_categories - coalesce(u.used_tickets, 0), 0) as remaining_tickets
  from categories_per_gender cpg
  left join used u on u.gender = cpg.gender;
$$;

revoke all on function public.get_device_ticket_usage(uuid, text) from public;
grant execute on function public.get_device_ticket_usage(uuid, text) to anon, authenticated;
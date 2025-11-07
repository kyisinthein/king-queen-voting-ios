-- Extensions used (bcrypt for admin password hashing)
create extension if not exists pgcrypto with schema extensions;

-- Universities: selectable list with active flag and optional voting window
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text generated always as (regexp_replace(lower(name), '\s+', '-', 'g')) stored,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  voting_start_at timestamptz,
  voting_end_at timestamptz
);

create index if not exists universities_window_idx on public.universities (voting_start_at, voting_end_at);

-- Admins: one admin per university with hashed password
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now(),
  unique (university_id)
);

create index if not exists admins_university_idx on public.admins (university_id);

-- Categories: (university, gender, type) tuples, active/inactive
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  gender text not null check (lower(gender) in ('male','female')),
  type text not null check (lower(type) in ('king','style','popular','innocent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (university_id, gender, type)
);

create index if not exists categories_university_idx on public.categories (university_id);

-- Candidates: master data per university+gender
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  gender text not null check (lower(gender) in ('male','female')),
  waist_number int not null,
  name text not null,
  birthday date,
  height_cm int,
  hobby text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (university_id, gender, waist_number)
);

create index if not exists candidates_university_idx on public.candidates (university_id);
create index if not exists candidates_gender_idx on public.candidates (gender);

-- Votes: one vote per device per category; immutable after insert
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (device_id, category_id)
);

create index if not exists votes_university_idx on public.votes (university_id);
create index if not exists votes_category_idx on public.votes (category_id);
create index if not exists votes_candidate_idx on public.votes (candidate_id);
create index if not exists votes_device_idx on public.votes (device_id);

-- Aggregated results per category/candidate
create or replace view public.category_results as
select
  v.category_id,
  v.candidate_id,
  count(*)::int as votes
from public.votes v
group by v.category_id, v.candidate_id;

-- Public top per category: single winner for each category_id
create or replace view public.public_top_results as
with ranked as (
  select
    cr.category_id,
    cr.candidate_id,
    cr.votes,
    row_number() over (partition by cr.category_id order by cr.votes desc, cr.candidate_id) as rn
  from public.category_results cr
)
select
  r.category_id,
  r.candidate_id,
  r.votes
from ranked r
where r.rn = 1;

-- Admin full results view (joined with candidate and category context)
create or replace view public.admin_full_results as
select
  cat.university_id,
  cat.id as category_id,
  cat.gender,
  cat.type,
  cand.id as candidate_id,
  cand.waist_number,
  cand.name,
  cr.votes
from public.category_results cr
join public.candidates cand on cand.id = cr.candidate_id
join public.categories cat on cat.id = cr.category_id
join public.universities u on u.id = cat.university_id;

-- Grants: public can read top results; aggregated can be limited if desired
grant select on public.public_top_results to anon, authenticated;
grant select on public.category_results to authenticated;
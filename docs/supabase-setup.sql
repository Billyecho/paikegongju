create extension if not exists "pgcrypto";

create table if not exists public.students (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  grade text not null,
  phone text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists students_user_id_idx on public.students (user_id);

create table if not exists public.courses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  subject text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text not null default '',
  status text not null default 'scheduled',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists courses_user_id_idx on public.courses (user_id);
create index if not exists courses_start_time_idx on public.courses (start_time);

alter table public.students enable row level security;
alter table public.courses enable row level security;

drop policy if exists "students_select_own" on public.students;
create policy "students_select_own"
on public.students
for select
using (auth.uid() = user_id);

drop policy if exists "students_insert_own" on public.students;
create policy "students_insert_own"
on public.students
for insert
with check (auth.uid() = user_id);

drop policy if exists "students_update_own" on public.students;
create policy "students_update_own"
on public.students
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
on public.students
for delete
using (auth.uid() = user_id);

drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own"
on public.courses
for select
using (auth.uid() = user_id);

drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own"
on public.courses
for insert
with check (auth.uid() = user_id);

drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own"
on public.courses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own"
on public.courses
for delete
using (auth.uid() = user_id);

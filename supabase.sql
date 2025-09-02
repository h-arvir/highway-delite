-- Run this in Supabase SQL Editor
-- Notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.notes enable row level security;

-- Policies: users can manage only their notes
create policy if not exists "Notes are visible to owners" on public.notes
  for select using (auth.uid() = user_id);

create policy if not exists "Owners can insert their notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy if not exists "Owners can delete their notes" on public.notes
  for delete using (auth.uid() = user_id);

-- (Optional) allow updates by owners
create policy if not exists "Owners can update their notes" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
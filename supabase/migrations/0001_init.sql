-- Portfolio backend for Supabase (Postgres).
-- Run in: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------

-- Only YOU can edit content. Change the email if you ever use another one.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'xdjohnnysumulong12@gmail.com'
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ---------------------------------------------------------------
-- Tables (from your Excel sheet)
-- ---------------------------------------------------------------

create table public.about (
  id             bigint generated always as identity primary key,
  name           text not null,
  description    text not null,
  looking_for    text,
  location       text,
  studying_since integer,            -- year, e.g. 2023
  image          text,               -- path inside the "portfolio" bucket
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.education (
  id           bigint generated always as identity primary key,
  type         text not null check (type in ('degree', 'certificate')),
  title        text not null,
  organization text,
  description  text,
  year         text,                 -- text so "2023 - Present" works
  image        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.projects (
  id          bigint generated always as identity primary key,
  title       text not null,
  short_name  text,
  type        text not null check (type in ('main', 'side')),
  role        text,
  client      text,
  start_date  date,
  end_date    date,                  -- NULL = still ongoing
  status      text not null default 'ongoing' check (status in ('complete', 'ongoing', 'pending')),
  summary     text,
  description text,
  highlights  text[] not null default '{}',   -- the bullet points
  tech_stack  text[] not null default '{}',
  image       text,                  -- cover image
  images      jsonb not null default '[]',    -- [{"src": "...", "alt": "..."}]
  live_url    text,
  repo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.technical_skills (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('web_interface', 'data', 'access_integrity', 'other')),
  name       text not null,
  image      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages sent from your contact form (replaces the mailto: link).
create table public.contact_messages (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text,
  message    text not null,
  created_at timestamptz not null default now(),
  constraint contact_name_len    check (char_length(name) between 1 and 100),
  constraint contact_email_len   check (email is null or char_length(email) <= 200),
  constraint contact_message_len check (char_length(message) between 1 and 5000)
);

create index projects_type_created_idx on public.projects (type, created_at desc);

create trigger about_updated    before update on public.about            for each row execute function public.set_updated_at();
create trigger education_updated before update on public.education       for each row execute function public.set_updated_at();
create trigger projects_updated  before update on public.projects        for each row execute function public.set_updated_at();
create trigger skills_updated    before update on public.technical_skills for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security: anyone can READ content, only you can WRITE.
-- ---------------------------------------------------------------

alter table public.about            enable row level security;
alter table public.education        enable row level security;
alter table public.projects         enable row level security;
alter table public.technical_skills enable row level security;
alter table public.contact_messages enable row level security;

create policy "public read" on public.about            for select to anon, authenticated using (true);
create policy "public read" on public.education        for select to anon, authenticated using (true);
create policy "public read" on public.projects         for select to anon, authenticated using (true);
create policy "public read" on public.technical_skills for select to anon, authenticated using (true);

create policy "admin write" on public.about            for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.education        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.projects         for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.technical_skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Visitors may only INSERT messages. Only you can read or delete them.
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin read"      on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admin delete"    on public.contact_messages for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------
-- Image storage: a public bucket that only you can upload to.
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admin update" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());
create policy "admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

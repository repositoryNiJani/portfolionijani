-- Store portfolio contact form submissions in an admin-managed inbox.
create table if not exists public.contact_inquiries (
  id           bigint generated always as identity primary key,
  name         text not null,
  email        text,
  message_type text not null default 'other'
    check (message_type in ('interested', 'concern', 'question', 'feedback', 'other')),
  came_from    text not null default 'Contact page',
  message      text not null,
  status       text not null default 'pending'
    check (status in ('complete', 'ongoing', 'pending')),
  favorite     boolean not null default false,
  created_at   timestamptz not null default now(),
  constraint inquiry_name_len check (char_length(name) between 1 and 100),
  constraint inquiry_email_len check (email is null or char_length(email) <= 200),
  constraint inquiry_source_len check (char_length(came_from) between 1 and 200),
  constraint inquiry_message_len check (char_length(message) between 1 and 5000)
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

drop policy if exists "anyone can send inquiry" on public.contact_inquiries;
create policy "anyone can send inquiry" on public.contact_inquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "admin read inquiries" on public.contact_inquiries;
create policy "admin read inquiries" on public.contact_inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "admin update inquiries" on public.contact_inquiries;
create policy "admin update inquiries" on public.contact_inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin delete inquiries" on public.contact_inquiries;
create policy "admin delete inquiries" on public.contact_inquiries
  for delete to authenticated using (public.is_admin());

insert into public.contact_inquiries
  (name, email, message_type, came_from, message, status, favorite, created_at)
select
  old.name,
  old.email,
  'other',
  'Contact page',
  old.message,
  'pending',
  false,
  old.created_at
from public.contact_messages as old
where not exists (
  select 1
  from public.contact_inquiries as existing
  where existing.name = old.name
    and existing.email is not distinct from old.email
    and existing.message = old.message
    and existing.created_at = old.created_at
);

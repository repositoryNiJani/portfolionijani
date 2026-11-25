create table if not exists public.availability_events (
  id bigint generated always as identity primary key,
  availability_date date not null,
  activity text not null check (char_length(activity) between 1 and 120),
  start_time time not null,
  end_time time not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_time_order check (end_time > start_time),
  constraint availability_notes_len check (notes is null or char_length(notes) <= 1000)
);

create index if not exists availability_events_date_time_idx
  on public.availability_events (availability_date, start_time);

drop trigger if exists availability_events_updated on public.availability_events;
create trigger availability_events_updated
  before update on public.availability_events
  for each row execute function public.set_updated_at();

alter table public.availability_events enable row level security;

drop policy if exists "admin manage availability" on public.availability_events;
create policy "admin manage availability" on public.availability_events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public read availability" on public.availability_events;
create policy "public read availability" on public.availability_events
  for select to anon
  using (true);

grant select, insert, update, delete on public.availability_events to authenticated;
grant usage, select on sequence public.availability_events_id_seq to authenticated;
revoke all on public.availability_events from anon;
grant select (id, availability_date, activity, start_time, end_time)
  on public.availability_events to anon;

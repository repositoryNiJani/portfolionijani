-- Align project records with the project editor fields.
drop index if exists public.skills_type_sort_idx;

alter table public.education
  drop column if exists sort_order;

alter table public.technical_skills
  drop column if exists sort_order;

alter table public.projects
  drop column if exists slug,
  drop column if exists kind,
  drop column if exists sort_order,
  add column if not exists status text not null default 'ongoing';

update public.projects
set status = 'complete'
where end_date is not null;

alter table public.projects
  drop constraint if exists projects_status_check,
  add constraint projects_status_check
  check (status in ('complete', 'ongoing', 'pending'));

drop index if exists public.projects_type_sort_idx;
create index if not exists projects_type_created_idx
  on public.projects (type, created_at desc);

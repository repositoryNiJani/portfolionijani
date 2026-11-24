-- Use insertion time instead of manual display order for education and skills.
drop index if exists public.skills_type_sort_idx;

alter table public.education
  drop column if exists sort_order;

alter table public.technical_skills
  drop column if exists sort_order;

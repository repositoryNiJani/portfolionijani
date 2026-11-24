alter table public.technical_skills
  drop constraint if exists technical_skills_type_check;

alter table public.technical_skills
  add constraint technical_skills_type_check
  check (type in ('web_interface', 'data', 'access_integrity', 'other', 'design_media'));

update public.technical_skills
set type = 'design_media'
where type = 'other' and name = 'Figma';

insert into public.technical_skills (type, name)
select 'design_media', skill.name
from (values ('Canva'), ('CapCut'), ('Photoshop')) as skill(name)
where not exists (
  select 1
  from public.technical_skills existing
  where existing.type = 'design_media' and existing.name = skill.name
);

alter table public.technical_skills
  drop constraint if exists technical_skills_type_check;

alter table public.technical_skills
  add constraint technical_skills_type_check
  check (
    type in (
      'web_interface',
      'data',
      'access_integrity',
      'other',
      'design_media',
      'documents_office'
    )
  );

update public.technical_skills
set type = 'documents_office'
where type = 'other' and name in ('Word', 'Excel', 'PowerPoint');

insert into public.technical_skills (type, name, image)
select 'documents_office', skill.name, skill.image
from (
  values
    ('Word', '/word.png'),
    ('Excel', '/excel.png'),
    ('PowerPoint', '/ppt.png')
) as skill(name, image)
where not exists (
  select 1
  from public.technical_skills existing
  where existing.type = 'documents_office' and existing.name = skill.name
);

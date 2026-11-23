-- Your current site content. Run AFTER 0001_init.sql.

insert into public.about (name, description, looking_for, location, studying_since) values (
  'Jhonny M. Sumulong',
  'I’m Jhonny M. Sumulong, a BSIS student at Kolehiyo ng Lungsod ng Dasmariñas and a web developer who works with Laravel, React, and MySQL. I’ve designed and built database-driven systems for a local business and a student-government transparency portal.',
  'An OJT in information systems or web development',
  'Dasmariñas City, Cavite',
  2023
);

insert into public.education (type, title, organization, year, sort_order) values
  ('degree',      'BS Information Systems',        'Kolehiyo ng Lungsod ng Dasmariñas', '2023 – Present', 1),
  ('certificate', 'Introduction to Cybersecurity', 'Cisco',                             'March 2025',     2),
  ('certificate', 'Ethical Hacker',                'Cisco',                             'March 2025',     3);

insert into public.projects
  (slug, title, short_name, type, kind, role, client, start_date, end_date, summary, highlights, tech_stack, live_url, sort_order)
values
  ('step',
   'School Transparency and Engagement Portal (STEP)', 'STEP', 'main', 'School project',
   'Web Developer, Project Manager, System Architect',
   'SADU, Kolehiyo ng Lungsod ng Dasmariñas',
   '2025-02-01', null,
   'A student portal that makes student-government project spending and transactions easy to trace.',
   array[
     'Led design and development of a platform that lets students trace how the Central Student Government spends project live budgets, with each transaction visible from start to finish.',
     'Built a tamper-evident ledger that chains each approved project to the previous one with SHA-256 hashes, so any altered record can be detected and students can independently verify spending.',
     'Implemented authentication and role-based access control; every transaction is verified by the CSG council and the system administrator.',
     'Own the project timeline and requirements, and designed the system architecture and database.'
   ],
   array['Laravel', 'React', 'MySQL'], null, 1),

  ('scheduling',
   'Employee Scheduling System', 'Employee Scheduling', 'main', 'Client project',
   'Web Developer, System Architect', 'GLM Bakery',
   '2025-02-01', '2025-05-31',
   'A client system that assigns employee shifts based on availability and keeps scheduling records.',
   array[
     'Gathered requirements from the owner and designed the architecture and database for a system that assigns employees to dates based on their availability.',
     'Replaced manual scheduling with automatic schedule switching and record keeping.'
   ],
   array['PHP', 'JavaScript', 'Bootstrap', 'MySQL'], null, 2),

  ('library',
   'Book Borrowing System', 'Book Borrowing', 'main', 'School project',
   'Web Developer', null,
   '2024-11-01', '2024-11-30',
   'A library system for requesting books, tracking due dates, and applying late penalties.',
   array['Built a system for requesting books and tracking borrow dates, with automatic penalties for late or unreturned books.'],
   array['PHP', 'MySQL', 'Bootstrap', 'HTML'], null, 3),

  ('contreebution',
   'Contreebution', 'Contreebution', 'side', 'Side project',
   null, null, null, null,
   'A visual GitHub contribution tracker featured in my portfolio.',
   array['Displays GitHub contribution activity as an interactive visual tree.'],
   '{}', 'https://contreebution.vercel.app/', 4),

  ('bloomail',
   'Bloomail', 'Bloomail', 'side', 'Side project',
   null, null, null, null,
   'More details coming soon.',
   '{}', '{}', null, 5);

insert into public.technical_skills (type, name, image, sort_order) values
  ('web_interface', 'HTML5',      '/html.png', 1),
  ('web_interface', 'CSS3',       '/css.png', 2),
  ('web_interface', 'JavaScript', '/js.png', 3),
  ('web_interface', 'React',      '/react.png', 4),
  ('web_interface', 'Bootstrap',  '/bootstrap.png', 5),
  ('data', 'PHP',             '/php.png', 1),
  ('data', 'Laravel',         '/laravel.png', 2),
  ('data', 'MySQL',           '/mysql.png', 3),
  ('data', 'SQL',             null, 4),
  ('data', 'Database design', null, 5),
  ('access_integrity', 'Authentication',       null, 1),
  ('access_integrity', 'Role-based access',    null, 2),
  ('access_integrity', 'SHA-256 audit ledger', null, 3),
  ('other', 'Git',                  '/git.png', 1),
  ('other', 'GitHub',               '/github.png', 2),
  ('other', 'Draw.io',              '/draw.png', 3),
  ('other', 'Figma',                '/figma.png', 4),
  ('other', 'Word',                 '/word.png', 5),
  ('other', 'Excel',                '/excel.png', 6),
  ('other', 'PowerPoint',           '/ppt.png', 7),
  ('other', 'AI coding assistants', null, 8);

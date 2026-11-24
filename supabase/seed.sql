-- Your current site content. Run AFTER 0001_init.sql.

insert into public.about (name, description, looking_for, location, studying_since) values (
  'Jhonny M. Sumulong',
  'I’m Jhonny M. Sumulong, a BSIS student at Kolehiyo ng Lungsod ng Dasmariñas and a web developer who works with Laravel, React, and MySQL. I’ve designed and built database-driven systems for a local business and a student-government transparency portal.',
  'An OJT in information systems or web development',
  'Dasmariñas City, Cavite',
  2023
);

insert into public.education (type, title, organization, year) values
  ('degree',      'BS Information Systems',        'Kolehiyo ng Lungsod ng Dasmariñas', '2023 – Present'),
  ('certificate', 'Introduction to Cybersecurity', 'Cisco',                             'March 2025'),
  ('certificate', 'Ethical Hacker',                'Cisco',                             'March 2025');

insert into public.projects
  (title, short_name, type, role, client, start_date, end_date, status, summary, highlights, tech_stack, live_url, repo_url)
values
  ('School Transparency and Engagement Portal (STEP)', 'STEP', 'main',
   'Web Developer, Project Manager, System Architect',
   'SADU, Kolehiyo ng Lungsod ng Dasmariñas',
   '2025-02-01', null, 'ongoing',
   'A student portal that makes student-government project spending and transactions easy to trace.',
   array[
     'Led design and development of a platform that lets students trace how the Central Student Government spends project live budgets, with each transaction visible from start to finish.',
     'Built a tamper-evident ledger that chains each approved project to the previous one with SHA-256 hashes, so any altered record can be detected and students can independently verify spending.',
     'Implemented authentication and role-based access control; every transaction is verified by the CSG council and the system administrator.',
     'Own the project timeline and requirements, and designed the system architecture and database.'
   ],
   array['Laravel', 'React', 'MySQL'], null, null),

  ('Employee Scheduling System', 'Employee Scheduling', 'main',
   'Web Developer, System Architect', 'GLM Bakery',
   '2025-02-01', '2025-05-31', 'complete',
   'A client system that assigns employee shifts based on availability and keeps scheduling records.',
   array[
     'Gathered requirements from the owner and designed the architecture and database for a system that assigns employees to dates based on their availability.',
     'Replaced manual scheduling with automatic schedule switching and record keeping.'
   ],
   array['PHP', 'JavaScript', 'Bootstrap', 'MySQL'], null, null),

  ('Book Borrowing System', 'Book Borrowing', 'main',
   'Web Developer', null,
   '2024-11-01', '2024-11-30', 'complete',
   'A library system for requesting books, tracking due dates, and applying late penalties.',
   array['Built a system for requesting books and tracking borrow dates, with automatic penalties for late or unreturned books.'],
   array['PHP', 'MySQL', 'Bootstrap', 'HTML'], null, null),

  ('Contreebution', 'Contreebution', 'side',
   null, null, null, null,
   'ongoing',
   'A visual GitHub contribution tracker featured in my portfolio.',
   array['Displays GitHub contribution activity as an interactive visual tree.'],
   '{}', 'https://contreebution.vercel.app/', null),

  ('Bloomail', 'Bloomail', 'side',
   null, null, null, null,
   'pending',
   'More details coming soon.',
   '{}', '{}', null, null);

insert into public.technical_skills (type, name, image) values
  ('web_interface', 'HTML5',      '/html.png'),
  ('web_interface', 'CSS3',       '/css.png'),
  ('web_interface', 'JavaScript', '/js.png'),
  ('web_interface', 'React',      '/react.png'),
  ('web_interface', 'Bootstrap',  '/bootstrap.png'),
  ('data', 'PHP',             '/php.png'),
  ('data', 'Laravel',         '/laravel.png'),
  ('data', 'MySQL',           '/mysql.png'),
  ('data', 'SQL',             null),
  ('data', 'Database design', null),
  ('access_integrity', 'Authentication',       null),
  ('access_integrity', 'Role-based access',    null),
  ('access_integrity', 'SHA-256 audit ledger', null),
  ('other', 'Git',                  '/git.png'),
  ('other', 'GitHub',               '/github.png'),
  ('other', 'Draw.io',              '/draw.png'),
  ('other', 'Figma',                '/figma.png'),
  ('other', 'Word',                 '/word.png'),
  ('other', 'Excel',                '/excel.png'),
  ('other', 'PowerPoint',           '/ppt.png'),
  ('other', 'AI coding assistants', null);

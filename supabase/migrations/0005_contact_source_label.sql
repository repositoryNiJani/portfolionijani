-- Use a consistent source label for messages sent from the portfolio contact page.
alter table public.contact_inquiries
  alter column came_from set default 'Portfolio - Contact Me';

update public.contact_inquiries
set came_from = 'Portfolio - Contact Me'
where came_from = 'Contact page';

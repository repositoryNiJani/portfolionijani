# Jhonny M. Sumulong Portfolio

A React and Vite portfolio site.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Supabase database update

For an existing database, run `0002_project_fields.sql`, `0003_upload_order.sql`,
`0004_contact_inquiries.sql`, and `0005_contact_source_label.sql` from
`supabase/migrations` in the Supabase SQL Editor, in order. If 0002 through 0004
have already been applied, run only 0005.

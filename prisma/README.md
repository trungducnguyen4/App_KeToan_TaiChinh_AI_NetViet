# Prisma Migration Notes

`schema.prisma` is the source of truth for PostgreSQL.

Use Prisma to generate migrations instead of hand-written destructive SQL:

```bash
npm run prisma:migrate:dev -- --name initial_safe_baseline
```

For an existing database, inspect the generated migration before applying it and prefer additive `ALTER` operations. Do not reset the database or delete seeded demo data.

The current local PostgreSQL database is rebuilt from the converted `data.sql` dump. The old migration SQL files were originally generated for MySQL, so do not run `prisma migrate dev` against this database until a PostgreSQL baseline migration is created.

Default local PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/app_ke_toan?schema=public"
```

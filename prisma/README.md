# Prisma Migration Notes

`schema.prisma` is the source of truth for MySQL/MariaDB on XAMPP.

Use Prisma to generate migrations instead of hand-written destructive SQL:

```bash
npm run prisma:migrate:dev -- --name initial_safe_baseline
```

For an existing database, inspect the generated migration before applying it and prefer additive `ALTER` operations. Do not reset the database or delete seeded demo data.

Default local XAMPP connection:

```env
DATABASE_URL="mysql://root:@localhost:3306/app_quan_tri"
```

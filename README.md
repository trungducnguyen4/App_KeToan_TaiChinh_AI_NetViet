# Workit Accounting App

Production-oriented MVP for a Workit-inspired accounting and operations platform.

## Stack

- Frontend: Next.js Pages Router
- Backend: NestJS
- Database: PostgreSQL
- Migration: Prisma
- Jobs: BullMQ + Redis
- Auth/RBAC: JWT + role-based guards

## Run

```bash
npm install
npm run web:dev
```

The frontend starts at `http://localhost:3000`.

Main screens:

- `http://localhost:3000`
- `http://localhost:3000/modules/accounting`
- `http://localhost:3000/modules/accounting/journal-vouchers`

Backend development server:

```bash
npm run api:dev
```

Prisma setup for PostgreSQL:

```bash
cp .env.example .env
```

Create the database first with PostgreSQL:

```sql
CREATE DATABASE app_ke_toan;
```

Default local connection:

```bash
DATABASE_URL="postgresql://postgres:secret@localhost:5432/app_ke_toan?schema=public"
```

Then generate Prisma client:

```bash
npm run prisma:generate
```

To rebuild from `data.sql`, convert and import:

```bash
node scripts/convert-mysql-dump-to-postgres.js
psql -U postgres -h localhost -d app_ke_toan -f data.postgres.sql
```

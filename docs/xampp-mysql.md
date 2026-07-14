# PostgreSQL Setup

This project now targets PostgreSQL.

## 1. Start PostgreSQL

Start the local PostgreSQL service or use the `postgres` service in `docker-compose.yml`.

## 2. Create Database

Use `psql`:

```sql
CREATE DATABASE app_ke_toan;
```

## 3. Environment

Create `.env` from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/app_ke_toan?schema=public"
```

## 4. Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

To import from the provided MySQL dump:

```bash
node scripts/convert-mysql-dump-to-postgres.js
psql -U postgres -h localhost -d app_ke_toan -f data.postgres.sql
```

For an existing seeded database, inspect generated SQL before applying migrations and avoid reset commands.

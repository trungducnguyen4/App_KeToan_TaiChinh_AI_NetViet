# Workit Accounting App

Production-oriented MVP for a Workit-inspired accounting and operations platform.

## Stack

- Frontend: Next.js Pages Router
- Backend: NestJS
- Database: MySQL/MariaDB via XAMPP
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

Prisma setup for XAMPP MySQL:

```bash
cp .env.example .env
```

Create the database first in phpMyAdmin or MySQL CLI:

```sql
CREATE DATABASE IF NOT EXISTS app_quan_tri
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

Default local connection:

```bash
DATABASE_URL="mysql://root:@localhost:3306/app_quan_tri"
```

Then generate Prisma client and choose one database workflow:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

For a quick local prototype database without creating migration files:

```bash
npm run prisma:db:push
```

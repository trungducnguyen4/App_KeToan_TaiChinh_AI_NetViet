# XAMPP MySQL Setup

This project now targets MySQL/MariaDB through XAMPP.

## 1. Start XAMPP

Start:

- Apache
- MySQL

## 2. Create Database

Use phpMyAdmin or MySQL CLI:

```sql
CREATE DATABASE IF NOT EXISTS app_quan_tri
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

## 3. Environment

Create `.env` from `.env.example`:

```env
DATABASE_URL="mysql://root:@localhost:3306/app_quan_tri"
```

If your local root user has a password:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/app_quan_tri"
```

## 4. Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

For prototype sync:

```bash
npm run prisma:db:push
```

For tracked migrations:

```bash
npm run prisma:migrate:dev -- --name initial_mysql_baseline
```

For an existing seeded database, inspect generated SQL before applying migrations and avoid reset commands.

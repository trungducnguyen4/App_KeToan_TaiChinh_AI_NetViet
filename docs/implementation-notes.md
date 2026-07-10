# Implementation Notes

The current implementation is a production-oriented MVP scaffold:

- `apps/web` contains the Next.js frontend.
- `apps/api` contains the NestJS API.
- `packages/domain` contains shared module metadata, DTO-facing types, and demo data.
- `prisma/schema.prisma` models the MySQL/XAMPP baseline for tenant, RBAC, Workit sync, vouchers, approvals, attachments, audit, and AI jobs.

## Frontend

The UI is intentionally modernized from Workit while preserving the observed workflow:

- app shell with sidebar module launcher
- dashboard cards
- approval queue
- module tiles
- `Phiếu hạch toán` list page
- create form with header fields
- journal line grid
- invoice payment and attachment area

## Backend

The API is wired to demo data for the first pass. Replace `WorkitService` internals with Prisma repositories when the MySQL database is available.

RBAC is currently represented by `@Roles()` and `RbacGuard`; JWT strategy can be attached without changing controller contracts.

## Database

Use Prisma migrations against MySQL/MariaDB. For an existing XAMPP database, review generated SQL and keep changes additive.

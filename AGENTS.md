# Repository Guidelines

## Project Structure & Module Organization

This is an npm workspace monorepo for a Workit-inspired accounting application.

- `apps/web`: Next.js Pages Router frontend. Pages live in `pages/`, reusable screens in `screens/`, shared UI in `components/`, and API helpers/mock data in `lib/`.
- `apps/api`: NestJS backend. Main modules are under `src/`, including `auth/`, `ai/`, `users/`, `workit/`, and `prisma/`.
- `packages/domain`: shared domain types, demo data, and module metadata consumed by both apps.
- `prisma`: Prisma schema and migrations.
- `docs`: implementation notes, API surface, and integration documentation.
- Root `temp-*.json` files are local/demo payload examples.

## Build, Test, and Development Commands

Run commands from the repository root.

- `npm install`: install all workspace dependencies.
- `npm run dev` or `npm run web:dev`: start the frontend at `http://localhost:3000`.
- `npm run web:dev:fresh`: clean Next artifacts, then start the frontend.
- `npm run api:dev`: start the NestJS API with `ts-node`.
- `npm run web:build`: build the frontend into `.next-build`.
- `npm run api:build`: compile the backend TypeScript.
- `npm run typecheck`: build the API and type-check the web app.
- `npm run prisma:generate`: regenerate Prisma Client after schema changes.
- `npm run prisma:migrate:dev`: create/apply a local Prisma migration.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow the existing style: two-space indentation, double quotes, semicolons, and named exports where already established. React components and screen files use PascalCase component names with kebab-case filenames, for example `bank-statement-screen.tsx`. NestJS files follow conventional suffixes such as `.controller.ts`, `.service.ts`, `.module.ts`, and DTO classes use PascalCase.

Keep shared business types in `packages/domain`; avoid duplicating DTO-facing types across frontend and backend when a shared type fits.

## Testing Guidelines

There is currently no dedicated `npm test` script or formal coverage threshold. Before submitting changes, run `npm run typecheck` and any relevant build command (`npm run api:build`, `npm run web:build`). For new tests, colocate them near the code they cover and use clear names such as `workit.service.spec.ts` or `bank-statement-screen.test.tsx`.

## Mock Backend & AI Workflows

The app can run key accounting flows without a database. `apps/api/src/workit/mock-accounting-store.ts` is the stateful in-memory source for cash vouchers, bank statements, reconciliation, debt candidates, missing vouchers, and monitoring alerts. State resets when the API restarts.

Use backend mock APIs for operational screens instead of frontend-only demo data. Monitoring alerts are exposed through `GET /api/alerts`, `GET /api/alerts/:id`, and `PATCH /api/alerts/:id/status`; the Reports dashboard should display these backend alerts. Dify `alert-writer` is only for drafting/explaining a selected alert, not for deciding whether the alert exists.

For AI on PT/PC/BN/BC screens, `POST /api/ai/chat` reviews the selected voucher JSON directly and should not ask for an attachment. If a user attaches a file on cash receipt, cash payment, bank debit, or bank credit pages, `POST /api/ai/chat/upload` should route to the `ocr-accounting` workflow with the inferred voucher type (`PT`, `PC`, `BN`, or `BC`). To avoid false-positive OCR triggers during normal chat questions, backend chat answers check `hasUpload` and `isOcrRequest` before applying fallback OCR simulations.

For Input E-Invoices (`/modules/accounting/input-einvoices`):
- AI OCR/suggestions (Dify `ocr-accounting` workflow) are integrated on the main dashboard page. Running AI OCR extracts invoice/statement data, suggests double-entry accounts (`debitAccount`/`creditAccount`), and fills account sub-ledger dimensions (`counterpartyCode` / `Mã đối tượng` and `contractNo` / `Số hợp đồng`) before automatically redirecting to the workspace layout.
- The workspace page (`?action=create`) is dedicated strictly to manual, human-only entry/editing with no AI triggering panel, allowing the user to review and correct all suggestions before committing.

## Commit & Pull Request Guidelines

Recent commits use short imperative messages, for example `Fix AI chat launcher layout` and `Fix refresh session migration for PostgreSQL`. Keep commits focused and descriptive.

Pull requests should include a concise summary, the affected areas (`apps/web`, `apps/api`, `prisma`, etc.), verification commands run, and screenshots for visible UI changes. Link related issues or task notes when available.

## Security & Configuration Tips

Do not commit `.env` values or Dify/API secrets. Use `.env.example` as the template. After changing Prisma models or migrations, document the database impact and run `npm run prisma:generate`.

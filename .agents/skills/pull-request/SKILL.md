---
name: pull-request
description: >-
  Standardized protocol for opening Pull Requests following the 4-Pillar Verification Model (Tests, Runtime, Visual, Confidence). Enforces branch hygiene, build/type checks, live runtime proof, inline screenshot/GIF embeds, and autonomous agent safety boundaries.
whenToUse: >-
  Trigger when the user asks to open, review, verify, or prepare a Pull Request (PR) on GitHub.
---

# Pull Request (PR) Automation & Authoring Skill

This skill standardizes the Pull Request creation and verification workflow for the repository, integrating the **Risk-Based 4-Pillar Verification Protocol** and **Git Automation Boundaries**.

> **Language Policy**:
> - All agent instructions, skills, and rules MUST remain in concise **English** to optimize token consumption.
> - The final PR body/description and reviewer communications MUST be written in **Vietnamese**.

---

## 1. 5-Step Pull Request Workflow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Git & Branch │ ──> │ 2. Tests & Build │ ──> │ 3. Runtime Check │ ──> │ 4. Visual Proof  │ ──> │ 5. Open & Embed │
│ (Ticket pattern)│     │ (npm typecheck)  │     │ (Live API/DB)    │     │ (Live Dev Server)│     │ (Direct Raw URL)│
└─────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘     └─────────────────┘
```

### Step 1: Branch Isolation & Conventional Commits
- Identify ticket / issue key: e.g., `NV-001`, `EX-042`.
- Branch naming: `feature/<ticket>-<slug>` or `bugfix/<ticket>-<slug>`.
- Commit messages: Conventional Commits in English:
  - `feat(<scope>): ...`
  - `fix(<scope>): ...`
  - `refactor(<scope>): ...`
  - `docs(proof): ...`

### Step 2: Syntax, Typecheck & Build (Pillar 1: Tests)
Execute type checking and build verification:
```powershell
npm run typecheck
```
- Must complete with **Exit code 0 (0 errors)**.
- Document metrics: `Passed 100%, 0 failures`.

### Step 3: Runtime Verification (Pillar 2: Runtime)
Validate against the live API and database:
- **Endpoints tested**: e.g., `GET /api/batches/cost-summary`, `POST /api/invoices`.
- **HTTP Status Code**: `200 OK` or `201 Created` (or expected `400/403` for rejection guardrails).
- **Payload Shape**: Validate data integrity, zero `500 Internal Server Error`, no dangling `undefined` fields.
- **Database State**: Confirm Prisma/MariaDB entity creation and consistency.

### Step 4: Visual Proof Capture (Pillar 3: Visual)
- **Static UI / Tables (Tier 3)**:
  - Capture viewport screenshot from the **live dev server** (`http://localhost:3000`) with full Layout Shell (Sidebar 280px + Header).
  - Save to `docs/screenshots/<ticket>-<slug>.png`.
- **User Flows / Multi-Step Actions (Tier 4)**:
  - Capture sequence (input ➔ submit ➔ result state).
  - Use `python scripts/create_visual_gif.py` to compile into an animated GIF.
  - Save to `docs/screenshots/<ticket>-<flow>.gif`.
- Stage, commit, and push assets to remote:
  ```powershell
  git add docs/screenshots/
  git commit -m "docs(proof): add visual proof for <ticket>"
  git push origin <branch-name>
  ```

### Step 5: Author PR Body (in Vietnamese) & Open/Update PR (Pillar 4: Confidence)
Fill out the PR description using the template format from [`.github/PULL_REQUEST_TEMPLATE.md`](file:///.github/PULL_REQUEST_TEMPLATE.md). **The PR description MUST be written in Vietnamese**.

> ⚠️ **CRITICAL ANTI-PATTERN & MANDATORY ENFORCEMENT**:
> - **NEVER** leave the main PR description (`body`) empty, unpopulated, or containing only placeholder comments.
> - **NEVER** post the 4-Pillar report as an Issue Comment (`add_issue_comment`) while leaving the top PR description blank.
> - **ALWAYS** set or update the PR `body` directly using `create_pull_request` (when opening) or `update_issue` / `update_pull_request` (when modifying an existing PR).
> - **MANDATORY POST-PR VERIFICATION**: Immediately after creating or updating a PR, fetch the PR using `get_pull_request` and assert that `body` is NOT empty, contains the 4-Pillar headers, and has live raw asset links.
> - **ALWAYS** return the clickable Markdown PR URL `[PR #<number>](<html_url>)` directly to the user in the final response.

```markdown
## 📌 Overview
[Tóm tắt ngắn gọn tính năng hoặc bugfix vừa triển khai]

---

## 🔍 Proof of Change & Confidence Report (Verification Protocol — 4 Trụ Cột)

### 1. 🧪 Tests (Focused logic and integration checks)
- [x] Syntax & Type check (`npm run typecheck`): Passed 100% (0 errors)
- [x] API build check (`npm run api:build`): Passed 100% (0 errors)
- [x] Test metrics: Passed 100%

### 2. ⚡ Runtime (Use the actual feature end to end)
- **Endpoint / Action**: [Endpoint hoặc hành động đã kiểm thử]
- **Status code / Response**: HTTP 200 OK / HTTP 201 Created
- **Database verification**: Dữ liệu lưu trữ nhất quán trong database

### 3. 👁️ Visual (Inspect what the user will see)
- [x] **Visual Evidence:**
  ![Minh chứng User Flow](https://raw.githubusercontent.com/<owner>/<repo>/<branch-name>/docs/screenshots/<filename>.gif)

### 4. 🎯 Confidence (State what was verified — and what was not)
- **Mức độ tự tin (Confidence level)**: High / Medium / Low
- **Những gì ĐÃ được chứng minh (Verified)**:
  - [Liệt kê các trường hợp và tính năng đã test thành công]
- **Những gì CHƯA kiểm thử / Ranh giới phụ thuộc (NOT verified)**:
  - [Liệt kê các ranh giới phần cứng hoặc dịch vụ bên ngoài chưa test]

---

## 🚀 Deployment Checklist
- [x] Code passes typecheck & build locally
- [x] No hardcoded environment paths / credentials / secrets
- [x] Screenshots / Videos attached for visual proof (full Layout Shell)
- [x] Accented Vietnamese UI strings verified
```

---

## 2. Git Automation Safety Boundaries

### ✅ Autonomous Permissions:
- Create and switch to feature/bugfix branches matching the ticket pattern.
- Execute type checks, builds, tests, and dev servers.
- Capture live screenshots/GIFs and save to `docs/screenshots/`.
- Commit code using Conventional Commits and push feature branches to remote.
- Open Pull Requests or update PR body on GitHub.

### ⛔ Strict Prohibitions (Requires Explicit Human Confirmation):
- NEVER push directly to protected branches (`main`, `master`, `production`, `develop`).
- NEVER use force push (`git push -f` or `--force-with-lease`).
- NEVER merge Pull Requests autonomously without human review approval.
- NEVER delete remote branches or tags.

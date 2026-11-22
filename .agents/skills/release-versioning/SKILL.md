---
name: release-versioning
description: >-
  Standardized release workflow for version bumping, CHANGELOG maintenance, and git tagging. MUST be used when the user requests "new version", "bump version", "release", "git tag", or prepares to package changes into an official release. Do not use for routine commits.
---

# Release & Versioning (Commit Naming + CHANGELOG + Git Tag)

This repository follows `MAJOR.MINOR.PATCH` semantic versioning. The version and `CHANGELOG.md` document explicit milestones, schema changes, and production deployment steps.

> **Important:** Do NOT automatically execute this release procedure (updating CHANGELOG.md, committing `Release vX.Y.Z`, creating git tags) after small routine edits. Only execute when the user explicitly requests — specifying this skill, or stating "bump version", "release", or "create new version".

---

## 0. Universal Commit Guidelines

- **Never include `Co-Authored-By` or any AI assistant attribution lines in commit messages.** All commits in this repository must be authored solely under the user's name.
- **Push immediately to remote after committing** by default (both feature commits and `Release vX.Y.Z` commits), unless the user explicitly requests not to push.
- **Standard release sequence:**
  1. Commit and push feature/fix changes.
  2. Execute real local/production verification checks until all steps pass.
  3. Only after all checks pass, write `CHANGELOG.md` entry.
  4. Create a dedicated **`Release vX.Y.Z`** commit including `CHANGELOG.md`.
  5. Create annotated git tag `vX.Y.Z` pointing to that commit.
  6. Push both the commit and tag to remote.

---

## 1. Version Increment Rules

- **MINOR** (`1.2.0` → `1.3.0`): New feature additions, or database schema changes (tables/columns modified or added).
- **PATCH** (`1.2.0` → `1.2.1`): Bug fixes, UI enhancements, or performance improvements without schema modifications.
- **MAJOR** (`1.0.0` → `2.0.0`): Breaking architectural or API changes. Always confirm with the user before bumping MAJOR.

---

## 2. Mandatory Verification Before Release

Never commit `Release vX.Y.Z` based on unverified code.

**Required Verification Steps:**
1. **Typecheck & Build:** Run `npm run typecheck` or workspace build commands (`npm run api:build`, `npm run web:build`), verifying that no TypeScript compiler errors or build failures exist.
2. **Runtime Verification:** Ensure backend API and frontend dev servers start cleanly and endpoints respond with expected HTTP status codes.
3. **Database Consistency:** When schema or migration scripts are involved, verify idempotent execution and data integrity.

---

## 3. CHANGELOG.md Format

Always maintain a `CHANGELOG.md` at the repository root. Prepend new entries under the main heading:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Changes
- Brief description of each change, citing key modified files.

### Database Updates
One of the following:
- **None.** — No schema changes.
- **`prisma db push` / Migration script** — Schema additions or updates (data preserved).
- **⚠️ Re-seed required** — Only when clean re-seed is necessary, explaining why.

### Deployment / Verification Notes
- List verification steps executed and instructions for deploying FE/BE.
```

---

## 4. Release Commit Format

Release commits must strictly adhere to:

```
Release vX.Y.Z: <short summary>

<optional detailed description of changes and rationale>
```

Example: `Release v1.1.0: Add pagination, period filters, and insights dashboard`.

**Crucial rule: The release commit MUST contain the `CHANGELOG.md` update for that version.**
If feature changes were already committed, create a dedicated commit for `CHANGELOG.md` (+ any release configs) and tag that commit.

---

## 5. Git Tagging

Immediately create an annotated git tag for the release commit:

```bash
git tag -a vX.Y.Z <commit-hash> -m "Release vX.Y.Z: <summary>"
```

- Always use annotated tags (`-a`), never lightweight tags.
- Tag only the commit containing the version's `CHANGELOG.md`.
- Push both the release commit and tag:
  ```bash
  git push origin <branch> && git push origin vX.Y.Z
  ```
- If a tag was placed incorrectly and not yet pushed: delete locally via `git tag -d vX.Y.Z` and re-tag. If already pushed, confirm with the user before modifying shared remote tags.

---

## 6. Post-Release Communication

After creating the release tag and pushing:
- Provide the release version, commit hash, and tag name.
- Summarize changes from `CHANGELOG.md` in Vietnamese for reviewer clarity.
- Provide direct link to the GitHub Pull Request or release tag.

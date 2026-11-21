# Dầu Dừa NetViet — AI Developer Harness & Guidelines

> **Single Source of Truth (SSOT)** for all AI agents, pairing assistants, and automated engineering workflows across the ERP Dầu Dừa NetViet workspace (`App_KeToan_TaiChinh_AI_NetViet`).

---

## 1. Language Policy & Token Optimization

To maximize token efficiency, eliminate prompt drift, and preserve model context capacity:
- **Rules, Skills, Harness Guidelines, Code Comments & Prompts**: MUST be authored in **English**.
- **Pull Request Output (PR Description & Review Notes)**: MUST be generated in **Vietnamese** for human reviewers.
- **Application User Interface (UI)**: Accented **Vietnamese** (100% tiếng Việt có dấu) with localized formats (VND, kg/tấn, `tabular-nums`).

---

## 2. Modular Engineering Rules (`.agents/rules/`)

| Rule Module | Scope & Purpose | Link |
| :--- | :--- | :--- |
| **Core Principles** | SSOT, standard language policy, minimal invasive code modifications | [`.agents/rules/core.md`](.agents/rules/core.md) |
| **Git Flow & Boundaries** | Branching model (`NV-xxx`), Conventional Commits, PR protocol, agent safety boundaries | [`.agents/rules/git-workflow.md`](.agents/rules/git-workflow.md) |
| **Risk-Based Verification** | 4-Tier verification protocol (Tier 1 Trivial ➔ Tier 4 Full Flow/Perf), visual proofs | [`.agents/rules/verification.md`](.agents/rules/verification.md) |

---

## 3. Risk-Based Verification Protocol Summary (4 Pillars)

Every code change must be proven with tangible evidence proportional to its risk tier:

- **Tier 1 (Trivial / Docs / Typo)**: Syntax & type check (`npm run typecheck`), clean `git diff`. Visual proof optional.
- **Tier 2 (Backend / Logic / DB / Security)**: Tier 1 + Build pass 100% (`npm run api:build`) + Live API runtime verification (`HTTP status 200/201/400`).
- **Tier 3 (Static UI / Layout)**: Tier 2 + Live Dev Server screenshot with full Layout Shell (Sidebar 280px + Topbar). Prohibited: mock HTML preview files.
- **Tier 4 (Complex User Flow / Latency / Cost Engine)**: Tier 3 + Animated GIF or Screen Recording (`.mp4`) simulating the complete interaction journey, embedded directly via raw Markdown Image into the PR description on GitHub.

---

## 4. Skills Directory (`.agents/skills/`)

- **`pull-request`**: 5-step PR workflow, Git safety boundaries, automated filling of [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) in Vietnamese.
- **`verification-visual-proof`**: Standards for live dev server captures, ban on mock HTML files, packaging animated GIFs via `scripts/create_visual_gif.py`, and direct PR embedding.

---

## 5. ERP Domain Invariants & UX/UI Standards

1. **System Icon Standard: Aligned with Sidebar (`AppIcon`)**:
   - **STRICT BAN ON CARTOON EMOJIS** (`🥥`, `🌾`, `⚙️`, `🏆`, `📦`, `🧮`, `⚡`, `💰`, `💵`, `🏦`, `⚖️`, `🧾`, `🏢`, `🛢️`...) across all buttons, tabs, headers, modals, and badges.
   - Use `<AppIcon name="..." />` based on Lucide React (`strokeWidth: 2.1`) consistently across all screens.
2. **Enterprise Data Density**:
   - Data table numbers must apply CSS `tabular-nums` (`font-variant-numeric: tabular-nums`).
   - All currency (VND) and quantity columns (kg, Tấn, Lít) must be strictly **right-aligned** (`.text-right`).
3. **100% Accented Vietnamese in UI**:
   - All user-facing labels, titles, status pills, dialogs, and table headers must use standard accented Vietnamese.
4. **Crude Coconut Oil Realtime Cost Accounting**:
   $$\text{Unit Cost per kg Oil} = \frac{\sum \text{Raw Materials} + \sum \text{Processing (Press/Filter)} + \sum \text{Overhead} - \sum \text{Byproduct Recovery}}{\text{Total Crude Coconut Oil Output (kg)}}$$
5. **1-Click Cash / Bank Voucher Linking**:
   - Purchasing (weight slips, VAT expenses) ➔ 1-click Payment Voucher (PC) or Bank Debit Advice (BN).
   - Sales (crude oil, coconut meal byproduct) ➔ 1-click Receipt Voucher (PT) or Bank Credit Advice (BC).

---
name: verification-visual-proof
description: >-
  Standard for capturing and packaging tangible visual evidence (Visual Proof of Change) under the 4-Pillar Verification Model. Enforces real dev server captures with complete layout shell, bans static mock HTML files, mandates animated GIFs for user flows, and requires direct raw image embedding in Pull Request descriptions.
whenToUse: >-
  Trigger when validating UI/UX modifications, capturing test evidence, or preparing Pull Request visual proofs.
---

# Verification Protocol — Visual Proof of Change

For any user interface (UI) or user experience (UX) modification in the codebase, **Visual Proof** is an absolute prerequisite before marking a task complete or requesting PR review.

> **Language Policy**:
> - All agent instructions and rules MUST remain in concise **English** to optimize token consumption.
> - The final PR body and reviewer communications MUST be written in **Vietnamese**.

---

## 1. Core Principles

1. **"No Invisible Changes"**:
   - Every UI/UX change must be visually verifiable directly on the GitHub PR page.
   - Strictly forbidden to provide only local file paths (e.g. `See docs/screenshots/local.png`). Reviewers cannot open local disk paths on GitHub.

2. **"Moving Proof for User Flows & Performance"**:
   - **Static UI (Tier 3)**: Button color, margin, alignment, static layout ➔ Viewport screenshot before/after from the live dev server.
   - **User Flows (Tier 4)**: Multi-step interactions (typing, dropdown selections, modals, progress states, final output) ➔ **MANDATORY Animated GIF or Screen Recording (`.mp4`)** capturing the full journey from start to finish.
   - **Performance Optimizations**: N+1 queries, page load latency, caching ➔ Live screen capture demonstrating instant responsiveness (<100ms) alongside before/after metrics.

3. **"Directly Embedded in PR"**:
   - In Section `3. Visual` of the Pull Request description, embed raw GitHub content URLs using Markdown syntax:
     ```markdown
     - [x] **Visual Evidence:**
       ![User Flow](https://raw.githubusercontent.com/<owner>/<repo>/<branch-name>/docs/screenshots/<filename>.gif)
       🎥 **Video MP4:** [Watch MP4](https://raw.githubusercontent.com/<owner>/<repo>/<branch-name>/docs/videos/<filename>.mp4)
     ```

---

## 2. Strict Anti-Patterns (Prohibited Behaviors)

1. 🚫 **STRICT BAN ON MOCK / STATIC PREVIEW HTML FILES**:
   - Never create temporary files like `preview-*.html` or `test-ui.html` using standalone CDN links or hardcoded HTML outside the application.
   - Any visual proof not captured from the actual live dev server (`http://localhost:...`) is considered **COUNTERFEIT AND INVALID**.

2. 🚫 **NO FABRICATED STATIC VALUES**:
   - Never hardcode mock numbers in screenshots to "beautify" images. Visuals must reflect real state from backend APIs, stores, and databases.

3. 🚫 **NO ISOLATED COMPONENT CROPS**:
   - Never crop isolated components outside the full window. Capture within the **complete application layout shell** (including Sidebar and Header) to ensure flexbox/grid layout integrity.

---

## 3. Step-by-Step Live Capture Workflow

### Step 1: Start Live Servers
- Start frontend dev server (`npm run web:dev` on port 3000).
- Start backend API server (`npm run api:dev` on port 4000).
- Ensure database and Redis connections are active.

### Step 2: Configure Viewport & Check Breakpoints
Use Chrome DevTools MCP `resize_page` to verify real desktop resolutions:
- Standard Desktop: `1440x900` or `1366x768`.
- Compact View: `1024x768`.

### Step 3: Execute Walkthrough Interactions
1. `navigate_page`: Load target route URL.
2. `type_text` / `fill`: Enter realistic operational input.
3. `click`: Interact with filters, buttons, modal dialogs.
4. Capture sequential frames at transition points.

### Step 4: Compile into Animated GIF
Use `scripts/create_visual_gif.py` to compile sequential screenshots:
- Set appropriate frame durations (action frames: 600-1000ms, modal/result frames: 2500-3000ms).
- Output to `docs/screenshots/<ticket>-<flow>.gif`.

### Step 5: Commit, Push & Embed in PR Description (Vietnamese)
1. `git add docs/screenshots/<file>.gif`
2. `git commit -m "docs(proof): add visual proof for <ticket>"`
3. `git push origin <branch>`
4. Embed the direct raw URL into the Vietnamese PR body.

---

## 4. Acceptance Checklist

Before submitting code or requesting human review:
- [ ] Captured directly from live dev server with full Layout Shell (Sidebar + Topbar)?
- [ ] No static mock HTML preview files used?
- [ ] Input fields and search bars have full width, no squished layout?
- [ ] All numeric figures use `tabular-nums` and right alignment?
- [ ] Animated GIF or video included for multi-step flows?
- [ ] Image assets pushed to remote branch?
- [ ] Raw Markdown image link verified on GitHub PR page (no broken images)?

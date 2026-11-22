# ERP UX/UI Design Guidelines (Vietnamese SME & Production)

Interface design rules for Enterprise Resource Planning (ERP), Accounting, Purchasing, and Workshop Production Management systems.

> **Language Policy**:
> - Instructions and guidelines: English (token-efficient).
> - End-user UI strings and PR descriptions: Vietnamese.

---

## 1. Enterprise Data Density
- **Typography & Row Sizing**:
  - Use font sizes `13px` (secondary) and `14px` (primary) for numerical tables.
  - Table row height: `36px - 40px` (compact mode), avoiding bloated SaaS marketing padding.
- **Number Alignment & Formatting**:
  - Mandatory CSS property: `font-variant-numeric: tabular-nums` (or class `.tabular-nums`).
  - **Strict Right-Alignment (`text-align: right`)** for all currency (VND), unit price, quantity (kg, lít, tấn), tax rates, and yield percentages.
  - Left-alignment (`text-align: left`) for document codes, partner names, and descriptions.
  - Center-alignment (`text-align: center`) for dates, status badges, and action buttons.

---

## 2. Eliminate Hero Banners — Data Table First
- **Compact Topbar (48px - 52px)**:
  - Replace oversized hero banners with a thin header containing breadcrumbs, module title, period filter (`This Month / This Quarter / Custom`), and primary action CTA (`+ New Weigh Slip / Expense Invoice`).
- **Compact KPI Banner (76px - 84px)**:
  - Display 4-5 core financial/production KPIs in a single horizontal row.
  - Primary metric: bold `20px - 24px`, secondary labels: `12px`.
- **Immediate Data Table Visibility**:
  - The primary document table must be visible immediately on page load without intermediate navigation cards.
  - Use horizontal tabs at the top for sub-views (e.g. `All` | `Weighbridge Slips` | `VAT Expenses` | `Supplier Ranking`).

---

## 3. Accented Vietnamese for All User UI (100%)
- Strictly prohibit unaccented Vietnamese in the user interface.
- All user-visible labels, alerts, notifications, buttons, and headers must use correct, professional Vietnamese accounting terminology:
  - `Phiếu thu tiền mặt`, `Phiếu chi tiền mặt`, `Ủy nhiệm chi (Báo nợ)`, `Báo có ngân hàng`
  - `Số dư quỹ tiền mặt`, `Tài khoản ngân hàng`, `Công nợ phải trả`, `Công nợ phải thu`
  - `Trọng lượng tịnh (kg)`, `Tỷ lệ thu hồi dầu (% Yield)`, `Hao hụt bã dừa`

---

## 4. Split-View & Slide-over Drawer Layout
- **Split-View (Two Columns)**:
  - Invoice verification: Left pane (40-50%) displays original invoice PDF/image with zoom controls; Right pane (50-60%) contains data entry/verification form.
- **Slide-over Drawer for Quick Actions**:
  - Line-item entries, supplier payments, and batch recordings open in a slide-over drawer from the right, preserving background table scroll and filter context.

---

## 5. Keyboard-First Data Entry
- Full `Tab` navigation across consecutive input fields.
- Table line-item entry: pressing `Enter` creates the next row automatically.
- Realtime formula calculation: `Subtotal = Quantity × Unit Price` and `Total = Subtotal + VAT - Discounts`.

---

## 6. Consistent Color Palette & Status Coding
- Gray (`#f1f5f9` / `#475569`): *Draft (Bản nháp)*.
- Amber (`#fef3c7` / `#92400e`): *Pending Payment / Pending Approval (Chờ thanh toán / Chờ duyệt)*.
- Green (`#dcfce7` / `#15803d`): *Paid / Completed / Meeting Target (Đã thanh toán / Đạt chuẩn)*.
- Red (`#fee2e2` / `#b91c1c`): *Canceled / Overdue / Warning (Đã hủy / Quá hạn / Cảnh báo)*.

---

## 7. System Icon Standardization (Lucide React via AppIcon)
- **STRICT BAN ON CARTOON EMOJIS**:
  - Do NOT use emojis (`🥥`, `🌾`, `⚙️`, `🏆`, `📦`, `🧮`, `⚡`, `💰`, `💵`, `🏦`, `⚖️`, `🧾`, `🏢`, `🛢️`, `🥇`, `🥈`, `🥉`) in buttons, tabs, modal headers, or badges.
- **Mandatory SVG Lucide Icon System**:
  - Use `<AppIcon name="..." size={16} />` based on Lucide React (`strokeWidth: 2.1`).
  - Standard icons: `Scale` (weigh slip), `ReceiptText` (VAT invoice), `Cog` (batch press/filter), `Trophy` / `Medal` (supplier ranking), `Package` / `Boxes` (inventory/stock), `BarChart3` / `Calculator` (cost calculation), `Droplet` (crude oil), `Leaf` (coconut meal byproduct), `Coins` (cash vouchers), `Landmark` (bank advice), `CheckCircle2` (complete), `AlertTriangle` (warning).

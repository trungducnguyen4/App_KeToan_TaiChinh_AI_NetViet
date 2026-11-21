# Dầu Dừa NetViet — AI Developer Harness & Guidelines

> **Single Source of Truth (SSOT)** for all AI agents, pairing assistants, and automated engineering workflows across the ERP Dầu Dừa NetViet workspace (`App_KeToan_TaiChinh_AI_NetViet`).

---

## 1. Modular Engineering Rules

All engineering rules, workflows, and invariants are organized under `.agents/rules/`:

| Rule Module | Scope & Purpose | Link |
| :--- | :--- | :--- |
| **Core Principles** | SSOT, standard language policy (EN tech specs / VI user UI), minimal invasive changes | [`.agents/rules/core.md`](.agents/rules/core.md) |
| **Git Flow & Boundaries** | Branching model (`NV-xxx`), SemVer, PR specification template, safe autonomous boundaries | [`.agents/rules/git-workflow.md`](.agents/rules/git-workflow.md) |
| **Risk-Based Verification** | 4-Tier verification protocol (Tier 1 Trivial ➔ Tier 4 Full Flow/Perf), visual proofs | [`.agents/rules/verification.md`](.agents/rules/verification.md) |

---

## 2. Risk-Based Verification Protocol (4 Trụ Cột)

Mọi thay đổi code hoặc tính năng mới bắt buộc phải chứng minh bằng **bằng chứng cụ thể** tương ứng với 4 Tier:

- **Tier 1 (Trivial / Docs / Typo)**: Syntax & type check (`npm run typecheck`), clean `git diff`. Visual proof không bắt buộc.
- **Tier 2 (Backend / Logic / DB / Security)**: Tier 1 + Build pass 100% (`npm run api:build`) + Live API runtime verification (`HTTP status 200/201/400`).
- **Tier 3 (Static UI / Layout)**: Tier 2 + Live Dev Server screenshot có đầy đủ Layout Shell (Sidebar 280px, Header). CẤM tạo file HTML mock preview tĩnh.
- **Tier 4 (Complex User Flow / Latency / Cost Engine)**: Tier 3 + Animated GIF hoặc Screen Recording (`.mp4`) mô phỏng trọn vẹn thao tác người dùng, nhúng trực tiếp bằng Markdown Image vào PR description trên GitHub.

---

## 3. Skills Directory (`.agents/skills/`)

Các bộ kỹ năng chuyên biệt sẵn sàng cho Agent thực thi:
- **`pull-request`**: Quy chuẩn 5 bước mở Pull Request, kiểm tra ranh giới Git an toàn, tự động điền template [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
- **`verification-visual-proof`**: Tiêu chuẩn chụp ảnh và quay màn hình từ Dev Server thật, cấm mock HTML tĩnh, đóng gói Animated GIF qua `scripts/create_visual_gif.py` và nhúng link trực tiếp vào PR.

---

## 4. ERP Domain Invariants & UX/UI Standards

1. **Chuẩn Icon Hệ thống: Đồng bộ theo Sidebar (`AppIcon`)**:
   - **CẤM DÙNG CARTOON EMOJI** (`🥥`, `🌾`, `⚙️`, `🏆`, `📦`, `🧮`, `⚡`, `💰`, `💵`, `🏦`, `⚖️`, `🧾`, `🏢`, `🛢️`...) trên toàn bộ nút, tab, header, modal và badge.
   - Bắt buộc dùng component `<AppIcon name="..." />` lấy icon từ thư viện Lucide React đồng nhất với Sidebar, nét vẽ `strokeWidth: 2.1`.
2. **Chuẩn Mật độ Dữ liệu Doanh nghiệp (Data Density)**:
   - Font bảng số liệu bắt buộc áp dụng CSS `tabular-nums` (`font-variant-numeric: tabular-nums`).
   - Mọi cột tiền tệ (VND) và khối lượng (kg, Tấn, Lít) bắt buộc **căn lề phải** (`.text-right`).
3. **Tiếng Việt Có Dấu 100%**:
   - Tất cả các nhãn, tiêu đề, trạng thái, modal, bảng dữ liệu đều phải là tiếng Việt có dấu chuẩn nghiệp vụ kế toán/sản xuất.
4. **Công thức Giá thành Dầu Dừa Thô (Realtime)**:
   $$\text{Giá thành 1 kg dầu thô} = \frac{\sum \text{CP Nguyên liệu} + \sum \text{CP Ép/Lọc} + \sum \text{CP Chung} - \sum \text{Thu hồi Bã dừa}}{\text{Tổng sản lượng kg Dầu dừa thô}}$$
5. **Liên kết 1-click Thu Chi (Voucher Engine)**:
   - Mua hàng (phiếu cân vỏ dừa, chi phí VAT) ➔ Sinh Phiếu chi tiền mặt (PC) hoặc Báo nợ ngân hàng (BN).
   - Bán hàng (dầu dừa thô, bã dừa) ➔ Sinh Phiếu thu tiền mặt (PT) hoặc Báo có ngân hàng (BC).

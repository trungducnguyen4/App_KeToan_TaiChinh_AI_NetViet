---
name: pull-request
description: >-
  Quy chuẩn và luồng tự động hóa mở Pull Request (PR) chuẩn 4 Trụ Cột (Tests, Runtime, Visual, Confidence). Hướng dẫn kiểm tra nhánh, chạy typecheck/test, lấy bằng chứng runtime API/DB, nhúng ảnh/GIF minh chứng trực quan vào PR description, và tuân thủ ranh giới an toàn cho AI agent.
whenToUse: >-
  Kích hoạt khi người dùng yêu cầu: mở PR, tạo Pull Request, review PR, kiểm tra điều kiện merge PR, hoặc chuẩn bị bộ chứng từ kiểm thử để submit code lên GitHub.
---

# Pull Request (PR) Automation & Authoring Skill

Bộ kỹ năng này chuẩn hóa quy trình tạo và nghiệm thu Pull Request cho dự án ERP Dầu Dừa NetViet (`App_KeToan_TaiChinh_AI_NetViet`), kết hợp chặt chẽ với **Verification Protocol — 4 Trụ Cột** và **Git Automation Boundaries**.

---

## 1. Quy trình 5 bước tạo Pull Request chuẩn

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Git & Branch │ ──> │ 2. Tests & Build │ ──> │ 3. Runtime Check │ ──> │ 4. Visual Proof  │ ──> │ 5. Open & Embed │
│ (NV-xxx pattern)│     │ (npm typecheck)  │     │ (Live API status)│     │ (Real Dev Server)│     │ (Direct Raw URL)│
└─────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘     └─────────────────┘
```

### Bước 1: Kiểm tra Nhánh & Conventional Commits
- Xác định mã Issue / Ticket: ví dụ `NV-001`, `NV-002`.
- Tên nhánh: `feature/NV-xxx` hoặc `bugfix/NV-xxx`.
- Commit messages: Theo chuẩn Conventional Commits tiếng Anh:
  - `feat(cost): ...`
  - `fix(purchasing): ...`
  - `refactor(ui): ...`
  - `docs(proof): ...`

### Bước 2: Chạy Kiểm tra Cú pháp & Build (Trụ cột 1: Tests)
Bắt buộc chạy và kiểm tra kết quả:
```powershell
npm run typecheck
```
- Phải đảm bảo `@workit/api build` và `tsc --noEmit` hoàn thành với **Exit code 0 (0 errors)**.
- Ghi nhận chỉ số: `Passed 100%, 0 failures`.

### Bước 3: Xác minh Runtime Thực tế (Trụ cột 2: Runtime)
Gọi trực tiếp API hoặc kiểm tra dữ liệu qua curl/fetch:
- **Endpoint kiểm tra**: ví dụ `GET /api/batches/cost-summary`, `POST /api/invoices`.
- **HTTP Status Code**: `200 OK` hoặc `201 Created`.
- **Dữ liệu trả về**: Đúng shape dữ liệu, không có lỗi 500 hay trường `undefined`.
- **Trạng thái Database**: Xác minh bản ghi được ghi nhận vào MariaDB (ví dụ số lượng mẻ, giá thành 1 kg dầu dừa).

### Bước 4: Thu thập Bằng chứng Trực quan (Trụ cột 3: Visual)
- **Đối với Static UI / Bảng dữ liệu (Tier 3)**:
  - Chụp ảnh màn hình từ Dev Server thật `http://localhost:3000` (giữ nguyên Sidebar 280px và Header).
  - Lưu vào thư mục `docs/screenshots/<ticket>-<view>.png`.
- **Đối với User Flow / Quy trình tính giá thành / Thanh toán 1-click (Tier 4)**:
  - Chụp chuỗi thao tác (nhập liệu ➔ bấm nút ➔ kết quả).
  - Dùng script `python scripts/create_visual_gif.py` đóng gói thành Animated GIF mượt mà.
  - Lưu vào `docs/screenshots/<ticket>-<flow>.gif`.
- Commit và push ảnh/GIF lên nhánh làm việc:
  ```powershell
  git add docs/screenshots/
  git commit -m "docs(proof): add visual proof for NV-xxx"
  git push origin <branch-name>
  ```

### Bước 5: Viết Nội dung PR & Mở Pull Request (Trụ cột 4: Confidence)
Điền đầy đủ theo file template [`.github/PULL_REQUEST_TEMPLATE.md`](file:///.github/PULL_REQUEST_TEMPLATE.md):

```markdown
## 📌 Overview
[Tóm tắt ngắn gọn tính năng hoặc bugfix vừa triển khai]

---

## 🔍 Proof of Change & Confidence Report (Verification Protocol — 4 Trụ Cột)

### 1. 🧪 Tests (Focused logic and integration checks)
- [x] Syntax & Type check (`npm run typecheck`): Passed (0 errors)
- [x] API build check (`npm run api:build`): Passed (0 errors)
- [x] Test metrics: Passed 100%

### 2. ⚡ Runtime (Use the actual feature end to end)
- **Endpoint / Action**: GET /api/batches/cost-summary, POST /api/invoices
- **Status code / Response**: HTTP 200 OK / HTTP 201 Created
- **Database verification**: Dữ liệu phiếu cân & giá thành lưu trữ nhất quán trong MariaDB

### 3. 👁️ Visual (Inspect what the user will see)
- [x] **Visual Evidence:**
  ![Minh chứng UI/User Flow](https://raw.githubusercontent.com/trungducnguyen4/App_KeToan_TaiChinh_AI_NetViet/<branch-name>/docs/screenshots/<filename>.gif)

### 4. 🎯 Confidence (State what was verified — and what was not)
- **Mức độ tự tin (Confidence level)**: High
- **Những gì ĐÃ được chứng minh (Verified)**:
  - Bảng tính giá thành tự động phân rã 5 yếu tố chi phí.
  - Form nhập liệu phiếu cân vỏ dừa tự động tính tiền trừ tạp chất.
  - Giao diện tiếng Việt có dấu chuẩn ERP và font `tabular-nums`.
- **Những gì CHƯA kiểm thử / Ranh giới phụ thuộc (NOT verified)**:
  - Kết nối phần cứng cổng COM trực tiếp từ cân bàn điện tử tại cổng xưởng.

---

## 🚀 Deployment Checklist
- [x] Code passes typecheck & build locally
- [x] No hardcoded environment paths / credentials / secrets
- [x] Screenshots / Videos attached for visual proof (full Layout Shell)
- [x] Accented Vietnamese UI strings verified
```

---

## 2. Ranh giới An toàn Tự động hóa Git (Agent Boundaries)

### ✅ Được phép tự động thực hiện:
- Tạo nhánh tính năng/sửa lỗi `feature/NV-xxx`.
- Chạy typecheck, build, test.
- Chụp ảnh màn hình / xuất GIF từ trình duyệt thật và lưu vào `docs/screenshots/`.
- Commit code theo Conventional Commits và push nhánh feature lên remote.
- Mở Pull Request hoặc cập nhật PR body trên GitHub.

### ⛔ TUYỆT ĐỐI CẤM (Phải có xác nhận của con người):
- CẤM push trực tiếp vào các nhánh bảo vệ (`main`, `master`, `production`, `develop`).
- CẤM dùng lệnh force push (`git push -f` hoặc `--force-with-lease`).
- CẤM tự động merge PR vào nhánh chính mà không có sự đồng ý của reviewer.

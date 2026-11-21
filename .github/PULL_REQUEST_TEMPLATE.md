## 📌 Overview
<!-- Tóm tắt ngắn gọn mục tiêu của Pull Request và các thay đổi chính -->

---

## 🔍 Proof of Change & Confidence Report (Verification Protocol — 4 Trụ Cột)

### 1. 🧪 Tests (Focused logic and integration checks)
<!-- Báo cáo kết quả kiểm tra cú pháp, typescript và chạy test tự động -->
- [ ] Syntax & Type check (`npm run typecheck` / `tsc --noEmit`): Passed (0 errors)
- [ ] API build check (`npm run api:build`): Passed
- [ ] Automated tests (`npm test`): Passed
- [ ] Test metrics: <!-- ví dụ: 25/25 assertions passed, 0 failures -->

### 2. ⚡ Runtime (Use the actual feature end to end)
<!-- Báo cáo kết quả thực thi thực tế tính năng từ đầu đến cuối trên Dev Server / API -->
- **Endpoint / Action**: <!-- ví dụ: POST /api/invoices, POST /api/batches/calculate-cost -->
- **Status code / Response**: <!-- ví dụ: HTTP 201 Created / HTTP 200 OK, response payload -->
- **Database / State verification**: <!-- ví dụ: Bảng invoices, batches, cost calculations được cập nhật chính xác trong DB -->

### 3. 👁️ Visual (Inspect what the user will see)
<!-- 
BẮT BUỘC NHÚNG TRỰC TIẾP HÌNH ẢNH / HOẠT ẢNH VÀO ĐÂY:
- Nếu chỉnh UI / Component / Bảng dữ liệu: BẮT BUỘC nhúng SCREENSHOT chụp từ Dev Server thật (kèm Sidebar 280px + Header đầy đủ):
  ![Minh chứng UI](https://raw.githubusercontent.com/trungducnguyen4/App_KeToan_TaiChinh_AI_NetViet/<branch-or-commit>/docs/screenshots/<file>.png)
- Nếu chỉnh Luồng người dùng (User Flow) / Tính toán giá thành: BẮT BUỘC nhúng ANIMATED GIF / VIDEO quay lại thao tác thực tế (gõ, click chọn, modal/dialog, tiến trình xử lý, kết quả):
  ![Minh chứng User Flow](https://raw.githubusercontent.com/trungducnguyen4/App_KeToan_TaiChinh_AI_NetViet/<branch-or-commit>/docs/screenshots/<file>.gif)
- NGHIÊM CẤM chỉ ghi text đường dẫn file cục bộ. Reviewer phải nhìn thấy hình ảnh/hoạt ảnh chuyển động ngay trên trang PR.
- NGHIÊM CẤM tạo file HTML mock/preview tĩnh để đối phó.
-->

### 4. 🎯 Confidence (State what was verified — and what was not)
- **Mức độ tự tin (Confidence level)**: High / Medium / Low
- **Những gì ĐÃ được chứng minh (Verified)**:
  - 
  - 
- **Những gì CHƯA kiểm thử / Ranh giới phụ thuộc (NOT verified)**:
  - 
  - 

---

## 🚀 Deployment Checklist
- [ ] Code passes typecheck & build locally
- [ ] No hardcoded environment paths / credentials / secrets
- [ ] Screenshots / Videos attached for visual proof (full Layout Shell)
- [ ] Accented Vietnamese UI strings verified (Tiếng Việt có dấu chuẩn ERP)

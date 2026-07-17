# Bản đồ Nghiệp vụ Kế toán Tích hợp AI (AI Accounting Business Flows)

Tài liệu này cung cấp chi tiết về các nghiệp vụ kế toán được tích hợp công nghệ AI (thông qua Dify workflows/chatflow và backend NestJS) trong dự án hiện tại, kèm theo các đường dẫn URL tương ứng của từng phân hệ trên môi trường Local.

---

## 1. Bản đồ tổng quan (Overview Map)

| STT | Nghiệp vụ kế toán | Dify Workflow Key | URL trên Local (`http://localhost:3000`) | API Backend chính |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Đọc hóa đơn/chứng từ & Gợi ý định khoản | `ocr-accounting` | `/modules/accounting/input-einvoices` | `POST /api/ai/chat/upload` (hoặc custom tool) |
| **2** | Đối chiếu ngân hàng tự động | `semantic-reconciliation` | `/modules/cash/reconciliation` | `POST /api/ai/workflows/run` |
| **3** | Giải trình & Soạn văn bản cảnh báo | `alert-writer` | `/modules/accounting` | `POST /api/ai/workflows/run` |
| **4** | Lập báo cáo quản trị CFO | `cfo-report` | `/modules/reports` (phần Báo cáo CFO) | `POST /api/ai/workflows/run` |
| **5** | Trợ lý ảo CFO Chat & Đánh giá chứng từ | N/A (Chatflow) | Toàn hệ thống (khung chat AI Agent) | `POST /api/ai/chat` |

---

## 2. Chi tiết từng nghiệp vụ

### 2.1. Đọc hóa đơn & Gợi ý định khoản (`ocr-accounting`)

#### A. Phân hệ Hóa đơn đầu vào (Input E-Invoices)
* **Đường dẫn URL**: [http://localhost:3000/modules/accounting/input-einvoices](http://localhost:3000/modules/accounting/input-einvoices)
* **Nguyên lý hoạt động**:
  * Khi người dùng tải hóa đơn điện tử (PDF/Ảnh) lên giao diện chính, AI sẽ chạy workflow OCR để chiết xuất thông tin: *Số hóa đơn, ngày hóa đơn, tên đối tác bán, mã số thuế, tổng số tiền*.
  * Đề xuất tài khoản kế toán định khoản đối ứng kép (`debitAccount`/`creditAccount`) và điền các chiều quản trị phụ trợ: mã đối tượng (`counterpartyCode`), số hợp đồng (`contractNo`).
  * Sau khi xử lý xong, hệ thống sẽ tự động chuyển hướng sang giao diện **Workspace thủ công** (`?action=create`) để kế toán đối chiếu và chỉnh sửa trước khi ghi sổ chính thức.

#### B. Phân hệ Phiếu thu / Phiếu chi / Báo nợ / Báo có (PT/PC/BN/BC)
* **Đường dẫn URL**:
  * **Phiếu thu**: [http://localhost:3000/modules/cash/receipts](http://localhost:3000/modules/cash/receipts)
  * **Phiếu chi**: [http://localhost:3000/modules/cash/payments](http://localhost:3000/modules/cash/payments)
  * **Báo nợ**: [http://localhost:3000/modules/cash/bank-debits](http://localhost:3000/modules/cash/bank-debits)
  * **Báo có**: [http://localhost:3000/modules/cash/bank-credits](http://localhost:3000/modules/cash/bank-credits)
* **Nguyên lý hoạt động**:
  * Tại các màn hình này, nếu người dùng tải tệp đính kèm lên khung chat, yêu cầu OCR sẽ được định tuyến thông qua endpoint `POST /api/ai/chat/upload` tới workflow `ocr-accounting` với tham số `voucher_type` tương ứng (`PT`, `PC`, `BN`, `BC`).
  * AI sẽ trả về cấu trúc JSON chứng từ gợi ý để tự động điền nhanh vào form nhập liệu.

---

### 2.2. Đối chiếu ngân hàng tự động (`semantic-reconciliation`)
* **Đường dẫn URL**: [http://localhost:3000/modules/cash/reconciliation](http://localhost:3000/modules/cash/reconciliation)
* **Nguyên lý hoạt động**:
  * So khớp thông minh giữa các dòng sao kê ngân hàng nhập ngoại (Bank Statement) với các chứng từ kế toán có sẵn trong hệ thống (Sổ quỹ, Báo nợ/Báo có).
  * Sử dụng thuật toán ngữ nghĩa phân tích tên đối tác thanh toán, số tiền và nội dung diễn giải (ví dụ: *"Minh An thanh toan HD00256"* sẽ tự động gợi ý khớp với hóa đơn phải thu của khách hàng Minh An) ngay cả khi không khớp chính xác 100% text.
  * AI tính toán độ tin cậy và đưa ra đề xuất khớp để kế toán phê duyệt nhanh.

---

### 2.3. Giải trình & Soạn văn bản cảnh báo (`alert-writer`)
* **Đường dẫn URL**: [http://localhost:3000/modules/accounting](http://localhost:3000/modules/accounting)
* **Nguyên lý hoạt động**:
  * Tại giao diện chính của phân hệ Sổ cái & Hạch toán, hệ thống hiển thị khối "Cảnh báo cần xem" (bao gồm các cảnh báo tự động như Nợ quá hạn, Chi vượt định mức, Dòng tiền âm, Bút toán lệch).
  * Khi kế toán bấm chọn một cảnh báo cụ thể từ danh sách bên trái, chi tiết cảnh báo sẽ được hiển thị kèm theo nút **"AI soạn văn bản"**.
  * AI sẽ phân tích các thuộc tính thực tế, ngưỡng cảnh báo, độ chênh lệch để tự động soạn thảo một bản nháp báo cáo giải trình hoàn chỉnh giúp kế toán trình duyệt hoặc đề xuất biện pháp xử lý.

---

### 2.4. Lập báo cáo quản trị CFO (`cfo-report`)
* **Đường dẫn URL**: [http://localhost:3000/modules/reports](http://localhost:3000/modules/reports)
* **Nguyên lý hoạt động**:
  * Tự động tổng hợp số liệu từ các luồng tiền thu/chi thực tế, công nợ phải thu/phải trả và kết quả kinh doanh.
  * AI đóng vai trò như một CFO ảo tự động lập báo cáo phân tích quản trị ngắn gọn: nêu rõ tình hình dòng tiền thuần (dương/âm), các điểm nóng công nợ nguy cơ cao (khách hàng nợ quá hạn lớn), và đưa ra khuyến nghị kiểm soát dòng tiền trong 7 ngày tới.

---

### 2.5. Trợ lý ảo CFO Chat & Đánh giá chứng từ (Chatflow & Copilot)
* **Đường dẫn URL**: Toàn hệ thống (Nút Trợ lý AI ở góc màn hình)
* **Nguyên lý hoạt động**:
  * Nhận biết màn hình làm việc hiện tại của người dùng để lấy ngữ cảnh.
  * **Đánh giá chứng từ nhanh**: Khi ở các trang PT/PC/BN/BC, nếu người dùng hỏi chatbot về chứng từ đang chọn, AI sẽ trực tiếp phân tích cấu trúc dữ liệu JSON để kiểm tra tính hợp lệ (VD: lệch tiền giữa tổng và chi tiết dòng, thiếu mã đối tượng, định khoản không đúng quy tắc kế toán thường gặp).
  * **Truy xuất dữ liệu động (Tools)**: Chatbot gọi trực tiếp các hàm nghiệp vụ để lấy dữ liệu thực tế:
    * `get_cashflow_summary`: Lấy tóm tắt dòng tiền.
    * `get_due_debts`: Lấy công nợ quá hạn.
    * `detect_missing_vouchers`: Tìm kiếm chứng từ bị thiếu.

---

## 3. Cơ chế Chạy mô phỏng (Offline Fallback)

Khi không cấu hình API Key của Dify trong file `.env`, hệ thống backend NestJS tự động chuyển sang chế độ mô phỏng dữ liệu (Mock completions) trong file `ai.service.ts`:
* Trả về kết quả OCR mẫu theo các loại chứng từ (`PT`, `PC`, `BN`, `BC`, `HT2`, `HT1`).
* Mô phỏng báo cáo CFO và văn bản cảnh báo chi phí vận hành với số liệu giả lập thực tế khớp với hệ thống kế toán in-memory trong `mock-accounting-store.ts`.

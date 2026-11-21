# ERP UX/UI Design Guidelines (Vietnamese SME & Production)

Bộ quy tắc thiết kế giao diện cho phần mềm Quản trị Doanh nghiệp (ERP), Kế toán, Thu mua và Quản lý Phân xưởng sản xuất tại Việt Nam.

## 1. Mật độ Dữ liệu Chuẩn Enterprise (Data Density)
- Dùng cỡ chữ `13px` (phụ trợ) và `14px` (nội dung chính) cho bảng số liệu.
- Chiều cao dòng trong bảng: `36px - 40px` (compact mode).
- Bắt buộc áp dụng thuộc tính CSS: `font-variant-numeric: tabular-nums` (hoặc class `tabular-nums`).
- **Căn lề phải (`text-align: right`)** tuyệt đối cho mọi cột tiền tệ, đơn giá, số lượng (kg, lít, tấn), thuế suất, tỷ lệ %.
- Căn lề trái (`text-align: left`) cho mã chứng từ, tên đối tượng, nội dung diễn giải.
- Căn giữa (`text-align: center`) cho ngày tháng, trạng thái, hành động.

## 2. Loại bỏ Banner Rườm rà — Đưa Bảng Dữ Liệu ra Mặt Tiền
- **Thanh Header mỏng gọn (48px - 52px)**: Breadcrumb, Tiêu đề phân hệ, Bộ lọc kỳ (`Tháng này / Quý này / Tùy chọn`), nút CTA chính.
- **Thẻ KPI nén thành 1 hàng gọn (~76px - 84px)**: 4-5 chỉ số tài chính/sản xuất cốt lõi trên 1 hàng.
- **Bảng dữ liệu (Data Table) xuất hiện ngay lập tức**: Sử dụng **Tab ngang** ở đầu trang để chuyển đổi giữa các loại chứng từ.

## 3. Đồng bộ 100% Tiếng Việt Có Dấu Chuẩn Nghiệp Vụ
- Tuyệt đối không dùng tiếng Việt không dấu.
- Mọi nhãn, thông báo, nút bấm, tiêu đề cột phải dùng tiếng Việt có dấu chuẩn mực kế toán Việt Nam.

## 4. Bố cục Split-View & Ngăn Kéo (Slide-over Drawer / Sheet)
- Bố cục Split-View: Đối chiếu file ảnh/PDF gốc bên trái và form nhập liệu bên phải.
- Slide-over Drawer: Thao tác tạo mới/chỉnh sửa trượt từ cạnh phải, không làm mất ngữ cảnh cuộn trang.

## 5. Nhập Liệu Thân Thiện Với Bàn Phím (Keyboard-First)
- Hỗ trợ phím `Tab` để di chuyển liên tục giữa các trường.
- `Enter` thêm dòng mới, tự động cộng dồn thành tiền và thuế theo thời gian thực.

## 6. Định Dạng Chuẩn Việt Nam & Trạng Thái Nhất Quán
- Tiền tệ: `12.500.000 ₫` (phân cách dấu chấm).
- Khối lượng: `12.500,5 kg`.
- Trạng thái nhất quán: Xám (Nháp), Vàng (Chờ thanh toán), Xanh lá (Đã thanh toán), Đỏ (Đã hủy/Cảnh báo).

## 7. Chuẩn Icon Hệ Thống: Đồng Bộ Theo Sidebar (Lucide React SVG Icons via AppIcon)
- **Tuyệt đối CẤM dùng Cartoon Emojis**: Không dùng các ký tự emoji (như `🥥`, `🌾`, `⚙️`, `🏆`, `📦`, `🧮`, `⚡`, `💰`, `💵`, `🏦`, `⚖️`, `🧾`, `🏢`, `🛢️`, `🥇`, `🥈`, `🥉`) ở bất kỳ đâu trên giao diện: Tab, Nút bấm, Badge, Modal header, Input placeholder. Emojis làm giao diện ERP bị thiếu chuyên nghiệp, lệch chuẩn B2B enterprise và hiển thị màu sắc lòe loẹt, méo mó trên các hệ điều hành khác nhau (Windows / Android / macOS / iOS).
- **Bắt buộc sử dụng hệ thống Icon SVG chuẩn Sidebar (`<AppIcon />`)**:
  - Toàn bộ giao diện phải dùng chung component `<AppIcon name="..." size={16} />` dựa trên thư viện Lucide React với nét chuẩn `strokeWidth: 2.1`.
  - Icon phải được căn chỉnh flexbox thẳng hàng với văn bản (`display: inline-flex; align-items: center; gap: 6px`).
  - Các icon thông dụng: `Scale` (phiếu cân), `ReceiptText` (hóa đơn VAT), `Cog` (mẻ ép/lọc), `Trophy` / `Medal` (xếp hạng thương lái), `Package` / `Boxes` (tồn kho/kho bãi), `BarChart3` / `Calculator` (giá thành), `Droplet` (dầu dừa thô), `Leaf` (bã dừa/phụ phẩm), `Coins` (thu chi/tiền mặt), `Landmark` (ngân hàng), `CheckCircle2` / `Check` (hoàn thành), `AlertTriangle` / `AlertCircle` (cảnh báo).

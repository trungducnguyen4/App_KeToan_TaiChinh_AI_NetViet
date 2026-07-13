import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";

const paymentDetailColumns = [
  "TK Nợ",
  "YT1 Nợ",
  "YT2 Nợ",
  "TK Có",
  "YT1 Có",
  "YT2 Có",
  "Tiền",
  "Diễn giải",
  "Tiền hàng",
  "% VAT",
  "Tiền VAT",
  "Mã đơn vị",
  "Tên đơn vị khai thuế",
  "Địa chỉ"
] as const;

const invoicePaymentColumns = [
  "",
  "",
  "",
  "Mã CT",
  "Số CT",
  "Ngày CT",
  "Số hóa đơn",
  "Ngày hóa đơn",
  "Ngày đến hạn",
  "Giá trị hóa đơn",
  "Giá trị còn nợ",
  "Thanh toán lần này",
  "Diễn giải"
] as const;

export default function BankDebitCreateScreen() {
  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">
            Trang chủ
          </a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/cash/bank-debits">
            Báo nợ ngân hàng
          </a>
          <span>/</span>
          <span>Thêm mới</span>
        </div>

        <div className="section-title">
          <h2>Báo nợ ngân hàng</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button">
              <AppIcon name="Save" />
              Lưu (F8)
            </button>
            <a className="button danger" href="/modules/cash/bank-debits">
              Hủy
            </a>
          </div>
        </div>

        <section className="panel">
          <div className="subsection">
            <h3>Thông tin</h3>
          </div>

          <div className="topbar-actions" style={{ marginBottom: 14 }}>
            <button className="button primary" type="button">
              Chọn
            </button>
          </div>

          <form className="form-grid">
            <label className="form-field sm">
              <span>Mã CT</span>
              <input className="field" defaultValue="BN1" />
            </label>
            <label className="form-field sm">
              <span>Ngày CT</span>
              <input className="field" defaultValue="13/07/2026" />
            </label>
            <label className="form-field md">
              <span>Số CT</span>
              <input className="field" defaultValue="26070001" />
            </label>
            <label className="form-field sm">
              <span>Loại tiền</span>
              <input className="field" defaultValue="VND" />
            </label>
            <label className="form-field lg">
              <span>CT gốc</span>
              <input className="field" defaultValue="" />
            </label>

            <label className="form-field sm">
              <span>Mã đơn vị</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field xl">
              <span>Đơn vị nhận tiền</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field xl">
              <span>Địa chỉ</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field md">
              <span>Mã số thuế</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field sm">
              <span>ĐT</span>
              <input className="field" defaultValue="" />
            </label>

            <label className="form-field sm">
              <span>Mã người nhận</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field md">
              <span>Tên người nhận</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field sm">
              <span>ĐT người nhận</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field xl">
              <span>Nội dung</span>
              <input className="field" defaultValue="" />
            </label>
          </form>
        </section>

        <div className="section-title">
          <h2>Chi tiết thanh toán</h2>
          <div className="topbar-actions">
            <button className="button" type="button">
              + (F4)
            </button>
            <span className="module-meta">Tổng cộng: 0</span>
            <span className="module-meta">Tổng tiền: 0</span>
            <span className="module-meta">Tổng VAT: 0</span>
          </div>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {paymentDetailColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: 120 }}>
                {paymentDetailColumns.map((column) => (
                  <td key={column} />
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        <div className="section-title">
          <h2>Thanh toán hóa đơn</h2>
          <div className="topbar-actions">
            <button className="button" type="button">
              Chọn thanh toán hóa đơn
            </button>
            <button className="button danger" type="button">
              Xóa tất cả thanh toán
            </button>
            <span className="module-meta">Tổng tiền NTệ: 0,00</span>
            <span className="module-meta">Tổng tiền: 0</span>
          </div>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {invoicePaymentColumns.map((column, index) => (
                  <th key={`${column || "blank"}-${index}`}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: 120 }}>
                {invoicePaymentColumns.map((column, index) => (
                  <td key={`${column || "blank"}-${index}`} />
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        <div className="section-title">
          <h2>Tệp tin đính kèm</h2>
          <div className="topbar-actions">
            <button className="button" type="button">
              <AppIcon name="Upload" />
              Tải lên
            </button>
            <button className="button" type="button">
              Thêm Link
            </button>
          </div>
        </div>

        <section className="panel">
          <div className="attachment-box">
            Chưa có tệp đính kèm. Khu vực này sẽ nối với `attachment_files` và checksum để phục vụ audit.
          </div>
        </section>
      </div>
    </AppShell>
  );
}

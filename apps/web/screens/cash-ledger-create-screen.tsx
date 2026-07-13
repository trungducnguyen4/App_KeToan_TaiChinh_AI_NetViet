import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";

type CashLedgerCreateScreenProps = {
  title: string;
  backHref: string;
  codePrefix: "PT" | "PC";
  counterpartyLabel: string;
  documentLabel: string;
};

const paymentDetailColumns = [
  "TK Nợ",
  "TK Có",
  "YT1 Có",
  "YT2 Có",
  "Tỷ giá",
  "Tiền NTệ",
  "Tiền",
  "Diễn giải"
] as const;

export default function CashLedgerCreateScreen({
  title,
  backHref,
  codePrefix,
  counterpartyLabel,
  documentLabel
}: CashLedgerCreateScreenProps) {
  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">
            Trang chủ
          </a>
          <span>/</span>
          <a className="breadcrumb-link" href={backHref}>
            {title}
          </a>
          <span>/</span>
          <span>Thêm mới</span>
        </div>

        <div className="section-title">
          <h2>{title}</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button">
              <AppIcon name="Save" />
              Lưu (F8)
            </button>
            <a className="button danger" href={backHref}>
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
              <span>Mã ctừ</span>
              <input className="field" defaultValue={`${codePrefix}1`} />
            </label>
            <label className="form-field sm">
              <span>Ngày ctừ</span>
              <input className="field" defaultValue="13/07/2026" />
            </label>
            <label className="form-field md">
              <span>Số ctừ</span>
              <input className="field" defaultValue="26070001" />
            </label>
            <label className="form-field sm">
              <span>Loại tiền</span>
              <input className="field" defaultValue="VND" />
            </label>
            <label className="form-field lg">
              <span>Ctừ gốc</span>
              <input className="field" defaultValue="" />
            </label>

            <label className="form-field sm">
              <span>Mã đơn vị</span>
              <input className="field" defaultValue="" />
            </label>
            <label className="form-field xl">
              <span>{counterpartyLabel}</span>
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
                <th />
                <th />
                <th />
                <th>Mã CT</th>
                <th>Số CT</th>
                <th>Ngày CT</th>
                <th>Số hóa đơn</th>
                <th>Ngày hóa đơn</th>
                <th>Ngày đến hạn</th>
                <th>Giá trị hóa đơn</th>
                <th>Giá trị còn nợ</th>
                <th>Thanh toán lần này</th>
                <th>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: 120 }}>
                {Array.from({ length: 13 }).map((_, index) => (
                  <td key={index} />
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

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="attachment-box">
            <strong>Lưu ý</strong>
            <p>
              Màn này là form tạo mới cho {documentLabel}, giữ đúng pattern tách riêng khỏi danh sách để người dùng không
              bị chiếm toàn bộ màn hình khi chỉ đang xem chứng từ.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

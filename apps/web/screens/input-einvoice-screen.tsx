import { inputEInvoiceScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { StatusPill } from "../components/status-pill";

const invoiceRows = [
  {
    id: "INV-001",
    invoiceNo: "HD-2607001",
    invoiceDate: "2026-07-10",
    supplierName: "Công ty AAA",
    amount: "5.475.277",
    vatAmount: "547.528",
    templateNo: "01GTKT0",
    series: "AA/26E",
    status: "Chờ duyệt"
  }
];

export default function InputEInvoiceScreen() {
  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">Kế toán</a>
          <span>/</span>
          <span>{inputEInvoiceScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Hóa đơn điện tử</div>
            <h2 className="hero-title">{inputEInvoiceScreen.title}</h2>
            <p className="hero-copy">
              Màn này dùng layout gọn hơn Workit: một thanh công cụ ngắn phía trên, một menu hành động nhỏ, và bảng nhập liệu nằm dưới.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button">
                <AppIcon name="FileText" />
                Nhập HĐĐT đầu vào
              </button>
              <button className="button" type="button">
                <AppIcon name="Search" />
                HĐĐT chờ duyệt
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>HĐĐT</strong>
            <span>Các hành động được gom thành chip gọn, không dùng dropdown nặng như ảnh gốc.</span>
          </div>
        </section>

        <div className="split-grid">
          <section className="panel">
            <div className="subsection">
              <h3>Hành động</h3>
              <StatusPill status="ready" />
            </div>
            <div className="attachments compact-actions">
              <button className="button" type="button">Nhập HĐĐT đầu vào</button>
              <button className="button" type="button">HĐĐT đầu vào chờ duyệt</button>
              <button className="button" type="button">Thống kê HĐĐT đầu vào</button>
              <button className="button" type="button">Danh mục Nhóm hóa đơn</button>
              <button className="button" type="button">Danh mục Loại hóa đơn</button>
              <button className="button" type="button">Quy trình: HĐĐT đầu vào</button>
            </div>
          </section>

          <section className="panel">
            <div className="subsection">
              <h3>Bộ lọc nhanh</h3>
              <span className="module-meta">Gọn để thao tác nhanh</span>
            </div>
            <div className="form-grid invoice-filter-grid">
              <label className="form-field sm">
                <span>Từ ngày</span>
                <input className="field" defaultValue="01/07/2026" />
              </label>
              <label className="form-field sm">
                <span>Đến ngày</span>
                <input className="field" defaultValue="10/07/2026" />
              </label>
              <label className="form-field lg">
                <span>Tìm nhanh</span>
                <input className="field" defaultValue="Công ty AAA" />
              </label>
            </div>
          </section>
        </div>

        <div className="section-title">
          <h2>Danh sách HĐĐT đầu vào</h2>
          <div className="topbar-actions">
            <button className="button" type="button">Tìm</button>
            <button className="button primary" type="button">Export</button>
          </div>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {inputEInvoiceScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.invoiceNo}</td>
                  <td>{row.invoiceDate}</td>
                  <td>{row.supplierName}</td>
                  <td>{row.amount}</td>
                  <td>{row.vatAmount}</td>
                  <td>{row.templateNo}</td>
                  <td>{row.series}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}

import { inputEInvoiceScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { invoiceAssistantMock } from "../lib/document-assistant-mock-data";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

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

const pendingInvoiceRows = [
  {
    id: "PEN-001",
    invoiceNo: "HD-2607001",
    invoiceDate: "2026-07-10",
    series: "AA/26E",
    templateNo: "01GTKT0",
    supplierName: "Công ty AAA",
    amount: "5.475.277",
    vatRate: "10%",
    totalAmount: "6.022.805",
    vatAmount: "547.528",
    taxCode: "0101234567",
    address: "123 Lê Lợi, Q1",
    content: "Hóa đơn mua dịch vụ tháng 07/2026",
    link: "Mở"
  }
];

const pendingLineRows = [
  {
    id: "LINE-001",
    itemCode: "MH01",
    itemName: "Dịch vụ phần mềm",
    unit: "Gói",
    quantity: "1",
    exchangeRate: "1",
    unitPriceForeign: "5.475.277",
    unitPrice: "5.475.277",
    foreignAmount: "5.475.277",
    amount: "5.475.277",
    vatRate: "10%",
    vatAmount: "547.528",
    totalAmount: "6.022.805",
    description: "Dịch vụ phần mềm tháng 07/2026"
  }
];

export default function InputEInvoiceScreen() {
  const router = useRouter();
  const isPendingView = router.query.status === "pending";
  const [assistantFeedback, setAssistantFeedback] = useState("");

  if (isPendingView) {
    return (
      <AppShell activeModule="accounting">
        <div className="workspace">
          <div className="pending-topbar">
            <button className="pending-back" type="button" onClick={() => router.push("/modules/accounting/input-einvoices")}>
              <AppIcon name="ArrowLeft" size={18} />
            </button>
            <span className="pending-chip">HĐĐT đầu vào chờ duyệt</span>
          </div>

          <section className="pending-board">
            <div className="pending-board-title">
              <div>
                <strong>HĐĐT đầu vào chờ duyệt</strong>
              </div>
            </div>

            <section className="pending-table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th aria-hidden="true" />
                    <th aria-hidden="true" />
                    <th>Số hóa đơn</th>
                    <th>Ngày hóa đơn</th>
                    <th>Ký hiệu/Seri</th>
                    <th>Mẫu số</th>
                    <th>Tên đơn vị</th>
                    <th>Tiền hàng</th>
                    <th>% VAT</th>
                    <th>Tổng cộng</th>
                    <th>Tiền VAT</th>
                    <th>Mã số thuế</th>
                    <th>Địa chỉ</th>
                    <th>Nội dung</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoiceRows.map((row) => (
                    <tr key={row.id}>
                      <td />
                      <td />
                      <td>{row.invoiceNo}</td>
                      <td>{row.invoiceDate}</td>
                      <td>{row.series}</td>
                      <td>{row.templateNo}</td>
                      <td>{row.supplierName}</td>
                      <td>{row.amount}</td>
                      <td>{row.vatRate}</td>
                      <td>{row.totalAmount}</td>
                      <td>{row.vatAmount}</td>
                      <td>{row.taxCode}</td>
                      <td>{row.address}</td>
                      <td>{row.content}</td>
                      <td>{row.link}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="pending-footer-bar">
              <div className="pending-pager">
                <button type="button" aria-label="Trang đầu">|&lt;</button>
                <button type="button" aria-label="Trang trước">&lt;</button>
                <span className="pending-page-current">0</span>
                <button type="button" aria-label="Trang sau">&gt;</button>
                <button type="button" aria-label="Trang cuối">&gt;|</button>
                <select defaultValue="15" aria-label="Số dòng mỗi trang">
                  <option value="15">15</option>
                  <option value="25">25</option>
                </select>
                <span>dòng / trang</span>
              </div>
              <span className="pending-empty">Dữ liệu rỗng</span>
            </div>

            <section className="pending-detail-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Đvt</th>
                    <th>SL</th>
                    <th>Tỷ giá</th>
                    <th>ĐG NTệ</th>
                    <th>ĐG</th>
                    <th>Tiền NTệ</th>
                    <th>Tiền</th>
                    <th>% VAT</th>
                    <th>Tiền VAT</th>
                    <th>Tổng tiền</th>
                    <th>Diễn giải</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLineRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.itemCode}</td>
                      <td>{row.itemName}</td>
                      <td>{row.unit}</td>
                      <td>{row.quantity}</td>
                      <td>{row.exchangeRate}</td>
                      <td>{row.unitPriceForeign}</td>
                      <td>{row.unitPrice}</td>
                      <td>{row.foreignAmount}</td>
                      <td>{row.amount}</td>
                      <td>{row.vatRate}</td>
                      <td>{row.vatAmount}</td>
                      <td>{row.totalAmount}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </section>
        </div>
      </AppShell>
    );
  }

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

        <section className="panel ai-assistant-panel">
          <div className="ai-assistant-heading">
            <div>
              <span className="ai-assistant-eyebrow">OCR hóa đơn NCC</span>
              <h2>Đọc - phân loại - trích xuất hóa đơn đầu vào</h2>
              <p>
                Demo đọc file {invoiceAssistantMock.fileName}, nhận diện hóa đơn NCC, trích xuất thông tin thuế và
                đề xuất mapping trước khi tạo hóa đơn chờ duyệt.
              </p>
            </div>
            <span className="ai-assistant-badge">{invoiceAssistantMock.confidence}% tin cậy</span>
          </div>

          <div className="ai-doc-layout">
            <article className="ai-doc-card">
              <span className="ai-doc-file">
                <AppIcon name="FileText" />
                {invoiceAssistantMock.fileName}
              </span>
              <strong>{invoiceAssistantMock.classificationLabel}</strong>
              <p>{invoiceAssistantMock.recommendation}</p>
              <button
                className="button primary"
                type="button"
                onClick={() => setAssistantFeedback("Đã mô phỏng tạo hóa đơn đầu vào chờ duyệt từ kết quả OCR.")}
              >
                <AppIcon name="Bot" />
                Tạo hóa đơn chờ duyệt
              </button>
            </article>

            <div className="ai-extract-grid">
              {invoiceAssistantMock.extractedFields.map((field) => (
                <div className="ai-extract-item" key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-assistant-columns">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mapping</th>
                    <th>Đề xuất</th>
                    <th>Tin cậy</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceAssistantMock.mappingSuggestions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sourceType}</td>
                      <td>{item.suggestedValue}</td>
                      <td>{item.confidence}%</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nợ</th>
                    <th>Có</th>
                    <th>Số tiền</th>
                    <th>Yếu tố TK</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceAssistantMock.journalLines.map((line) => (
                    <tr key={`${line.debitAccount}-${line.creditAccount}-${line.amount}`}>
                      <td>{line.debitAccount}</td>
                      <td>{line.creditAccount}</td>
                      <td>{currency.format(line.amount)}</td>
                      <td>{line.dimension}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {assistantFeedback ? (
            <div className="ai-feedback-box">
              <strong>Kết quả mô phỏng</strong>
              <p>{assistantFeedback}</p>
            </div>
          ) : null}
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

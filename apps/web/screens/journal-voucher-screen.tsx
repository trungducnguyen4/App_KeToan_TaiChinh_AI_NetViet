import { journalVoucherScreen, journalVouchers } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { StatusPill } from "../components/status-pill";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

export default function JournalVoucherPage() {
  const firstVoucher = journalVouchers[0];

  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <span>Kế toán</span>
          <span>/</span>
          <span>{journalVoucherScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Mã phân hệ 5018</div>
            <h2 className="hero-title">{journalVoucherScreen.title}</h2>
            <p className="hero-copy">{journalVoucherScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{journalVouchers.length}</strong>
            <span>Chứng từ demo đã sẵn sàng để kiểm thử danh sách và chi tiết hạch toán.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Danh sách chứng từ</h2>
          <div className="topbar-actions">
            <a className="button primary" href="/modules/accounting/journal-vouchers/new">
              <AppIcon name="FileText" />
              Thêm (F2)
            </a>
            <button className="button" type="button">Xuất dữ liệu</button>
          </div>
        </div>

        <section className="panel table-scroll">
          <div className="toolbar">
            <input className="field" defaultValue="07/2026" aria-label="Từ tháng" />
            <input className="field" defaultValue="07/2026" aria-label="Đến tháng" />
            <button className="button" type="button">Trong năm</button>
            <input className="search" placeholder="Tìm số chứng từ, đơn vị, nội dung" aria-label="Tìm kiếm" />
            <button className="button primary" type="button">
              <AppIcon name="Search" />
              Tìm
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                {journalVoucherScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {journalVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td>{voucher.voucherType}</td>
                  <td>{voucher.voucherNo}</td>
                  <td>{voucher.voucherDate}</td>
                  <td>{currency.format(voucher.amount)}</td>
                  <td>{voucher.content}</td>
                  <td>{voucher.counterpartyCode}</td>
                  <td>{voucher.counterpartyName}</td>
                  <td>{voucher.currency}</td>
                  <td>
                    <StatusPill status={voucher.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="section-title">
          <h2>Chi tiết hạch toán</h2>
          <div className="topbar-actions">
            <span className="module-meta">Tổng tiền: 0</span>
            <span className="module-meta">Tổng VAT: 0</span>
            <span className="module-meta">Tổng cộng: 0</span>
            <button className="button" type="button">+ (F4)</button>
          </div>
        </div>
        <section className="panel table-scroll">
          <table className="data-table journal-detail-table">
            <thead>
              <tr>
                <th>TK Nợ</th>
                <th>YT1 Nợ</th>
                <th>YT2 Nợ</th>
                <th>TK Có</th>
                <th>YT1 Có</th>
                <th>YT2 Có</th>
                <th>Tiền</th>
                <th>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              {firstVoucher.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.debitAccount}</td>
                  <td>{line.debitDimension1}</td>
                  <td>{line.debitDimension2 ?? ""}</td>
                  <td>{line.creditAccount}</td>
                  <td>{line.creditDimension1}</td>
                  <td>{line.creditDimension2 ?? ""}</td>
                  <td>{currency.format(line.amount)}</td>
                  <td>{line.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="section-title">
          <h2>Thanh toán hóa đơn và tệp đính kèm</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button">Chọn thanh toán hóa đơn</button>
            <button className="button danger" type="button">Xóa tất cả thanh toán</button>
            <button className="button" type="button">
              <AppIcon name="Upload" />
              Tải lên
            </button>
          </div>
        </div>
        <section className="panel table-scroll">
          <table className="data-table invoice-table">
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
                <th>Giá trị hóa đơn</th>
                <th>Giá trị còn nợ</th>
                <th>Thanh toán lần này</th>
                <th>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td />
                <td />
                <td />
                <td>{firstVoucher.voucherType}</td>
                <td>{firstVoucher.voucherNo}</td>
                <td>{firstVoucher.voucherDate}</td>
                <td>HD-26070018</td>
                <td>2026-07-10</td>
                <td>{currency.format(firstVoucher.amount)}</td>
                <td>{currency.format(firstVoucher.amount)}</td>
                <td>{currency.format(firstVoucher.amount)}</td>
                <td>{firstVoucher.content}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="section-title">
          <h2>Tập tin đính kèm</h2>
          <div className="topbar-actions">
            <button className="button" type="button">Tải lên</button>
            <button className="button" type="button">Thêm Link</button>
          </div>
        </div>
        <section className="panel">
          <div className="attachment-box">
            Chưa có tệp đính kèm. Khu vực này sẽ nối với `attachment_files` và lưu checksum để phục vụ audit.
          </div>
        </section>
      </div>
    </AppShell>
  );
}

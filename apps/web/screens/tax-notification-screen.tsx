import { taxNotificationScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";

const taxRows = [
  {
    id: "TN-001",
    taxAuthorityCode: "CQT01",
    taxAuthorityName: "Chi cục Thuế Quận 1",
    serviceCode: "DV01",
    serviceName: "Thông báo nộp thuế",
    version: "1.0",
    recipientCode: "NR001",
    recipientName: "Công ty AAA",
    recipientAddress: "123 Lê Lợi, Q1",
    notificationCode: "TB01",
    notificationName: "Thông báo thuế GTGT",
    notificationVersion: "1.0",
    notificationNo: "TB-2607001",
    notificationDate: "2026-07-10",
    status: "Đã gửi",
    submittedAt: "2026-07-10"
  }
];

export default function TaxNotificationScreen() {
  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">Kế toán</a>
          <span>/</span>
          <span>{taxNotificationScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Công cụ thuế</div>
            <h2 className="hero-title">{taxNotificationScreen.title}</h2>
            <p className="hero-copy">
              Màn này tập trung vào bảng dữ liệu lớn như ảnh mẫu, nhưng giữ đúng component style của hệ thống kế toán hiện tại.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button">
                <AppIcon name="Search" />
                Tìm
              </button>
              <button className="button" type="button">
                <AppIcon name="Upload" />
                Import
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>Thuế</strong>
            <span>Nhập dữ liệu, lọc theo khoảng ngày và xuất Excel từ một khung bảng duy nhất.</span>
          </div>
        </section>

        <section className="panel table-scroll tax-panel">
          <div className="tax-toolbar">
            <input className="field" defaultValue="01/07/2026" aria-label="Từ ngày" />
            <input className="field" defaultValue="10/07/2026" aria-label="Đến ngày" />
            <div className="toolbar-actions-right">
              <button className="button button-sm" type="button">Xóa</button>
              <button className="button primary button-sm" type="button">Export Excel</button>
              <button className="button button-sm" type="button">Import</button>
              <button className="button button-sm" type="button">Tìm</button>
            </div>
          </div>

          <table className="data-table tax-table">
            <thead>
              <tr>
                <th colSpan={5}>Thông tin cơ quan thuế</th>
                <th colSpan={3}>Thông tin người nhận</th>
                <th colSpan={7}>Thông tin thông báo</th>
              </tr>
              <tr>
                {taxNotificationScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taxRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.taxAuthorityCode}</td>
                  <td>{row.taxAuthorityName}</td>
                  <td>{row.serviceCode}</td>
                  <td>{row.serviceName}</td>
                  <td>{row.version}</td>
                  <td>{row.recipientCode}</td>
                  <td>{row.recipientName}</td>
                  <td>{row.recipientAddress}</td>
                  <td>{row.notificationCode}</td>
                  <td>{row.notificationName}</td>
                  <td>{row.notificationVersion}</td>
                  <td>{row.notificationNo}</td>
                  <td>{row.notificationDate}</td>
                  <td>{row.status}</td>
                  <td>{row.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}

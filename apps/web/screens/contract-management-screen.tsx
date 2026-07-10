import { contractManagementScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { StatusPill } from "../components/status-pill";

const contractReports = [
  { title: "Bảng tính lãi vay", icon: "TrendingUp", tone: "green" },
  { title: "Bảng tính lãi vay 12 tháng", icon: "Calculator", tone: "blue" },
  { title: "Dư nợ theo đối tượng", icon: "Database", tone: "amber" }
] as const;

const contractCatalogs = [
  { title: "Danh mục khế ước", icon: "BookOpen", tone: "green" },
  { title: "Danh mục đối tượng", icon: "LayoutGrid", tone: "blue" },
  { title: "Danh mục lãi suất", icon: "FileText", tone: "amber" }
] as const;

export default function ContractManagementScreen() {
  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">Kế toán</a>
          <span>/</span>
          <span>{contractManagementScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Công cụ theo dõi khế ước</div>
            <h2 className="hero-title">{contractManagementScreen.title}</h2>
            <p className="hero-copy">
              Màn này bám theo component Kế toán sẵn có: tổng quan, danh sách, báo cáo và danh mục. Không dùng lớp giao diện riêng kiểu Workit nữa.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button">
                <AppIcon name="Search" />
                Tìm khế ước
              </button>
              <button className="button" type="button">
                <AppIcon name="TrendingUp" />
                Bảng tính lãi
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>Khế ước</strong>
            <span>Giữ chung hệ thống nút, panel và bảng như các màn kế toán khác để không bị lạc tông.</span>
          </div>
        </section>

        <div className="split-grid">
          <section className="panel">
            <div className="subsection">
              <h3>Nghiệp vụ</h3>
              <StatusPill status="ready" />
            </div>
            <div className="attachments">
              <button className="button" type="button">
                <AppIcon name="Calculator" />
                Quản lý khế ước
              </button>
              <button className="button" type="button">
                <AppIcon name="TrendingUp" />
                Bảng tính lãi vay
              </button>
              <button className="button" type="button">
                <AppIcon name="BookOpen" />
                Danh mục khế ước
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="subsection">
              <h3>Báo cáo</h3>
              <span className="module-meta">Mẫu ngắn gọn</span>
            </div>
            <div className="attachments">
              {contractReports.map((item) => (
                <button className="button" key={item.title} type="button">
                  <AppIcon name={item.icon} />
                  {item.title}
                </button>
              ))}
              {contractCatalogs.map((item) => (
                <button className="button" key={item.title} type="button">
                  <AppIcon name={item.icon} />
                  {item.title}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="section-title">
          <h2>Danh sách khế ước</h2>
          <div className="topbar-actions">
            <button className="button" type="button">Tìm</button>
            <button className="button primary" type="button">Export</button>
          </div>
        </div>
        <section className="panel table-scroll">
          <div className="toolbar">
            <input className="field" defaultValue="01/07/2026" aria-label="Từ ngày" />
            <input className="field" defaultValue="10/07/2026" aria-label="Đến ngày" />
            <button className="button" type="button">Năm 2026</button>
            <input className="search" defaultValue="Chọn TK" aria-label="Chọn TK" />
            <button className="button primary" type="button">
              <AppIcon name="Search" />
              Tìm
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                {contractManagementScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={contractManagementScreen.listColumns.length}>
                  <div className="attachment-box">
                    Chưa có dữ liệu khế ước. Kết nối API sau để đổ danh sách thật vào đây.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}

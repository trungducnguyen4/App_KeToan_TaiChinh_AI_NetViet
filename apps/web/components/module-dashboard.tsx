import {
  accountingKpis,
  bankStatementScreen,
  cashDashboardMetrics,
  cashVoucherScreens,
  contractManagementScreen,
  inputEInvoiceScreen,
  journalVoucherScreen,
  taxNotificationScreen,
  reconciliationScreen,
  workitModules
} from "@domain/index";
import type { ModuleKey } from "@domain/types";
import { AppIcon } from "./icons";
import { StatusPill } from "./status-pill";

const accountingReportItems = [
  { title: "Sổ cái tài khoản", icon: "BookOpen", tone: "green" },
  { title: "Bảng cân đối tài khoản", icon: "Calculator", tone: "blue" },
  { title: "Nhật ký chung", icon: "FileText", tone: "blue" },
  { title: "Bảng kê chứng từ", icon: "ReceiptText", tone: "green" },
  { title: "Báo cáo thuế", icon: "ShieldCheck", tone: "amber" },
  { title: "Bảng cân đối kế toán", icon: "LayoutGrid", tone: "blue" },
  { title: "Kết quả kinh doanh", icon: "TrendingUp", tone: "green" },
  { title: "Lưu chuyển tiền tệ", icon: "WalletCards", tone: "blue" },
  { title: "Các chỉ tiêu thuyết minh BCTC", icon: "Database", tone: "gray" },
  { title: "Hợp nhất BCTC", icon: "Bot", tone: "amber" }
] as const;

const kpiIcons = {
  green: "TrendingUp",
  blue: "Calculator",
  amber: "ShieldCheck",
  red: "Bot",
  gray: "Database"
} as const;

export function ModuleDashboard({ moduleKey }: { moduleKey: ModuleKey }) {
  const current = workitModules.find((module) => module.key === moduleKey) ?? workitModules[0];
  const isAccounting = current.key === "accounting";
  const isCash = current.key === "cash";
  const kpis = isCash ? cashDashboardMetrics : accountingKpis;
  const moduleRoutes = isCash
    ? [
        cashVoucherScreens[0].route,
        cashVoucherScreens[1].route,
        cashVoucherScreens[2].route,
        cashVoucherScreens[3].route,
        bankStatementScreen.route,
        reconciliationScreen.route
      ]
    : [
        journalVoucherScreen.route,
        contractManagementScreen.route,
        taxNotificationScreen.route,
        inputEInvoiceScreen.route
      ];
  const kpiCaption = (item: (typeof kpis)[number]) => ("hint" in item ? item.hint : item.delta ?? "");

  return (
    <div className="workspace">
      <div className="breadcrumb">
        <a className="breadcrumb-link" href="/">Trang chu</a>
        <span>/</span>
        <span>{current.name}</span>
      </div>

      <section className="hero-panel">
        <div>
          <div className="eyebrow">Enterprise workspace</div>
          <h2 className="hero-title">{current.name}</h2>
          <p className="hero-copy">{current.description}</p>
          <div className="hero-actions">
            {isAccounting ? (
              <a className="button primary" href={journalVoucherScreen.route}>
                <AppIcon name="FileText" />
                Mo phieu hach toan
              </a>
            ) : isCash ? (
              <a className="button primary" href={cashVoucherScreens[0].route}>
                <AppIcon name="WalletCards" />
                Mo PT/PC/BN/BC
              </a>
            ) : (
              <button className="button primary" type="button">
                <AppIcon name={current.icon} />
                Mo danh sach
              </button>
            )}
            <button className="button" type="button">
              <AppIcon name="Bot" />
              AI doi chieu
            </button>
          </div>
        </div>
        <div className="sync-panel">
          <strong>GD1</strong>
          <span>Workit la nguon goc read-only. App moi tap trung chuan hoa, doi chieu, phan tich va bao cao.</span>
        </div>
      </section>

      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <article className="kpi-card" key={kpi.label}>
            <div className={`kpi-accent tone-${kpi.tone}`} aria-hidden="true" />
            <div className="kpi-header">
              <span className="kpi-badge">
                <AppIcon name={kpiIcons[kpi.tone]} size={14} />
              </span>
              <span className="kpi-index">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-track" aria-hidden="true">
              <span />
            </div>
            <div className="kpi-delta">{kpiCaption(kpi)}</div>
          </article>
        ))}
      </div>

      <div className="section-title">
        <h2>Nghiep vu</h2>
        <StatusPill status={current.status} />
      </div>
      <div className="module-grid">
        {current.primaryScreens.map((screen, index) => (
          <a
            className="module-card"
              href={
              isAccounting
                ? moduleRoutes[index] ?? current.route
                : isCash
                  ? moduleRoutes[index] ?? current.route
                  : current.route
            }
            key={`${current.key}-${screen}`}
          >
            <span className="module-icon" style={{ color: current.accent }}>
              <AppIcon name={current.icon} />
            </span>
            <div>
              <h3>{screen}</h3>
              <p>
                {isCash
                  ? "Da gan route va pattern nghiep vu M2: dashboard, voucher, sao ke va doi chieu."
                  : index === 0
                    ? "Man hinh uu tien cho v1, san sang noi API."
                    : "Da scaffold theo metadata module."}
              </p>
            </div>
          </a>
        ))}
      </div>

      {isAccounting ? (
        <>
          <div className="section-title">
            <h2>Báo cáo</h2>
            <span className="module-meta">10 mẫu báo cáo sẵn khung, ưu tiên đối soát và phân tích</span>
          </div>
          <div className="report-grid">
            {accountingReportItems.map((item) => (
              <button className={`report-card tone-${item.tone}`} key={item.title} type="button">
                <span className="report-icon">
                  <AppIcon name={item.icon} />
                </span>
                <span className="report-copy">
                  <strong>{item.title}</strong>
                  <span>Mở mẫu xem nhanh, map dữ liệu và xuất báo cáo.</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}

    </div>
  );
}

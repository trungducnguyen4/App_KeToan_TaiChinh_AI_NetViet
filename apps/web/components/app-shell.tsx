import { workitModules } from "@domain/index";
import { useRouter } from "next/router";
import { clearSession } from "../lib/auth";
import { AppIcon } from "./icons";

const enterpriseWorkspaces = [
  {
    title: "Danh mục & đồng bộ",
    description: "Master data, mapping, quy tắc đồng bộ và chuẩn hóa danh mục.",
    href: "/modules/master-data",
    icon: "Database",
    tone: "green"
  },
  {
    title: "Sổ quỹ & ngân hàng",
    description: "Thu chi, sao kê, bút toán ngân hàng và đối chiếu dòng tiền.",
    href: "/modules/cash",
    icon: "WalletCards",
    tone: "blue"
  },
  {
    title: "Công nợ",
    description: "Phải thu, phải trả, tuổi nợ và hạn mức theo dõi rủi ro.",
    href: "/modules/receivables",
    icon: "ReceiptText",
    tone: "amber"
  },
  {
    title: "Sổ cái & hạch toán",
    description: "Phiếu hạch toán, bút toán, kết chuyển và khung sổ cái.",
    href: "/modules/accounting",
    icon: "BookOpen",
    tone: "green"
  },
  {
    title: "Báo cáo và Dashboard",
    description: "Tổng quan vận hành, báo cáo quản trị và phân tích số liệu.",
    href: "/modules/accounting?view=reports",
    icon: "PieChart",
    tone: "blue"
  }
] as const;

export function AppShell({ children, activeModule = "accounting" }: { children: React.ReactNode; activeModule?: string }) {
  const router = useRouter();

  function logout() {
    clearSession();
    void router.replace("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/modules/accounting" className="brand">
          <span className="brand-mark">W</span>
          <span>
            <span className="brand-title">Workit Ops</span>
            <span className="brand-subtitle">Accounting intelligence</span>
          </span>
        </a>

        <nav className="nav-section" aria-label="Phân hệ nghiệp vụ">
          <p className="nav-section-title">Quản trị doanh nghiệp</p>
          {workitModules.slice(0, 6).map((module) => (
            <a
              key={module.key}
              href={module.route}
              className={`module-link ${activeModule === module.key ? "is-active" : ""}`}
            >
              <span className="module-icon">
                <AppIcon name={module.icon} />
              </span>
              <span className="module-copy">
                <span className="module-name">{module.name}</span>
                <span className="module-meta">Mã phân hệ {module.code}</span>
              </span>
            </a>
          ))}
        </nav>

        <nav className="nav-section nav-section--enterprise" aria-label="Quản trị doanh nghiệp mở rộng">
          <p className="nav-section-title">Quản trị doanh nghiệp (New)</p>
          <div className="enterprise-stack">
            {enterpriseWorkspaces.map((item) => (
              <a className="enterprise-link" href={item.href} key={item.title}>
                <span className={`enterprise-icon tone-${item.tone}`}>
                  <AppIcon name={item.icon} />
                </span>
                <span className="enterprise-copy">
                  <span className="enterprise-name">{item.title}</span>
                  <span className="enterprise-meta">{item.description}</span>
                </span>
              </a>
            ))}

            <a className="enterprise-feature-link" href="/modules/accounting/journal-vouchers">
              <span className="enterprise-feature-copy">
                <span className="enterprise-feature-head">
                  <strong>Phiếu hạch toán</strong>
                  <span className="enterprise-feature-badge">NEW</span>
                </span>
                <span className="enterprise-feature-meta">Tạo mới, theo dõi bút toán và kết chuyển trong khối Sổ cái &amp; hạch toán.</span>
              </span>
              <AppIcon name="FileText" />
            </a>

            <div className="enterprise-copilot" aria-label="AiCopilot">
              <span className="enterprise-copilot-badge">
                <AppIcon name="Bot" size={16} />
                AiCopilot
              </span>
              <strong>Lớp phủ thông minh</strong>
              <p>Gợi ý, đối chiếu và điều hướng trên toàn bộ các khối nghiệp vụ bên dưới.</p>
            </div>
          </div>
        </nav>

        <nav className="nav-section" aria-label="Hệ thống và danh mục">
          <p className="nav-section-title">Nền tảng</p>
          {workitModules.slice(6).map((module) => (
            <a
              key={module.key}
              href={module.route}
              className={`module-link ${activeModule === module.key ? "is-active" : ""}`}
            >
              <span className="module-icon">
                <AppIcon name={module.icon} />
              </span>
              <span className="module-copy">
                <span className="module-name">{module.name}</span>
                <span className="module-meta">{module.status}</span>
              </span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Nền tảng quản trị và chuyển đổi số</h1>
          <div className="topbar-actions">
            <span>Đồng bộ Workit chỉ đọc</span>
            <span className="avatar">TG</span>
            <button className="topbar-logout" type="button" onClick={logout} title="Đăng xuất">
              <AppIcon name="LogOut" size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

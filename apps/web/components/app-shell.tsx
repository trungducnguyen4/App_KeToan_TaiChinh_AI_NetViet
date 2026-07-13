import { workitModules } from "@domain/index";
import { useRouter } from "next/router";
import { clearSession } from "../lib/auth";
import { AppIcon } from "./icons";

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

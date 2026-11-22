import { workitModules } from "@domain/index";
import { AppIcon } from "./icons";

export function AppShell({ children, activeModule = "accounting" }: { children: React.ReactNode; activeModule?: string }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/dashboard" className="brand">
          <span className="brand-mark" style={{ background: "linear-gradient(135deg, #15936b 0%, #087f5b 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(21, 147, 107, 0.35)", borderRadius: "10px", display: "grid", placeItems: "center" }}>
            <AppIcon name="Droplet" size={20} />
          </span>
          <span>
            <span className="brand-title">Dầu Dừa</span>
            <span className="brand-subtitle">Quản trị Xưởng &amp; Giá thành</span>
          </span>
        </a>

        <nav className="nav-section" aria-label="Tổng quan điều hành">
          <p className="nav-section-title">Trung tâm Điều hành</p>
          <a
            href="/dashboard"
            className={`module-link ${activeModule === "dashboard" ? "is-active" : ""}`}
          >
            <span className="module-icon">
              <AppIcon name="LayoutGrid" />
            </span>
            <span className="module-copy">
              <span className="module-name">Dashboard Insights</span>
            </span>
          </a>
        </nav>

        <nav className="nav-section" aria-label="Quy trình nghiệp vụ">
          <p className="nav-section-title">Quy trình Vận hành Xưởng</p>
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
              </span>
            </a>
          ))}
        </nav>

        <nav className="nav-section" aria-label="Hệ thống và danh mục">
          <p className="nav-section-title">Hệ thống & Danh mục</p>
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
              </span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Hệ thống Quản lý Thu mua & Ép lọc Dầu dừa thô</h1>
          <div className="topbar-actions">
            <span style={{ fontSize: "12px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
              Nhập liệu trực tiếp (Direct CRUD)
            </span>
            <span className="avatar" title="Quản trị Xưởng (admin1)">AD</span>
            <a
              href="/login"
              title="Đăng xuất / Chuyển tài khoản"
              style={{
                fontSize: "12px",
                color: "#64748b",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "#ffffff"
              }}
            >
              <AppIcon name="X" size={13} />
              Thoát
            </a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

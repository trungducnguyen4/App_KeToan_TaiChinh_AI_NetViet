import { useState } from "react";
import { workitModules } from "@domain/index";
import { AppIcon } from "./icons";

export function AppShell({ children, activeModule = "accounting" }: { children: React.ReactNode; activeModule?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <a href="/dashboard" className="brand" style={{ marginBottom: 0 }} onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-mark" style={{ background: "linear-gradient(135deg, #15936b 0%, #087f5b 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(21, 147, 107, 0.35)", borderRadius: "10px", display: "grid", placeItems: "center" }}>
              <AppIcon name="Droplet" size={20} />
            </span>
            <span>
              <span className="brand-title">Dầu Dừa</span>
              <span className="brand-subtitle">Quản trị Xưởng &amp; Giá thành</span>
            </span>
          </a>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
            style={{ color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <AppIcon name="X" size={18} />
          </button>
        </div>

        <nav className="nav-section" aria-label="Tổng quan điều hành">
          <p className="nav-section-title">Trung tâm Điều hành</p>
          <a
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`module-link ${activeModule === "dashboard" ? "is-active" : ""}`}
          >
            <span className="module-icon">
              <AppIcon name="LayoutGrid" />
            </span>
            <span className="module-copy">
              <span className="module-name">Trang chủ</span>
            </span>
          </a>
        </nav>

        <nav className="nav-section" aria-label="Quy trình nghiệp vụ">
          <p className="nav-section-title">Quy trình Vận hành Xưởng</p>
          {workitModules.slice(0, 7).map((module) => (
            <a
              key={module.key}
              href={module.route}
              onClick={() => setMobileMenuOpen(false)}
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
          {workitModules.slice(7).map((module) => (
            <a
              key={module.key}
              href={module.route}
              onClick={() => setMobileMenuOpen(false)}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở danh mục điều hướng"
            >
              <AppIcon name="Menu" size={20} />
            </button>
            <h1>Hệ thống Quản lý Thu mua & Ép lọc Dầu dừa thô</h1>
          </div>
          <div className="topbar-actions">
            <span className="avatar" title="Quản trị Xưởng (admin1)">AD</span>
            <a
              href="/login"
              title="Đăng xuất khỏi hệ thống"
              className="btn-logout"
            >
              <AppIcon name="LogOut" size={13} />
              Đăng xuất
            </a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

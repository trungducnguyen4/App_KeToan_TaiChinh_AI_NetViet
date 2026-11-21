import { useEffect, useState } from "react";
import { bankStatementScreen, cashDashboardMetrics, cashVoucherScreens, reconciliationScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi } from "../lib/api";
import { StatusPill } from "../components/status-pill";

export default function CashDashboardScreen() {
  const [metrics, setMetrics] = useState(cashDashboardMetrics);

  useEffect(() => {
    let active = true;
    void fetchApi<{ metrics: typeof cashDashboardMetrics }>("/cash/dashboard")
      .then((data) => {
        if (active) {
          setMetrics(data.metrics);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <span>Sổ quỹ và Ngân hàng</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Quỹ tiền & Ngân hàng</div>
            <h2 className="hero-title">Sổ quỹ &amp; Ngân hàng Xưởng</h2>
            <p className="hero-copy">
              Quản lý Phiếu thu (PT), Phiếu chi (PC), Báo nợ (BN), Báo có (BC) và đối soát tài khoản thanh toán tiền dừa.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={cashVoucherScreens[0].route}>
                <AppIcon name="WalletCards" />
                Lập Phiếu thu / chi
              </a>
              <a className="button" href={reconciliationScreen.route}>
                <AppIcon name="Search" />
                Mở đối chiếu
              </a>
            </div>
          </div>
          <div className="sync-panel">
            <strong>Thanh toán Xưởng</strong>
            <span>Ghi nhận chi tiền mặt tại xưởng cho lái xe dừa, chuyển khoản thanh toán thương lái và đối soát sao kê.</span>
          </div>
        </section>

        <div className="kpi-grid">
          {metrics.map((metric) => (
            <article className="kpi-card" key={metric.label}>
              <div className="kpi-label">{metric.label}</div>
              <div className="kpi-value">{metric.value}</div>
              <div className="kpi-delta">{metric.hint}</div>
            </article>
          ))}
        </div>

        <div className="section-title">
          <h2>Nghiệp vụ Thu chi & Thanh toán</h2>
          <StatusPill status="ready" />
        </div>
        <div className="module-grid">
          {cashVoucherScreens.map((screen) => (
            <a className="module-card" href={screen.route} key={screen.key}>
              <span className="module-icon" style={{ color: "#0f7bbf" }}>
                <AppIcon name="WalletCards" />
              </span>
              <div>
                <h3>{screen.title}</h3>
                <p>{screen.description}</p>
              </div>
            </a>
          ))}
          <a className="module-card" href={bankStatementScreen.route}>
            <span className="module-icon" style={{ color: "#0f7bbf" }}>
              <AppIcon name="Upload" />
            </span>
            <div>
              <h3>{bankStatementScreen.title}</h3>
              <p>{bankStatementScreen.description}</p>
            </div>
          </a>
          <a className="module-card" href={reconciliationScreen.route}>
            <span className="module-icon" style={{ color: "#0f7bbf" }}>
              <AppIcon name="Search" />
            </span>
            <div>
              <h3>{reconciliationScreen.title}</h3>
              <p>{reconciliationScreen.description}</p>
            </div>
          </a>
        </div>

      </div>
    </AppShell>
  );
}

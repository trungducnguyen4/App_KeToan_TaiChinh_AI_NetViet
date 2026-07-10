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
          <a className="breadcrumb-link" href="/">Trang chu</a>
          <span>/</span>
          <span>So quy va Ngan hang</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">M2 cash engine</div>
            <h2 className="hero-title">So quy &amp; Ngan hang</h2>
            <p className="hero-copy">
              Module M2 gom PT, PC, BN, BC, import sao ke va doi chieu ngan hang tren mot voucher engine chung.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={cashVoucherScreens[0].route}>
                <AppIcon name="WalletCards" />
                Mo PT/PC
              </a>
              <a className="button" href={reconciliationScreen.route}>
                <AppIcon name="Search" />
                Mo doi chieu
              </a>
            </div>
          </div>
          <div className="sync-panel">
            <strong>Read-only GD1</strong>
            <span>Du lieu Workit duoc dong bo theo source id + checksum, luu raw payload de phuc vu audit va doi chieu.</span>
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
          <h2>Man hinh M2</h2>
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

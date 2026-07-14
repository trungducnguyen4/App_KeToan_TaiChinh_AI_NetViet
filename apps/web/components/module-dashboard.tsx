"use client";

import {
  accountingKpis,
  bankStatementScreen,
  cashDashboardMetrics,
  cashVoucherScreens,
  contractManagementScreen,
  inputEInvoiceScreen,
  journalVoucherScreen,
  reconciliationScreen,
  taxNotificationScreen,
  workitModules
} from "@domain/index";
import type { ModuleKey } from "@domain/types";
import { useEffect, useRef, useState } from "react";
import { AppIcon } from "./icons";
import { StatusPill } from "./status-pill";

const accountingReportItems = [
  { title: "Sổ cái tài khoản", icon: "BookOpen", tone: "green", route: "/modules/accounting/report/account-ledger" },
  { title: "Bảng cân đối tài khoản", icon: "Calculator", tone: "blue", route: "/modules/accounting/report/account-trial-balance" },
  { title: "Nhật ký chung", icon: "FileText", tone: "blue", route: "/modules/accounting/report/general-journal" },
  { title: "Bảng kê chứng từ", icon: "ReceiptText", tone: "green" },
  { title: "Báo cáo thuế", icon: "ShieldCheck", tone: "amber" },
  { title: "Bảng cân đối kế toán", icon: "LayoutGrid", tone: "blue" },
  { title: "Kết quả kinh doanh", icon: "TrendingUp", tone: "green" },
  { title: "Lưu chuyển tiền tệ", icon: "WalletCards", tone: "blue" },
  { title: "Các chỉ tiêu thuyết minh BCTC", icon: "Database", tone: "gray" },
  { title: "Hợp nhất BCTC", icon: "Bot", tone: "amber" }
] as const;

const accountingAssetGroups = [
  {
    title: "Tài sản cố định",
    cards: [
      { title: "Cập nhật TSCĐ", icon: "Warehouse", tone: "green", href: "/modules/accounting/assets/fixed/create" },
      { title: "Giảm nguyên giá / khấu hao", icon: "ArrowLeft", tone: "green", href: "/modules/accounting/assets/fixed/decrease" },
      { title: "Tăng nguyên giá / khấu hao", icon: "TrendingUp", tone: "green", href: "/modules/accounting/assets/fixed/increase" },
      { title: "Thanh lý TSCĐ", icon: "BadgeDollarSign", tone: "green", href: "/modules/accounting/assets/fixed/disposal" },
      { title: "Điều chỉnh khấu hao", icon: "FileText", tone: "green", href: "/modules/accounting/assets/fixed/adjustment" },
      { title: "Ngừng khấu hao", icon: "CircleDollarSign", tone: "amber", href: "/modules/accounting/assets/fixed/suspend" },
      { title: "Bút toán thanh lý TSCĐ", icon: "ReceiptText", tone: "red", href: "/modules/accounting/assets/fixed/disposal-journal" },
      { title: "Bút toán khấu hao", icon: "ReceiptText", tone: "red", href: "/modules/accounting/assets/fixed/depreciation-journal" },
      { title: "Phiếu kiểm kê tài sản", icon: "List", tone: "green", href: "/modules/accounting/assets/fixed/inventory" },
      { title: "In tem mã vạch / QR code", icon: "Printer", tone: "blue", href: "/modules/accounting/assets/fixed/labels" },
      { title: "Báo cáo TSCĐ", icon: "LayoutGrid", tone: "blue", href: "/modules/accounting/assets/fixed/reports" }
    ]
  },
  {
    title: "Công cụ dụng cụ",
    cards: [
      { title: "Cập nhật CCDC", icon: "ShoppingCart", tone: "green", href: "/modules/accounting/assets/ccdc/create" },
      { title: "Giảm nguyên giá / thời gian phân bổ CCDC", icon: "ArrowLeft", tone: "green", href: "/modules/accounting/assets/ccdc/decrease" },
      { title: "Tăng nguyên giá / thời gian phân bổ CCDC", icon: "TrendingUp", tone: "green", href: "/modules/accounting/assets/ccdc/increase" },
      { title: "Ngừng phân bổ CCDC", icon: "CircleDollarSign", tone: "amber", href: "/modules/accounting/assets/ccdc/suspend" },
      { title: "Bút toán phân bổ CCDC", icon: "ReceiptText", tone: "red", href: "/modules/accounting/assets/ccdc/allocation-journal" },
      { title: "Báo cáo CCDC", icon: "LayoutGrid", tone: "blue", href: "/modules/accounting/assets/ccdc/reports" }
    ]
  },
  {
    title: "Chi phí trả trước",
    cards: [
      {
        title: "Phân bổ CP trả trước",
        icon: "WalletCards",
        tone: "blue",
        href: "/modules/accounting/assets/prepaid-expense/allocation",
        badge: "NEW"
      }
    ]
  }
] as const;

const receivablesGroups = [
  {
    title: "Quản lý công nợ",
    description: "Theo dõi tập trung công nợ phải thu, phải trả và các khoản cần xử lý.",
    cards: [
      {
        title: "Tổng quan công nợ",
        description: "Tổng hợp số dư TK131/TK331, khoản đến hạn và quá hạn trong kỳ.",
        icon: "LayoutGrid",
        tone: "green",
        href: "/modules/receivables?view=overview"
      },
      {
        title: "Công nợ phải thu (TK131)",
        description: "Theo khách hàng, hóa đơn, ngày đến hạn và nhóm tuổi nợ.",
        icon: "TrendingUp",
        tone: "blue",
        href: "/modules/receivables?view=receivable"
      },
      {
        title: "Công nợ phải trả (TK331)",
        description: "Theo nhà cung cấp, hóa đơn, lịch thanh toán và nhóm tuổi nợ.",
        icon: "WalletCards",
        tone: "amber",
        href: "/modules/receivables?view=payable"
      },
      {
        title: "Nhắc nợ & cảnh báo",
        description: "Tập trung khoản sắp đến hạn, quá hạn và lịch sử nhắc nợ.",
        icon: "ShieldCheck",
        tone: "red",
        href: "/modules/receivables?view=reminders",
        badge: "NEW"
      }
    ]
  }
] as const;

const kpiIcons = {
  green: "TrendingUp",
  blue: "Calculator",
  amber: "ShieldCheck",
  red: "Bot",
  gray: "Database"
} as const;

const inputEInvoiceMenuItems = [
  { label: "Nhập HĐĐT đầu vào", href: `${inputEInvoiceScreen.route}?action=create` },
  { label: "HĐĐT đầu vào chờ duyệt", href: `${inputEInvoiceScreen.route}?status=pending` },
  { label: "Thống kê HĐĐT đầu vào", href: `${inputEInvoiceScreen.route}?view=stats` },
  { label: "Danh mục Nhóm hóa đơn", href: `${inputEInvoiceScreen.route}?catalog=invoice-groups` },
  { label: "Danh mục Loại hóa đơn", href: `${inputEInvoiceScreen.route}?catalog=invoice-types` },
  { label: "Quy trình: HĐĐT đầu vào", href: `${inputEInvoiceScreen.route}?view=workflow` }
] as const;

export function ModuleDashboard({ moduleKey }: { moduleKey: ModuleKey }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const current = workitModules.find((module) => module.key === moduleKey) ?? workitModules[0];
  const isAccounting = current.key === "accounting";
  const isCash = current.key === "cash";
  const isReceivables = current.key === "receivables";
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

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  return (
    <div className="workspace">
      <div className="breadcrumb">
        <a className="breadcrumb-link" href="/">
          Trang chủ
        </a>
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
              <a className="button primary" href={current.route}>
                <AppIcon name="FileText" />
                Mở sổ cái &amp; hạch toán
              </a>
            ) : isCash ? (
              <a className="button primary" href={cashVoucherScreens[0].route}>
                <AppIcon name="WalletCards" />
                Mở PT/PC/BN/BC
              </a>
            ) : isReceivables ? (
              <a className="button primary" href="/modules/receivables?view=overview">
                <AppIcon name={current.icon} />
                Mở tổng quan công nợ
              </a>
            ) : (
              <button className="button primary" type="button">
                <AppIcon name={current.icon} />
                Mở danh sách
              </button>
            )}
            <button className="button" type="button">
              <AppIcon name="Bot" />
              AI đối chiếu
            </button>
          </div>
        </div>
        <div className="sync-panel">
          <strong>GD1</strong>
          <span>Workit là nguồn gốc read-only. App mới tập trung chuẩn hóa, đối chiếu, phân tích và báo cáo.</span>
        </div>
      </section>

      {isReceivables ? (
        <div className="receivables-groups">
          {receivablesGroups.map((group) => (
            <section className="receivables-group" key={group.title}>
              <div className="section-title">
                <h2>{group.title}</h2>
                <span className="module-meta">{group.description}</span>
              </div>
              <div className="report-grid receivables-report-grid">
                {group.cards.map((item) => (
                  <a className={`report-card tone-${item.tone}`} href={item.href} key={item.title}>
                    <span className="report-icon">
                      <AppIcon name={item.icon} />
                    </span>
                    {"badge" in item ? <span className="report-badge">{item.badge}</span> : null}
                    <span className="report-copy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className={`kpi-grid${isAccounting ? " kpi-grid--compact" : ""}`}>
            {kpis.map((kpi, index) => (
              <article className={`kpi-card${isAccounting ? " kpi-card--compact" : ""}`} key={kpi.label}>
                <div className={`kpi-accent tone-${kpi.tone}`} aria-hidden="true" />
                <div className="kpi-header">
                  <span className="kpi-badge">
                    <AppIcon name={kpiIcons[kpi.tone]} size={isAccounting ? 12 : 14} />
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
            <h2>Nghiệp vụ</h2>
            <StatusPill status={current.status} />
          </div>

          <div className="module-grid">
            {current.primaryScreens.map((screen, index) =>
              screen === inputEInvoiceScreen.title ? (
                <div className="module-card-shell" key={`${current.key}-${screen}`} ref={popoverRef}>
                  <button
                    className="module-card module-card--popover"
                    type="button"
                    aria-expanded={openMenu === screen}
                    aria-haspopup="menu"
                    onClick={() => setOpenMenu((prev) => (prev === screen ? null : screen))}
                  >
                    <span className="module-icon" style={{ color: current.accent }}>
                      <AppIcon name={current.icon} />
                    </span>
                    <div className="module-card-copy">
                      <h3>{screen}</h3>
                      <p>
                        {isCash
                          ? "Đã gắn route và pattern nghiệp vụ M2: dashboard, voucher, sao kê và đối chiếu."
                          : index === 0
                            ? "Màn hình ưu tiên cho v1, sẵn sàng nối API."
                            : "Đã scaffold theo metadata module."}
                      </p>
                    </div>
                    <span className="module-card-caret">
                      <AppIcon name="ChevronDown" size={16} />
                    </span>
                  </button>
                  {openMenu === screen ? (
                    <div className="module-popover" role="menu" aria-label={screen}>
                      {inputEInvoiceMenuItems.map((item) => (
                        <a className="module-popover-item" href={item.href} key={item.label} role="menuitem">
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <a
                  className="module-card"
                  href={moduleRoutes[index] ?? current.route}
                  key={`${current.key}-${screen}`}
                >
                  <span className="module-icon" style={{ color: current.accent }}>
                    <AppIcon name={current.icon} />
                  </span>
                  <div>
                    <h3>{screen}</h3>
                    <p>
                      {isCash
                        ? "Đã gắn route và pattern nghiệp vụ M2: dashboard, voucher, sao kê và đối chiếu."
                        : index === 0
                          ? "Màn hình ưu tiên cho v1, sẵn sàng nối API."
                          : "Đã scaffold theo metadata module."}
                    </p>
                  </div>
                </a>
              )
            )}
          </div>

          {isAccounting ? (
            <div className="receivables-groups accounting-asset-groups">
              {accountingAssetGroups.map((group) => (
                <section className="receivables-group" key={group.title}>
                  <div className="section-title">
                    <h2>{group.title}</h2>
                    <span className="module-meta">
                      {group.title === "Tài sản cố định"
                        ? "Cập nhật, khấu hao, thanh lý và báo cáo TSCĐ"
                        : group.title === "Công cụ dụng cụ"
                          ? "Cập nhật, phân bổ, ngừng phân bổ và báo cáo CCDC"
                          : "Phân bổ chi phí trả trước theo kỳ và theo đối tượng"}
                    </span>
                  </div>
                  <div className="report-grid receivables-report-grid">
                    {group.cards.map((item) => (
                      <a className={`report-card tone-${item.tone}`} href={item.href} key={item.title}>
                        <span className="report-icon">
                          <AppIcon name={item.icon} />
                        </span>
                        {"badge" in item ? <span className="report-badge">{item.badge}</span> : null}
                        <span className="report-copy">
                          <strong>{item.title}</strong>
                          <span>Chức năng kế toán chuyên sâu, có thể mở rộng theo quy trình nghiệp vụ.</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {isAccounting ? (
            <>
              <div className="section-title">
                <h2>Báo cáo</h2>
                <span className="module-meta">10 mẫu báo cáo sẵn khung, ưu tiên đối soát và phân tích</span>
              </div>
              <div className="report-grid">
                {accountingReportItems.map((item) => (
                  <a className={`report-card tone-${item.tone}`} href={"route" in item ? item.route : "#"} key={item.title}>
                    <span className="report-icon">
                      <AppIcon name={item.icon} />
                    </span>
                    <span className="report-copy">
                      <strong>{item.title}</strong>
                      <span>Mở mẫu xem nhanh, map dữ liệu và xuất báo cáo.</span>
                    </span>
                  </a>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

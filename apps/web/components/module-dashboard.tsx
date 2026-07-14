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
import { assistantMappingSuggestions } from "../lib/document-assistant-mock-data";
import { readAiWorkflowOutput, type AiWorkflowResponse } from "../lib/ai-workflows";
import { postApi } from "../lib/api";
import { AppIcon } from "./icons";
import { MarkdownText } from "./markdown-text";
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

const accountingDashboardAlerts = [
  {
    id: "overdue-debt",
    title: "Cảnh báo nợ quá hạn",
    severity: "Cao",
    dueDate: "2026-07-14",
    owner: "Kế toán công nợ",
    source: "AR-AGING",
    amount: "1.28 tỷ",
    sentAt: "08:10",
    description: "5 khách hàng có hóa đơn quá hạn trên 15 ngày, cần nhắc nợ và cập nhật kế hoạch thu."
  },
  {
    id: "budget-overrun",
    title: "Chi vượt định mức",
    severity: "Trung bình",
    dueDate: "2026-07-14",
    owner: "Kế toán chi phí",
    source: "BUDGET-OPS",
    amount: "186 triệu",
    sentAt: "08:25",
    description: "Chi phí vận hành tháng 07/2026 vượt 12% so với định mức đã duyệt."
  },
  {
    id: "negative-cashflow",
    title: "Dòng tiền âm dự báo",
    severity: "Cao",
    dueDate: "2026-07-18",
    owner: "CFO",
    source: "CASHFLOW-FORECAST",
    amount: "-420 triệu",
    sentAt: "08:40",
    description: "Dự báo dòng tiền thuần âm trong 7 ngày tới nếu lịch thu công nợ không thay đổi."
  },
  {
    id: "journal-mismatch",
    title: "Bút toán lệch",
    severity: "Cao",
    dueDate: "2026-07-14",
    owner: "Kế toán tổng hợp",
    source: "GL-CHECK",
    amount: "3 chứng từ",
    sentAt: "09:00",
    description: "Có chứng từ hạch toán chưa cân Nợ/Có hoặc thiếu tài khoản đối ứng."
  }
] as const;

export function ModuleDashboard({ moduleKey }: { moduleKey: ModuleKey }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isWritingAlert, setIsWritingAlert] = useState(false);
  const [alertDraft, setAlertDraft] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const current = workitModules.find((module) => module.key === moduleKey) ?? workitModules[0];
  const isAccounting = current.key === "accounting";
  const isCash = current.key === "cash";
  const isMasterData = current.key === "masterData";
  const isReceivables = current.key === "receivables";
  const shouldShowKpis = isAccounting || isCash;
  const kpis = isCash ? cashDashboardMetrics : accountingKpis;
  const [mappingFeedback, setMappingFeedback] = useState("");
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
  const selectedAlert =
    accountingDashboardAlerts.find((item) => item.id === selectedAlertId) ??
    (selectedAlertId ? accountingDashboardAlerts[0] : undefined);

  async function handleWriteDashboardAlert() {
    const alert = accountingDashboardAlerts.find((item) => item.id === selectedAlertId) ?? accountingDashboardAlerts[0];
    setIsWritingAlert(true);
    setAlertDraft("");

    try {
      const response = await postApi<AiWorkflowResponse>("/ai/workflows/alert-writer", {
        inputs: {
          alert_type: "DASHBOARD_TAX_ALERT",
          raw_data: JSON.stringify(
            {
              alert_id: alert.id,
              title: alert.title,
              severity: alert.severity,
              due_date: alert.dueDate,
              owner: alert.owner,
              source: alert.source,
              amount: alert.amount,
              sent_at: alert.sentAt,
              description: alert.description,
              requested_from: "accounting_dashboard"
            },
            null,
            2
          )
        }
      });
      setAlertDraft(
        readAiWorkflowOutput(
          response,
          "Workflow alert-writer chua cau hinh API key trong .env."
        )
      );
    } catch (error) {
      setAlertDraft(error instanceof Error ? error.message : "Khong soan duoc canh bao AI.");
    } finally {
      setIsWritingAlert(false);
    }
  }

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
          {shouldShowKpis ? (
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
          ) : null}

          {isMasterData ? (
            <section className="panel ai-assistant-panel">
              <div className="ai-assistant-heading">
                <div>
                  <span className="ai-assistant-eyebrow">AI document assistant</span>
                  <h2>Mapping AI đề xuất</h2>
                  <p>
                    Chuẩn hóa KH/NCC/hợp đồng/tài khoản từ hóa đơn, sao kê và chứng từ nguồn. WORKIT là nguồn
                    read-only; kế toán duyệt mapping trước khi dùng cho đối chiếu và hạch toán.
                  </p>
                </div>
                <span className="ai-assistant-badge">AI đề xuất, kế toán duyệt</span>
              </div>

              <div className="ai-mapping-grid">
                {assistantMappingSuggestions.map((item) => (
                  <article className="ai-mapping-card" key={item.id}>
                    <div className="ai-mapping-top">
                      <span>{item.sourceType}</span>
                      <strong>{item.confidence}%</strong>
                    </div>
                    <h3>{item.sourceValue}</h3>
                    <p>{item.suggestedValue}</p>
                    <div className="ai-mapping-meta">
                      <span className={`ai-status-chip status-${item.status.replace(/\s+/g, "-").toLowerCase()}`}>
                        {item.status}
                      </span>
                      <small>{item.sourceModule}</small>
                    </div>
                    <small className="ai-mapping-reason">{item.reason}</small>
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => setMappingFeedback(`Đã mô phỏng duyệt mapping: ${item.suggestedValue}`)}
                    >
                      <AppIcon name="ShieldCheck" />
                      Duyệt mapping
                    </button>
                  </article>
                ))}
              </div>

              {mappingFeedback ? (
                <div className="ai-feedback-box">
                  <strong>Kết quả mô phỏng</strong>
                  <p>{mappingFeedback}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          {isAccounting ? (
            <>
              <button
                className="dashboard-alert-card"
                type="button"
                onClick={() => {
                  setSelectedAlertId((currentAlertId) =>
                    currentAlertId ? null : accountingDashboardAlerts[0].id
                  );
                  setAlertDraft("");
                }}
              >
                <span className="dashboard-alert-icon">
                  <AppIcon name="BriefcaseBusiness" />
                </span>
                <span className="dashboard-alert-copy">
                  <span>Cảnh báo cần xem</span>
                  <strong>{String(accountingDashboardAlerts.length).padStart(2, "0")}</strong>
                  <small>Tự động gửi cảnh báo</small>
                </span>
              </button>

              {selectedAlert ? (
                <section className="panel dashboard-alert-detail">
                  <div className="section-title section-title--inside">
                    <h2>Chi tiết cảnh báo</h2>
                    <div className="topbar-actions">
                      <a className="button" href={taxNotificationScreen.route}>
                        <AppIcon name="ShieldCheck" />
                        Xem thông báo thuế
                      </a>
                      <button className="button primary" type="button" onClick={handleWriteDashboardAlert} disabled={isWritingAlert}>
                        <AppIcon name="Bot" />
                        {isWritingAlert ? "AI đang soạn..." : "AI soạn văn bản"}
                      </button>
                    </div>
                  </div>
                  <div className="dashboard-alert-layout">
                    <div className="dashboard-alert-list">
                      {accountingDashboardAlerts.map((alert) => (
                        <button
                          className={`dashboard-alert-row${alert.id === selectedAlert.id ? " is-active" : ""}`}
                          type="button"
                          key={alert.id}
                          onClick={() => {
                            setSelectedAlertId(alert.id);
                            setAlertDraft("");
                          }}
                        >
                          <span>
                            <strong>{alert.title}</strong>
                            <small>Đã gửi tự động lúc {alert.sentAt}</small>
                          </span>
                          <b>{alert.severity}</b>
                        </button>
                      ))}
                    </div>
                    <div className="dashboard-alert-content">
                      <div className="dashboard-alert-heading">
                        <strong>{selectedAlert.title}</strong>
                        <span>{selectedAlert.amount}</span>
                      </div>
                      <p>{selectedAlert.description}</p>
                      <dl>
                        <div>
                          <dt>Nguồn</dt>
                          <dd>{selectedAlert.source}</dd>
                        </div>
                        <div>
                          <dt>Phụ trách</dt>
                          <dd>{selectedAlert.owner}</dd>
                        </div>
                        <div>
                          <dt>Hạn xử lý</dt>
                          <dd>{selectedAlert.dueDate}</dd>
                        </div>
                      </dl>
                      {alertDraft ? (
                        <div className="attachment-box" style={{ marginTop: 16 }}>
                          <strong>Bản nháp AI</strong>
                          <MarkdownText className="ai-card-markdown" content={alertDraft} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

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


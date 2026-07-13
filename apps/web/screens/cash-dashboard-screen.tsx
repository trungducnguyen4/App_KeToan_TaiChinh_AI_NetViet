"use client";

import { useEffect, useState } from "react";
import {
  bankStatementScreen,
  cashDashboardMetrics,
  cashVoucherScreens,
  cashVouchers,
  reconciliationScreen
} from "@domain/index";
import type { CashVoucherType } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi } from "../lib/api";
import { StatusPill } from "../components/status-pill";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const cashSummaryCards = [
  {
    label: "Thu từ đầu năm",
    value: "1.149.000.000",
    hint: "Tổng hợp PT + BC",
    tone: "blue",
    icon: "BadgeDollarSign"
  },
  {
    label: "Chi từ đầu năm",
    value: "268.452.813",
    hint: "Tổng hợp PC + BN",
    tone: "red",
    icon: "CircleDollarSign"
  },
  {
    label: "Thu từ đầu tháng",
    value: "1.149.000.000",
    hint: "Lượng tiền vào trong tháng",
    tone: "green",
    icon: "TrendingUp"
  },
  {
    label: "Chi từ đầu tháng",
    value: "100.000.000",
    hint: "Lượng tiền ra trong tháng",
    tone: "amber",
    icon: "Save"
  },
  {
    label: "Thu - Chi tháng này",
    value: "-70.000.000",
    hint: "Cảnh báo dòng tiền âm",
    tone: "violet",
    icon: "ArrowLeftRight"
  },
  {
    label: "Số dư hiện tại",
    value: "60.384.479.055",
    hint: "Tổng hợp quỹ + ngân hàng",
    tone: "cyan",
    icon: "Landmark"
  }
] as const;

const cashOperationCards: Array<{
  title: string;
  description: string;
  href: string;
  icon: string;
  tone: "green" | "rose" | "cyan";
  featured?: boolean;
}> = [
  {
    title: "Đề nghị thanh toán",
    description: "Lập đề nghị, trình duyệt và đẩy được sang Phiếu chi.",
    href: cashVoucherScreens[1].route,
    icon: "Save",
    tone: "green"
  },
  {
    title: "Đề nghị tạm ứng",
    description: "Hỗ trợ tạm ứng theo nhân viên, dự án và hạn mức nội bộ.",
    href: `${cashVoucherScreens[1].route}?mode=advance`,
    icon: "BadgeDollarSign",
    tone: "green"
  },
  {
    title: "Đề nghị hoàn ứng",
    description: "Ghi nhận hoàn ứng sau tạm ứng và đối chiếu số tiền còn lại.",
    href: `${cashVoucherScreens[0].route}?mode=settlement`,
    icon: "ArrowLeftRight",
    tone: "green"
  },
  {
    title: "Ủy nhiệm chi",
    description: "Dòng chi qua ngân hàng, liên kết với đối chiếu sao kê.",
    href: cashVoucherScreens[2].route,
    icon: "FileText",
    tone: "rose",
    featured: true
  },
  {
    title: "Phiếu thu tiền mặt",
    description: "Thu tiền mặt, gắn đối tượng và ghi nhận vào sổ quỹ.",
    href: cashVoucherScreens[0].route,
    icon: "WalletCards",
    tone: "green",
    featured: true
  },
  {
    title: "Phiếu chi tiền mặt",
    description: "Chi tiền mặt theo đề nghị, tạm ứng và nghiệp vụ nội bộ.",
    href: cashVoucherScreens[1].route,
    icon: "WalletCards",
    tone: "green",
    featured: true
  },
  {
    title: "Báo nợ ngân hàng",
    description: "Ghi nhận chi tiền qua tài khoản ngân hàng.",
    href: cashVoucherScreens[2].route,
    icon: "Landmark",
    tone: "green",
    featured: true
  },
  {
    title: "Báo có ngân hàng",
    description: "Ghi nhận thu tiền qua tài khoản ngân hàng.",
    href: cashVoucherScreens[3].route,
    icon: "Landmark",
    tone: "green"
  }
] as const;

const cashReportCards = [
  { title: "Sổ quỹ tiền mặt", href: cashVoucherScreens[0].route, icon: "BookOpen" },
  { title: "Sổ tiền gửi ngân hàng", href: bankStatementScreen.route, icon: "Landmark" },
  { title: "Nhật ký thu tiền", href: cashVoucherScreens[0].route, icon: "TrendingUp" },
  { title: "Nhật ký chi tiền", href: cashVoucherScreens[1].route, icon: "CircleDollarSign" },
  { title: "Bảng tổng hợp thu chi tiền mặt", href: cashVoucherScreens[0].route, icon: "PieChart" }
] as const;

function sumVoucherAmount(types: CashVoucherType[]) {
  return cashVouchers
    .filter((voucher) => types.includes(voucher.voucherType as CashVoucherType))
    .reduce((total, voucher) => total + voucher.amount, 0);
}

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
          <a className="breadcrumb-link" href="/">
            Trang chủ
          </a>
          <span>/</span>
          <span>Sổ quỹ và Ngân hàng</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">M2 cash engine</div>
            <h2 className="hero-title">Sổ quỹ &amp; Ngân hàng</h2>
            <p className="hero-copy">
              Module M2 gom PT, PC, BN, BC, import sao kê và đối chiếu ngân hàng trên một voucher engine chung.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={cashVoucherScreens[0].route}>
                <AppIcon name="WalletCards" />
                Mở PT/PC
              </a>
              <a className="button" href={reconciliationScreen.route}>
                <AppIcon name="Search" />
                Mở đối chiếu
              </a>
              <a className="button" href={`${reconciliationScreen.route}?mode=auto`}>
                <AppIcon name="ArrowLeftRight" />
                Đối chiếu tự động
              </a>
            </div>
          </div>
          <div className="sync-panel">
            <strong>Read-only GD1</strong>
            <span>
              Dữ liệu Workit được đồng bộ theo source id + checksum, lưu raw payload để phục vụ audit và đối chiếu.
              Hiện tại có {metrics[2]?.value ?? 0} dòng cần đối chiếu và {metrics[3]?.value ?? 0} chứng từ chờ duyệt.
            </span>
          </div>
        </section>

        <div className="cash-summary-grid">
          {cashSummaryCards.map((card, index) => (
            <article className={`cash-summary-card tone-${card.tone}`} key={card.label}>
              <div className="cash-summary-icon">
                <AppIcon name={card.icon} />
              </div>
              <div className="cash-summary-copy">
                <span className="cash-summary-label">{card.label}</span>
                <strong className="cash-summary-value">{card.value}</strong>
                <span className="cash-summary-hint">{card.hint}</span>
              </div>
              <span className="cash-summary-index">{String(index + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </div>

        <div className="section-title">
          <h2>Nghiệp vụ</h2>
          <StatusPill status="ready" />
        </div>
        <div className="cash-operation-grid">
          {cashOperationCards.map((card) => (
            <a
              className={`cash-operation-card${card.featured ? " cash-operation-card--featured" : ""}`}
              href={card.href}
              key={card.title}
            >
              <span className={`cash-operation-icon tone-${card.tone}`}>
                <AppIcon name={card.icon} />
              </span>
              <div className="cash-operation-copy">
                {card.featured ? <span className="cash-operation-badge">Hoàn thiện</span> : null}
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </a>
          ))}

          <a className="cash-operation-card cash-operation-card--auto" href={`${reconciliationScreen.route}?mode=auto`}>
            <span className="cash-operation-icon tone-cyan">
              <AppIcon name="ArrowLeftRight" />
            </span>
            <div className="cash-operation-copy">
              <h3>Đối chiếu sao kê ngân hàng tự động</h3>
              <p>So khớp theo số tiền, ngày và tham chiếu; gợi ý unmatched, partial và matched cho kế toán.</p>
            </div>
          </a>
        </div>

        <section className="cash-recon-panel">
          <div className="cash-recon-copy">
            <div className="eyebrow">New feature</div>
            <h3>Đối chiếu sao kê ngân hàng tự động</h3>
            <p>
              Hệ thống tự nhận diện dòng sao kê, so khớp với BN/BC theo số tiền, ngày, reference và trạng thái để
              giảm thao tác thủ công.
            </p>
            <div className="cash-recon-actions">
              <a className="button primary" href={reconciliationScreen.route}>
                <AppIcon name="Search" />
                Bắt đầu đối chiếu
              </a>
              <a className="button" href={bankStatementScreen.route}>
                <AppIcon name="Upload" />
                Nhập sao kê
              </a>
            </div>
          </div>
          <div className="cash-recon-stats">
            <div className="cash-recon-stat">
              <strong>{metrics[2]?.value ?? "0"}</strong>
              <span>Dòng chưa khớp</span>
            </div>
            <div className="cash-recon-stat">
              <strong>{metrics[3]?.value ?? "0"}</strong>
              <span>Chứng từ chờ duyệt</span>
            </div>
            <div className="cash-recon-stat">
              <strong>{currency.format(sumVoucherAmount(["BN", "BC"]))}</strong>
              <span>Tổng giao dịch ngân hàng</span>
            </div>
          </div>
        </section>

        <div className="section-title">
          <h2>Báo cáo</h2>
        </div>
        <div className="cash-report-grid">
          {cashReportCards.map((card) => (
            <a className="cash-report-card" href={card.href} key={card.title}>
              <AppIcon name={card.icon} />
              <span>{card.title}</span>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

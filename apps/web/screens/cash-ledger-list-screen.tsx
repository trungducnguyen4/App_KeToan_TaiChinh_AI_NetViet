"use client";

import { useMemo, useState } from "react";
import { cashVouchers } from "@domain/index";
import type { VoucherRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { MarkdownText } from "../components/markdown-text";
import { StatusPill } from "../components/status-pill";
import { postApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const foreignCurrency = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});

const dateDisplay = new Intl.DateTimeFormat("vi-VN");
const dateTimeDisplay = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "medium"
});

type CashLedgerListScreenProps = {
  voucherType: "PT" | "PC";
  title: string;
  createHref: string;
  detailColumns: string[];
  rightSidebarTitle?: string;
  rightSidebarHint?: string;
};

type ListColumn = {
  key: string;
  label: string;
  render: (voucher: VoucherRecord) => string;
};

type AiChatResponse = {
  answer?: string;
};

const listColumns: ListColumn[] = [
  { key: "voucherType", label: "Mã ctừ", render: (voucher) => splitVoucherNo(voucher.voucherNo).code },
  { key: "voucherNo", label: "Số", render: (voucher) => splitVoucherNo(voucher.voucherNo).number },
  { key: "voucherDate", label: "Ngày", render: (voucher) => formatDate(voucher.voucherDate) },
  { key: "counterpartyCode", label: "Mã đơn vị", render: (voucher) => voucher.counterpartyCode ?? "-" },
  { key: "counterpartyName", label: "Tên đơn vị", render: (voucher) => voucher.counterpartyName ?? "-" },
  { key: "amount", label: "Tổng tiền", render: (voucher) => currency.format(voucher.amount) },
  {
    key: "foreignAmount",
    label: "Tổng tiền NTệ",
    render: () => foreignCurrency.format(0)
  },
  { key: "content", label: "Nội dung", render: (voucher) => voucher.content },
  { key: "contact", label: "Liên hệ", render: (voucher) => voucher.counterpartyCode ?? "-" },
  { key: "address", label: "Địa chỉ", render: (voucher) => voucher.counterpartyAddress ?? "-" },
  { key: "project", label: "Dự án", render: (voucher) => voucher.projectName ?? "-" },
  { key: "sourceVoucherNo", label: "Số ctừ gốc", render: (voucher) => voucher.sourceVoucherNo ?? voucher.referenceInvoiceNo ?? "-" },
  { key: "referenceNo", label: "Ctừ tham chiếu", render: (voucher) => voucher.referenceNo ?? voucher.referenceInvoiceNo ?? "-" },
  { key: "currency", label: "Loại tiền", render: (voucher) => voucher.currency },
  { key: "createdBy", label: "Người tạo", render: (voucher) => voucher.createdBy },
  { key: "createdAt", label: "Ngày tạo", render: (voucher) => formatDateTime(voucher.createdAt ?? voucher.updatedAt) },
  { key: "updatedBy", label: "Người sửa gần nhất", render: (voucher) => voucher.updatedBy ?? voucher.createdBy },
  { key: "updatedAt", label: "Ngày sửa gần nhất", render: (voucher) => formatDateTime(voucher.updatedAt) }
];

export default function CashLedgerListScreen({
  voucherType,
  title,
  createHref,
  detailColumns,
  rightSidebarTitle = "Chi tiết dòng hạch toán",
  rightSidebarHint = "Dòng đầu tiên của chứng từ đang chọn"
}: CashLedgerListScreenProps) {
  const vouchers = useMemo(() => cashVouchers.filter((voucher) => voucher.voucherType === voucherType), [voucherType]);
  const [selectedId, setSelectedId] = useState(vouchers[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [fromMonth, setFromMonth] = useState("07/2026");
  const [toMonth, setToMonth] = useState("07/2026");
  const [periodLabel, setPeriodLabel] = useState("Trong năm");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const filteredVouchers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return vouchers.filter((voucher) => {
      if (!normalized) {
        return true;
      }

      return [
        voucher.voucherNo,
        voucher.counterpartyCode,
        voucher.counterpartyName,
        voucher.counterpartyAddress,
        voucher.projectName,
        voucher.sourceVoucherNo,
        voucher.referenceNo,
        voucher.referenceInvoiceNo,
        voucher.content
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, vouchers]);

  const selectedVoucher = filteredVouchers.find((voucher) => voucher.id === selectedId) ?? filteredVouchers[0] ?? vouchers[0];
  const selectedLine = selectedVoucher?.lines[0];

  async function handleAskAi() {
    if (!selectedVoucher) {
      setAiSuggestion("Chua co chung tu duoc chon de AI kiem tra.");
      return;
    }

    setIsAskingAi(true);
    setAiSuggestion("");

    try {
      const response = await postApi<AiChatResponse>("/ai/chat", {
        message:
          "Kiem tra nhanh chung tu dang chon: goi y dinh khoan, rui ro thue/kiem soat, thong tin con thieu va viec can lam tiep. Tra loi ngan gon theo bullet.",
        currentScreen: `/modules/cash/${voucherType === "PC" ? "payments" : "receipts"}`,
        selectedFilters: {
          voucherType,
          period: `${fromMonth} - ${toMonth}`,
          query,
          selectedVoucher: {
            voucherNo: selectedVoucher.voucherNo,
            voucherDate: selectedVoucher.voucherDate,
            counterpartyName: selectedVoucher.counterpartyName,
            content: selectedVoucher.content,
            amount: selectedVoucher.amount,
            status: selectedVoucher.status,
            lines: selectedVoucher.lines.slice(0, 5),
          },
        },
      });

      setAiSuggestion(response.answer || "AI da nhan yeu cau nhung chua tra ve noi dung.");
    } catch (error) {
      setAiSuggestion(error instanceof Error ? error.message : "Khong goi duoc AI Agent.");
    } finally {
      setIsAskingAi(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">
            Trang chủ
          </a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/cash">
            Sổ quỹ &amp; Ngân hàng
          </a>
          <span>/</span>
          <span>{title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Màn danh sách</div>
            <h2 className="hero-title">{title}</h2>
            <p className="hero-copy">
              Danh sách chứng từ {voucherType} dùng chung template bảng, có đủ metadata và chi tiết hạch toán phía dưới.
            </p>
          </div>
          <div className="sync-panel">
            <strong>{filteredVouchers.length} chứng từ</strong>
            <span>
              Hỗ trợ lọc theo kỳ, tìm kiếm nhanh và mở form tạo mới riêng qua nút <strong>Thêm (F2)</strong>.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Danh sách chứng từ</h2>
          <div className="topbar-actions">
            <a className="button primary" href={createHref}>
              <AppIcon name="FileText" />
              Thêm (F2)
            </a>
            <button className="button" type="button" onClick={handleAskAi} disabled={isAskingAi}>
              <AppIcon name="Bot" />
              {isAskingAi ? "AI dang kiem tra..." : "AI kiem tra"}
            </button>
            <button className="button" type="button">
              In
            </button>
            <button className="button" type="button">
              Xuất Excel
            </button>
          </div>
        </div>

        <section className="panel table-scroll">
          <div className="toolbar">
            <input className="field" value={fromMonth} aria-label="Từ tháng" onChange={(event) => setFromMonth(event.target.value)} />
            <input className="field" value={toMonth} aria-label="Đến tháng" onChange={(event) => setToMonth(event.target.value)} />
            <button className="button" type="button" onClick={() => setPeriodLabel((current) => (current === "Trong năm" ? "Trong quý" : "Trong năm"))}>
              {periodLabel}
            </button>
            <input
              className="search"
              placeholder="Tìm số chứng từ, đơn vị, nội dung"
              aria-label="Tìm kiếm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="button primary" type="button">
              <AppIcon name="Search" />
              Tìm
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                {listColumns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  onClick={() => setSelectedId(voucher.id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: voucher.id === selectedVoucher?.id ? "rgba(15, 23, 42, 0.06)" : undefined
                  }}
                >
                  {listColumns.map((column) => (
                    <td key={column.key}>{column.render(voucher)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Tổng</td>
                <td>{currency.format(filteredVouchers.reduce((total, voucher) => total + voucher.amount, 0))}</td>
                <td>{foreignCurrency.format(0)}</td>
                <td colSpan={11} />
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="section-title">
          <h2>{rightSidebarTitle}</h2>
          <div className="topbar-actions">
            <span className="module-meta">Tổng số: {selectedVoucher?.lines.length ?? 0} dòng</span>
            <span className="module-meta">Kỳ lọc: {fromMonth} - {toMonth}</span>
          </div>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {detailColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedVoucher?.lines.map((line) => (
                <tr key={line.id}>
                  {detailColumns.map((column) => (
                    <td key={column}>{renderDetailCell(column, line, selectedVoucher)}</td>
                  ))}
                </tr>
              )) ?? null}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={detailColumns.length - 2}>Tổng cộng</td>
                <td>{currency.format(selectedVoucher?.lines.reduce((total, line) => total + line.amount, 0) ?? 0)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="section-title">
          <h2>Trạng thái</h2>
        </div>
        <section className="panel">
          <div className="attachment-box">
            <strong>Chứng từ đang chọn</strong>
            <p>
              {selectedVoucher
                ? `${selectedVoucher.voucherNo} - ${selectedVoucher.counterpartyName ?? "Chưa có tên đơn vị"}`
                : "Chưa có chứng từ phù hợp bộ lọc hiện tại."}
            </p>
            {selectedLine ? <p>{rightSidebarHint}: {selectedLine.description}</p> : null}
            <div style={{ marginTop: 12 }}>
              <StatusPill status={selectedVoucher?.status ?? "draft"} />
            </div>
          </div>
          {aiSuggestion ? (
            <div className="attachment-box" style={{ marginTop: 12 }}>
              <strong>AI Agent</strong>
              <MarkdownText className="ai-card-markdown" content={aiSuggestion} />
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function renderDetailCell(column: string, line: VoucherRecord["lines"][number], voucher: VoucherRecord) {
  switch (column) {
    case "TK Nợ":
      return line.debitAccount;
    case "YT1 Nợ":
      return line.debitDimension1 ?? "-";
    case "YT2 Nợ":
      return line.debitDimension2 ?? "-";
    case "TK Có":
      return line.creditAccount;
    case "YT1 Có":
      return line.creditDimension1 ?? "-";
    case "YT2 Có":
      return line.creditDimension2 ?? "-";
    case "Tỷ giá":
      return "1,00";
    case "Tiền NTệ":
      return line.foreignAmount ? foreignCurrency.format(line.foreignAmount) : foreignCurrency.format(0);
    case "Tiền":
      return currency.format(line.amount);
    case "Diễn giải":
      return line.description;
    default:
      return voucher.bankAccountName ?? voucher.bankAccountCode ?? "-";
  }
}

function splitVoucherNo(voucherNo: string) {
  const [code = voucherNo, number = voucherNo] = voucherNo.split("-");
  return { code, number };
}

function formatDate(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? dateValue : dateDisplay.format(parsed);
}

function formatDateTime(dateValue?: string) {
  if (!dateValue) {
    return "-";
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? dateValue : dateTimeDisplay.format(parsed);
}

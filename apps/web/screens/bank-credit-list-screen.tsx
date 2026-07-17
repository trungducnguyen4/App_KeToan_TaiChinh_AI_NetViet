"use client";

import { useMemo, useState } from "react";
import { cashVouchers } from "@domain/index";
import type { VoucherRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { MarkdownText } from "../components/markdown-text";
import { postApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const dateDisplay = new Intl.DateTimeFormat("vi-VN");

type BankCreditColumn = {
  key: string;
  label: string;
  render: (voucher: VoucherRecord) => string;
};

type AiChatResponse = {
  answer?: string;
};

const bankCreditColumns: BankCreditColumn[] = [
  { key: "voucherType", label: "Mã CT", render: (voucher) => splitVoucherNo(voucher.voucherNo).code },
  { key: "voucherNo", label: "Số", render: (voucher) => splitVoucherNo(voucher.voucherNo).number },
  { key: "voucherDate", label: "Ngày", render: (voucher) => formatDate(voucher.voucherDate) },
  { key: "counterpartyName", label: "Tên đơn vị", render: (voucher) => voucher.counterpartyName ?? "-" },
  { key: "amount", label: "Tổng tiền", render: (voucher) => currency.format(voucher.amount) },
  {
    key: "foreignAmount",
    label: "Tổng tiền NTệ",
    render: (voucher) => getForeignAmountText(voucher)
  },
  { key: "content", label: "Nội dung", render: (voucher) => voucher.content },
  { key: "contact", label: "Liên hệ", render: (voucher) => voucher.counterpartyCode ?? "-" },
  { key: "address", label: "Địa chỉ", render: (voucher) => voucher.counterpartyAddress ?? "-" },
  { key: "project", label: "Dự án", render: (voucher) => voucher.projectName ?? "-" },
  { key: "sourceVoucherNo", label: "Số ct gốc", render: (voucher) => voucher.sourceVoucherNo ?? voucher.referenceInvoiceNo ?? "-" },
  { key: "referenceNo", label: "Ctr tham chiếu", render: (voucher) => voucher.referenceNo ?? voucher.referenceInvoiceNo ?? "-" },
  { key: "currency", label: "Loại tiền", render: (voucher) => voucher.currency },
  { key: "createdBy", label: "Người tạo", render: (voucher) => voucher.createdBy },
  { key: "createdAt", label: "Ngày tạo", render: (voucher) => formatDateTime(voucher.createdAt ?? voucher.updatedAt) },
  { key: "updatedBy", label: "Người sửa gần nhất", render: (voucher) => voucher.updatedBy ?? voucher.createdBy },
  { key: "updatedAt", label: "Ngày sửa gần nhất", render: (voucher) => formatDateTime(voucher.updatedAt) }
];

const detailColumns = [
  { key: "debitAccount", label: "TK Nợ" },
  { key: "debitDimension1", label: "YT1 Nợ" },
  { key: "debitDimension2", label: "YT2 Nợ" },
  { key: "creditAccount", label: "TK Có" },
  { key: "bankName", label: "Ngân hàng" },
  { key: "bankAccount", label: "TK ngân hàng" },
  { key: "exchangeRate", label: "Tỷ giá" },
  { key: "foreignAmount", label: "Tiền NTệ" },
  { key: "amount", label: "Tiền" },
  { key: "description", label: "Diễn giải" }
] as const;

export default function BankCreditListScreen() {
  const bankCreditVouchers = useMemo(() => cashVouchers.filter((voucher) => voucher.voucherType === "BC"), []);
  const [selectedId, setSelectedId] = useState(bankCreditVouchers[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [fromMonth, setFromMonth] = useState("07/2026");
  const [toMonth, setToMonth] = useState("07/2026");
  const [periodLabel, setPeriodLabel] = useState("Trong năm");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const filteredVouchers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return bankCreditVouchers.filter((voucher) => {
      if (!normalized) {
        return true;
      }

      return [
        voucher.voucherNo,
        voucher.counterpartyName,
        voucher.counterpartyCode,
        voucher.counterpartyAddress,
        voucher.projectName,
        voucher.sourceVoucherNo,
        voucher.referenceNo,
        voucher.content
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [bankCreditVouchers, query]);

  const selectedVoucher = filteredVouchers.find((voucher) => voucher.id === selectedId) ?? filteredVouchers[0] ?? bankCreditVouchers[0];
  const selectedLine = selectedVoucher?.lines[0];
  const activeVoucher = selectedVoucher;

  async function handleAskAi() {
    if (!selectedVoucher) {
      setAiSuggestion("Chưa có chứng từ BC được chọn để AI kiểm tra.");
      return;
    }

    setIsAskingAi(true);
    setAiSuggestion("");

    try {
      const response = await postApi<AiChatResponse>("/ai/chat", {
        message:
          "Kiểm tra nhanh chứng từ báo có ngân hàng đang chọn: định khoản Nợ/Có, rủi ro đối chiếu sao kê, thông tin còn thiếu và việc cần làm tiếp. Trả lời ngắn gọn theo bullet.",
        currentScreen: "/modules/cash/bank-credits",
        selectedFilters: {
          voucherType: "BC",
          period: `${fromMonth} - ${toMonth}`,
          query,
          selectedVoucher: {
            voucherNo: selectedVoucher.voucherNo,
            voucherDate: selectedVoucher.voucherDate,
            bankAccountCode: selectedVoucher.bankAccountCode,
            counterpartyName: selectedVoucher.counterpartyName,
            content: selectedVoucher.content,
            amount: selectedVoucher.amount,
            reconciliationStatus: selectedVoucher.reconciliationStatus,
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
          <span>Báo có ngân hàng</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Màn danh sách</div>
            <h2 className="hero-title">Báo có ngân hàng</h2>
            <p className="hero-copy">
              Danh sách chứng từ BC dùng chung template bảng, có đủ metadata và chi tiết hạch toán phía dưới.
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
            <a className="button primary" href="/modules/cash/bank-credits/new">
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
            <input
              className="field"
              value={fromMonth}
              aria-label="Từ tháng"
              onChange={(event) => setFromMonth(event.target.value)}
            />
            <input
              className="field"
              value={toMonth}
              aria-label="Đến tháng"
              onChange={(event) => setToMonth(event.target.value)}
            />
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
                {bankCreditColumns.map((column) => (
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
                    backgroundColor: voucher.id === activeVoucher?.id ? "rgba(15, 23, 42, 0.06)" : undefined
                  }}
                >
                  {bankCreditColumns.map((column) => (
                    <td key={column.key}>{column.render(voucher)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Tổng</td>
                <td />
                <td />
                <td />
                <td>{currency.format(filteredVouchers.reduce((total, voucher) => total + voucher.amount, 0))}</td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="section-title">
          <h2>Chi tiết dòng hạch toán</h2>
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
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeVoucher?.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.debitAccount}</td>
                  <td>{line.debitDimension1 ?? "-"}</td>
                  <td>{line.debitDimension2 ?? "-"}</td>
                  <td>{line.creditAccount}</td>
                  <td>{activeVoucher.bankAccountName ?? activeVoucher.bankAccountCode ?? "-"}</td>
                  <td>{activeVoucher.bankAccountCode ?? "-"}</td>
                  <td>1,00</td>
                  <td>-</td>
                  <td>{currency.format(line.amount)}</td>
                  <td>{line.description}</td>
                </tr>
              )) ?? null}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8}>Tổng cộng</td>
                <td>{currency.format(activeVoucher?.lines.reduce((total, line) => total + line.amount, 0) ?? 0)}</td>
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
            {selectedLine ? <p>Dòng hạch toán đầu tiên: {selectedLine.description}</p> : null}
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
  return Number.isNaN(parsed.getTime()) ? dateValue : dateDisplay.format(parsed);
}

function getForeignAmountText(voucher: VoucherRecord) {
  const foreignAmount = voucher.lines[0]?.foreignAmount;
  return typeof foreignAmount === "number" ? currency.format(foreignAmount) : "-";
}

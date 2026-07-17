"use client";

import { useEffect, useMemo, useState } from "react";
import { reconciliationItems, reconciliationScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { MarkdownText } from "../components/markdown-text";
import { readAiWorkflowOutput, readAiWorkflowOutputValue, type AiWorkflowResponse } from "../lib/ai-workflows";
import { fetchApi, postApi, postFormApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const amountOrDash = (value?: number) => value ? currency.format(value) : "—";

const selectedBankAccount = {
  accountNo: "VCB-001",
  bankName: "Vietcombank - CN Sai Gon",
  holderName: "Cong ty Workit Demo"
};

type ReconciliationPayload = typeof reconciliationItems;

type BankStatementPreviewLine = {
  id: string;
  transactionDate: string;
  transactionTime: string;
  referenceNo: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  amount: number;
  runningBalance: number;
  counterparty?: string;
  suggestedVoucher: string;
  matchStatus: string;
  confidence: number;
};

type ReconciliationCandidateDocument = {
  document_id?: string;
  invoice_no?: string;
  partner_name?: string;
  partner_code?: string;
  amount?: number;
  document_date?: string;
  account_code?: string;
  counterparty_type?: string;
  voucher_type?: string;
  status?: string;
  expected_match_score?: number;
  note?: string;
};

type BankStatementPreviewResponse = {
  fileName: string;
  bankName: string;
  bankAccountCode: string;
  accountNo: string;
  statementNo: string;
  statementDate: string;
  lineCount: number;
  candidateDocuments?: ReconciliationCandidateDocument[];
  lines: BankStatementPreviewLine[];
};

type DemoScenario = {
  id: string;
  category?: string;
  rowNo?: number;
  title: string;
  subtitle: string;
  icon: string;
  tone: "green" | "blue" | "amber" | "red";
  voucherId: string;
  voucherNo: string;
  statementLineId: string;
  referenceNo: string;
  transactionDate: string;
  description: string;
  amount: number;
  accountingDate?: string;
  accountingVoucherNo?: string;
  accountingIncome?: number;
  accountingExpense?: number;
  accountingCounterparty?: string;
  accountingContent?: string;
  linkedBankTransaction?: string;
  bankTransactionTime?: string;
  bankTransactionNo?: string;
  bankIncome?: number;
  bankExpense?: number;
  bankContent?: string;
  confidence: number;
  status: "matched" | "partial" | "split" | "unmatched";
  matchReason: string;
  accountingEntry: Array<{ debitAccount: string; creditAccount: string; amount: number; description: string }>;
  allocations?: Array<{ invoiceNo: string; amount: number }>;
  suggestedActionLabel?: string;
  suggestedActionDescription?: string;
  suggestedActionResult?: string;
  candidateDocument?: ReconciliationCandidateDocument;
  bankAccountCode?: string;
  sourceFileName?: string;
};

type SemanticMatch = {
  invoice_id?: unknown;
  document_id?: unknown;
  match_score?: unknown;
  reason?: unknown;
  matched_signals?: unknown;
  risk_flags?: unknown;
};

const demoScenarios: DemoScenario[] = [
  {
    id: "matched",
    title: "Khớp hoàn toàn",
    subtitle: "Số tiền, tham chiếu và nội dung đều trùng",
    icon: "ShieldCheck",
    tone: "green",
    voucherId: "cash-voucher-003",
    voucherNo: "BN1-26070003",
    statementLineId: "statement-line-demo-001",
    referenceNo: "BN1-26070003",
    transactionDate: "2026-07-14",
    description: "THANH TOAN NCC TTP MH-26070008 REF BN1-26070003",
    amount: 62000000,
    confidence: 100,
    status: "matched",
    matchReason: "Trùng số tiền, mã chứng từ BN1-26070003 và nội dung nhà cung cấp TTP.",
    accountingEntry: [
      {
        debitAccount: "331",
        creditAccount: "1121",
        amount: 62000000,
        description: "Thanh toán nhà cung cấp TTP qua ngân hàng."
      }
    ]
  },
  {
    id: "partial",
    title: "Khớp một phần",
    subtitle: "Khách thanh toán thấp hơn công nợ còn lại",
    icon: "Calculator",
    tone: "blue",
    voucherId: "cash-voucher-004",
    voucherNo: "BC1-26070005",
    statementLineId: "statement-line-demo-002",
    referenceNo: "FT2619600101",
    transactionDate: "2026-07-14",
    description: "CONG TY CO PHAN 32 TT MOT PHAN BH-26070011",
    amount: 30000000,
    confidence: 88,
    status: "partial",
    matchReason: "Trùng khách hàng KH32 và hóa đơn BH-26070011, nhưng số tiền chỉ khớp một phần.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount: 30000000,
        description: "Ghi nhận KH32 thanh toán một phần."
      }
    ],
    allocations: [
      {
        invoiceNo: "BH-26070011",
        amount: 30000000
      },
      {
        invoiceNo: "Còn lại",
        amount: 24000000
      }
    ]
  },
  {
    id: "split",
    title: "Một giao dịch nhiều hóa đơn",
    subtitle: "Tổng tiền khớp nhiều hóa đơn",
    icon: "ArrowLeftRight",
    tone: "amber",
    voucherId: "demo-split-voucher",
    voucherNo: "BC-DEMO-SPLIT",
    statementLineId: "statement-line-demo-003",
    referenceNo: "FT2619600102",
    transactionDate: "2026-07-14",
    description: "CONG TY ABC TT HD00256 HD00257 HD00258",
    amount: 15500000,
    confidence: 92,
    status: "split",
    matchReason: "Nội dung chứa 3 số hóa đơn, tổng tiền khớp tổng các khoản phải thu đề xuất.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount: 15500000,
        description: "Khách hàng ABC thanh toán nhiều hóa đơn trong một giao dịch."
      }
    ],
    allocations: [
      { invoiceNo: "HD00256", amount: 5500000 },
      { invoiceNo: "HD00257", amount: 7000000 },
      { invoiceNo: "HD00258", amount: 3000000 }
    ]
  },
  {
    id: "unmatched",
    title: "Ngoại lệ chưa khớp",
    subtitle: "Phí ngân hàng cần kế toán xử lý",
    icon: "FileText",
    tone: "red",
    voucherId: "demo-unmatched-voucher-1",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-demo-004",
    referenceNo: "FEE-VCB-1407",
    transactionDate: "2026-07-14",
    description: "PHI DICH VU NGAN HANG THANG 07/2026",
    amount: 330000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không tìm thấy chứng từ hiện hữu; hệ thống đưa vào danh sách ngoại lệ.",
    accountingEntry: [
      {
        debitAccount: "642",
        creditAccount: "1121",
        amount: 330000,
        description: "Đề xuất tạo bút toán phí dịch vụ ngân hàng."
      }
    ]
  }
] as const;

const matchedDemoRows: DemoScenario[] = Array.from({ length: 10 }, (_, index) => {
  const rowNo = index + 1;
  const amount = 12500000 + index * 1750000;
  const voucherNo = `BC-DEMO-M${String(rowNo).padStart(2, "0")}`;
  const customerCode = `KH${String(101 + index).padStart(3, "0")}`;
  const referenceNo = `FT-MATCH-${String(260700 + rowNo)}`;
  const transactionTime = `2026-07-14 ${String(8 + Math.floor(index / 2)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}:30`;
  const bankContent = `${customerCode} thanh toan dung so tien cho hoa don ${voucherNo}`;

  return {
    id: `matched-${rowNo}`,
    category: "matched",
    rowNo,
    title: "Khớp hoàn toàn",
    subtitle: `${voucherNo} · ${customerCode}`,
    icon: "ShieldCheck",
    tone: "green",
    voucherId: `demo-voucher-matched-${rowNo}`,
    voucherNo,
    statementLineId: `statement-line-matched-${rowNo}`,
    referenceNo,
    transactionDate: "2026-07-14",
    description: bankContent,
    amount,
    accountingDate: "2026-07-14",
    accountingVoucherNo: voucherNo,
    accountingIncome: amount,
    accountingExpense: 0,
    accountingCounterparty: customerCode,
    accountingContent: `Thu tiền ${customerCode} theo hóa đơn ${voucherNo}`,
    linkedBankTransaction: referenceNo,
    bankTransactionTime: transactionTime,
    bankTransactionNo: referenceNo,
    bankIncome: amount,
    bankExpense: 0,
    bankContent,
    confidence: 98 + (rowNo % 3),
    status: "matched",
    matchReason: "Trùng số tiền, số chứng từ, mã khách hàng và nội dung chuyển khoản.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: `Ghi nhận ${customerCode} thanh toán đủ qua ngân hàng.`
      }
    ]
  };
});

const partialDemoRows: DemoScenario[] = [30000000, 18500000, 42000000].map((amount, index) => {
  const rowNo = index + 1;
  const invoiceNo = `BH-PART-${String(rowNo).padStart(2, "0")}`;
  const remainingAmount = [24000000, 9500000, 18000000][index];

  return {
    id: `partial-${rowNo}`,
    category: "partial",
    rowNo,
    title: "Khớp một phần",
    subtitle: `${invoiceNo} còn ${currency.format(remainingAmount)}`,
    icon: "Calculator",
    tone: "blue",
    voucherId: `demo-voucher-partial-${rowNo}`,
    voucherNo: `BC-PART-${String(rowNo).padStart(2, "0")}`,
    statementLineId: `statement-line-partial-${rowNo}`,
    referenceNo: `FT-PART-${String(260800 + rowNo)}`,
    transactionDate: "2026-07-14",
    description: `Khach hang thanh toan mot phan ${invoiceNo}`,
    amount,
    confidence: 84 + rowNo,
    status: "partial",
    matchReason: "Trùng khách hàng và hóa đơn, nhưng số tiền nhỏ hơn công nợ còn lại.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: "Ghi nhận thanh toán một phần công nợ khách hàng."
      }
    ],
    suggestedActionLabel: "Ghi nhận thanh toán một phần",
    suggestedActionDescription: "AI sẽ phân bổ số tiền đã thu vào hóa đơn và giữ phần còn lại là công nợ.",
    suggestedActionResult: `Đã mô phỏng phân bổ ${currency.format(amount)} vào ${invoiceNo}; còn lại ${currency.format(remainingAmount)} tiếp tục theo dõi công nợ.`,
    allocations: [
      { invoiceNo, amount },
      { invoiceNo: "Còn lại", amount: remainingAmount }
    ]
  };
});

const splitDemoRows: DemoScenario[] = [
  {
    customer: "Cong ty ABC",
    invoices: [
      ["HD00256", 5500000],
      ["HD00257", 7000000],
      ["HD00258", 3000000]
    ]
  },
  {
    customer: "Cong ty Minh Chau",
    invoices: [
      ["HD00301", 8200000],
      ["HD00302", 6400000],
      ["HD00303", 4100000]
    ]
  },
  {
    customer: "Cong ty Nam Viet",
    invoices: [
      ["HD00410", 12000000],
      ["HD00411", 9000000],
      ["HD00412", 7500000]
    ]
  }
].map((group, index) => {
  const rowNo = index + 1;
  const allocations = group.invoices.map(([invoiceNo, amount]) => ({ invoiceNo: String(invoiceNo), amount: Number(amount) }));
  const amount = allocations.reduce((sum, item) => sum + item.amount, 0);

  return {
    id: `split-${rowNo}`,
    category: "split",
    rowNo,
    title: "Một giao dịch nhiều hóa đơn",
    subtitle: `${group.customer} · ${allocations.length} hóa đơn`,
    icon: "ArrowLeftRight",
    tone: "amber",
    voucherId: `demo-voucher-split-${rowNo}`,
    voucherNo: `BC-SPLIT-${String(rowNo).padStart(2, "0")}`,
    statementLineId: `statement-line-split-${rowNo}`,
    referenceNo: `FT-SPLIT-${String(260900 + rowNo)}`,
    transactionDate: "2026-07-14",
    description: `${group.customer} thanh toan ${allocations.map((item) => item.invoiceNo).join(" ")}`,
    amount,
    confidence: 90 + rowNo,
    status: "split",
    matchReason: "Một dòng sao kê chứa nhiều số hóa đơn, tổng tiền khớp cụm công nợ đề xuất.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: "Ghi nhận một giao dịch ngân hàng phân bổ cho nhiều hóa đơn."
      }
    ],
    allocations
  };
});

const unmatchedDemoRows: DemoScenario[] = [
  {
    id: "unmatched-1",
    category: "unmatched",
    rowNo: 1,
    title: "Ngoại lệ chưa khớp",
    subtitle: "Phí ngân hàng",
    icon: "FileText",
    tone: "red",
    voucherId: "demo-unmatched-voucher-2",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-unmatched-1",
    referenceNo: "FEE-VCB-1407",
    transactionDate: "2026-07-14",
    description: "PHI DICH VU NGAN HANG THANG 07/2026",
    amount: 330000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không tìm thấy chứng từ hiện hữu; cần kế toán tạo bút toán phí ngân hàng.",
    accountingEntry: [
      {
        debitAccount: "642",
        creditAccount: "1121",
        amount: 330000,
        description: "Đề xuất tạo bút toán phí dịch vụ ngân hàng."
      }
    ],
    suggestedActionLabel: "Tạo chứng từ nháp",
    suggestedActionDescription: "AI sẽ tạo phiếu hạch toán nháp cho khoản phí ngân hàng để kế toán duyệt.",
    suggestedActionResult: "Đã mô phỏng tạo chứng từ nháp HT-FEE-VCB-1407 cho phí ngân hàng 330.000 ₫."
  },
  {
    id: "unmatched-2",
    category: "unmatched",
    rowNo: 2,
    title: "Ngoại lệ chưa khớp",
    subtitle: "Lãi tiền gửi",
    icon: "FileText",
    tone: "red",
    voucherId: "",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-unmatched-2",
    referenceNo: "INT-VCB-1407",
    transactionDate: "2026-07-14",
    description: "LAI TIEN GUI KHONG KY HAN",
    amount: 250000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không có chứng từ kế toán tương ứng; đề xuất tạo bút toán lãi tiền gửi.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "515",
        amount: 250000,
        description: "Đề xuất tạo bút toán lãi tiền gửi."
      }
    ],
    suggestedActionLabel: "Tạo chứng từ nháp",
    suggestedActionDescription: "AI sẽ tạo phiếu hạch toán nháp ghi nhận lãi tiền gửi để kế toán duyệt.",
    suggestedActionResult: "Đã mô phỏng tạo chứng từ nháp HT-INT-VCB-1407 cho lãi tiền gửi 250.000 ₫."
  }
];

const demoRows: DemoScenario[] = [...matchedDemoRows, ...partialDemoRows, ...splitDemoRows, ...unmatchedDemoRows];

const processSteps = ["Nhập sao kê", "Chọn case demo", "Gợi ý match", "Kế toán duyệt", "Ghi nhận audit"] as const;

function stripJsonFence(content: string) {
  const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fencedJson?.[1] ?? content).trim();
}

function parseJsonLike(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(stripJsonFence(value));
  } catch {
    return value;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function formatMatchScore(value: unknown) {
  if (typeof value === "number") {
    return `${Math.round(value * 100)}%`;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return `${Math.round(numeric * 100)}%`;
  }

  return "Chua co";
}

function getSemanticMatches(value: unknown): SemanticMatch[] {
  const parsed = asRecord(parseJsonLike(value));
  if (!parsed) {
    return [];
  }

  const result = asRecord(parsed.result);
  const candidate = parsed.suggested_matches ?? result?.suggested_matches ?? parsed.candidate_matches;
  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate.filter((item): item is SemanticMatch => Boolean(asRecord(item)));
}

function normalizeSemanticText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function pickUnmatchedPreviewLine(preview: BankStatementPreviewResponse, fallback?: ReconciliationPayload["statements"][number]) {
  const readableLines = preview.lines.filter((line) => line.description || line.referenceNo || line.amount);
  const preferredLine =
    readableLines.find((line) => /needs_semantic|semantic|review|can_doi_chieu|chua_khop|needs|true|yes|^1$/.test(normalizeSemanticText(line.matchStatus))) ??
    readableLines.find((line) => line.suggestedVoucher || line.counterparty) ??
    readableLines.find((line) => !/unmatched|khong_khop/.test(normalizeSemanticText(line.matchStatus))) ??
    readableLines[0];

  if (preferredLine) {
    return {
      date: preferredLine.transactionDate || preview.statementDate,
      time: preferredLine.transactionTime,
      reference_no: preferredLine.referenceNo,
      amount: preferredLine.amount,
      debit_amount: preferredLine.debitAmount,
      credit_amount: preferredLine.creditAmount,
      description: preferredLine.description,
      counterparty: preferredLine.counterparty,
      suggested_voucher: preferredLine.suggestedVoucher,
      match_status: preferredLine.matchStatus,
      bank_account_code: preview.bankAccountCode || selectedBankAccount.accountNo,
      source_file_name: preview.fileName,
    };
  }

  return {
    date: fallback?.transactionDate ?? "",
    amount: fallback?.amount ?? 0,
    description: fallback?.description ?? "",
    bank_account_code: fallback?.bankAccountCode ?? selectedBankAccount.accountNo,
    source_file_name: preview.fileName,
  };
}

function buildPreviewCandidateDocuments(preview: BankStatementPreviewResponse): ReconciliationCandidateDocument[] {
  const sheetCandidates = preview.candidateDocuments ?? [];
  const lineCandidates = preview.lines
    .filter((line) => line.suggestedVoucher)
    .map((line) => ({
      document_id: line.suggestedVoucher,
      invoice_no: line.suggestedVoucher,
      partner_name: line.counterparty,
      amount: line.amount,
      document_date: line.transactionDate || preview.statementDate,
      note: line.description,
    }));

  const unique = new Map<string, ReconciliationCandidateDocument>();

  for (const item of [...sheetCandidates, ...lineCandidates]) {
    const key = String(item.document_id ?? item.invoice_no ?? "").trim();
    if (key && !unique.has(key)) {
      unique.set(key, item);
    }
  }

  return [...unique.values()];
}

function scoreToPercent(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.round((numeric <= 1 ? numeric * 100 : numeric));
}

function normalizeDocumentToken(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/([a-z]+)0+(\d+)/g, "$1$2")
    .replace(/[^a-z0-9]+/g, "");
}

function classifyPreviewLine(line: BankStatementPreviewLine, semanticMatches: SemanticMatch[]): DemoScenario["status"] {
  const status = normalizeSemanticText(line.matchStatus);

  if (/partial/.test(status)) {
    return "partial";
  }

  if (/many|multi|split|nhieu/.test(status)) {
    return "split";
  }

  if (/unmatched|bank_fee|fee|interest|khong_khop/.test(status)) {
    return "unmatched";
  }

  if (/needs_semantic|semantic|review|needs/.test(status)) {
    return semanticMatches.length ? "matched" : "unmatched";
  }

  return "matched";
}

function toneForStatus(status: DemoScenario["status"]): DemoScenario["tone"] {
  if (status === "matched") return "green";
  if (status === "partial") return "blue";
  if (status === "split") return "amber";
  return "red";
}

function titleForStatus(status: DemoScenario["status"]) {
  if (status === "matched") return "Khớp hoàn toàn";
  if (status === "partial") return "Khớp một phần";
  if (status === "split") return "Một giao dịch nhiều hóa đơn";
  return "Ngoại lệ chưa khớp";
}

function iconForStatus(status: DemoScenario["status"]) {
  if (status === "matched") return "ShieldCheck";
  if (status === "partial") return "Calculator";
  if (status === "split") return "ArrowLeftRight";
  return "FileText";
}

function findCandidateForLine(
  line: BankStatementPreviewLine,
  candidates: ReconciliationCandidateDocument[],
  semanticMatches: SemanticMatch[],
) {
  const lineText = normalizeDocumentToken(`${line.referenceNo} ${line.description} ${line.suggestedVoucher}`);
  const semanticMatch = semanticMatches[0];
  const semanticDocumentId = normalizeDocumentToken(semanticMatch?.document_id ?? semanticMatch?.invoice_id);

  return (
    candidates.find((candidate) => semanticDocumentId && normalizeDocumentToken(candidate.document_id) === semanticDocumentId) ??
    candidates.find((candidate) => {
      const invoice = normalizeDocumentToken(candidate.invoice_no);
      const document = normalizeDocumentToken(candidate.document_id);
      return Boolean((invoice && lineText.includes(invoice)) || (document && lineText.includes(document)));
    }) ??
    candidates.find((candidate) => normalizeDocumentToken(candidate.document_id) === normalizeDocumentToken(line.suggestedVoucher)) ??
    candidates.find((candidate) => Number(candidate.amount ?? 0) === line.amount) ??
    undefined
  );
}

function buildPreviewAccountingEntry(
  line: BankStatementPreviewLine,
  candidate: ReconciliationCandidateDocument | undefined,
): DemoScenario["accountingEntry"] {
  const accountCode = String(candidate?.account_code ?? "").trim();
  const description = normalizeSemanticText(line.description);
  const amount = line.amount || Math.max(line.debitAmount, line.creditAmount);

  if (accountCode === "131" || line.creditAmount > 0) {
    if (/interest|lai tien gui|lai ngan hang/.test(description) && accountCode !== "131") {
      return [{ debitAccount: "1121", creditAccount: "515", amount, description: line.description || "Lãi tiền gửi ngân hàng" }];
    }

    return [{ debitAccount: "1121", creditAccount: "131", amount, description: line.description || "Thu công nợ khách hàng qua ngân hàng" }];
  }

  if (/fee|phi ngan hang|phi dich vu/.test(description) && accountCode !== "331") {
    return [{ debitAccount: "642", creditAccount: "1121", amount, description: line.description || "Phí ngân hàng" }];
  }

  return [{ debitAccount: "331", creditAccount: "1121", amount, description: line.description || "Thanh toán công nợ nhà cung cấp qua ngân hàng" }];
}

function buildReconciliationRowsFromPreview(
  preview: BankStatementPreviewResponse,
  semanticMatches: SemanticMatch[],
  extraCandidates: ReconciliationCandidateDocument[] = [],
): DemoScenario[] {
  const candidates = [...buildPreviewCandidateDocuments(preview), ...extraCandidates];

  return preview.lines.map((line, index) => {
    const status = classifyPreviewLine(line, semanticMatches);
    const tone = toneForStatus(status);
    const candidate = findCandidateForLine(line, candidates, semanticMatches);
    const semanticMatch = semanticMatches[index] ?? semanticMatches[0];
    const confidence =
      scoreToPercent(semanticMatch?.match_score) ||
      scoreToPercent(candidate?.expected_match_score) ||
      (status === "unmatched" ? 0 : line.confidence);
    const voucherNo = String(candidate?.document_id ?? candidate?.invoice_no ?? line.suggestedVoucher ?? "Chưa có chứng từ");
    const matchReason = String(
      semanticMatch?.reason ??
      candidate?.note ??
      (status === "unmatched"
        ? "Chưa tìm thấy chứng từ đủ điều kiện khớp trong danh sách ứng viên."
        : "AI đọc file sao kê và tìm thấy tín hiệu đối chiếu từ nội dung, số tiền hoặc mã chứng từ."),
    );

    return {
      id: `uploaded-${index + 1}`,
      category: status,
      rowNo: index + 1,
      title: titleForStatus(status),
      subtitle: `${line.referenceNo || "Không có số giao dịch"} · ${line.matchStatus || "AI đọc file"}`,
      icon: iconForStatus(status),
      tone,
      voucherId: voucherNo,
      voucherNo,
      statementLineId: line.id,
      referenceNo: line.referenceNo,
      transactionDate: line.transactionDate || preview.statementDate,
      description: line.description,
      amount: line.amount,
      accountingDate: candidate?.document_date || line.transactionDate || preview.statementDate,
      accountingVoucherNo: voucherNo,
      accountingIncome: status === "unmatched" ? 0 : (line.creditAmount || line.amount),
      accountingExpense: status === "unmatched" ? 0 : line.debitAmount,
      accountingCounterparty: candidate?.partner_name || line.counterparty || "Chưa xác định",
      accountingContent: matchReason,
      linkedBankTransaction: line.referenceNo,
      bankTransactionTime: line.transactionTime || line.transactionDate || preview.statementDate,
      bankTransactionNo: line.referenceNo,
      bankIncome: line.creditAmount,
      bankExpense: line.debitAmount,
      bankContent: line.description,
      confidence,
      status,
      matchReason,
      accountingEntry: buildPreviewAccountingEntry(line, candidate),
      suggestedActionLabel: status === "unmatched" ? "Tạo chứng từ nháp" : undefined,
      suggestedActionDescription: status === "unmatched" ? "AI sẽ tạo chứng từ nháp để kế toán kiểm tra và duyệt." : undefined,
      suggestedActionResult: status === "unmatched" ? `Đã mô phỏng tạo chứng từ nháp cho ${line.referenceNo || "dòng sao kê này"}.` : undefined,
      candidateDocument: candidate,
      bankAccountCode: preview.bankAccountCode,
      sourceFileName: preview.fileName,
    };
  });
}

function SemanticReconciliationResult({ value }: { value: unknown }) {
  const matches = getSemanticMatches(value);

  if (!matches.length) {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return <MarkdownText className="ai-card-markdown" content={text} />;
  }

  return (
    <div className="semantic-ai-result">
      <table className="semantic-ai-table">
        <thead>
          <tr>
            <th>Chung tu</th>
            <th>Diem khop</th>
            <th>Tin hieu khop</th>
            <th>Rui ro</th>
            <th>Ly do</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => {
            const documentId = String(match.document_id ?? match.invoice_id ?? "Chua co");
            const signals = asStringList(match.matched_signals);
            const risks = asStringList(match.risk_flags);

            return (
              <tr key={`${documentId}-${index}`}>
                <td>
                  <strong>{documentId}</strong>
                </td>
                <td>{formatMatchScore(match.match_score)}</td>
                <td>{signals.length ? signals.join(", ") : "Chua co"}</td>
                <td>{risks.length ? risks.join(", ") : "Khong co"}</td>
                <td>{String(match.reason ?? "Chua co ly do")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ReconciliationScreen() {
  const [items, setItems] = useState<ReconciliationPayload>(reconciliationItems);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [selectedStatementLineId, setSelectedStatementLineId] = useState("");
  const [matchedAmount, setMatchedAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<unknown>("");
  const [recentMatchId, setRecentMatchId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(demoScenarios[0].id);
  const [selectedDemoRowId, setSelectedDemoRowId] = useState(matchedDemoRows[0].id);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [hasAutoReconciliationRun, setHasAutoReconciliationRun] = useState(false);
  const [resultRows, setResultRows] = useState<DemoScenario[]>([]);
  const [debtCandidates, setDebtCandidates] = useState<ReconciliationCandidateDocument[]>([]);

  const reconciliationRows = hasAutoReconciliationRun && resultRows.length ? resultRows : demoRows;
  const visibleDemoRows = reconciliationRows.filter((row) => row.category === selectedDemoId);
  const selectedDemo = visibleDemoRows.find((row) => row.id === selectedDemoRowId) ?? visibleDemoRows[0] ?? reconciliationRows[0] ?? demoRows[0];

  async function loadReconciliation() {
    const data = await fetchApi<ReconciliationPayload>("/cash/reconciliation");
    setItems(data);
  }

  async function loadDebtCandidates() {
    const data = await fetchApi<ReconciliationCandidateDocument[]>("/cash/reconciliation/debt-candidates");
    setDebtCandidates(data);
  }

  useEffect(() => {
    void loadReconciliation().catch(() => undefined);
    void loadDebtCandidates().catch(() => setDebtCandidates([]));
  }, []);

  useEffect(() => {
    const firstRow = visibleDemoRows[0];
    if (firstRow) {
      setSelectedDemoRowId(firstRow.id);
      if (hasAutoReconciliationRun) {
        applyDemoScenario(firstRow);
      }
    }
  }, [selectedDemoId, hasAutoReconciliationRun]);

  const autoCandidates = useMemo(() => items.vouchers.filter((voucher) => voucher.voucherType !== "PT"), [items.vouchers]);

  function applyDemoScenario(scenario: DemoScenario) {
    setSelectedVoucherId(scenario.voucherId);
    setSelectedStatementLineId(scenario.statementLineId);
    setMatchedAmount(String(scenario.amount));
    setFeedback(`${scenario.title}: ${scenario.matchReason}`);
  }

  function resetAiReconciliation() {
    setHasAutoReconciliationRun(false);
    setResultRows([]);
    setAiSuggestion("");
    setRecentMatchId("");
    setFeedback("");
  }

  async function handleMatch() {
    if (!selectedVoucherId || !selectedStatementLineId || !matchedAmount) {
      setFeedback("Cần chọn chứng từ BN/BC, dòng sao kê và số tiền khớp trước khi match.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      if (hasAutoReconciliationRun && reconciliationRows.some((row) => row.statementLineId === selectedStatementLineId)) {
        const result = await postApi<{
          id: string;
          status: string;
          voucherNo: string;
          voucherType: string;
          createdVoucher: boolean;
          importedStatementLine: boolean;
          matchedAmount: number;
        }>("/cash/reconciliation/ai-confirm", {
          statementLine: {
            transactionDate: selectedDemo.transactionDate,
            transactionTime: selectedDemo.bankTransactionTime,
            referenceNo: selectedDemo.referenceNo,
            description: selectedDemo.description,
            debitAmount: selectedDemo.bankExpense ?? 0,
            creditAmount: selectedDemo.bankIncome ?? 0,
            amount: selectedDemo.amount,
            counterparty: selectedDemo.accountingCounterparty,
          },
          candidateDocument: selectedDemo.candidateDocument,
          bankAccountCode: selectedDemo.bankAccountCode || selectedBankAccount.accountNo,
          sourceFileName: selectedDemo.sourceFileName,
          status: selectedDemo.status,
          note: selectedDemo.matchReason,
        });
        setRecentMatchId(result.id);
        setFeedback(
          `Đã ghi match thật ${result.voucherType} ${result.voucherNo} với ${currency.format(result.matchedAmount)}.${result.createdVoucher ? " AI đã tạo chứng từ nháp vì chưa có chứng từ." : ""}${result.importedStatementLine ? " Dòng sao kê đã được import vào sổ." : ""}`,
        );
        await loadReconciliation();
        await loadDebtCandidates().catch(() => undefined);
        return;
      }

      const result = await postApi<{ id: string; status: string }>("/cash/reconciliation/match", {
        voucherId: selectedVoucherId,
        bankStatementLineId: selectedStatementLineId,
        matchedAmount: Number(matchedAmount),
        note: "UI match"
      });
      setRecentMatchId(result.id);
      setFeedback(`Đã match: ${result.status}`);
      setSelectedVoucherId("");
      setSelectedStatementLineId("");
      setMatchedAmount("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không match được");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAutoMatch() {
    const fallbackVoucher = autoCandidates[0];
    const fallbackStatement = items.statements[0];

    if (!fallbackVoucher || !fallbackStatement) {
      applyDemoScenario(selectedDemo);
      return;
    }

    setSelectedVoucherId(fallbackVoucher.voucherId ?? fallbackVoucher.id);
    setSelectedStatementLineId(fallbackStatement.statementLineId ?? fallbackStatement.id);
    setMatchedAmount(String(Math.min(fallbackVoucher.amount, fallbackStatement.amount)));
    setFeedback("Đã gợi ý cặp giao dịch BN/BC phù hợp. Vui lòng xác nhận và Match.");
  }

  async function handleAskSemanticReconciliation() {
    const pendingDocuments = autoCandidates.slice(0, 8);
    const selectedStatement =
      items.statements.find((item) => (item.statementLineId ?? item.id) === selectedStatementLineId) ??
      items.statements[0];

    if (!statementFile) {
      setFeedback("Vui lòng upload file sao kê CSV hoặc XLSX trước khi chạy AI đối chiếu.");
      setAiSuggestion("");
      setHasAutoReconciliationRun(false);
      setResultRows([]);
      return;
    }

    if (!selectedStatement) {
      setFeedback("Chưa có dòng sao kê để gửi sang AI đối chiếu.");
      setAiSuggestion("");
      setHasAutoReconciliationRun(false);
      setResultRows([]);
      return;
    }

    setIsAskingAi(true);
    setAiSuggestion("");
    setFeedback("");
    setHasAutoReconciliationRun(false);
    setResultRows([]);

    try {
      const previewFormData = new FormData();
      previewFormData.append("file", statementFile);
      const preview = await postFormApi<BankStatementPreviewResponse>("/cash/bank-statements/preview-upload", previewFormData);
      const uploadedStatement = pickUnmatchedPreviewLine(preview, selectedStatement);
      const workbookCandidates = buildPreviewCandidateDocuments(preview);
      const documentsForMatching = [
        ...workbookCandidates,
        ...debtCandidates,
        ...pendingDocuments.map((item) => ({
          document_id: item.voucherId ?? item.id,
          invoice_no: item.voucherNo,
          partner_name: item.counterpartyName,
          amount: item.amount,
          document_date: item.transactionDate,
          voucher_type: item.voucherType,
          status: item.matchingStatus,
        })),
      ];

      if (!preview.lines.length) {
        setFeedback("AI đã đọc file nhưng chưa tìm thấy dòng sao kê hợp lệ để đối chiếu.");
        setHasAutoReconciliationRun(false);
        setResultRows([]);
        return;
      }

      const formData = new FormData();
      formData.append("file", statementFile);
      formData.append(
        "inputs",
        JSON.stringify({
          bank_statement_file_name: preview.fileName || statementFile.name,
          bank_statement_no: preview.statementNo,
          bank_statement_date: preview.statementDate,
          bank_account: {
            ...selectedBankAccount,
            accountNo: preview.accountNo || selectedBankAccount.accountNo,
            bankName: preview.bankName || selectedBankAccount.bankName,
          },
          unmatched_transaction: JSON.stringify(uploadedStatement, null, 2),
          bank_statement_lines: JSON.stringify(
            preview.lines.map((line) => ({
              date: line.transactionDate || preview.statementDate,
              time: line.transactionTime,
              reference_no: line.referenceNo,
              amount: line.amount,
              debit_amount: line.debitAmount,
              credit_amount: line.creditAmount,
              description: line.description,
              counterparty: line.counterparty,
              suggested_voucher: line.suggestedVoucher,
              match_status: line.matchStatus,
            })),
            null,
            2,
          ),
          pending_documents: JSON.stringify(
            documentsForMatching,
            null,
            2,
          ),
        }),
      );

      const response = await postFormApi<AiWorkflowResponse>("/ai/workflows/semantic-reconciliation/upload", formData);
      const outputValue = readAiWorkflowOutputValue(response);
      const semanticOutput =
        outputValue ??
        readAiWorkflowOutput(
          response,
          "Workflow semantic-reconciliation chua cau hinh API key trong .env.",
        );
      const semanticMatches = getSemanticMatches(semanticOutput);
      const nextRows = buildReconciliationRowsFromPreview(preview, semanticMatches, documentsForMatching);

      setAiSuggestion(semanticOutput);
      setResultRows(nextRows);
      setHasAutoReconciliationRun(true);

      const firstCategory = nextRows[0]?.category ?? demoScenarios[0].id;
      const firstRow = nextRows.find((row) => row.category === firstCategory) ?? nextRows[0];
      setSelectedDemoId(firstCategory);
      if (firstRow) {
        setSelectedDemoRowId(firstRow.id);
        applyDemoScenario(firstRow);
      }

      if (!semanticMatches.length) {
        setFeedback(
          `AI đã đọc file ${statementFile.name}; bảng bên dưới đang hiển thị ${nextRows.length} dòng từ file nhưng workflow chưa trả gợi ý đạt ngưỡng.`,
        );
        return;
      }

      setFeedback(
        `AI đã đọc file ${statementFile.name}, hiển thị ${nextRows.length} dòng và tìm thấy ${semanticMatches.length} gợi ý đối chiếu.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong goi duoc workflow doi chieu AI.";
      setAiSuggestion("");
      setFeedback(message);
      setHasAutoReconciliationRun(false);
      setResultRows([]);
    } finally {
      setIsAskingAi(false);
    }
  }

  async function handleUnmatch() {
    if (!recentMatchId) {
      setFeedback("Chưa có match ID để hủy.");
      return;
    }

    if (recentMatchId.startsWith("DEMO-") || recentMatchId.startsWith("AI-")) {
      setRecentMatchId("");
      applyDemoScenario(selectedDemo);
      setFeedback("Đã reset lựa chọn match.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ status: string }>("/cash/reconciliation/unmatch", {
        matchId: recentMatchId,
        reason: "UI unmatch"
      });
      setFeedback(`Đã ${result.status}`);
      setRecentMatchId("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không unmatch được");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSuggestedAction() {
    if (!selectedDemo.suggestedActionResult) {
      return;
    }

    void handleMatch();
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Sổ quỹ &amp; Ngân hàng</span>
          <span>/</span>
          <span>{reconciliationScreen.title}</span>
        </div>

        <div className="cash-recon-steps">
          {processSteps.map((step, index) => (
            <div className="cash-recon-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>

        <div className="section-title">
          <h2>AI đối chiếu tự động</h2>
          <span className="module-meta">Upload sao kê CSV/XLSX rồi chạy AI để sinh kết quả đối chiếu</span>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleAskSemanticReconciliation} disabled={isAskingAi}>
              <AppIcon name="Bot" />
              {isAskingAi ? "AI đang đối chiếu..." : "AI đối chiếu tự động"}
            </button>
            {hasAutoReconciliationRun ? (
              <>
                <button className="button" type="button" onClick={handleMatch} disabled={isSubmitting}>
                  <AppIcon name="Search" />
                  {isSubmitting ? "Đang xử lý..." : "Match BN/BC"}
                </button>
                <button className="button" type="button" onClick={handleAutoMatch} disabled={isSubmitting}>
                  <AppIcon name="ArrowLeftRight" />
                  Đề xuất match
                </button>
                <button className="button" type="button" onClick={handleUnmatch} disabled={isSubmitting}>
                  Unmatch
                </button>
              </>
            ) : null}
          </div>
        </div>
        <section className="panel">
          <div className="recon-source-grid">
            <label className="recon-source-field">
              <span>Số tài khoản & ngân hàng đã chọn</span>
              <strong>{selectedBankAccount.accountNo} · {selectedBankAccount.bankName}</strong>
              <small>{selectedBankAccount.holderName}</small>
            </label>
            <label className="recon-source-field">
              <span>Upload file sao kê CSV/XLSX</span>
              <input
                className="field recon-upload-input"
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  setStatementFile(event.target.files?.[0] ?? null);
                  resetAiReconciliation();
                }}
              />
              <strong>{statementFile?.name ?? "Chưa chọn file"}</strong>
              <small>AI chỉ hiển thị kết quả sau khi đọc file và chạy đối chiếu.</small>
            </label>
          </div>

          {!hasAutoReconciliationRun ? (
            <div className="recon-empty-state">
              <AppIcon name="Upload" size={24} />
              <strong>Chưa có kết quả đối chiếu</strong>
              <p>Chọn file sao kê CSV/XLSX, sau đó bấm AI đối chiếu tự động để đọc file, so khớp chứng từ và sinh bảng kết quả.</p>
            </div>
          ) : (
            <>
              <div className="recon-demo-grid">
                {demoScenarios.map((scenario) => {
                  const count = reconciliationRows.filter((row) => row.category === scenario.id).length;

                  return (
                    <button
                      className={`recon-demo-button tone-${scenario.tone} ${selectedDemoId === scenario.id ? "is-active" : ""}`}
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedDemoId(scenario.id)}
                    >
                      <span className="recon-demo-icon">
                        <AppIcon name={scenario.icon} />
                      </span>
                      <span>
                        <strong>{scenario.title}</strong>
                        <small>{count} dòng · {scenario.subtitle}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="recon-demo-table-wrap">
                <div className="subsection">
                  <h3>{visibleDemoRows.length} dòng sao kê AI đã đối chiếu</h3>
                  <span className="module-meta">Bấm từng dòng để xem chi tiết match</span>
                </div>
                <div className="table-scroll">
                  <table className="data-table recon-demo-table">
                    <thead>
                      <tr className="recon-demo-group-row">
                        <th rowSpan={2}>#</th>
                        <th colSpan={7}>Sổ kế toán tiền gửi</th>
                        <th colSpan={5}>
                          Sao k&#234; ng&#226;n h&#224;ng <span className="ai-inline-badge">AI đọc sao kê</span>
                        </th>
                        <th rowSpan={2}>Chức năng</th>
                        <th rowSpan={2}>Tin cậy</th>
                      </tr>
                      <tr>
                        <th>Ngày hạch toán</th>
                        <th>Số chứng từ</th>
                        <th>Số tiền thu</th>
                        <th>Số tiền chi</th>
                        <th>Đối tượng</th>
                        <th>Nội dung</th>
                        <th>Giao d&#7883;ch ng&#226;n h&#224;ng</th>
                        <th>Thời gian giao dịch</th>
                        <th>Số giao dịch</th>
                        <th>Số tiền thu</th>
                        <th>Số tiền chi</th>
                        <th>Nội dung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDemoRows.map((row) => (
                        <tr
                          className={selectedDemo.id === row.id ? "is-selected" : ""}
                          key={row.id}
                          onClick={() => {
                            setSelectedDemoRowId(row.id);
                            applyDemoScenario(row);
                          }}
                        >
                          <td>{row.rowNo}</td>
                          <td>{row.accountingDate ?? row.transactionDate}</td>
                          <td>{row.accountingVoucherNo ?? row.voucherNo}</td>
                          <td>{amountOrDash(row.accountingIncome ?? (row.status === "unmatched" ? 0 : row.amount))}</td>
                          <td>{amountOrDash(row.accountingExpense)}</td>
                          <td>{row.accountingCounterparty ?? row.subtitle}</td>
                          <td>{row.accountingContent ?? row.matchReason}</td>
                          <td>{row.linkedBankTransaction ?? row.referenceNo}</td>
                          <td>{row.bankTransactionTime ?? `${row.transactionDate} 09:00:00`}</td>
                          <td>{row.bankTransactionNo ?? row.referenceNo}</td>
                          <td>{amountOrDash(row.bankIncome ?? row.amount)}</td>
                          <td>{amountOrDash(row.bankExpense)}</td>
                          <td>{row.bankContent ?? row.description}</td>
                          <td>
                            <button className="recon-link-button" type="button">
                              Xem match
                            </button>
                          </td>
                          <td>{row.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="recon-visual-panel">
                <article className="recon-visual-card">
                  <span className="recon-visual-label">Dòng sao kê · AI đọc sao kê</span>
                  <strong>{selectedDemo.referenceNo}</strong>
                  <p>{selectedDemo.description}</p>
                  <div className="recon-visual-amount">{currency.format(selectedDemo.amount)}</div>
                </article>
                <div className="recon-visual-arrow">
                  <AppIcon name="ArrowLeftRight" size={22} />
                </div>
                <article className="recon-visual-card">
                  <span className="recon-visual-label">Chứng từ đề xuất</span>
                  <strong>{selectedDemo.voucherNo}</strong>
                  <p>{selectedDemo.matchReason}</p>
                  <div className={`recon-confidence tone-${selectedDemo.tone}`}>{selectedDemo.confidence}% tin cậy</div>
                  {selectedDemo.suggestedActionLabel ? (
                    <div className="recon-ai-action">
                      <button type="button" onClick={handleSuggestedAction}>
                        <AppIcon name="Bot" size={15} />
                        {selectedDemo.suggestedActionLabel}
                      </button>
                      <small>{selectedDemo.suggestedActionDescription}</small>
                    </div>
                  ) : null}
                </article>
              </div>

              {selectedDemo.allocations ? (
                <div className="recon-allocation-grid">
                  {selectedDemo.allocations.map((item) => (
                    <div className="recon-allocation-card" key={item.invoiceNo}>
                      <span>{item.invoiceNo}</span>
                      <strong>{currency.format(item.amount)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Trạng thái</strong>
              <p>{feedback}</p>
            </div>
          ) : null}

          {aiSuggestion ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>AI đối chiếu ngữ nghĩa</strong>
              <SemanticReconciliationResult value={aiSuggestion} />
            </div>
          ) : null}
        </section>

      </div>
    </AppShell>
  );
}

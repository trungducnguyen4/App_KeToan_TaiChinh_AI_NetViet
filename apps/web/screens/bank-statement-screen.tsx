"use client";

import { useEffect, useMemo, useState } from "react";
import { bankStatementScreen, bankStatements } from "@domain/index";
import type { BankStatementRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { bankStatementAssistantMock } from "../lib/document-assistant-mock-data";
import { readAiWorkflowOutput, type AiWorkflowResponse } from "../lib/ai-workflows";
import { fetchApi, postApi, postFormApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

type StatementFormState = {
  bankAccountCode: string;
  statementNo: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  sourceName: string;
  transactionDate: string;
  referenceNo: string;
  description: string;
  debitAmount: string;
  creditAmount: string;
};

type BankStatementAiLine = {
  id: string;
  transactionTime: string;
  referenceNo: string;
  description: string;
  amount: number;
  debitAmount?: number;
  creditAmount?: number;
  runningBalance?: number;
  direction: "Thu" | "Chi";
  suggestedVoucher: string;
  matchStatus: "Matched" | "Partial" | "Unmatched" | "Review";
  confidence: number;
};

type BankStatementAiDraft = {
  fileName: string;
  voucherType: string;
  bankName: string;
  bankAccountCode: string;
  statementNo: string;
  accountNo: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  lineCount: string;
  format: string;
  classificationLabel: string;
  recommendation: string;
  confidence: number;
  statementLines: BankStatementAiLine[];
};

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
  suggestedVoucher: string;
  matchStatus: string;
  confidence: number;
};

type BankStatementPreviewResponse = {
  fileName: string;
  bankName: string;
  bankAccountCode: string;
  accountNo: string;
  statementNo: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  lineCount: number;
  format: string;
  classificationLabel: string;
  recommendation: string;
  confidence: number;
  lines: BankStatementPreviewLine[];
};

const initialBankStatementAiDraft: BankStatementAiDraft = {
  fileName: bankStatementAssistantMock.fileName,
  voucherType: "BN",
  bankName: bankStatementAssistantMock.extractedFields[0]?.value ?? "Vietcombank",
  bankAccountCode: "VCB-001",
  statementNo: `ST-${Date.now()}`,
  accountNo: bankStatementAssistantMock.extractedFields[1]?.value ?? "VCB-001 - 0123456789",
  statementDate: bankStatementAssistantMock.extractedFields[2]?.value ?? "2026-07-14",
  openingBalance: 0,
  closingBalance: 0,
  lineCount: bankStatementAssistantMock.extractedFields[3]?.value ?? "5",
  format: bankStatementAssistantMock.extractedFields[4]?.value ?? "CSV/XLSX chuẩn hóa",
  classificationLabel: bankStatementAssistantMock.classificationLabel,
  recommendation: bankStatementAssistantMock.recommendation,
  confidence: bankStatementAssistantMock.confidence,
  statementLines: bankStatementAssistantMock.statementLines ?? []
};

function extractJsonBlock(content: string) {
  const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fencedJson?.[1] ?? content).trim();
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJsonObject(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(extractJsonBlock(value));
  } catch {
    return value;
  }
}

function findValueDeep(value: unknown, aliases: string[]): unknown {
  const normalizedAliases = aliases.map(normalizeKey);
  const parsedValue = parseJsonObject(value);

  if (Array.isArray(parsedValue)) {
    for (const item of parsedValue) {
      const result = findValueDeep(item, aliases);
      if (result !== undefined && result !== null && result !== "") {
        return result;
      }
    }
    return undefined;
  }

  if (!isRecord(parsedValue)) {
    return undefined;
  }

  for (const [key, item] of Object.entries(parsedValue)) {
    if (normalizedAliases.includes(normalizeKey(key)) && item !== undefined && item !== null && item !== "") {
      return item;
    }
  }

  for (const item of Object.values(parsedValue)) {
    const result = findValueDeep(item, aliases);
    if (result !== undefined && result !== null && result !== "") {
      return result;
    }
  }

  return undefined;
}

function firstText(source: unknown, aliases: string[], fallback: string) {
  const value = findValueDeep(source, aliases);
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function moneyNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function confidenceNumber(source: unknown, fallback: number) {
  const value = findValueDeep(source, ["confidence", "confidence_score", "do_tin_cay", "tin_cay"]);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace("%", "").trim());
    return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  }

  return fallback;
}

function findArrayDeep(value: unknown, aliases: string[]): unknown[] | undefined {
  const normalizedAliases = aliases.map(normalizeKey);
  const parsedValue = parseJsonObject(value);

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (!isRecord(parsedValue)) {
    return undefined;
  }

  for (const [key, item] of Object.entries(parsedValue)) {
    if (normalizedAliases.includes(normalizeKey(key)) && Array.isArray(item)) {
      return item;
    }
  }

  for (const item of Object.values(parsedValue)) {
    const result = findArrayDeep(item, aliases);
    if (result?.length) {
      return result;
    }
  }

  return undefined;
}

function buildStatementLines(source: unknown, fallback: BankStatementAiLine[]) {
  const rawLines = findArrayDeep(source, ["statement_lines", "statementLines", "transactions", "bank_statement_lines", "lines"]);
  if (!rawLines?.length) {
    return fallback;
  }

  return rawLines.map((line, index) => {
    const record = isRecord(line) ? line : {};
    const debitAmount = moneyNumber(findValueDeep(record, ["debit_amount", "debitAmount", "so_tien_chi", "debit", "chi"]), fallback[index]?.debitAmount ?? 0);
    const creditAmount = moneyNumber(findValueDeep(record, ["credit_amount", "creditAmount", "so_tien_thu", "credit", "thu"]), fallback[index]?.creditAmount ?? 0);
    const amount = moneyNumber(findValueDeep(record, ["amount", "so_tien", "credit_amount", "debit_amount"]), fallback[index]?.amount ?? Math.max(debitAmount, creditAmount));
    const direction = firstText(record, ["direction", "type", "thu_chi"], fallback[index]?.direction ?? (debitAmount > creditAmount ? "Chi" : "Thu"));
    const normalizedDirection: BankStatementAiLine["direction"] =
      debitAmount > creditAmount || direction.toLowerCase().includes("chi") || direction.toLowerCase().includes("debit") ? "Chi" : "Thu";

    return {
      id: firstText(record, ["id", "line_id", "statement_line_id"], fallback[index]?.id ?? `ai-st-${index + 1}`),
      transactionTime: firstText(record, ["transaction_time", "transactionTime", "time", "date", "transaction_date"], fallback[index]?.transactionTime ?? ""),
      referenceNo: firstText(record, ["reference_no", "referenceNo", "ref", "transaction_no", "so_giao_dich"], fallback[index]?.referenceNo ?? ""),
      description: firstText(record, ["description", "content", "noi_dung", "dien_giai"], fallback[index]?.description ?? ""),
      amount,
      debitAmount,
      creditAmount,
      runningBalance: moneyNumber(findValueDeep(record, ["running_balance", "runningBalance", "balance", "so_du"]), fallback[index]?.runningBalance ?? 0),
      direction: normalizedDirection,
      suggestedVoucher: firstText(record, ["suggested_voucher", "suggestedVoucher", "voucher_no", "chung_tu_de_xuat"], fallback[index]?.suggestedVoucher ?? ""),
      matchStatus: firstText(record, ["match_status", "matchStatus", "status"], fallback[index]?.matchStatus ?? "Review") as BankStatementAiLine["matchStatus"],
      confidence: confidenceNumber(record, fallback[index]?.confidence ?? 0)
    };
  });
}

function buildBankStatementAiDraft(
  response: AiWorkflowResponse,
  outputText: string,
  previous: BankStatementAiDraft,
  fileName: string,
  voucherType: string
): BankStatementAiDraft {
  const source = {
    outputs: response.outputs ?? {},
    output: outputText
  };
  const statementLines = buildStatementLines(source, previous.statementLines);

  return {
    fileName,
    voucherType,
    bankName: firstText(source, ["bank_name", "bankName", "ngan_hang", "Ngân hàng"], previous.bankName),
    bankAccountCode: firstText(source, ["bank_account_code", "bankAccountCode", "account_code", "ma_tai_khoan_ngan_hang"], previous.bankAccountCode),
    statementNo: firstText(source, ["statement_no", "statementNo", "so_sao_ke"], previous.statementNo),
    accountNo: firstText(source, ["account_no", "accountNo", "bank_account", "so_tai_khoan", "Số tài khoản"], previous.accountNo),
    statementDate: firstText(source, ["statement_date", "statementDate", "ngay_sao_ke", "Ngày sao kê"], previous.statementDate),
    openingBalance: moneyNumber(findValueDeep(source, ["opening_balance", "openingBalance", "so_du_dau"]), previous.openingBalance),
    closingBalance: moneyNumber(findValueDeep(source, ["closing_balance", "closingBalance", "so_du_cuoi"]), previous.closingBalance),
    lineCount: firstText(source, ["line_count", "lineCount", "so_dong", "Số dòng đọc được"], String(statementLines.length || previous.lineCount)),
    format: firstText(source, ["format", "file_format", "dinh_dang", "Định dạng"], previous.format),
    classificationLabel: firstText(source, ["classification_label", "classificationLabel", "document_type", "loai_tai_lieu"], previous.classificationLabel),
    recommendation: firstText(source, ["recommendation", "action", "suggestion", "khuyen_nghi"], previous.recommendation),
    confidence: confidenceNumber(source, previous.confidence),
    statementLines
  };
}

function buildBankStatementAiDraftFromPreview(
  preview: BankStatementPreviewResponse,
  previous: BankStatementAiDraft,
  voucherType: string
): BankStatementAiDraft {
  return {
    fileName: preview.fileName,
    voucherType,
    bankName: preview.bankName || previous.bankName,
    bankAccountCode: preview.bankAccountCode || previous.bankAccountCode,
    statementNo: preview.statementNo || previous.statementNo,
    accountNo: preview.accountNo || previous.accountNo,
    statementDate: preview.statementDate || previous.statementDate,
    openingBalance: preview.openingBalance,
    closingBalance: preview.closingBalance,
    lineCount: String(preview.lineCount || preview.lines.length),
    format: preview.format || previous.format,
    classificationLabel: preview.classificationLabel || "Sao kê ngân hàng",
    recommendation: preview.recommendation || "AI đã đọc file sao kê. Kiểm tra các dòng giao dịch trước khi import.",
    confidence: preview.confidence || previous.confidence,
    statementLines: preview.lines.map((line, index) => ({
      id: line.id || `preview-${index + 1}`,
      transactionTime: [line.transactionDate, line.transactionTime].filter(Boolean).join(" "),
      referenceNo: line.referenceNo,
      description: line.description,
      amount: line.amount || Math.max(line.debitAmount, line.creditAmount),
      debitAmount: line.debitAmount,
      creditAmount: line.creditAmount,
      runningBalance: line.runningBalance,
      direction: line.debitAmount > line.creditAmount ? "Chi" : "Thu",
      suggestedVoucher: line.suggestedVoucher,
      matchStatus: normalizeMatchStatus(line.matchStatus),
      confidence: line.confidence
    }))
  };
}

function normalizeMatchStatus(value: string): BankStatementAiLine["matchStatus"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("unmatch") || normalized.includes("chua")) {
    return "Unmatched";
  }
  if (normalized.includes("match") || normalized.includes("khop")) {
    return normalized.includes("partial") || normalized.includes("mot_phan") ? "Partial" : "Matched";
  }
  return "Review";
}

function toDateInputValue(value: string) {
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  const localMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (localMatch) {
    return `${localMatch[3]}-${localMatch[2].padStart(2, "0")}-${localMatch[1].padStart(2, "0")}`;
  }

  return value;
}

function dateFromLine(line?: BankStatementAiLine, fallback = "") {
  return toDateInputValue(line?.transactionTime.match(/\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4}/)?.[0] ?? fallback);
}

function hasReadableStatementLines(draft: BankStatementAiDraft) {
  return draft.statementLines.some((line) => line.referenceNo || line.description || line.amount > 0);
}

function buildFormFromAiDraft(current: StatementFormState, draft: BankStatementAiDraft): StatementFormState {
  const firstLine = draft.statementLines.find((line) => line.referenceNo || line.description || line.amount > 0);
  const debitAmount = firstLine?.debitAmount ?? (firstLine?.direction === "Chi" ? firstLine.amount : 0);
  const creditAmount = firstLine?.creditAmount ?? (firstLine?.direction === "Thu" ? firstLine.amount : 0);

  return {
    ...current,
    bankAccountCode: draft.bankAccountCode || draft.accountNo || current.bankAccountCode,
    statementNo: draft.statementNo || current.statementNo,
    statementDate: toDateInputValue(draft.statementDate || current.statementDate),
    openingBalance: draft.openingBalance ? String(draft.openingBalance) : current.openingBalance,
    closingBalance: draft.closingBalance ? String(draft.closingBalance) : current.closingBalance,
    sourceName: draft.fileName || current.sourceName,
    transactionDate: dateFromLine(firstLine, draft.statementDate || current.transactionDate),
    referenceNo: firstLine?.referenceNo ?? current.referenceNo,
    description: firstLine?.description ?? current.description,
    debitAmount: String(debitAmount || 0),
    creditAmount: String(creditAmount || 0)
  };
}

function buildExtractedFields(draft: BankStatementAiDraft, shouldShowValues: boolean) {
  return [
    { label: "Ngân hàng", value: shouldShowValues ? draft.bankName : "" },
    { label: "Số tài khoản", value: shouldShowValues ? draft.accountNo : "" },
    { label: "Ngày sao kê", value: shouldShowValues ? draft.statementDate : "" },
    { label: "Số dòng đọc được", value: shouldShowValues ? draft.lineCount : "" },
    { label: "Định dạng", value: shouldShowValues ? draft.format : "" }
  ];
}

export default function BankStatementScreen() {
  const [statements, setStatements] = useState<BankStatementRecord[]>(bankStatements);
  const [selectedStatementId, setSelectedStatementId] = useState(bankStatements[0]?.id ?? "");
  const [form, setForm] = useState<StatementFormState>({
    bankAccountCode: "VCB-001",
    statementNo: `ST-${Date.now()}`,
    statementDate: "2026-07-09",
    openingBalance: "10000000",
    closingBalance: "12000000",
    sourceName: "Import thủ công",
    transactionDate: "2026-07-09",
    referenceNo: "",
    description: "Dòng sao kê mới",
    debitAmount: "0",
    creditAmount: "1000000"
  });
  const [feedback, setFeedback] = useState("");
  const [assistantFeedback, setAssistantFeedback] = useState("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiVoucherType, setAiVoucherType] = useState(initialBankStatementAiDraft.voucherType);
  const [aiDraft, setAiDraft] = useState<BankStatementAiDraft>(initialBankStatementAiDraft);
  const [hasAiDraftCreated, setHasAiDraftCreated] = useState(false);
  const [isCreatingAiDraft, setIsCreatingAiDraft] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchApi<BankStatementRecord[]>("/cash/bank-statements")
      .then((data) => {
        if (active) {
          setStatements(data);
          setSelectedStatementId((current) => current || data[0]?.id || "");
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const selectedStatement = useMemo(
    () => statements.find((statement) => statement.id === selectedStatementId) ?? statements[0],
    [selectedStatementId, statements]
  );

  async function handleImportStatement() {
    setIsImporting(true);
    setFeedback("");

    try {
      const aiLines = hasAiDraftCreated && hasReadableStatementLines(aiDraft)
        ? aiDraft.statementLines
            .filter((line) => line.referenceNo || line.description || line.amount > 0)
            .map((line) => {
              const debitAmount = line.debitAmount ?? (line.direction === "Chi" ? line.amount : 0);
              const creditAmount = line.creditAmount ?? (line.direction === "Thu" ? line.amount : 0);

              return {
                transactionDate: dateFromLine(line, form.statementDate),
                referenceNo: line.referenceNo || undefined,
                description: line.description || "Dòng sao kê AI đọc",
                debitAmount,
                creditAmount,
                amount: Math.max(debitAmount, creditAmount)
              };
            })
        : [];

      const created = await postApi<BankStatementRecord>("/cash/bank-statements/import", {
        statementNo: form.statementNo,
        bankAccountCode: form.bankAccountCode,
        statementDate: form.statementDate,
        openingBalance: Number(form.openingBalance),
        closingBalance: Number(form.closingBalance),
        sourceName: form.sourceName,
        lines: aiLines.length
          ? aiLines
          : [
              {
                transactionDate: form.transactionDate,
                referenceNo: form.referenceNo || undefined,
                description: form.description,
                debitAmount: Number(form.debitAmount),
                creditAmount: Number(form.creditAmount),
                amount: Math.max(Number(form.debitAmount), Number(form.creditAmount))
              }
            ]
      });

      setStatements((current) => [created, ...current]);
      setSelectedStatementId(created.id);
      setFeedback(`Đã import ${created.statementNo} với ${created.lineCount} dòng sao kê.`);
      setForm((current) => ({
        ...current,
        statementNo: `ST-${Date.now()}`,
        referenceNo: "",
        description: "Dòng sao kê mới"
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Import sao kê thất bại");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleCreateAiDraft() {
    if (!aiFile) {
      setAssistantFeedback("Vui lòng chọn file sao kê CSV/XLSX/PDF/ảnh trước khi tạo chứng từ nháp.");
      setAiResult("");
      setHasAiDraftCreated(false);
      return;
    }

    setIsCreatingAiDraft(true);
    setAssistantFeedback("");
    setAiResult("");
    setHasAiDraftCreated(false);

    try {
      const workflowFormData = new FormData();
      workflowFormData.append("file", aiFile);
      workflowFormData.append(
        "inputs",
        JSON.stringify({
          voucher_type: aiVoucherType,
          source: "bank_statement_screen",
          bank_account_code: form.bankAccountCode
        })
      );

      const previewFormData = new FormData();
      previewFormData.append("file", aiFile);

      const workflowRequest = postFormApi<AiWorkflowResponse>("/ai/workflows/ocr-accounting/upload", workflowFormData);
      const preview = await postFormApi<BankStatementPreviewResponse>("/cash/bank-statements/preview-upload", previewFormData);
      const nextDraft = buildBankStatementAiDraftFromPreview(preview, aiDraft, aiVoucherType);

      if (!hasReadableStatementLines(nextDraft)) {
        setAiDraft(nextDraft);
        setHasAiDraftCreated(false);
        setAssistantFeedback(
          "Chưa đọc được dòng sao kê trong file. Vui lòng dùng file CSV/XLSX đúng mẫu hoặc kiểm tra lại header dữ liệu."
        );
        return;
      }

      setAiDraft(nextDraft);
      setForm((current) => buildFormFromAiDraft(current, nextDraft));
      setHasAiDraftCreated(true);
      setAssistantFeedback(
        `Đã đọc ${nextDraft.lineCount} dòng từ file ${aiFile.name} và điền xuống form nhập sao kê. Workflow 1 đang chạy nền để bổ sung kết quả AI.`
      );
      setIsCreatingAiDraft(false);

      workflowRequest
        .then((response) => {
          const outputText = readAiWorkflowOutput(
            response,
            "Workflow ocr-accounting chua cau hinh API key trong .env.",
          );
          setAiResult(outputText);
          setAssistantFeedback(`Đã đọc ${nextDraft.lineCount} dòng sao kê. Workflow 1 đã trả kết quả bổ sung.`);
        })
        .catch((error) => {
          setAiResult(error instanceof Error ? error.message : "Workflow 1 không trả được kết quả.");
          setAssistantFeedback(`Đã đọc ${nextDraft.lineCount} dòng sao kê. Workflow 1 phản hồi chậm hoặc lỗi, bạn vẫn có thể import sao kê.`);
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tạo được chứng từ nháp bằng AI.";
      setAssistantFeedback(message);
      setAiResult("");
      setHasAiDraftCreated(false);
    } finally {
      setIsCreatingAiDraft(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Sổ quỹ &amp; Ngân hàng</span>
          <span>/</span>
          <span>{bankStatementScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Statement import</div>
            <h2 className="hero-title">{bankStatementScreen.title}</h2>
            <p className="hero-copy">{bankStatementScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{statements.length} đợt import</strong>
            <span>Import file, lưu header và từng dòng để phục vụ matching, raw payload và audit.</span>
          </div>
        </section>

        <section className="panel ai-assistant-panel">
          <div className="ai-assistant-heading">
            <div>
              <span className="ai-assistant-eyebrow">AI đọc sao kê</span>
              <h2>Đọc sao kê bằng AI</h2>
              <p>
                Đọc file {hasAiDraftCreated ? aiDraft.fileName : aiFile?.name ?? "sao kê"}, chuẩn hóa dòng giao dịch, nhận diện giao dịch
                nghi ngờ và chuyển sang đối chiếu ngân hàng.
              </p>
            </div>
            <span className="ai-assistant-badge">{hasAiDraftCreated ? `${aiDraft.confidence}% tin cậy` : "Chưa chạy AI"}</span>
          </div>

          <div className="form-grid">
            <label className="form-field xl">
              <span>File sao kê CSV/XLSX/PDF/ảnh</span>
              <input
                className="field"
                type="file"
                accept=".csv,.xlsx,.xls,.pdf,image/*"
                onChange={(event) => {
                  setAiFile(event.target.files?.[0] ?? null);
                  setHasAiDraftCreated(false);
                  setAssistantFeedback("");
                  setAiResult("");
                }}
              />
            </label>
            <label className="form-field md">
              <span>Loại chứng từ nháp</span>
              <input
                className="field"
                value={aiVoucherType}
                placeholder="VD: BN, BC, HT1"
                onChange={(event) => {
                  setAiVoucherType(event.target.value);
                  setHasAiDraftCreated(false);
                  setAssistantFeedback("");
                  setAiResult("");
                }}
              />
            </label>
          </div>

          <div className="ai-doc-layout">
            <article className="ai-doc-card">
              <span className="ai-doc-file">
                <AppIcon name="Upload" />
                {hasAiDraftCreated ? aiDraft.fileName : aiFile?.name ?? "Chưa chọn file"}
              </span>
              <strong>{hasAiDraftCreated ? aiDraft.classificationLabel : "Sao kê ngân hàng"}</strong>
              <p>
                {hasAiDraftCreated
                  ? aiDraft.recommendation
                  : "Chọn file sao kê, sau đó bấm tạo chứng từ nháp để AI đọc dữ liệu và điền kết quả."}
              </p>
              <button
                className="button primary"
                type="button"
                onClick={handleCreateAiDraft}
                disabled={isCreatingAiDraft}
              >
                <AppIcon name="Bot" />
                {isCreatingAiDraft ? "Đang chạy AI..." : "Tạo chứng từ nháp"}
              </button>
            </article>

            <div className="ai-extract-grid">
              {buildExtractedFields(aiDraft, hasAiDraftCreated).map((field) => (
                <div className="ai-extract-item" key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tham chiếu</th>
                  <th>Nội dung AI đọc</th>
                  <th>Thu/Chi</th>
                  <th>Số tiền</th>
                  <th>Chứng từ đề xuất</th>
                  <th>Match</th>
                  <th>Tin cậy</th>
                </tr>
              </thead>
              <tbody>
                {aiDraft.statementLines.map((line) => (
                  <tr key={line.id}>
                    <td>{hasAiDraftCreated ? line.transactionTime : ""}</td>
                    <td>{hasAiDraftCreated ? line.referenceNo : ""}</td>
                    <td>{hasAiDraftCreated ? line.description : ""}</td>
                    <td>{hasAiDraftCreated ? line.direction : ""}</td>
                    <td>{hasAiDraftCreated ? currency.format(line.amount) : ""}</td>
                    <td>{hasAiDraftCreated ? line.suggestedVoucher : ""}</td>
                    <td>{hasAiDraftCreated ? line.matchStatus : ""}</td>
                    <td>{hasAiDraftCreated ? `${line.confidence}%` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasAiDraftCreated && aiResult ? (
            <div className="attachment-box" style={{ marginTop: 12 }}>
              <strong>Kết quả workflow 1</strong>
              <p>{aiResult}</p>
            </div>
          ) : null}

          {assistantFeedback ? (
            <div className="ai-feedback-box">
              <strong>Trạng thái AI</strong>
              <p>{assistantFeedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Nhập sao kê</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleImportStatement} disabled={isImporting}>
              <AppIcon name="Upload" />
              {isImporting ? "Đang import..." : "Import sao kê"}
            </button>
            <button className="button" type="button">
              Tải mẫu CSV
            </button>
          </div>
        </div>

        <section className="panel">
          <form className="form-grid">
            {bankStatementScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <input
                  className="field"
                  type={field.type === "date" ? "date" : "text"}
                  value={getStatementField(form, field.key)}
                  onChange={(event) => setStatementField(setForm, field.key, event.target.value)}
                />
              </label>
            ))}
            <label className="form-field md">
              <span>Số sao kê *</span>
              <input className="field" value={form.statementNo} onChange={(event) => setForm((current) => ({ ...current, statementNo: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số dư đầu *</span>
              <input className="field" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số dư cuối *</span>
              <input className="field" value={form.closingBalance} onChange={(event) => setForm((current) => ({ ...current, closingBalance: event.target.value }))} />
            </label>
          </form>

          <div className="section-title" style={{ marginTop: 20 }}>
            <h2>Dòng giao dịch trong sao kê</h2>
            <span className="module-meta">1 dòng = 1 giao dịch trong file sao kê</span>
          </div>
          <form className="form-grid">
            <label className="form-field md">
              <span>Ngày giao dịch *</span>
              <input className="field" type="date" value={form.transactionDate} onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Tham chiếu</span>
              <input className="field" value={form.referenceNo} onChange={(event) => setForm((current) => ({ ...current, referenceNo: event.target.value }))} />
            </label>
            <label className="form-field xl">
              <span>Diễn giải *</span>
              <input className="field" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Debit</span>
              <input className="field" value={form.debitAmount} onChange={(event) => setForm((current) => ({ ...current, debitAmount: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Credit</span>
              <input className="field" value={form.creditAmount} onChange={(event) => setForm((current) => ({ ...current, creditAmount: event.target.value }))} />
            </label>
          </form>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Trạng thái</strong>
              <p>{feedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Danh sách sao kê</h2>
          <span className="module-meta">Mỗi dòng là một file/đợt import sao kê riêng</span>
        </div>
        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {bankStatementScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statements.map((item) => (
                <tr key={item.id} onClick={() => setSelectedStatementId(item.id)} style={{ cursor: "pointer" }}>
                  <td>{item.statementNo}</td>
                  <td>{item.bankAccountCode}</td>
                  <td>{item.statementDate}</td>
                  <td>{item.lineCount}</td>
                  <td>{currency.format(item.openingBalance)}</td>
                  <td>{currency.format(item.closingBalance)}</td>
                  <td>{item.sourceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selectedStatement ? (
          <>
            <div className="section-title">
              <h2>Dòng giao dịch của sao kê đã chọn</h2>
              <span className="module-meta">
                {selectedStatement.statementNo} · {selectedStatement.lineCount} dòng
              </span>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Ngày GD</th>
                    <th>Diễn giải</th>
                    <th>Tham chiếu</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Running</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStatement.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.lineNo}</td>
                      <td>{line.transactionDate}</td>
                      <td>{line.description}</td>
                      <td>{line.referenceNo}</td>
                      <td>{line.debitAmount ? currency.format(line.debitAmount) : "-"}</td>
                      <td>{line.creditAmount ? currency.format(line.creditAmount) : "-"}</td>
                      <td>{currency.format(line.runningBalance)}</td>
                      <td>{line.matchingStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="attachment-box">
              Chưa có sao kê trong database. Sử dụng form import bên trên để nạp dữ liệu vào M2.
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function getStatementField(form: StatementFormState, key: string) {
  return form[key as keyof StatementFormState] ?? "";
}

function setStatementField(setter: React.Dispatch<React.SetStateAction<StatementFormState>>, key: string, value: string) {
  setter((current) => ({
    ...current,
    [key]: value
  }));
}

import { inputEInvoiceScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { MarkdownText } from "../components/markdown-text";
import { readAiWorkflowOutput, type AiWorkflowResponse } from "../lib/ai-workflows";
import { postFormApi } from "../lib/api";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { invoiceAssistantMock } from "../lib/document-assistant-mock-data";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const invoiceRows = [
  {
    id: "INV-001",
    invoiceNo: "HD-2607001",
    invoiceDate: "2026-07-10",
    supplierName: "Công ty AAA",
    amount: "5.475.277",
    vatAmount: "547.528",
    templateNo: "01GTKT0",
    series: "AA/26E",
    status: "Chờ duyệt"
  }
];

const pendingInvoiceRows = [
  {
    id: "PEN-001",
    invoiceNo: "HD-2607001",
    invoiceDate: "2026-07-10",
    series: "AA/26E",
    templateNo: "01GTKT0",
    supplierName: "Công ty AAA",
    counterpartyCode: "NCC-AAA",
    contractNo: "HDM-2026-07",
    amount: "5.475.277",
    vatRate: "10%",
    totalAmount: "6.022.805",
    vatAmount: "547.528",
    taxCode: "0101234567",
    address: "123 Lê Lợi, Q1",
    content: "Hóa đơn mua dịch vụ tháng 07/2026",
    link: "Mở"
  }
];

const pendingLineRows = [
  {
    id: "LINE-001",
    itemCode: "MH01",
    itemName: "Dịch vụ phần mềm",
    unit: "Gói",
    quantity: "1",
    exchangeRate: "1",
    unitPriceForeign: "5.475.277",
    unitPrice: "5.475.277",
    foreignAmount: "5.475.277",
    amount: "5.475.277",
    vatRate: "10%",
    vatAmount: "547.528",
    totalAmount: "6.022.805",
    description: "Dịch vụ phần mềm tháng 07/2026"
  }
];

type OcrAccountingSuggestion = {
  debit_account?: unknown;
  credit_account?: unknown;
  cost_item_code?: unknown;
  confidence?: unknown;
  explanation?: unknown;
  warnings?: unknown;
  invoice_no?: unknown;
  invoice_date?: unknown;
  supplier_name?: unknown;
  tax_code?: unknown;
  amount?: unknown;
  vat_amount?: unknown;
  total_amount?: unknown;
  vat_rate?: unknown;
  counterparty_code?: unknown;
  contract_no?: unknown;
};


type OcrInvoiceDraft = {
  fileName: string;
  sourceDocumentType: "invoice" | "bank_statement";
  voucherType: string;
  invoiceNo: string;
  invoiceDate: string;
  supplierName: string;
  counterpartyCode: string;
  counterpartyType: string;
  contractNo: string;
  contractName: string;
  taxCode: string;
  address: string;
  amount: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  templateNo: string;
  series: string;
  content: string;
  debitAccount: string;
  creditAccount: string;
  costItemCode: string;
  confidence: number;
};

const initialOcrInvoiceDraft: OcrInvoiceDraft = {
  fileName: "",
  sourceDocumentType: "invoice",
  voucherType: "HT1",
  invoiceNo: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  supplierName: "",
  counterpartyCode: "",
  counterpartyType: "supplier",
  contractNo: "",
  contractName: "",
  taxCode: "",
  address: "",
  amount: "0",
  vatRate: "10%",
  vatAmount: "0",
  totalAmount: "0",
  templateNo: "01GTKT0",
  series: "AA/26E",
  content: "Nhập mua hàng hóa dịch vụ",
  debitAccount: "642",
  creditAccount: "331",
  costItemCode: "",
  confidence: 100
};

function extractJsonBlock(content: string) {
  const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fencedJson?.[1] ?? content).trim();
}

function parseOcrAccountingSuggestion(content: string): OcrAccountingSuggestion | null {
  try {
    const parsed = JSON.parse(extractJsonBlock(content));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as OcrAccountingSuggestion;
  } catch {
    return null;
  }
}

function parseMoneyToNumber(value: string) {
  const normalized = value.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function displayValue(value: unknown, fallback = "Chưa có") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatConfidence(value: unknown) {
  if (typeof value !== "number") {
    return displayValue(value);
  }

  return `${Math.round(value * 100)}%`;
}

function buildDraftFromOcrResponse(ocrText: string, fileName: string): OcrInvoiceDraft {
  const suggestion = parseOcrAccountingSuggestion(ocrText);
  let invoiceNo = "";
  let invoiceDate = new Date().toISOString().slice(0, 10);
  let supplierName = "";
  let taxCode = "";
  let address = "";
  let counterpartyCode = "";
  let contractNo = "";
  let amount = "0";
  let vatRate = "10%";
  let vatAmount = "0";
  let totalAmount = "0";
  let content = "Nhập mua hàng hóa dịch vụ";
  let debitAccount = "642";
  let creditAccount = "331";
  let costItemCode = "";
  
  if (suggestion) {
    const anySug = suggestion as any;
    invoiceNo = anySug.invoice_no || anySug.invoiceNo || "";
    invoiceDate = anySug.invoice_date || anySug.invoiceDate || invoiceDate;
    supplierName = anySug.supplier_name || anySug.supplierName || "";
    taxCode = anySug.tax_code || anySug.taxCode || "";
    address = anySug.address || "";
    counterpartyCode = anySug.counterparty_code || anySug.counterpartyCode || "";
    contractNo = anySug.contract_no || anySug.contractNo || "";
    
    if (anySug.amount) {
      amount = typeof anySug.amount === "number" ? new Intl.NumberFormat("vi-VN").format(anySug.amount) : String(anySug.amount);
    }
    if (anySug.vat_amount || anySug.vatAmount) {
      const v = anySug.vat_amount || anySug.vatAmount;
      vatAmount = typeof v === "number" ? new Intl.NumberFormat("vi-VN").format(v) : String(v);
    }
    if (anySug.total_amount || anySug.totalAmount) {
      const t = anySug.total_amount || anySug.totalAmount;
      totalAmount = typeof t === "number" ? new Intl.NumberFormat("vi-VN").format(t) : String(t);
    }
    
    vatRate = anySug.vat_rate || anySug.vatRate || "10%";
    content = anySug.content || anySug.explanation || content;
    debitAccount = anySug.debit_account || anySug.debitAccount || debitAccount;
    creditAccount = anySug.credit_account || anySug.creditAccount || creditAccount;
    costItemCode = anySug.cost_item_code || anySug.costItemCode || "";
  }

  if (!debitAccount) debitAccount = "642";
  if (!creditAccount) creditAccount = "331";
  if (!counterpartyCode && supplierName) {
    counterpartyCode = `NCC-${supplierName.substring(0, 5).replace(/\s/g, "").toUpperCase()}`;
  }
  if (!contractNo) {
    contractNo = `HDM-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  }
  
  return {
    fileName,
    sourceDocumentType: "invoice",
    voucherType: "HT1",
    invoiceNo: invoiceNo || `HD-${Math.floor(Math.random() * 900000) + 100000}`,
    invoiceDate,
    supplierName: supplierName || "Nhà cung cấp mới",
    counterpartyCode,
    counterpartyType: "supplier",
    contractNo,
    contractName: contractNo ? `Hợp đồng số ${contractNo}` : "",
    taxCode,
    address,
    amount,
    vatRate,
    vatAmount,
    totalAmount,
    templateNo: "01GTKT0",
    series: "AA/26E",
    content,
    debitAccount,
    creditAccount,
    costItemCode: costItemCode || (counterpartyCode && contractNo ? `${counterpartyCode} / ${contractNo}` : ""),
    confidence: suggestion && typeof (suggestion as any).confidence === "number" ? Math.round((suggestion as any).confidence * 100) : 90
  };
}

function buildPendingInvoiceRow(draft: OcrInvoiceDraft) {
  return {
    id: `PEN-${Math.floor(Math.random() * 9000) + 1000}`,
    invoiceNo: draft.invoiceNo,
    invoiceDate: draft.invoiceDate,
    series: draft.series,
    templateNo: draft.templateNo,
    supplierName: draft.supplierName,
    counterpartyCode: draft.counterpartyCode,
    contractNo: draft.contractNo,
    amount: draft.amount,
    vatRate: draft.vatRate,
    totalAmount: draft.totalAmount,
    vatAmount: draft.vatAmount,
    taxCode: draft.taxCode,
    address: draft.address,
    content: draft.content,
    link: "Mở"
  };
}

function buildPendingLineRowsFromDraft(draft: OcrInvoiceDraft) {
  return [
    {
      id: `LINE-${Math.floor(Math.random() * 9000) + 1000}`,
      itemCode: "MH01",
      itemName: draft.content || "Hàng hóa dịch vụ mua vào",
      unit: "Lần",
      quantity: "1",
      exchangeRate: "1",
      unitPriceForeign: draft.amount,
      unitPrice: draft.amount,
      foreignAmount: draft.amount,
      amount: draft.amount,
      vatRate: draft.vatRate,
      vatAmount: draft.vatAmount,
      totalAmount: draft.totalAmount,
      description: draft.content
    }
  ];
}

function OcrAccountingResult({ content }: { content: string }) {
  const suggestion = parseOcrAccountingSuggestion(content);

  if (!suggestion) {
    return <MarkdownText className="ai-card-markdown" content={content} />;
  }

  const warnings = Array.isArray(suggestion.warnings)
    ? suggestion.warnings.filter((warning): warning is string => typeof warning === "string" && Boolean(warning.trim()))
    : [];

  return (
    <div className="ocr-ai-result">
      <div className="ocr-ai-grid">
        <div className="ocr-ai-metric">
          <span>Tài khoản Nợ</span>
          <strong>{displayValue(suggestion.debit_account)}</strong>
        </div>
        <div className="ocr-ai-metric">
          <span>Tài khoản Có</span>
          <strong>{displayValue(suggestion.credit_account)}</strong>
        </div>
        <div className="ocr-ai-metric">
          <span>Khoản mục chi phí</span>
          <strong>{displayValue(suggestion.cost_item_code, "Không áp dụng")}</strong>
        </div>
        <div className="ocr-ai-metric">
          <span>Độ tin cậy</span>
          <strong>{formatConfidence(suggestion.confidence)}</strong>
        </div>
      </div>

      {typeof suggestion.explanation === "string" && suggestion.explanation.trim() ? (
        <div className="ocr-ai-section">
          <span>Giải thích</span>
          <p>{suggestion.explanation}</p>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="ocr-ai-section warning">
          <span>Cần lưu ý</span>
          <ul>
            {warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function InputEInvoiceScreen() {
  const router = useRouter();
  const isPendingView = router.query.status === "pending";
  const isCreateView = router.query.action === "create";
  
  const [assistantFeedback, setAssistantFeedback] = useState("");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [sourceDocumentType, setSourceDocumentType] = useState<"invoice" | "bank_statement">("invoice");
  const [ocrVoucherType, setOcrVoucherType] = useState("HT1");
  const [isRunningOcr, setIsRunningOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState("");
  const [hasOcrScanned, setHasOcrScanned] = useState(false);
  const [ocrDraft, setOcrDraft] = useState<OcrInvoiceDraft>(initialOcrInvoiceDraft);

  const [pendingRows, setPendingRows] = useState(pendingInvoiceRows);
  const [pendingLines, setPendingLines] = useState(pendingLineRows);

  const [draftInvoices, setDraftInvoices] = useState<OcrInvoiceDraft[]>([
    {
      fileName: "",
      sourceDocumentType: "invoice",
      voucherType: "HT1",
      invoiceNo: "HD-2607001",
      invoiceDate: "2026-07-10",
      supplierName: "Công ty AAA",
      counterpartyCode: "NCC-AAA",
      counterpartyType: "supplier",
      contractNo: "HDM-2026-07",
      contractName: "Hợp đồng mua dịch vụ tháng 07",
      taxCode: "0101234567",
      address: "123 Lê Lợi, Q1",
      amount: "5.475.277",
      vatRate: "10%",
      vatAmount: "547.528",
      totalAmount: "6.022.805",
      templateNo: "01GTKT0",
      series: "AA/26E",
      content: "Hóa đơn mua dịch vụ tháng 07/2026",
      debitAccount: "642",
      creditAccount: "331",
      costItemCode: "NCC-AAA / HDM-2026-07",
      confidence: 100
    }
  ]);

  // Sync state with localStorage to persist across navigation/auth reload resets
  useEffect(() => {
    const storedRows = localStorage.getItem("einvoice_pending_rows");
    if (storedRows) {
      try {
        setPendingRows(JSON.parse(storedRows));
      } catch {}
    }
    const storedLines = localStorage.getItem("einvoice_pending_lines");
    if (storedLines) {
      try {
        setPendingLines(JSON.parse(storedLines));
      } catch {}
    }
    const storedDrafts = localStorage.getItem("einvoice_draft_invoices");
    if (storedDrafts) {
      try {
        setDraftInvoices(JSON.parse(storedDrafts));
      } catch {}
    }
  }, []);

  const updatePendingData = (newRows: typeof pendingInvoiceRows, newLines: typeof pendingLineRows) => {
    setPendingRows(newRows);
    setPendingLines(newLines);
    localStorage.setItem("einvoice_pending_rows", JSON.stringify(newRows));
    localStorage.setItem("einvoice_pending_lines", JSON.stringify(newLines));
  };

  const updateDraftInvoices = (updater: OcrInvoiceDraft[] | ((current: OcrInvoiceDraft[]) => OcrInvoiceDraft[])) => {
    setDraftInvoices((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      localStorage.setItem("einvoice_draft_invoices", JSON.stringify(next));
      return next;
    });
  };

  const handleAddDraftRow = () => {
    updateDraftInvoices((current) => [
      ...current,
      {
        fileName: "",
        sourceDocumentType: "invoice",
        voucherType: "HT1",
        invoiceNo: `HD-NEW-${100 + current.length}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        supplierName: "",
        counterpartyCode: "",
        counterpartyType: "supplier",
        contractNo: "",
        contractName: "",
        taxCode: "",
        address: "",
        amount: "0",
        vatRate: "10%",
        vatAmount: "0",
        totalAmount: "0",
        templateNo: "01GTKT0",
        series: "AA/26E",
        content: "Nhập mua hàng hóa dịch vụ",
        debitAccount: "642",
        creditAccount: "331",
        costItemCode: "",
        confidence: 100
      }
    ]);
  };

  const handleRemoveDraftRow = (index: number) => {
    updateDraftInvoices((current) => current.filter((_, i) => i !== index));
  };

  const handleDraftFieldChange = (index: number, field: keyof OcrInvoiceDraft, value: string) => {
    updateDraftInvoices((current) => {
      const next = [...current];
      let displayValue = value;
      
      if (field === 'amount' || field === 'vatAmount' || field === 'totalAmount') {
        const numericVal = parseMoneyToNumber(value);
        displayValue = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(numericVal);
      }
      
      const row = { ...next[index], [field]: displayValue };
      
      if (field === 'amount' || field === 'vatRate') {
        const amt = parseMoneyToNumber(field === 'amount' ? displayValue : row.amount);
        const rateStr = field === 'vatRate' ? value : row.vatRate;
        const rate = parseFloat(rateStr.replace("%", "").trim()) || 0;
        const vatAmt = Math.round(amt * (rate / 100));
        row.vatAmount = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(vatAmt);
        row.totalAmount = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amt + vatAmt);
      } else if (field === 'vatAmount') {
        const amt = parseMoneyToNumber(row.amount);
        const vatVal = parseMoneyToNumber(displayValue);
        row.totalAmount = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amt + vatVal);
      }
      
      next[index] = row;
      return next;
    });
  };

  const handleConfirmCreateInvoices = () => {
    if (draftInvoices.length === 0) {
      alert("Vui lòng thêm ít nhất 1 dòng hóa đơn.");
      return;
    }
    
    const invalidRow = draftInvoices.some(inv => !inv.invoiceNo || !inv.supplierName);
    if (invalidRow) {
      alert("Vui lòng điền đầy đủ Số hóa đơn và Tên nhà cung cấp cho tất cả các dòng.");
      return;
    }

    const newPendingRows = draftInvoices.map((inv) => buildPendingInvoiceRow(inv));
    const nextRows = [...newPendingRows, ...pendingRows];

    const newPendingLines = draftInvoices.flatMap((inv) => buildPendingLineRowsFromDraft(inv));
    const nextLines = [...newPendingLines, ...pendingLines];

    updatePendingData(nextRows, nextLines);

    alert(`Đã tạo thành công ${draftInvoices.length} hóa đơn đầu vào chờ duyệt!`);
    router.push("/modules/accounting/input-einvoices?status=pending");
  };

  async function handleRunOcrWorkflow() {
    if (!ocrFile) {
      setOcrResult("Vui lòng chọn file hóa đơn PDF/ảnh trước khi chạy OCR.");
      return;
    }

    setIsRunningOcr(true);
    setOcrResult("");

    try {
      const formData = new FormData();
      formData.append("file", ocrFile);
      formData.append("inputs", JSON.stringify({ voucher_type: ocrVoucherType }));

      const response = await postFormApi<AiWorkflowResponse>("/ai/workflows/ocr-accounting/upload", formData);
      const text = readAiWorkflowOutput(
        response,
        "Workflow ocr-accounting chưa cấu hình API key trong .env.",
      );
      setOcrResult(text);
      
      const newDraft = buildDraftFromOcrResponse(text, ocrFile.name);
      
      updateDraftInvoices((current) => {
        const firstIsEmpty = current.length === 1 && !current[0].invoiceNo && !current[0].supplierName;
        return firstIsEmpty ? [newDraft] : [...current, newDraft];
      });
      setHasOcrScanned(true);
      setAssistantFeedback("AI đã OCR thành công và điền dữ liệu trích xuất vào bảng nhập liệu bên dưới.");
    } catch (error) {
      setOcrResult(error instanceof Error ? error.message : "Không chạy được workflow OCR.");
    } finally {
      setIsRunningOcr(false);
    }
  }

  const isBankStatementSource = sourceDocumentType === "bank_statement";
  const sourceLabel = isBankStatementSource ? "Sao kê ngân hàng" : "Hóa đơn/chứng từ";
  const fileInputLabel = isBankStatementSource ? "File sao kê CSV/XLSX" : "File hóa đơn PDF/ảnh";

  if (isPendingView) {
    return (
      <AppShell activeModule="accounting">
        <div className="workspace">
          <div className="pending-topbar">
            <button className="pending-back" type="button" onClick={() => router.push("/modules/accounting/input-einvoices")}>
              <AppIcon name="ArrowLeft" size={18} />
            </button>
            <span className="pending-chip">HĐĐT đầu vào chờ duyệt</span>
          </div>

          <section className="pending-board">
            <div className="pending-board-title">
              <div>
                <strong>HĐĐT đầu vào chờ duyệt</strong>
              </div>
            </div>

            <section className="pending-table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th aria-hidden="true" />
                    <th aria-hidden="true" />
                    <th>Số hóa đơn</th>
                    <th>Ngày hóa đơn</th>
                    <th>Ký hiệu/Seri</th>
                    <th>Mẫu số</th>
                    <th>Tên đơn vị</th>
                    <th>Mã đối tượng</th>
                    <th>Tiền hàng</th>
                    <th>% VAT</th>
                    <th>Tổng cộng</th>
                    <th>Tiền VAT</th>
                    <th>Mã số thuế</th>
                    <th>Địa chỉ</th>
                    <th>Số hợp đồng</th>
                    <th>Nội dung</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.map((row) => (
                    <tr key={row.id}>
                      <td />
                      <td />
                      <td>{row.invoiceNo}</td>
                      <td>{row.invoiceDate}</td>
                      <td>{row.series}</td>
                      <td>{row.templateNo}</td>
                      <td>{row.supplierName}</td>
                      <td>{row.counterpartyCode || "NCC-AAA"}</td>
                      <td>{row.amount}</td>
                      <td>{row.vatRate}</td>
                      <td>{row.totalAmount}</td>
                      <td>{row.vatAmount}</td>
                      <td>{row.taxCode}</td>
                      <td>{row.address}</td>
                      <td>{row.contractNo || "HDM-2026-07"}</td>
                      <td>{row.content}</td>
                      <td>{row.link}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="pending-footer-bar">
              <div className="pending-pager">
                <button type="button" aria-label="Trang đầu">|&lt;</button>
                <button type="button" aria-label="Trang trước">&lt;</button>
                <span className="pending-page-current">1</span>
                <button type="button" aria-label="Trang sau">&gt;</button>
                <button type="button" aria-label="Trang cuối">&gt;|</button>
                <select defaultValue="15" aria-label="Số dòng mỗi trang">
                  <option value="15">15</option>
                  <option value="25">25</option>
                </select>
                <span>dòng / trang</span>
              </div>
              <span className="pending-empty">Hiển thị {pendingRows.length} dòng</span>
            </div>

            <section className="pending-detail-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Đvt</th>
                    <th>SL</th>
                    <th>Tỷ giá</th>
                    <th>ĐG NTệ</th>
                    <th>ĐG</th>
                    <th>Tiền NTệ</th>
                    <th>Tiền</th>
                    <th>% VAT</th>
                    <th>Tiền VAT</th>
                    <th>Tổng tiền</th>
                    <th>Diễn giải</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLines.map((row) => (
                    <tr key={row.id}>
                      <td>{row.itemCode}</td>
                      <td>{row.itemName}</td>
                      <td>{row.unit}</td>
                      <td>{row.quantity}</td>
                      <td>{row.exchangeRate}</td>
                      <td>{row.unitPriceForeign}</td>
                      <td>{row.unitPrice}</td>
                      <td>{row.foreignAmount}</td>
                      <td>{row.amount}</td>
                      <td>{row.vatRate}</td>
                      <td>{row.vatAmount}</td>
                      <td>{row.totalAmount}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </section>
        </div>
      </AppShell>
    );
  }

  if (isCreateView) {
    return (
      <AppShell activeModule="accounting">
        <div className="workspace">
          <div className="pending-topbar">
            <button className="pending-back" type="button" onClick={() => router.push("/modules/accounting/input-einvoices")}>
              <AppIcon name="ArrowLeft" size={18} />
            </button>
            <span className="pending-chip" style={{ background: '#15936b' }}>Nhập HĐĐT đầu vào mới</span>
          </div>

          <section className="panel" style={{ border: '1px solid #15936b', boxShadow: '0 8px 30px rgba(21,147,107,0.06)' }}>
            <div className="subsection">
              <h3>Bảng nhập liệu HĐĐT đầu vào</h3>
              <span className="module-meta">Nhập dữ liệu hóa đơn thủ công bên dưới, sau đó xác nhận để lưu hóa đơn.</span>
            </div>

            <div className="table-scroll" style={{ marginTop: 12, overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>STT</th>
                    <th>Số hóa đơn *</th>
                    <th>Ngày hóa đơn *</th>
                    <th>Ký hiệu</th>
                    <th>Mẫu số</th>
                    <th>Nhà cung cấp *</th>
                    <th>Mã đối tượng (KH/NCC)</th>
                    <th>Mã số thuế</th>
                    <th>Địa chỉ</th>
                    <th>Số hợp đồng</th>
                    <th>Tiền hàng (VND)</th>
                    <th>% VAT</th>
                    <th>Tiền VAT (VND)</th>
                    <th>Tổng cộng (VND)</th>
                    <th>TK Nợ</th>
                    <th>TK Có</th>
                    <th>Mã vụ việc/Khoản mục</th>
                    <th>Nội dung diễn giải</th>
                    <th style={{ width: 50, textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {draftInvoices.map((inv, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={inv.invoiceNo}
                          onChange={(e) => handleDraftFieldChange(idx, "invoiceNo", e.target.value)}
                          placeholder="VD: HD-001"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="table-input"
                          style={{ minWidth: 130 }}
                          value={inv.invoiceDate}
                          onChange={(e) => handleDraftFieldChange(idx, "invoiceDate", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 70 }}
                          value={inv.series}
                          onChange={(e) => handleDraftFieldChange(idx, "series", e.target.value)}
                          placeholder="AA/26E"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 70 }}
                          value={inv.templateNo}
                          onChange={(e) => handleDraftFieldChange(idx, "templateNo", e.target.value)}
                          placeholder="01GTKT0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 160 }}
                          value={inv.supplierName}
                          onChange={(e) => handleDraftFieldChange(idx, "supplierName", e.target.value)}
                          placeholder="Tên nhà cung cấp"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 110 }}
                          value={inv.counterpartyCode}
                          onChange={(e) => handleDraftFieldChange(idx, "counterpartyCode", e.target.value)}
                          placeholder="Mã KH/NCC"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 100 }}
                          value={inv.taxCode}
                          onChange={(e) => handleDraftFieldChange(idx, "taxCode", e.target.value)}
                          placeholder="Mã số thuế"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 150 }}
                          value={inv.address}
                          onChange={(e) => handleDraftFieldChange(idx, "address", e.target.value)}
                          placeholder="Địa chỉ NCC"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 110 }}
                          value={inv.contractNo}
                          onChange={(e) => handleDraftFieldChange(idx, "contractNo", e.target.value)}
                          placeholder="Số hợp đồng"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input number"
                          style={{ minWidth: 100 }}
                          value={inv.amount}
                          onChange={(e) => handleDraftFieldChange(idx, "amount", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <select
                          className="table-select"
                          style={{ minWidth: 70 }}
                          value={inv.vatRate}
                          onChange={(e) => handleDraftFieldChange(idx, "vatRate", e.target.value)}
                        >
                          <option value="0%">0%</option>
                          <option value="5%">5%</option>
                          <option value="8%">8%</option>
                          <option value="10%">10%</option>
                          <option value="K chịu thuế">K chịu thuế</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input number"
                          style={{ minWidth: 100 }}
                          value={inv.vatAmount}
                          onChange={(e) => handleDraftFieldChange(idx, "vatAmount", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input number"
                          style={{ minWidth: 110, fontWeight: 'bold' }}
                          value={inv.totalAmount}
                          onChange={(e) => handleDraftFieldChange(idx, "totalAmount", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 70 }}
                          value={inv.debitAccount}
                          onChange={(e) => handleDraftFieldChange(idx, "debitAccount", e.target.value)}
                          placeholder="642"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 70 }}
                          value={inv.creditAccount}
                          onChange={(e) => handleDraftFieldChange(idx, "creditAccount", e.target.value)}
                          placeholder="331"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 120 }}
                          value={inv.costItemCode}
                          onChange={(e) => handleDraftFieldChange(idx, "costItemCode", e.target.value)}
                          placeholder="Khoản mục chi phí"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: 180 }}
                          value={inv.content}
                          onChange={(e) => handleDraftFieldChange(idx, "content", e.target.value)}
                          placeholder="Nội dung"
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-delete-row"
                          onClick={() => handleRemoveDraftRow(idx)}
                          title="Xóa dòng"
                        >
                          <AppIcon name="Trash2" size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-actions-container">
              <button className="button" type="button" onClick={handleAddDraftRow}>
                <AppIcon name="Plus" />
                Thêm dòng hóa đơn
              </button>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="button"
                  type="button"
                  onClick={() => router.push("/modules/accounting/input-einvoices")}
                >
                  Hủy bỏ
                </button>
                <button
                  className="button primary"
                  type="button"
                  onClick={handleConfirmCreateInvoices}
                  style={{ background: '#087f5b', borderColor: '#087f5b' }}
                >
                  <AppIcon name="Check" />
                  Xác nhận tạo hóa đơn chờ duyệt
                </button>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">Kế toán</a>
          <span>/</span>
          <span>{inputEInvoiceScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Hóa đơn điện tử</div>
            <h2 className="hero-title">{inputEInvoiceScreen.title}</h2>
            <p className="hero-copy">
              Khai thác sức mạnh AI OCR để tự động phân tích chứng từ, đề xuất định khoản và khớp đối tượng, hoặc nhập thủ công trực tiếp.
            </p>
            <div className="hero-actions">
              <button
                className="button primary"
                type="button"
                onClick={() => {
                  updateDraftInvoices([
                    {
                      ...initialOcrInvoiceDraft,
                      invoiceNo: `HD-${Math.floor(Math.random() * 900000) + 100000}`,
                      invoiceDate: new Date().toISOString().slice(0, 10),
                      supplierName: "",
                      counterpartyCode: "",
                      contractNo: "",
                      taxCode: "",
                      address: "",
                      amount: "0",
                      vatRate: "10%",
                      vatAmount: "0",
                      totalAmount: "0",
                      debitAccount: "642",
                      creditAccount: "331",
                      costItemCode: "",
                      content: "Nhập mua hàng hóa dịch vụ thủ công"
                    }
                  ]);
                  router.push("/modules/accounting/input-einvoices?action=create");
                }}
              >
                <AppIcon name="Plus" />
                Tự điền thủ công (Không có AI)
              </button>
              <button className="button" type="button" onClick={() => router.push("/modules/accounting/input-einvoices?status=pending")}>
                <AppIcon name="Search" />
                HĐĐT chờ duyệt
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>HĐĐT</strong>
            <span>Các hành động được gom thành chip gọn, không dùng dropdown nặng như ảnh gốc.</span>
          </div>
        </section>

        <section className="panel ai-assistant-panel" style={{ border: '1px solid #15936b', boxShadow: '0 8px 30px rgba(21,147,107,0.06)', marginBottom: 24 }}>
          <div className="ai-assistant-heading">
            <div>
              <span className="ai-assistant-eyebrow">{sourceLabel} (AI Hỗ trợ)</span>
              <h2>Trích xuất Thông tin bằng AI (OCR hoá đơn/sao kê)</h2>
              <p>
                Tải lên ảnh hoặc file PDF hóa đơn đầu vào, hoặc file sao kê tài khoản ngân hàng. AI sẽ tự động đọc dữ liệu, phân loại, gợi ý định khoản Nợ/Có, tự động điền yếu tố tài khoản (KH/NCC, hợp đồng) và đưa bạn đến màn hình xác nhận.
              </p>
            </div>
            <span className="ai-assistant-badge">Tính năng AI</span>
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <label className="form-field md">
              <span>Nguồn dữ liệu</span>
              <select
                className="field"
                value={sourceDocumentType}
                onChange={(event) => {
                  const nextType = event.target.value as "invoice" | "bank_statement";
                  setSourceDocumentType(nextType);
                  setOcrVoucherType(nextType === "bank_statement" ? "BC" : "HT1");
                  setOcrResult("");
                }}
              >
                <option value="invoice">Hóa đơn/chứng từ đầu vào</option>
                <option value="bank_statement">Sao kê ngân hàng</option>
              </select>
            </label>
            <label className="form-field xl">
              <span>{fileInputLabel}</span>
              <input
                className="field"
                type="file"
                accept={isBankStatementSource ? ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "image/*,.pdf,.doc,.docx"}
                onChange={(event) => {
                  setOcrFile(event.target.files?.[0] ?? null);
                  setOcrResult("");
                }}
              />
            </label>
            <label className="form-field md">
              <span>Loại chứng từ</span>
              <input
                className="field"
                value={ocrVoucherType}
                placeholder="VD: HT1, BN, BC, PC, PT"
                onChange={(event) => {
                  setOcrVoucherType(event.target.value);
                  setOcrResult("");
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button
              className="button primary"
              type="button"
              onClick={handleRunOcrWorkflow}
              disabled={isRunningOcr}
            >
              <AppIcon name="Bot" />
              {isRunningOcr ? "Đang chạy OCR..." : "Chạy AI OCR trích xuất & gợi ý định khoản"}
            </button>

            <button
              className="button"
              type="button"
              onClick={() => {
                const dummyDraft = {
                  ...initialOcrInvoiceDraft,
                  invoiceNo: `HD-${Math.floor(Math.random() * 900000) + 100000}`,
                  invoiceDate: new Date().toISOString().slice(0, 10),
                  supplierName: "Công ty Cổ phần Tín Thịnh Phát",
                  counterpartyCode: "NCC-TTP-NEW",
                  contractNo: "HD-LOGISTICS-07",
                  taxCode: "0312456789",
                  address: "Tòa nhà TTP, Quận 3, TP.HCM",
                  amount: "15.000.000",
                  vatRate: "10%",
                  vatAmount: "1.500.000",
                  totalAmount: "16.500.000",
                  content: "Thanh toán chi phí logistics vận chuyển tháng 07/2026",
                  debitAccount: "642",
                  creditAccount: "331",
                  costItemCode: "NCC-TTP-NEW / HD-LOGISTICS-07",
                  confidence: 95
                };
                
                updateDraftInvoices([dummyDraft]);
                alert("Đã tải hóa đơn mẫu thành công! Đang chuyển đến bảng nhập liệu...");
                router.push("/modules/accounting/input-einvoices?action=create");
              }}
            >
              <AppIcon name="FileText" />
              Dùng hóa đơn mẫu (AI đề xuất)
            </button>
          </div>

          {ocrResult ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Kết quả đề xuất định khoản & Đối tượng</strong>
              <OcrAccountingResult content={ocrResult} />
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="subsection">
            <h3>Bộ lọc nhanh</h3>
            <span className="module-meta">Gọn để thao tác nhanh</span>
          </div>
          <div className="form-grid invoice-filter-grid">
            <label className="form-field sm">
              <span>Từ ngày</span>
              <input className="field" defaultValue="01/07/2026" />
            </label>
            <label className="form-field sm">
              <span>Đến ngày</span>
              <input className="field" defaultValue="10/07/2026" />
            </label>
            <label className="form-field lg">
              <span>Tìm nhanh</span>
              <input className="field" defaultValue="Công ty AAA" />
            </label>
          </div>
        </section>

        <div className="section-title">
          <h2>Danh sách HĐĐT đầu vào</h2>
          <div className="topbar-actions">
            <button className="button" type="button">Tìm</button>
            <button className="button primary" type="button">Export</button>
          </div>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {inputEInvoiceScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.invoiceNo}</td>
                  <td>{row.invoiceDate}</td>
                  <td>{row.supplierName}</td>
                  <td>{row.amount}</td>
                  <td>{row.vatAmount}</td>
                  <td>{row.templateNo}</td>
                  <td>{row.series}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}

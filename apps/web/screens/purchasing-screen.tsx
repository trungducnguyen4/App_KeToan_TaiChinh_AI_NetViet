import { useEffect, useState } from "react";
import type { CostCategory, DocType, ProcessStage, AllocationMode, PurchasingInvoiceItem } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";
import { Pagination } from "../components/pagination";
import { PeriodFilter, PeriodFilterValue, filterByPeriod } from "../components/period-filter";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

type FormState = {
  docType: DocType;
  voucherNo: string;
  voucherDate: string;
  supplierName: string;
  supplierCode: string;
  taxCode: string;
  invoiceSeries: string;
  invoiceTemplate: string;
  costCategory: CostCategory;
  processStage: ProcessStage;
  allocationMode: AllocationMode;
  batchId: string;
  vehiclePlate: string;
  grossWeightKg: string;
  tareWeightKg: string;
  netWeightKg: string;
  unitPrice: string;
  handlingFee: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  description: string;
  attachmentFileName: string;
};

const INITIAL_FORM: FormState = {
  docType: "PURCHASE_SLIP",
  voucherNo: `PCN-${new Date().toISOString().slice(0, 7).replace("-", "")}-001`,
  voucherDate: new Date().toISOString().slice(0, 10),
  supplierName: "Thương lái Ba Dừa (Bến Tre)",
  supplierCode: "TL-BADUA",
  taxCode: "",
  invoiceSeries: "",
  invoiceTemplate: "",
  costCategory: "RAW_MATERIAL",
  processStage: "EP",
  allocationMode: "BATCH",
  batchId: "",
  vehiclePlate: "71C-123.45",
  grossWeightKg: "18500",
  tareWeightKg: "6000",
  netWeightKg: "12500",
  unitPrice: "4200",
  handlingFee: "1000000",
  subtotal: "52500000",
  vatRate: "0",
  vatAmount: "0",
  totalAmount: "53500000",
  description: "Thu mua vỏ dừa tươi xe 71C-123.45 từ thương lái Ba Dừa Bến Tre",
  attachmentFileName: ""
};

export default function PurchasingScreen() {
  const [invoices, setInvoices] = useState<PurchasingInvoiceItem[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Duplicate check state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Period and Pagination state
  const [period, setPeriod] = useState<PeriodFilterValue>("3M");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [filterQuery, setFilterQuery] = useState("");
  const [filterDocType, setFilterDocType] = useState<string>("ALL");
  const [filterCostCategory, setFilterCostCategory] = useState<string>("ALL");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("ALL");

  // Load invoices
  async function loadInvoices() {
    try {
      setIsLoading(true);
      const data = await fetchApi<PurchasingInvoiceItem[]>("/purchasing/invoices");
      setInvoices(data);
    } catch (err: any) {
      console.error("Could not load invoices:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!form.voucherNo.trim()) {
        setDuplicateWarning(null);
        return;
      }

      try {
        setIsCheckingDuplicate(true);
        const queryParams = new URLSearchParams({
          docType: form.docType,
          invoiceNo: form.voucherNo.trim(),
          ...(form.docType === "VAT_INVOICE" ? {
            taxCode: form.taxCode.trim(),
            series: form.invoiceSeries.trim()
          } : {})
        });

        const res = await fetchApi<{ isDuplicate: boolean; message?: string }>(`/purchasing/check-duplicate?${queryParams.toString()}`);
        if (res.isDuplicate) {
          setDuplicateWarning(res.message || "Cảnh báo: Chứng từ này đã tồn tại trong CSDL!");
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        console.warn("Check duplicate error:", err);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.voucherNo, form.invoiceSeries, form.taxCode, form.docType]);

  // Recalculate weights & amounts when form changes
  function handleFormChange(patch: Partial<FormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };

      if (next.docType === "PURCHASE_SLIP") {
        // Auto compute net weight
        const gross = Number(next.grossWeightKg) || 0;
        const tare = Number(next.tareWeightKg) || 0;
        const net = Math.max(0, gross - tare);
        next.netWeightKg = String(net);

        // Auto compute subtotal
        const price = Number(next.unitPrice) || 0;
        const sub = net * price;
        next.subtotal = String(sub);

        // Auto compute total
        const fee = Number(next.handlingFee) || 0;
        next.totalAmount = String(sub + fee);
      } else {
        // VAT invoice
        const sub = Number(next.subtotal) || 0;
        const rate = Number(next.vatRate) || 0;
        const vat = Math.round((sub * rate) / 100);
        next.vatAmount = String(vat);
        next.totalAmount = String(sub + vat);
      }

      return next;
    });
  }

  // Switch docType tab
  function handleSwitchDocType(type: DocType) {
    if (type === "PURCHASE_SLIP") {
      setForm({
        ...INITIAL_FORM,
        docType: "PURCHASE_SLIP",
        voucherNo: `PCN-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(invoices.length + 1).padStart(3, "0")}`
      });
    } else {
      setForm({
        ...INITIAL_FORM,
        docType: "VAT_INVOICE",
        voucherNo: "0012345",
        invoiceSeries: "1C24TAA",
        taxCode: "1300998877",
        supplierName: "Công ty Thiết Bị Công Nghiệp Miền Nam",
        supplierCode: "NCC-TB-MIENNAM",
        costCategory: "PROCESSING",
        processStage: "LOC",
        allocationMode: "PERIOD",
        grossWeightKg: "",
        tareWeightKg: "",
        netWeightKg: "",
        unitPrice: "",
        handlingFee: "",
        subtotal: "14200000",
        vatRate: "8",
        vatAmount: "1136000",
        totalAmount: "15336000",
        description: "Mua màng lọc dầu khung bản & phụ kiện máy lọc T11/2026",
        attachmentFileName: "HD_1C24TAA_0012345.pdf"
      });
    }
    setDuplicateWarning(null);
    setFeedback(null);
  }

  // Submit invoice
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (duplicateWarning) {
      alert("Không thể lưu: " + duplicateWarning);
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const payload = {
        docType: form.docType,
        voucherNo: form.voucherNo.trim(),
        voucherDate: form.voucherDate,
        supplierName: form.supplierName.trim(),
        supplierCode: form.supplierCode.trim() || undefined,
        taxCode: form.taxCode.trim() || undefined,
        invoiceSeries: form.invoiceSeries.trim() || undefined,
        invoiceTemplate: form.invoiceTemplate.trim() || undefined,
        costCategory: form.costCategory,
        processStage: form.costCategory === "PROCESSING" ? form.processStage : undefined,
        allocationMode: form.allocationMode,
        batchId: form.batchId.trim() || undefined,
        vehiclePlate: form.vehiclePlate.trim() || undefined,
        grossWeightKg: Number(form.grossWeightKg) || undefined,
        tareWeightKg: Number(form.tareWeightKg) || undefined,
        netWeightKg: Number(form.netWeightKg) || undefined,
        unitPrice: Number(form.unitPrice) || undefined,
        handlingFee: Number(form.handlingFee) || undefined,
        subtotal: Number(form.subtotal) || 0,
        vatRate: Number(form.vatRate) || undefined,
        vatAmount: Number(form.vatAmount) || undefined,
        totalAmount: Number(form.totalAmount) || 0,
        description: form.description.trim() || undefined
      };

      await postApi("/purchasing/invoices", payload);
      setFeedback({
        type: "success",
        message: `Đã lưu thành công ${form.docType === "PURCHASE_SLIP" ? "phiếu cân" : "hóa đơn"} số ${form.voucherNo} vào CSDL nội bộ!`
      });

      // Reload list
      await loadInvoices();

      // Reset voucherNo for next entry
      if (form.docType === "PURCHASE_SLIP") {
        setForm((prev) => ({
          ...prev,
          voucherNo: `PCN-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(invoices.length + 2).padStart(3, "0")}`
        }));
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Lỗi khi lưu chứng từ."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // 1-Click Payment
  async function handleCreatePayment(invoice: PurchasingInvoiceItem, channel: "cash" | "bank") {
    const channelName = channel === "cash" ? "Tiền mặt (Phiếu chi PC)" : "Chuyển khoản (Báo nợ BN)";
    const confirmed = confirm(
      `Xác nhận thanh toán ${currency.format(invoice.totalAmount)} cho ${invoice.supplierName} qua ${channelName}?\nHệ thống sẽ tự động tạo chứng từ thanh toán trong mục Thu chi & Thanh toán.`
    );
    if (!confirmed) return;

    try {
      await postApi(`/purchasing/invoices/${invoice.id}/create-payment`, {
        paymentChannel: channel,
        cashBookCode: "QUY-XUONG",
        bankAccountCode: "VCB-001"
      });

      alert(`Thanh toán thành công! Đã tạo chứng từ thu chi và cập nhật trạng thái hóa đơn ${invoice.voucherNo}.`);
      await loadInvoices();
    } catch (err: any) {
      alert("Lỗi khi lập chứng từ thanh toán: " + err.message);
    }
  }

  // Filter by period first
  const periodInvoices = filterByPeriod(invoices, (item) => item.voucherDate, period);

  // Compute metrics based on selected period
  const totalAmount = periodInvoices.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalRawWeightTons = periodInvoices
    .filter((item) => item.costCategory === "RAW_MATERIAL")
    .reduce((sum, item) => sum + (item.netWeightKg || 0), 0) / 1000;
  const unpaidAmount = periodInvoices
    .filter((item) => item.paymentStatus === "UNPAID")
    .reduce((sum, item) => sum + item.totalAmount, 0);
  const paidAmount = periodInvoices
    .filter((item) => item.paymentStatus === "PAID")
    .reduce((sum, item) => sum + item.totalAmount, 0);

  // Filter invoices
  const filteredInvoices = periodInvoices.filter((item) => {
    if (filterDocType !== "ALL" && item.docType !== filterDocType) return false;
    if (filterCostCategory !== "ALL" && item.costCategory !== filterCostCategory) return false;
    if (filterPaymentStatus !== "ALL" && item.paymentStatus !== filterPaymentStatus) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matchNo = item.voucherNo.toLowerCase().includes(q);
      const matchSup = item.supplierName.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchTax = item.taxCode?.toLowerCase().includes(q);
      if (!matchNo && !matchSup && !matchDesc && !matchTax) return false;
    }
    return true;
  });

  // Paged invoices
  const pagedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell activeModule="purchasing">
      <div className="workspace">
        {/* Breadcrumb & Period Filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <span>Trang chủ</span>
            <span>/</span>
            <span>Hóa đơn Vào &amp; Thu mua</span>
          </div>

          <PeriodFilter
            value={period}
            onChange={(val) => {
              setPeriod(val);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Hero Section */}
        <section className="hero-panel">
          <div>
            <div className="eyebrow">XƯỞNG ÉP DẦU DỪA</div>
            <h2 className="hero-title">Hóa đơn Đầu vào & Thu mua vỏ dừa</h2>
            <p className="hero-copy">
              Nhập nhanh phiếu cân thu mua vỏ dừa từ thương lái (không VAT) và hóa đơn chi phí có VAT (điện, màng lọc, bảo trì, bao bì). Tự động phân loại chi phí & chống nhập trùng.
            </p>
          </div>
          <div className="sync-panel" style={{ background: "#134e4a" }}>
            <strong style={{ color: "#34d399" }}>{filteredInvoices.length} chứng từ</strong>
            <span>
              Đã ghi nhận {totalRawWeightTons.toFixed(1)} tấn vỏ dừa nguyên liệu trong kỳ ({period}).
            </span>
          </div>
        </section>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-label">Tổng chi phí & Thu mua</div>
            <div className="kpi-value" style={{ color: "#15936b" }}>{currency.format(totalAmount)}</div>
            <div className="kpi-delta">Toàn bộ đầu vào kỳ này</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Vỏ dừa nhập xưởng</div>
            <div className="kpi-value" style={{ color: "#0f7bbf" }}>{totalRawWeightTons.toFixed(2)} Tấn</div>
            <div className="kpi-delta">Nguyên liệu cho các mẻ ép</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Công nợ chưa trả</div>
            <div className="kpi-value" style={{ color: "#dc2626" }}>{currency.format(unpaidAmount)}</div>
            <div className="kpi-delta">Cần thanh toán thương lái</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Đã thanh toán</div>
            <div className="kpi-value" style={{ color: "#16a34a" }}>{currency.format(paidAmount)}</div>
            <div className="kpi-delta">Đã sinh phiếu chi / báo nợ</div>
          </article>
        </div>

        {/* Smart Entry Form */}
        <section className="panel" style={{ marginTop: "24px" }}>
          <div className="subsection" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <AppIcon name={form.docType === "PURCHASE_SLIP" ? "Scale" : "ReceiptText"} size={18} style={{ color: "var(--brand)" }} />
                {form.docType === "PURCHASE_SLIP" ? "Phiếu cân thu mua vỏ dừa (Thương lái)" : "Hóa đơn Chi phí có VAT"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                {form.docType === "PURCHASE_SLIP"
                  ? "Bảng kê cân hàng theo chuyến xe từ thương lái, không chịu thuế VAT."
                  : "Hóa đơn điện tử GTGT có thuế suất, MST và tệp PDF/XML đính kèm."}
              </p>
            </div>

            {/* Doc Type Selector */}
            <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => handleSwitchDocType("PURCHASE_SLIP")}
                className={`button ${form.docType === "PURCHASE_SLIP" ? "primary" : ""}`}
                style={{ fontSize: "13px", padding: "6px 14px", height: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <AppIcon name="Scale" size={15} />
                Phiếu cân vỏ dừa
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDocType("VAT_INVOICE")}
                className={`button ${form.docType === "VAT_INVOICE" ? "primary" : ""}`}
                style={{ fontSize: "13px", padding: "6px 14px", height: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <AppIcon name="ReceiptText" size={15} />
                Hóa đơn VAT chi phí
              </button>
            </div>
          </div>

          {/* Feedback & Warnings */}
          {feedback && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: 600,
                background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: feedback.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AppIcon name={feedback.type === "success" ? "CheckCircle2" : "AlertCircle"} size={16} />
              <span>{feedback.message}</span>
            </div>
          )}

          {duplicateWarning && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: 700,
                background: "#fff1f2",
                color: "#be123c",
                border: "2px solid #f43f5e",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <AppIcon name="AlertTriangle" size={20} style={{ color: "#e11d48" }} />
              <div>{duplicateWarning}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Row 1: Document details */}
              <div className="form-field">
                <label>
                  {form.docType === "PURCHASE_SLIP" ? "Số phiếu cân *" : "Số hóa đơn GTGT *"}
                </label>
                <input
                  type="text"
                  required
                  value={form.voucherNo}
                  onChange={(e) => handleFormChange({ voucherNo: e.target.value })}
                  placeholder={form.docType === "PURCHASE_SLIP" ? "PCN-202611-001" : "0012345"}
                  style={{
                    borderColor: duplicateWarning ? "#f43f5e" : undefined,
                    background: duplicateWarning ? "#fff5f5" : undefined
                  }}
                />
                {isCheckingDuplicate && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Đang kiểm tra trùng...</span>}
                {!duplicateWarning && form.voucherNo && !isCheckingDuplicate && (
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <AppIcon name="Check" size={13} />
                    Chưa có trong hệ thống
                  </span>
                )}
              </div>

              {form.docType === "VAT_INVOICE" && (
                <>
                  <div className="form-field">
                    <label>Ký hiệu hóa đơn</label>
                    <input
                      type="text"
                      value={form.invoiceSeries}
                      onChange={(e) => handleFormChange({ invoiceSeries: e.target.value })}
                      placeholder="1C24TAA"
                    />
                  </div>
                  <div className="form-field">
                    <label>Mã số thuế (MST) NCC</label>
                    <input
                      type="text"
                      value={form.taxCode}
                      onChange={(e) => handleFormChange({ taxCode: e.target.value })}
                      placeholder="1300123456"
                    />
                  </div>
                </>
              )}

              <div className="form-field">
                <label>Ngày lập / Ngày cân *</label>
                <input
                  type="date"
                  required
                  value={form.voucherDate}
                  onChange={(e) => handleFormChange({ voucherDate: e.target.value })}
                />
              </div>

              <div className={form.docType === "PURCHASE_SLIP" ? "form-field lg" : "form-field lg"}>
                <label>{form.docType === "PURCHASE_SLIP" ? "Tên Thương lái *" : "Tên Nhà cung cấp *"}</label>
                <input
                  type="text"
                  required
                  value={form.supplierName}
                  onChange={(e) => handleFormChange({ supplierName: e.target.value })}
                  placeholder="Thương lái Ba Dừa / Cty Điện Lực..."
                />
              </div>

              {/* Row 2: Categorization */}
              <div className="form-field">
                <label>Nhóm chi phí *</label>
                <select
                  value={form.costCategory}
                  onChange={(e) => handleFormChange({ costCategory: e.target.value as CostCategory })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                >
                  <option value="RAW_MATERIAL">Nguyên liệu trực tiếp (Vỏ dừa)</option>
                  <option value="PROCESSING">Chi phí Ép / Lọc dầu</option>
                  <option value="OVERHEAD">Chi phí vận hành chung</option>
                </select>
              </div>

              {form.costCategory === "PROCESSING" && (
                <div className="form-field">
                  <label>Công đoạn sản xuất</label>
                  <select
                    value={form.processStage}
                    onChange={(e) => handleFormChange({ processStage: e.target.value as ProcessStage })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  >
                    <option value="EP">1. Công đoạn Ép dầu</option>
                    <option value="LOC">2. Công đoạn Lọc dầu</option>
                    <option value="DONG_PHUY">3. Đóng phuy thành phẩm</option>
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>Chế độ phân bổ *</label>
                <select
                  value={form.allocationMode}
                  onChange={(e) => handleFormChange({ allocationMode: e.target.value as AllocationMode })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                >
                  <option value="BATCH">Mẻ/Lô ép (Gắn trực tiếp mẻ)</option>
                  <option value="PERIOD">Kỳ/Tháng (Phân bổ theo sản lượng dầu)</option>
                </select>
              </div>

              {/* Row 3: Weight and calculation fields for PURCHASE_SLIP */}
              {form.docType === "PURCHASE_SLIP" && (
                <>
                  <div className="form-field">
                    <label>Biển số xe cân</label>
                    <input
                      type="text"
                      value={form.vehiclePlate}
                      onChange={(e) => handleFormChange({ vehiclePlate: e.target.value })}
                      placeholder="71C-123.45"
                    />
                  </div>

                  <div className="form-field">
                    <label>Cân tổng (kg)</label>
                    <input
                      type="number"
                      value={form.grossWeightKg}
                      onChange={(e) => handleFormChange({ grossWeightKg: e.target.value })}
                      placeholder="18500"
                    />
                  </div>

                  <div className="form-field">
                    <label>Cân xe/bì (kg)</label>
                    <input
                      type="number"
                      value={form.tareWeightKg}
                      onChange={(e) => handleFormChange({ tareWeightKg: e.target.value })}
                      placeholder="6000"
                    />
                  </div>

                  <div className="form-field">
                    <label>Trọng lượng vỏ dừa tịnh (kg)</label>
                    <input
                      type="text"
                      readOnly
                      value={Number(form.netWeightKg).toLocaleString("vi-VN")}
                      style={{ background: "#f8fafc", fontWeight: 700, color: "#0f766e" }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Đơn giá vỏ dừa (đ/kg) *</label>
                    <input
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => handleFormChange({ unitPrice: e.target.value })}
                      placeholder="4200"
                    />
                  </div>

                  <div className="form-field">
                    <label>Tiền bốc xếp / phụ phí (VNĐ)</label>
                    <input
                      type="number"
                      value={form.handlingFee}
                      onChange={(e) => handleFormChange({ handlingFee: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                </>
              )}

              {/* Amounts for VAT invoice */}
              {form.docType === "VAT_INVOICE" && (
                <>
                  <div className="form-field">
                    <label>Tiền trước thuế (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={form.subtotal}
                      onChange={(e) => handleFormChange({ subtotal: e.target.value })}
                      placeholder="10000000"
                    />
                  </div>

                  <div className="form-field">
                    <label>Thuế suất VAT (%)</label>
                    <select
                      value={form.vatRate}
                      onChange={(e) => handleFormChange({ vatRate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="8">8% (Giảm thuế)</option>
                      <option value="10">10%</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Tiền thuế GTGT (VNĐ)</label>
                    <input
                      type="text"
                      readOnly
                      value={Number(form.vatAmount).toLocaleString("vi-VN")}
                      style={{ background: "#f8fafc" }}
                    />
                  </div>
                </>
              )}

              {/* Total Amount */}
              <div className="form-field">
                <label>TỔNG TIỀN THANH TOÁN (VNĐ) *</label>
                <input
                  type="text"
                  readOnly
                  value={currency.format(Number(form.totalAmount) || 0)}
                  style={{ background: "#ecfdf5", color: "#065f46", fontWeight: 800, fontSize: "16px" }}
                />
              </div>

              {/* Row: Description & Notes */}
              <div className="form-field xl">
                <label>Nội dung chi tiết / Ghi chú</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => handleFormChange({ description: e.target.value })}
                  placeholder="Ghi chú về lô hàng, màng lọc, bảo dưỡng..."
                />
              </div>

              {/* Attachment file */}
              <div className="form-field" style={{ gridColumn: "span 3" }}>
                <label>Tệp PDF/XML/Ảnh đính kèm</label>
                <input
                  type="text"
                  value={form.attachmentFileName}
                  onChange={(e) => handleFormChange({ attachmentFileName: e.target.value })}
                  placeholder="VD: PhieuCan_71C123.jpg"
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="button"
                onClick={() => setForm(INITIAL_FORM)}
              >
                Làm mới form
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={isSubmitting || !!duplicateWarning}
                style={{ opacity: duplicateWarning ? 0.5 : 1 }}
              >
                <AppIcon name="Save" />
                {isSubmitting ? "Đang lưu..." : "Lưu vào hệ thống"}
              </button>
            </div>
          </form>
        </section>

        {/* Invoices List Table */}
        <section className="panel" style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}>
          <div className="subsection" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "16px 20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Danh sách Hóa đơn &amp; Bảng kê thu mua ({filteredInvoices.length})
              </h3>
              <span className="module-meta">
                Dữ liệu thời gian thực từ CSDL nội bộ • Trang {currentPage} / {Math.max(1, Math.ceil(filteredInvoices.length / pageSize))}
              </span>
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Tìm số HĐ, thương lái..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{ width: "200px", padding: "6px 10px", fontSize: "13px" }}
              />

              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)" }}
              >
                <option value="ALL">Tất cả chứng từ</option>
                <option value="PURCHASE_SLIP">Phiếu cân vỏ dừa</option>
                <option value="VAT_INVOICE">Hóa đơn VAT</option>
              </select>

              <select
                value={filterCostCategory}
                onChange={(e) => setFilterCostCategory(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)" }}
              >
                <option value="ALL">Tất cả chi phí</option>
                <option value="RAW_MATERIAL">Nguyên liệu</option>
                <option value="PROCESSING">Ép / Lọc</option>
                <option value="OVERHEAD">Chi phí chung</option>
              </select>

              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)" }}
              >
                <option value="ALL">Mọi trạng thái TT</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
              </select>

              <button
                type="button"
                className="button"
                onClick={loadInvoices}
                title="Tải lại danh sách"
                style={{ padding: "6px 10px" }}
              >
                ↻
              </button>
            </div>
          </div>

          <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
            <table className="data-table">
              <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                <tr>
                  <th>Loại CT</th>
                  <th>Số CT / Số HĐ</th>
                  <th>Ngày</th>
                  <th>Thương lái / Nhà cung cấp</th>
                  <th>Nhóm chi phí</th>
                  <th>Phân bổ</th>
                  <th style={{ textAlign: "right" }}>KL Tịnh (kg)</th>
                  <th style={{ textAlign: "right" }}>Tổng tiền (VNĐ)</th>
                  <th style={{ textAlign: "center" }}>Trạng thái TT</th>
                  <th style={{ textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                    {isLoading ? "Đang tải dữ liệu..." : "Chưa có chứng từ nào phù hợp với bộ lọc."}
                  </td>
                </tr>
              ) : (
                pagedInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: inv.docType === "PURCHASE_SLIP" ? "#fef3c7" : "#e0e7ff",
                          color: inv.docType === "PURCHASE_SLIP" ? "#92400e" : "#3730a3"
                        }}
                      >
                        {inv.docType === "PURCHASE_SLIP" ? "Phiếu cân" : "HĐ VAT"}
                      </span>
                    </td>
                    <td>
                      <strong>{inv.voucherNo}</strong>
                      {inv.invoiceSeries && (
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>K/H: {inv.invoiceSeries}</div>
                      )}
                    </td>
                    <td>{inv.voucherDate}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.supplierName}</div>
                      {inv.vehiclePlate && (
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>Xe: {inv.vehiclePlate}</div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color:
                            inv.costCategory === "RAW_MATERIAL"
                              ? "#059669"
                              : inv.costCategory === "PROCESSING"
                              ? "#0284c7"
                              : "#64748b"
                        }}
                      >
                        {inv.costCategory === "RAW_MATERIAL"
                          ? "Nguyên liệu"
                          : inv.costCategory === "PROCESSING"
                          ? `Ép/Lọc (${inv.processStage || "SX"})`
                          : "Vận hành chung"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px" }}>
                        {inv.allocationMode === "BATCH" ? "Theo mẻ" : "Theo tháng"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {inv.netWeightKg ? inv.netWeightKg.toLocaleString("vi-VN") : "—"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#0f766e" }}>
                      {currency.format(inv.totalAmount)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: inv.paymentStatus === "PAID" ? "#dcfce7" : "#fee2e2",
                          color: inv.paymentStatus === "PAID" ? "#15803d" : "#b91c1c"
                        }}
                      >
                        {inv.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {inv.paymentStatus === "UNPAID" ? (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="button"
                            onClick={() => handleCreatePayment(inv, "cash")}
                            title="Lập phiếu chi tiền mặt ngay cho thương lái"
                            style={{ padding: "4px 8px", fontSize: "11px", background: "#f0fdf4", color: "#166534", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <AppIcon name="Coins" size={13} />
                            Tiền mặt (PC)
                          </button>
                          <button
                            type="button"
                            className="button"
                            onClick={() => handleCreatePayment(inv, "bank")}
                            title="Lập lệnh chuyển khoản ngân hàng (Báo nợ)"
                            style={{ padding: "4px 8px", fontSize: "11px", background: "#eff6ff", color: "#1e40af", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <AppIcon name="Landmark" size={13} />
                            Ngân hàng (BN)
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <AppIcon name="Check" size={13} style={{ color: "#16a34a" }} />
                          Đã tất toán
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
      </div>
    </AppShell>
  );
}

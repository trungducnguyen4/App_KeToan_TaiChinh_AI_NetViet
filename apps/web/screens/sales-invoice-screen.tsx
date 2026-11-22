import React, { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";
import { Pagination } from "../components/pagination";
import { PeriodFilter, PeriodFilterValue, filterByPeriod } from "../components/period-filter";

export type SalesProductType =
  | "CRUDE_OIL"
  | "FILTERED_OIL"
  | "BYPRODUCT"
  | "MEAL_BROWN"
  | "MEAL_WHITE"
  | "MEAL_WHOLE";

type SalesInvoiceItem = {
  id: string;
  voucherNo: string;
  voucherDate: string;
  dueDate?: string;
  paymentTermDays?: number;
  isOverdue?: boolean;
  overdueDays?: number;
  daysUntilDue?: number;
  customerName: string;
  taxCode?: string;
  invoiceSeries?: string;
  docType: "VAT_INVOICE" | "SALES_RECEIPT";
  productType: SalesProductType;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  batchId?: string;
  description?: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  paidAmount: number;
  remainingAmount: number;
  paymentVouchers?: Array<{
    voucherNo: string;
    voucherType: string;
    amount: number;
    date: string;
  }>;
};

const PRODUCT_DEFINITIONS: Record<
  SalesProductType,
  { name: string; category: "OIL" | "MEAL"; defaultPrice: number; defaultVat: number; badgeColor: string; badgeBg: string }
> = {
  CRUDE_OIL: { name: "Dầu dừa thô", category: "OIL", defaultPrice: 30000, defaultVat: 8, badgeColor: "#0369a1", badgeBg: "#e0f2fe" },
  FILTERED_OIL: { name: "Dầu dừa lọc", category: "OIL", defaultPrice: 33500, defaultVat: 8, badgeColor: "#047857", badgeBg: "#d1fae5" },
  BYPRODUCT: { name: "Cám dừa thành phẩm", category: "MEAL", defaultPrice: 1400, defaultVat: 0, badgeColor: "#92400e", badgeBg: "#fef3c7" },
  MEAL_BROWN: { name: "Cám dừa nâu", category: "MEAL", defaultPrice: 1250, defaultVat: 0, badgeColor: "#78350f", badgeBg: "#fef3c7" },
  MEAL_WHITE: { name: "Cám dừa trắng", category: "MEAL", defaultPrice: 1850, defaultVat: 0, badgeColor: "#4338ca", badgeBg: "#e0e7ff" },
  MEAL_WHOLE: { name: "Cám dừa nguyên", category: "MEAL", defaultPrice: 1500, defaultVat: 0, badgeColor: "#b45309", badgeBg: "#fef3c7" }
};

export default function SalesInvoiceScreen() {
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterProduct, setFilterProduct] = useState<string>("ALL");

  // Period and Pagination state
  const [period, setPeriod] = useState<PeriodFilterValue>("3M");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [docType, setDocType] = useState<"VAT_INVOICE" | "SALES_RECEIPT">("VAT_INVOICE");
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceSeries, setInvoiceSeries] = useState("1C26TNV");
  const [customerName, setCustomerName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [taxLookupLoading, setTaxLookupLoading] = useState(false);
  const [taxLookupError, setTaxLookupError] = useState<string | null>(null);
  const [taxLookupSuccess, setTaxLookupSuccess] = useState<string | null>(null);
  const [productType, setProductType] = useState<SalesProductType>("CRUDE_OIL");
  const [quantity, setQuantity] = useState<number>(3000);
  const [unit, setUnit] = useState<string>("kg");
  const [unitPrice, setUnitPrice] = useState<number>(30000);
  const [vatRate, setVatRate] = useState<number>(8);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Credit terms state (Công nợ N ngày & Hạn thanh toán)
  const [creditDays, setCreditDays] = useState<number>(15);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
  );

  // Quick Payment Modal State (Hỗ trợ thu tiền nhiều đợt / 1 phần)
  const [payingInvoice, setPayingInvoice] = useState<SalesInvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentChannel, setPaymentChannel] = useState<"cash" | "bank">("bank");
  const [paymentDesc, setPaymentDesc] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [viewHistoryInvoice, setViewHistoryInvoice] = useState<SalesInvoiceItem | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<SalesInvoiceItem[]>("/sales/invoices");
      setInvoices(data || []);
      // Suggest next voucher no
      const nextNum = (data?.length || 0) + 1;
      setVoucherNo(`HDB-2026-${String(nextNum).padStart(3, "0")}`);
    } catch (err) {
      console.error("Failed to load sales invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvoices();
  }, []);

  // Realtime calculations
  const subtotal = Math.round(quantity * unitPrice);
  const vatAmount = docType === "VAT_INVOICE" ? Math.round((subtotal * vatRate) / 100) : 0;
  const totalAmount = subtotal + vatAmount;

  // Handle product type switch defaults
  // Auto lookup tax code via public API
  const handleLookupTaxCode = async (codeToLookup?: string) => {
    const rawCode = (codeToLookup !== undefined ? codeToLookup : taxCode).trim().replace(/[^0-9-]/g, "");
    if (!rawCode || rawCode.length < 8) {
      setTaxLookupError("Mã số thuế cần ít nhất 8-10 chữ số.");
      setTaxLookupSuccess(null);
      return;
    }

    try {
      setTaxLookupLoading(true);
      setTaxLookupError(null);
      setTaxLookupSuccess(null);

      const res = await fetch(`http://localhost:4000/api/tax-lookup/${rawCode}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Không tìm thấy thông tin mã số thuế này.");
      }

      const data = await res.json();
      if (data && data.name) {
        setCustomerName(data.name);
        setTaxLookupSuccess(`Đã nhận diện: ${data.name}${data.address ? " - " + data.address : ""}`);
        if (data.taxCode) {
          setTaxCode(data.taxCode);
        }
      } else {
        throw new Error("Không tìm thấy tên doanh nghiệp.");
      }
    } catch (err: any) {
      setTaxLookupError(err.message || "Lỗi tra cứu mã số thuế.");
      setTaxLookupSuccess(null);
    } finally {
      setTaxLookupLoading(false);
    }
  };

  const handleProductChange = (type: SalesProductType) => {
    setProductType(type);
    const def = PRODUCT_DEFINITIONS[type] || PRODUCT_DEFINITIONS.CRUDE_OIL;
    setUnitPrice(def.defaultPrice);
    setUnit("kg");
    if (def.category === "OIL") {
      setDocType("VAT_INVOICE");
      setVatRate(def.defaultVat);
    } else {
      setDocType("SALES_RECEIPT");
      setVatRate(0);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherNo || !customerName || quantity <= 0 || unitPrice <= 0) {
      alert("Vui lòng điền đầy đủ số hóa đơn, khách hàng, số lượng và đơn giá.");
      return;
    }

    try {
      setSubmitting(true);
      await postApi("/sales/invoices", {
        docType,
        voucherNo,
        voucherDate,
        dueDate,
        paymentTermDays: creditDays,
        customerName,
        taxCode: taxCode || undefined,
        invoiceSeries: docType === "VAT_INVOICE" ? invoiceSeries : undefined,
        productType,
        quantity,
        unit,
        unitPrice,
        subtotal,
        vatRate: docType === "VAT_INVOICE" ? vatRate : 0,
        vatAmount,
        totalAmount,
        description: description || undefined
      });

      alert("Đã xuất hóa đơn bán hàng thành công!");
      setShowCreateModal(false);
      // Reset form
      setCustomerName("");
      setTaxCode("");
      setDescription("");
      await loadInvoices();
    } catch (err: any) {
      alert("Lỗi tạo hóa đơn: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayment = (inv: SalesInvoiceItem) => {
    const remaining = inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.totalAmount - (inv.paidAmount || 0));
    setPayingInvoice(inv);
    setPaymentAmount(remaining);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    const step = (inv.paymentVouchers?.length || 0) + 1;
    setPaymentDesc(`Thu tiền bán hàng (Đợt ${step}) theo HĐ ${inv.voucherNo} từ khách ${inv.customerName}`);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    if (paymentAmount <= 0) {
      alert("Số tiền thanh toán phải lớn hơn 0");
      return;
    }

    try {
      setPaymentSubmitting(true);
      await postApi(`/sales/invoices/${payingInvoice.id}/payment`, {
        paymentChannel,
        amount: paymentAmount,
        paymentDate,
        description: paymentDesc
      });

      alert(`Đã lập ${paymentChannel === "cash" ? "Phiếu thu (PT)" : "Báo có ngân hàng (BC)"} thành công số tiền ${paymentAmount.toLocaleString("vi-VN")} đ!`);
      setPayingInvoice(null);
      await loadInvoices();
    } catch (err: any) {
      alert("Lỗi lập phiếu thu: " + err.message);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // KPIs
  // Filter by period first
  const periodInvoices = filterByPeriod(invoices, (i) => i.voucherDate, period);

  // Compute metrics based on selected period
  const totalRevenue = periodInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const isOil = (type: SalesProductType) => type === "CRUDE_OIL" || type === "FILTERED_OIL";
  const isMeal = (type: SalesProductType) => type === "BYPRODUCT" || type === "MEAL_BROWN" || type === "MEAL_WHITE" || type === "MEAL_WHOLE";

  const oilRevenue = periodInvoices.filter((i) => isOil(i.productType)).reduce((s, i) => s + i.totalAmount, 0);
  const mealRevenue = periodInvoices.filter((i) => isMeal(i.productType)).reduce((s, i) => s + i.totalAmount, 0);
  const unpaidTotal = periodInvoices.reduce((s, i) => s + (i.remainingAmount !== undefined ? i.remainingAmount : (i.paymentStatus === "UNPAID" ? i.totalAmount : 0)), 0);
  const overdueInvoices = periodInvoices.filter((i) => i.isOverdue);
  const overdueTotal = overdueInvoices.reduce((s, i) => s + (i.remainingAmount || 0), 0);
  const partialCount = periodInvoices.filter((i) => i.paymentStatus === "PARTIAL").length;

  // Filtered invoices
  const filtered = periodInvoices.filter((inv) => {
    const matchSearch =
      searchTerm === "" ||
      inv.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.taxCode && inv.taxCode.includes(searchTerm));
    const matchPayment =
      filterPayment === "ALL" ||
      inv.paymentStatus === filterPayment ||
      (filterPayment === "OVERDUE" && inv.isOverdue);
    const matchProduct =
      filterProduct === "ALL" ||
      inv.productType === filterProduct ||
      (filterProduct === "ALL_OIL" && isOil(inv.productType)) ||
      (filterProduct === "ALL_MEAL" && isMeal(inv.productType));
    return matchSearch && matchPayment && matchProduct;
  });

  // Paged invoices
  const pagedInvoices = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell activeModule="sales">
      <div className="workspace">
        {/* Breadcrumb & Period Filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <a className="breadcrumb-link" href="/">Trang chủ</a>
            <span>/</span>
            <a className="breadcrumb-link" href="/modules/sales">Hóa đơn Đầu ra</a>
            <span>/</span>
            <span>Xuất Bán Dầu Dừa &amp; Cám Dừa Thành Phẩm</span>
          </div>

          <PeriodFilter
            value={period}
            onChange={(val) => {
              setPeriod(val);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Compact KPI Row - 80px according to erp-ux-ui skill */}
        <div className="kpi-row-compact">
          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #15936b" }}>
            <span className="kpi-label">Tổng doanh thu xuất bán</span>
            <span className="kpi-value text-right" style={{ color: "#15936b" }}>
              {(totalRevenue / 1000000).toFixed(1)} Tr
            </span>
            <span className="kpi-sub">Gồm VAT: {(totalRevenue).toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #0d9488" }}>
            <span className="kpi-label">Doanh thu Dầu Dừa (Thô &amp; Lọc)</span>
            <span className="kpi-value text-right" style={{ color: "#0d9488" }}>
              {(oilRevenue / 1000000).toFixed(1)} Tr
            </span>
            <span className="kpi-sub">
              {invoices.filter((i) => isOil(i.productType)).reduce((s, i) => s + i.quantity, 0).toLocaleString("vi-VN")} kg xuất xưởng
            </span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #0f7bbf" }}>
            <span className="kpi-label">Doanh thu Cám Dừa (3 loại)</span>
            <span className="kpi-value text-right" style={{ color: "#0f7bbf" }}>
              {(mealRevenue / 1000000).toFixed(1)} Tr
            </span>
            <span className="kpi-sub">
              {invoices.filter((i) => isMeal(i.productType)).reduce((s, i) => s + i.quantity, 0).toLocaleString("vi-VN")} kg thành phẩm
            </span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: `4px solid ${overdueInvoices.length > 0 ? "#e11d48" : "#c77d14"}` }}>
            <span className="kpi-label">Công nợ khách hàng chưa thu</span>
            <span className="kpi-value text-right" style={{ color: overdueInvoices.length > 0 ? "#be123c" : unpaidTotal > 0 ? "#d94b35" : "#15936b" }}>
              {unpaidTotal > 0 ? `${(unpaidTotal / 1000000).toFixed(1)} Tr` : "0 đ (Đã thu đủ)"}
            </span>
            <span className="kpi-sub" style={{ color: overdueInvoices.length > 0 ? "#be123c" : undefined, fontWeight: overdueInvoices.length > 0 ? 700 : undefined }}>
              {overdueInvoices.length > 0
                ? `⚠️ ${overdueInvoices.length} HĐ quá hạn (${(overdueTotal / 1000000).toFixed(1)} Tr) • ${partialCount} đợt dở dang`
                : `${invoices.filter((i) => i.paymentStatus !== "PAID").length} HĐ còn nợ • ${partialCount} đợt dở dang`}
            </span>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
            <input
              type="text"
              placeholder="Tìm theo số HĐ, tên khách hàng, MST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--line)", minWidth: 260, fontSize: 13 }}
            />
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="PAID">✓ Đã thu đủ</option>
              <option value="PARTIAL">⏳ Đã thu 1 phần</option>
              <option value="UNPAID">⏱️ Chưa thu</option>
              <option value="OVERDUE">⚠️ Quá hạn thanh toán</option>
            </select>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
            >
              <option value="ALL">Tất cả sản phẩm</option>
              <option value="ALL_OIL">💧 Nhóm Dầu Dừa (Thô &amp; Lọc)</option>
              <option value="CRUDE_OIL">-- Dầu dừa thô</option>
              <option value="FILTERED_OIL">-- Dầu dừa lọc</option>
              <option value="ALL_MEAL">🌾 Nhóm Cám Dừa (Thành phẩm)</option>
              <option value="MEAL_BROWN">-- Cám dừa nâu</option>
              <option value="MEAL_WHITE">-- Cám dừa trắng</option>
              <option value="MEAL_WHOLE">-- Cám dừa nguyên</option>
              <option value="BYPRODUCT">-- Cám dừa chung</option>
            </select>
          </div>

          <button
            type="button"
            className="button primary"
            onClick={() => setShowCreateModal(true)}
            style={{ fontWeight: 700 }}
          >
            <AppIcon name="TrendingUp" />
            + Lập Hóa Đơn Bán Hàng
          </button>
        </div>

        {/* Invoices Data Table */}
        <div className="table-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid var(--line)", overflow: "hidden" }}>
          <div className="table-scroll" style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
            <table className="data-table compact tabular-nums" style={{ width: "100%" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                <tr>
                  <th style={{ width: 105 }}>Số HĐ</th>
                  <th style={{ width: 80 }}>Ký hiệu</th>
                  <th style={{ width: 130 }}>Ngày lập / Hạn nợ</th>
                  <th>Khách hàng</th>
                  <th style={{ width: 95 }}>MST</th>
                  <th style={{ width: 135 }}>Sản phẩm</th>
                  <th className="text-right" style={{ width: 85 }}>Số lượng</th>
                  <th className="text-right" style={{ width: 95 }}>Đơn giá</th>
                  <th className="text-right" style={{ width: 110 }}>Thành tiền</th>
                  <th className="text-right" style={{ width: 55 }}>VAT</th>
                  <th className="text-right" style={{ width: 125 }}>Tổng tiền</th>
                  <th style={{ width: 145 }}>Thanh toán</th>
                  <th style={{ width: 120 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: "#0f7bbf" }}>
                      {inv.voucherNo}
                    </td>
                    <td className="font-mono" style={{ color: "var(--muted)" }}>
                      {inv.invoiceSeries || "-"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.voucherDate}</div>
                      {inv.paymentStatus === "PAID" ? (
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>Hạn: {inv.dueDate || "-"}</div>
                      ) : inv.isOverdue ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#be123c", background: "#ffe4e6", padding: "1px 5px", borderRadius: 3, display: "inline-block", marginTop: 2 }}>
                          ⚠️ Quá hạn {inv.overdueDays}N
                        </span>
                      ) : inv.daysUntilDue === 0 ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "1px 5px", borderRadius: 3, display: "inline-block", marginTop: 2 }}>
                          Đến hạn hôm nay
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: "#0369a1", background: "#f0f9ff", padding: "1px 5px", borderRadius: 3, display: "inline-block", marginTop: 2 }}>
                          Còn {inv.daysUntilDue}N ({inv.paymentTermDays}N)
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                    <td className="font-mono" style={{ fontSize: 12 }}>{inv.taxCode || "-"}</td>
                    <td>
                      {(() => {
                        const def = PRODUCT_DEFINITIONS[inv.productType] || {
                          name: inv.productName || "Sản phẩm",
                          category: "OIL",
                          badgeColor: "#0369a1",
                          badgeBg: "#e0f2fe"
                        };
                        return (
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: def.badgeBg,
                              color: def.badgeColor,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            {def.category === "OIL" ? (
                              <AppIcon name="Droplet" size={13} />
                            ) : (
                              <AppIcon name="Leaf" size={13} />
                            )}
                            {def.name}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="text-right" style={{ fontWeight: 600 }}>
                      {inv.quantity.toLocaleString("vi-VN")} {inv.unit}
                    </td>
                    <td className="text-right">{inv.unitPrice.toLocaleString("vi-VN")} đ</td>
                    <td className="text-right">{inv.subtotal.toLocaleString("vi-VN")} đ</td>
                    <td className="text-right" style={{ color: "var(--muted)" }}>{inv.vatRate}%</td>
                    <td className="text-right" style={{ fontWeight: 800, color: "var(--brand-strong)" }}>
                      {inv.totalAmount.toLocaleString("vi-VN")} đ
                    </td>
                    <td>
                      {inv.paymentStatus === "PAID" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#166534"
                          }}
                        >
                          <AppIcon name="Check" size={12} />
                          Đã thu đủ
                        </span>
                      ) : inv.paymentStatus === "PARTIAL" ? (
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "#fef3c7",
                              color: "#92400e"
                            }}
                          >
                            <AppIcon name="Clock" size={12} />
                            Thu 1 phần
                          </span>
                          <div style={{ fontSize: 10, marginTop: 2, color: "#b45309", fontWeight: 600 }}>
                            Đã thu: {inv.paidAmount.toLocaleString("vi-VN")} đ<br />
                            Còn nợ: {(inv.remainingAmount || (inv.totalAmount - inv.paidAmount)).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "#fee2e2",
                              color: "#b91c1c"
                            }}
                          >
                            <AppIcon name="AlertCircle" size={12} />
                            Chưa thu
                          </span>
                          <div style={{ fontSize: 10, marginTop: 2, color: "#b91c1c" }}>
                            Nợ: {inv.totalAmount.toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {inv.paymentStatus !== "PAID" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <button
                            type="button"
                            className="button"
                            style={{ padding: "4px 8px", fontSize: 11, background: "var(--brand)", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 4, cursor: "pointer", fontWeight: 600 }}
                            onClick={() => handleOpenPayment(inv)}
                          >
                            <AppIcon name="Coins" size={13} />
                            {inv.paymentStatus === "PARTIAL" ? "Thu tiếp" : "Thu tiền"}
                          </button>
                          {inv.paymentVouchers && inv.paymentVouchers.length > 0 && (
                            <span
                              onClick={() => setViewHistoryInvoice(inv)}
                              style={{ fontSize: 10, color: "#0f7bbf", cursor: "pointer", textDecoration: "underline" }}
                              title="Xem lịch sử các đợt thu tiền"
                            >
                              Đã thu {inv.paymentVouchers.length} đợt
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11 }}>
                          <span
                            onClick={() => setViewHistoryInvoice(inv)}
                            style={{ color: "#0f7bbf", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                            title="Bấm để xem lịch sử thanh toán"
                          >
                            {inv.paymentVouchers?.[0]?.voucherNo || "Đã tất toán"}
                            {inv.paymentVouchers && inv.paymentVouchers.length > 1 && ` (+${inv.paymentVouchers.length - 1})`}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center", padding: "24px", color: "var(--muted)" }}>
                      Không có hóa đơn nào khớp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Modal: Lập Hóa Đơn Bán Hàng */}
        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.45)",
              display: "grid",
              placeItems: "center",
              zIndex: 1000
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 8,
                width: "90%",
                maxWidth: 680,
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                padding: 24
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
                  <AppIcon name="TrendingUp" size={18} style={{ color: "var(--brand)" }} />
                  Lập Hóa Đơn Xuất Bán Hàng Xưởng Dầu Dừa
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
                >
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: "grid", gap: 14 }}>
                <div className="modal-grid-2">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Loại chứng từ
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                    >
                      <option value="VAT_INVOICE">Hóa đơn GTGT Điện tử</option>
                      <option value="SALES_RECEIPT">Phiếu xuất bán lẻ / Bán phụ phẩm</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Số hóa đơn / Phiếu
                    </label>
                    <input
                      type="text"
                      required
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid-2">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Ngày lập hóa đơn
                    </label>
                    <input
                      type="date"
                      required
                      value={voucherDate}
                      onChange={(e) => {
                        setVoucherDate(e.target.value);
                        const vDate = new Date(e.target.value || Date.now());
                        const newDue = new Date(vDate.getTime() + creditDays * 86400000);
                        setDueDate(newDue.toISOString().slice(0, 10));
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Ký hiệu hóa đơn
                    </label>
                    <input
                      type="text"
                      value={invoiceSeries}
                      onChange={(e) => setInvoiceSeries(e.target.value)}
                    />
                  </div>
                </div>

                {/* Credit terms row */}
                <div className="modal-grid-2" style={{ background: "#f8fafc", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", display: "block", marginBottom: 4 }}>
                      Thời hạn công nợ (Hạn nợ N ngày) *
                    </label>
                    <select
                      value={creditDays}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        setCreditDays(days);
                        const vDate = new Date(voucherDate || Date.now());
                        const newDue = new Date(vDate.getTime() + days * 86400000);
                        setDueDate(newDue.toISOString().slice(0, 10));
                      }}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontWeight: 600 }}
                    >
                      <option value={0}>Thanh toán ngay khi giao hàng (0 ngày)</option>
                      <option value={7}>Công nợ 7 ngày (Gối đầu 1 tuần)</option>
                      <option value={15}>Công nợ 15 ngày (Nửa tháng)</option>
                      <option value={30}>Công nợ 30 ngày (1 tháng)</option>
                      <option value={45}>Công nợ 45 ngày</option>
                      <option value={60}>Công nợ 60 ngày</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", display: "block", marginBottom: 4 }}>
                      Hạn thanh toán dự kiến *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        const vDate = new Date(voucherDate).getTime();
                        const dDate = new Date(e.target.value).getTime();
                        const diff = Math.round((dDate - vDate) / 86400000);
                        setCreditDays(Math.max(0, diff));
                      }}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                </div>

                <div className="modal-grid-2">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                        Mã số thuế (nếu có)
                      </label>
                      <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600 }}>
                        ⚡ Auto-fill tên DN
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        placeholder="Nhập MST (VD: 0300588569, 1300994511)..."
                        value={taxCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTaxCode(val);
                          setTaxLookupError(null);
                          setTaxLookupSuccess(null);
                          const clean = val.trim().replace(/[^0-9-]/g, "");
                          if (clean.length === 10 || clean.length === 13 || clean.length === 14) {
                            handleLookupTaxCode(clean);
                          }
                        }}
                        onBlur={() => {
                          const clean = taxCode.trim().replace(/[^0-9-]/g, "");
                          if (clean.length >= 8 && !taxLookupSuccess && !customerName) {
                            handleLookupTaxCode(clean);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleLookupTaxCode()}
                        disabled={taxLookupLoading || !taxCode.trim()}
                        style={{
                          padding: "0 12px",
                          background: taxLookupLoading ? "#94a3b8" : "var(--brand)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: taxLookupLoading ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                        title="Tra cứu API để tự động điền Tên doanh nghiệp"
                      >
                        {taxLookupLoading ? "Đang tìm..." : "Tra cứu MST"}
                      </button>
                    </div>
                    {taxLookupError && (
                      <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                        ⚠️ {taxLookupError}
                      </div>
                    )}
                    {taxLookupSuccess && (
                      <div style={{ fontSize: 11, color: "#059669", marginTop: 4, fontWeight: 500 }}>
                        ✓ {taxLookupSuccess}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Tên Khách hàng / Doanh nghiệp thu mua *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Công ty Cổ phần Sữa Việt Nam..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid-2" style={{ background: "#f8faf9", padding: 12, borderRadius: 6 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Sản phẩm xuất bán
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => handleProductChange(e.target.value as any)}
                      style={{ fontWeight: 700 }}
                    >
                      <optgroup label="💧 Nhóm Dầu Dừa (Xuất xưởng / tinh chế)">
                        <option value="CRUDE_OIL">Dầu dừa thô xuất xưởng</option>
                        <option value="FILTERED_OIL">Dầu dừa lọc sạch (khung bản / ly tâm)</option>
                      </optgroup>
                      <optgroup label="🌾 Nhóm Cám Dừa Thành Phẩm">
                        <option value="MEAL_BROWN">Cám dừa nâu (ép nguyên vỏ/lụa đậm)</option>
                        <option value="MEAL_WHITE">Cám dừa trắng (gọt vỏ lụa, giá trị cao)</option>
                        <option value="MEAL_WHOLE">Cám dừa nguyên (hỗn hợp tiêu chuẩn)</option>
                        <option value="BYPRODUCT">Cám dừa chung (tiêu chuẩn xuất bán)</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Đơn vị tính
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Số lượng xuất bán ({unit})
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{ textAlign: "right", fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Đơn giá bán (đ/{unit}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", textAlign: "right", fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Thuế suất VAT (%)
                    </label>
                    <select
                      value={vatRate}
                      disabled={docType !== "VAT_INVOICE"}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    >
                      <option value={0}>0%</option>
                      <option value={8}>8% (Giảm thuế)</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                    <span>Thành tiền chưa thuế:</span>
                    <strong className="tabular-nums">{subtotal.toLocaleString("vi-VN")} đ</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "var(--muted)" }}>
                    <span>Tiền thuế GTGT ({vatRate}%):</span>
                    <span className="tabular-nums">{vatAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#166534", borderTop: "1px solid #bbf7d0", paddingTop: 4 }}>
                    <span>Tổng tiền thanh toán:</span>
                    <span className="tabular-nums">{totalAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Ghi chú / Số hợp đồng / Số xe nhận dầu
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Xe bồn 63C-123.45 lấy dầu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="button" onClick={() => setShowCreateModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="button primary" disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <AppIcon name="Check" size={15} />
                    {submitting ? "Đang lưu..." : "Xác Nhận Xuất Hóa Đơn"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Lập Phiếu Thu / Báo Có Thanh Toán (Hỗ trợ Trả 1 phần / Trả góp) */}
        {payingInvoice && (() => {
          const paidBefore = payingInvoice.paidAmount || 0;
          const currentRemaining = payingInvoice.remainingAmount !== undefined ? payingInvoice.remainingAmount : (payingInvoice.totalAmount - paidBefore);
          const afterThisPayment = Math.max(0, currentRemaining - (paymentAmount || 0));

          return (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "grid",
                placeItems: "center",
                zIndex: 1000
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  width: "90%",
                  maxWidth: 540,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
                  padding: 24,
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <AppIcon name="Coins" size={18} style={{ color: "#0f7bbf" }} />
                      Lập Phiếu Thu Tiền Bán Hàng / Thu Nợ
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                      Hóa đơn: <strong>{payingInvoice.voucherNo}</strong> • Khách: <strong>{payingInvoice.customerName}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
                  >
                    <AppIcon name="X" size={18} />
                  </button>
                </div>

                {/* 4-Box Summary Card */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 14 }}>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Tổng tiền hóa đơn:</div>
                    <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {payingInvoice.totalAmount.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                  <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: 11, color: "#166534" }}>Đã thu các đợt trước:</div>
                    <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>
                      {paidBefore.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                  <div style={{ background: "#eff6ff", padding: "8px 12px", borderRadius: 6, border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 11, color: "#1d4ed8" }}>Còn nợ cần thu:</div>
                    <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8" }}>
                      {currentRemaining.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                  <div style={{ background: afterThisPayment === 0 ? "#ecfdf5" : "#fffbeb", padding: "8px 12px", borderRadius: 6, border: `1px solid ${afterThisPayment === 0 ? "#a7f3d0" : "#fef08a"}` }}>
                    <div style={{ fontSize: 11, color: afterThisPayment === 0 ? "#065f46" : "#854d0e" }}>
                      {afterThisPayment === 0 ? "✓ Sẽ hoàn tất công nợ:" : "⏳ Còn nợ lại sau đợt này:"}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 700, color: afterThisPayment === 0 ? "#065f46" : "#b45309" }}>
                      {afterThisPayment.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                </div>

                <form onSubmit={handleExecutePayment} style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                        Số tiền thu đợt này (VNĐ) *
                      </label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(currentRemaining)}
                          style={{ fontSize: 10, padding: "2px 6px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 4, cursor: "pointer", color: "#166534", fontWeight: 700 }}
                        >
                          Thu đủ 100%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(Math.round(currentRemaining * 0.5))}
                          style={{ fontSize: 10, padding: "2px 6px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", color: "#334155" }}
                        >
                          Thu 50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(Math.round(currentRemaining * 0.3))}
                          style={{ fontSize: 10, padding: "2px 6px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", color: "#334155" }}
                        >
                          Thu 30%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(Math.round(currentRemaining * 0.2))}
                          style={{ fontSize: 10, padding: "2px 6px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", color: "#334155" }}
                        >
                          Cọc 20%
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      required
                      min={1000}
                      max={currentRemaining}
                      value={paymentAmount || ""}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "2px solid #0f7bbf", fontSize: 15, fontWeight: 700, color: "#0f7bbf" }}
                    />
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Thương lái có thể trả từng đợt (ví dụ đặt cọc trước, trả dần gối đầu).
                    </div>
                  </div>

                  <div className="modal-grid-2">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                        Ngày thu tiền *
                      </label>
                      <input
                        type="date"
                        required
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                        Hình thức thanh toán
                      </label>
                      <select
                        value={paymentChannel}
                        onChange={(e) => setPaymentChannel(e.target.value as any)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                      >
                        <option value="bank">Chuyển khoản Ngân hàng (Lập Báo có BC)</option>
                        <option value="cash">Tiền mặt tại xưởng (Lập Phiếu thu PT)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Nội dung thu tiền
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentDesc}
                      onChange={(e) => setPaymentDesc(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                    <button type="button" className="button" onClick={() => setPayingInvoice(null)}>
                      Đóng
                    </button>
                    <button type="submit" className="button primary" disabled={paymentSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <AppIcon name="Check" size={15} />
                      {paymentSubmitting ? "Đang xử lý..." : `Xác Nhận Thu ${paymentAmount > 0 ? paymentAmount.toLocaleString("vi-VN") + " đ" : ""}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* Modal: Lịch Sử Các Đợt Thu Tiền / Trả Góp */}
        {viewHistoryInvoice && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.45)",
              display: "grid",
              placeItems: "center",
              zIndex: 1000
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 8,
                width: "90%",
                maxWidth: 580,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
                padding: 24,
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <AppIcon name="FileText" size={18} style={{ color: "#0f7bbf" }} />
                    Lịch Sử Các Đợt Thu Tiền Hóa Đơn
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                    HĐ: <strong>{viewHistoryInvoice.voucherNo}</strong> • Khách: <strong>{viewHistoryInvoice.customerName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewHistoryInvoice(null)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
                >
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              {/* Summary overview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Tổng tiền HĐ:</div>
                  <strong className="tabular-nums" style={{ fontSize: 14 }}>{viewHistoryInvoice.totalAmount.toLocaleString("vi-VN")} đ</strong>
                </div>
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, color: "#166534" }}>Đã thu:</div>
                  <strong className="tabular-nums" style={{ fontSize: 14, color: "#166534" }}>{(viewHistoryInvoice.paidAmount || 0).toLocaleString("vi-VN")} đ</strong>
                </div>
                <div style={{ background: (viewHistoryInvoice.remainingAmount || 0) > 0 ? "#fef2f2" : "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: `1px solid ${(viewHistoryInvoice.remainingAmount || 0) > 0 ? "#fecaca" : "#bbf7d0"}` }}>
                  <div style={{ fontSize: 11, color: (viewHistoryInvoice.remainingAmount || 0) > 0 ? "#b91c1c" : "#166534" }}>Còn nợ:</div>
                  <strong className="tabular-nums" style={{ fontSize: 14, color: (viewHistoryInvoice.remainingAmount || 0) > 0 ? "#b91c1c" : "#166534" }}>
                    {(viewHistoryInvoice.remainingAmount !== undefined ? viewHistoryInvoice.remainingAmount : Math.max(0, viewHistoryInvoice.totalAmount - (viewHistoryInvoice.paidAmount || 0))).toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              </div>

              {/* Installments table */}
              {viewHistoryInvoice.paymentVouchers && viewHistoryInvoice.paymentVouchers.length > 0 ? (
                <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                        <th style={{ padding: "6px 10px" }}>Đợt</th>
                        <th style={{ padding: "6px 10px" }}>Số CT</th>
                        <th style={{ padding: "6px 10px" }}>Ngày thu</th>
                        <th style={{ padding: "6px 10px" }}>Hình thức</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewHistoryInvoice.paymentVouchers.map((pv, idx) => (
                        <tr key={pv.voucherNo || idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700 }}>Đợt {idx + 1}</td>
                          <td style={{ padding: "8px 10px", color: "#0f7bbf", fontWeight: 600 }}>{pv.voucherNo}</td>
                          <td style={{ padding: "8px 10px" }}>{pv.date}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ padding: "2px 6px", borderRadius: 4, background: pv.voucherType === "BC" ? "#e0f2fe" : "#fef3c7", color: pv.voucherType === "BC" ? "#0369a1" : "#92400e", fontSize: 10, fontWeight: 700 }}>
                              {pv.voucherType === "BC" ? "Ngân hàng (BC)" : "Tiền mặt (PT)"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#166534" }} className="tabular-nums">
                            {pv.amount.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "var(--muted)", margin: "20px 0" }}>Chưa có đợt thanh toán nào.</p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                {(viewHistoryInvoice.remainingAmount || 0) > 0 && (
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      const inv = viewHistoryInvoice;
                      setViewHistoryInvoice(null);
                      handleOpenPayment(inv);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <AppIcon name="Coins" size={14} />
                    Thu Tiếp Đợt Mới
                  </button>
                )}
                <button type="button" className="button" onClick={() => setViewHistoryInvoice(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

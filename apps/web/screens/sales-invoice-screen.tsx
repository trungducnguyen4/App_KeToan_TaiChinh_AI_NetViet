import React, { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";
import { Pagination } from "../components/pagination";
import { PeriodFilter, PeriodFilterValue, filterByPeriod } from "../components/period-filter";

type SalesInvoiceItem = {
  id: string;
  voucherNo: string;
  voucherDate: string;
  customerName: string;
  taxCode?: string;
  invoiceSeries?: string;
  docType: "VAT_INVOICE" | "SALES_RECEIPT";
  productType: "CRUDE_OIL" | "BYPRODUCT";
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
  paymentStatus: "PAID" | "UNPAID";
  paidAmount: number;
  paymentVouchers?: Array<{
    voucherNo: string;
    voucherType: string;
    amount: number;
    date: string;
  }>;
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
  const [productType, setProductType] = useState<"CRUDE_OIL" | "BYPRODUCT">("CRUDE_OIL");
  const [quantity, setQuantity] = useState<number>(3000);
  const [unit, setUnit] = useState<string>("kg");
  const [unitPrice, setUnitPrice] = useState<number>(30000);
  const [vatRate, setVatRate] = useState<number>(8);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick Payment Modal State
  const [payingInvoice, setPayingInvoice] = useState<SalesInvoiceItem | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<"cash" | "bank">("bank");
  const [paymentDesc, setPaymentDesc] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

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
  const handleProductChange = (type: "CRUDE_OIL" | "BYPRODUCT") => {
    setProductType(type);
    if (type === "CRUDE_OIL") {
      setUnitPrice(30000);
      setUnit("kg");
      setVatRate(8);
    } else {
      setUnitPrice(1200);
      setUnit("kg");
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
    setPayingInvoice(inv);
    setPaymentDesc(`Thu tiền bán hàng hóa đơn ${inv.voucherNo} từ khách ${inv.customerName}`);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    try {
      setPaymentSubmitting(true);
      await postApi(`/sales/invoices/${payingInvoice.id}/payment`, {
        paymentChannel,
        description: paymentDesc
      });

      alert(`Đã lập ${paymentChannel === "cash" ? "Phiếu thu (PT)" : "Báo có ngân hàng (BC)"} thành công!`);
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
  const crudeOilRevenue = periodInvoices.filter((i) => i.productType === "CRUDE_OIL").reduce((s, i) => s + i.totalAmount, 0);
  const byproductRevenue = periodInvoices.filter((i) => i.productType === "BYPRODUCT").reduce((s, i) => s + i.totalAmount, 0);
  const unpaidTotal = periodInvoices.filter((i) => i.paymentStatus === "UNPAID").reduce((s, i) => s + i.totalAmount, 0);

  // Filtered invoices
  const filtered = periodInvoices.filter((inv) => {
    const matchSearch =
      searchTerm === "" ||
      inv.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.taxCode && inv.taxCode.includes(searchTerm));
    const matchPayment = filterPayment === "ALL" || inv.paymentStatus === filterPayment;
    const matchProduct = filterProduct === "ALL" || inv.productType === filterProduct;
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
            <span>Xuất Bán Dầu Dừa &amp; Bã Dừa</span>
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
            <span className="kpi-label">Doanh thu dầu dừa thô</span>
            <span className="kpi-value text-right" style={{ color: "#0d9488" }}>
              {(crudeOilRevenue / 1000000).toFixed(1)} Tr
            </span>
            <span className="kpi-sub">
              {invoices.filter((i) => i.productType === "CRUDE_OIL").reduce((s, i) => s + i.quantity, 0).toLocaleString("vi-VN")} kg xuất xưởng
            </span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #0f7bbf" }}>
            <span className="kpi-label">Thu hồi bán bã dừa</span>
            <span className="kpi-value text-right" style={{ color: "#0f7bbf" }}>
              {(byproductRevenue / 1000000).toFixed(1)} Tr
            </span>
            <span className="kpi-sub">Phụ phẩm ép thức ăn gia súc</span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #c77d14" }}>
            <span className="kpi-label">Công nợ khách hàng chưa thu</span>
            <span className="kpi-value text-right" style={{ color: unpaidTotal > 0 ? "#d94b35" : "#15936b" }}>
              {unpaidTotal > 0 ? `${(unpaidTotal / 1000000).toFixed(1)} Tr` : "0 đ (Đã thu đủ)"}
            </span>
            <span className="kpi-sub">
              {invoices.filter((i) => i.paymentStatus === "UNPAID").length} hóa đơn chờ thanh toán
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
              <option value="PAID">Đã thu tiền</option>
              <option value="UNPAID">Chưa thu tiền</option>
            </select>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
            >
              <option value="ALL">Tất cả sản phẩm</option>
              <option value="CRUDE_OIL">Dầu dừa thô</option>
              <option value="BYPRODUCT">Bã dừa phụ phẩm</option>
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
                  <th style={{ width: 110 }}>Số HĐ</th>
                  <th style={{ width: 85 }}>Ký hiệu</th>
                  <th style={{ width: 95 }}>Ngày lập</th>
                  <th>Khách hàng</th>
                  <th style={{ width: 100 }}>MST</th>
                  <th style={{ width: 130 }}>Sản phẩm</th>
                  <th className="text-right" style={{ width: 90 }}>Số lượng</th>
                  <th className="text-right" style={{ width: 100 }}>Đơn giá</th>
                  <th className="text-right" style={{ width: 120 }}>Thành tiền</th>
                  <th className="text-right" style={{ width: 80 }}>VAT</th>
                  <th className="text-right" style={{ width: 130 }}>Tổng tiền</th>
                  <th style={{ width: 110 }}>Thanh toán</th>
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
                    <td>{inv.voucherDate}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                    <td className="font-mono" style={{ fontSize: 12 }}>{inv.taxCode || "-"}</td>
                    <td>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: inv.productType === "CRUDE_OIL" ? "#e0f2fe" : "#fef3c7",
                          color: inv.productType === "CRUDE_OIL" ? "#0369a1" : "#92400e",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {inv.productType === "CRUDE_OIL" ? (
                          <>
                            <AppIcon name="Droplet" size={13} />
                            Dầu dừa thô
                          </>
                        ) : (
                          <>
                            <AppIcon name="Leaf" size={13} />
                            Bã dừa
                          </>
                        )}
                      </span>
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
                      ) : (
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
                          <AppIcon name="Clock" size={12} />
                          Chưa thu
                        </span>
                      )}
                    </td>
                    <td>
                      {inv.paymentStatus === "UNPAID" ? (
                        <button
                          type="button"
                          className="button"
                          style={{ padding: "4px 8px", fontSize: 11, background: "var(--brand)", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                          onClick={() => handleOpenPayment(inv)}
                        >
                          <AppIcon name="Coins" size={13} />
                          Thu tiền
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {inv.paymentVouchers?.[0]?.voucherNo || "Đã tất toán"}
                        </span>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Loại chứng từ
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Ngày lập hóa đơn
                    </label>
                    <input
                      type="date"
                      required
                      value={voucherDate}
                      onChange={(e) => setVoucherDate(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Tên Khách hàng / Doanh nghiệp thu mua
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Công ty TNHH Dầu Thực Vật Miền Tây..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Mã số thuế (nếu có)
                    </label>
                    <input
                      type="text"
                      placeholder="031..."
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8faf9", padding: 12, borderRadius: 6 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Sản phẩm xuất bán
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => handleProductChange(e.target.value as any)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontWeight: 700 }}
                    >
                      <option value="CRUDE_OIL">Dầu dừa thô xuất xưởng</option>
                      <option value="BYPRODUCT">Bã dừa ép (phụ phẩm thức ăn)</option>
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr", gap: 12 }}>
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", textAlign: "right", fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      Đơn giá bán (đ/{unit})
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

        {/* Modal: Lập Phiếu Thu / Báo Có Thanh Toán */}
        {payingInvoice && (
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
                maxWidth: 480,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                padding: 24
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
                <h3 style={{ margin: 0, color: "var(--ink)", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <AppIcon name="Coins" size={18} style={{ color: "#0f7bbf" }} />
                  Lập Phiếu Thu Tiền Bán Hàng
                </h3>
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
                >
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleExecutePayment} style={{ display: "grid", gap: 12 }}>
                <div style={{ background: "#f8faf9", padding: 10, borderRadius: 6, fontSize: 13 }}>
                  <p style={{ margin: "2px 0" }}><strong>Khách hàng:</strong> {payingInvoice.customerName}</p>
                  <p style={{ margin: "2px 0" }}><strong>Hóa đơn:</strong> {payingInvoice.voucherNo} ({payingInvoice.voucherDate})</p>
                  <p style={{ margin: "4px 0 0", color: "#15936b", fontWeight: 800, fontSize: 15 }}>
                    Số tiền cần thu: {payingInvoice.totalAmount.toLocaleString("vi-VN")} đ
                  </p>
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="button" onClick={() => setPayingInvoice(null)}>
                    Đóng
                  </button>
                  <button type="submit" className="button primary" disabled={paymentSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <AppIcon name="Check" size={15} />
                    {paymentSubmitting ? "Đang xử lý..." : "Xác Nhận Thu Tiền"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

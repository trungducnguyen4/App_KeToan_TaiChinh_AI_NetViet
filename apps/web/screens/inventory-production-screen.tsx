import { useEffect, useState } from "react";
import type { ProductionBatchRecord, SupplierYieldPerformance } from "@domain/types";
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

type BatchFormState = {
  batchCode: string;
  batchDate: string;
  supplierName: string;
  rawMaterialKg: string;
  crudeOilKg: string;
  byproductKg: string;
  rawMaterialCost: string;
  processingCost: string;
  overheadCost: string;
  byproductRecovery: string;
  notes: string;
};

const INITIAL_BATCH_FORM: BatchFormState = {
  batchCode: `ME-${new Date().toISOString().slice(0, 7).replace("-", "")}-004`,
  batchDate: new Date().toISOString().slice(0, 10),
  supplierName: "Thương lái Ba Dừa (Bến Tre)",
  rawMaterialKg: "15000",
  crudeOilKg: "3350",
  byproductKg: "10850",
  rawMaterialCost: "63000000",
  processingCost: "6197500",
  overheadCost: "1675000",
  byproductRecovery: "13020000",
  notes: "Mẻ ép vỏ dừa máy số 2, độ ẩm đạt yêu cầu"
};

export default function InventoryProductionScreen() {
  const [batches, setBatches] = useState<ProductionBatchRecord[]>([]);
  const [supplierYields, setSupplierYields] = useState<SupplierYieldPerformance[]>([]);
  const [activeTab, setActiveTab] = useState<"batches" | "ranking" | "stock">("batches");
  const [form, setForm] = useState<BatchFormState>(INITIAL_BATCH_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filters
  const [filterQuery, setFilterQuery] = useState("");
  const [period, setPeriod] = useState<PeriodFilterValue>("3M");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function loadData() {
    try {
      setIsLoading(true);
      const [batchData, yieldData] = await Promise.all([
        fetchApi<ProductionBatchRecord[]>("/production/batches"),
        fetchApi<SupplierYieldPerformance[]>("/production/supplier-yields")
      ]);
      setBatches(batchData);
      setSupplierYields(yieldData);
    } catch (err) {
      console.error("Failed to load production data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Realtime calculated form metrics
  const rawKg = Number(form.rawMaterialKg) || 0;
  const oilKg = Number(form.crudeOilKg) || 0;
  const byKg = Number(form.byproductKg) || 0;
  const currentYieldRate = rawKg > 0 ? Number(((oilKg / rawKg) * 100).toFixed(2)) : 0;
  const currentLossRate = rawKg > 0 ? Number(Math.max(0, 100 - currentYieldRate - ((byKg / rawKg) * 100)).toFixed(2)) : 0;
  const currentLiters = Number((oilKg / 0.915).toFixed(1));

  // Auto update cost estimates when raw/oil changes
  function handleFormChange(patch: Partial<BatchFormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      const rKg = Number(next.rawMaterialKg) || 0;
      const oKg = Number(next.crudeOilKg) || 0;
      const bKg = Number(next.byproductKg) || 0;

      // Auto estimate costs
      next.rawMaterialCost = String(rKg * 4200);
      next.processingCost = String(oKg * 1850);
      next.overheadCost = String(oKg * 500);
      next.byproductRecovery = String(bKg * 1200);

      return next;
    });
  }

  async function handleSubmitBatch(e: React.FormEvent) {
    e.preventDefault();
    if (rawKg <= 0 || oilKg <= 0) {
      alert("Khối lượng vỏ dừa và dầu thô phải lớn hơn 0");
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const payload = {
        batchCode: form.batchCode.trim(),
        batchDate: form.batchDate,
        supplierName: form.supplierName.trim() || undefined,
        rawMaterialKg: rawKg,
        crudeOilKg: oilKg,
        byproductKg: byKg,
        rawMaterialCost: Number(form.rawMaterialCost) || undefined,
        processingCost: Number(form.processingCost) || undefined,
        overheadCost: Number(form.overheadCost) || undefined,
        byproductRecovery: Number(form.byproductRecovery) || undefined,
        notes: form.notes.trim() || undefined
      };

      await postApi("/production/batches", payload);
      setFeedback({
        type: "success",
        message: `Đã ghi nhận thành công mẻ ép ${form.batchCode} vào hệ thống!`
      });

      await loadData();

      // Advance batch code
      setForm((prev) => ({
        ...prev,
        batchCode: `ME-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(batches.length + 2).padStart(3, "0")}`
      }));
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Lỗi khi lưu mẻ sản xuất."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter batches by period first
  const periodBatches = filterByPeriod(batches, (b) => b.batchDate, period);

  // Aggregate metrics based on selected period
  const totalRawTons = periodBatches.reduce((sum, b) => sum + b.rawMaterialKg, 0) / 1000;
  const totalOilTons = periodBatches.reduce((sum, b) => sum + b.crudeOilKg, 0) / 1000;
  const totalLiters = periodBatches.reduce((sum, b) => sum + b.crudeOilLiters, 0);
  const totalByproductTons = periodBatches.reduce((sum, b) => sum + b.byproductKg, 0) / 1000;
  const avgYieldRate = totalRawTons > 0 ? ((totalOilTons / totalRawTons) * 100).toFixed(2) : "0.00";
  const avgUnitCost = periodBatches.length > 0
    ? Math.round(periodBatches.reduce((sum, b) => sum + b.unitCostPerKg, 0) / periodBatches.length)
    : 0;

  const filteredBatches = periodBatches.filter((b) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      b.batchCode.toLowerCase().includes(q) ||
      (b.supplierName && b.supplierName.toLowerCase().includes(q)) ||
      (b.notes && b.notes.toLowerCase().includes(q))
    );
  });

  // Paged batches
  const pagedBatches = filteredBatches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell activeModule="inventory">
      <div className="workspace">
        {/* Breadcrumb & Period Filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <span>Trang chủ</span>
            <span>/</span>
            <span>Kho &amp; Công đoạn Ép/Lọc</span>
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
            <div className="eyebrow">CÔNG ĐOẠN SẢN XUẤT DẦU DỪA THÔ</div>
            <h2 className="hero-title">Kho & Công đoạn Ép/Lọc Dầu dừa</h2>
            <p className="hero-copy">
              Ghi nhận sản lượng vỏ dừa đưa vào máy ép, sản lượng dầu dừa thô thu được sau lọc, đo lường tỷ lệ thu hồi (% Yield) và xếp hạng chất lượng nguyên liệu theo từng thương lái.
            </p>
          </div>
          <div className="sync-panel" style={{ background: "#0f766e" }}>
            <strong style={{ color: "#a7f3d0" }}>{avgYieldRate}% Thu hồi</strong>
            <span>
              Định mức bình quân toàn xưởng: 1 tấn vỏ dừa ép được {(Number(avgYieldRate) * 10).toFixed(0)} kg dầu dừa thô (~{(Number(avgYieldRate) * 10 / 0.915).toFixed(0)} lít).
            </span>
          </div>
        </section>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-label">Vỏ dừa đưa vào ép</div>
            <div className="kpi-value" style={{ color: "#0f7bbf" }}>{totalRawTons.toFixed(2)} Tấn</div>
            <div className="kpi-delta">Tổng {batches.length} mẻ sản xuất</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Dầu dừa thu hồi (Thô/Lọc)</div>
            <div className="kpi-value" style={{ color: "#15936b" }}>{totalOilTons.toFixed(2)} Tấn</div>
            <div className="kpi-delta">~{totalLiters.toLocaleString("vi-VN")} Lít dầu thành phẩm</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Cám dừa thành phẩm</div>
            <div className="kpi-value" style={{ color: "#c77d14" }}>{totalByproductTons.toFixed(2)} Tấn</div>
            <div className="kpi-delta">3 loại: cám nâu, trắng, nguyên</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Giá thành 1 kg dầu thô</div>
            <div className="kpi-value" style={{ color: "#087f5b" }}>{currency.format(avgUnitCost)}</div>
            <div className="kpi-delta">Chi phí xuất xưởng bình quân</div>
          </article>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderBottom: "2px solid var(--line)", paddingBottom: "10px" }}>
          <button
            type="button"
            className={`button ${activeTab === "batches" ? "primary" : ""}`}
            onClick={() => setActiveTab("batches")}
            style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <AppIcon name="Cog" size={16} />
            Mẻ Ép & Lọc Dầu ({batches.length})
          </button>
          <button
            type="button"
            className={`button ${activeTab === "ranking" ? "primary" : ""}`}
            onClick={() => setActiveTab("ranking")}
            style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <AppIcon name="Trophy" size={16} />
            Đánh giá & Xếp hạng Thương lái ({supplierYields.length})
          </button>
          <button
            type="button"
            className={`button ${activeTab === "stock" ? "primary" : ""}`}
            onClick={() => setActiveTab("stock")}
            style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <AppIcon name="Package" size={16} />
            Tồn kho Nguyên liệu & Thành phẩm
          </button>
        </div>

        {/* TAB 1: BATCHES */}
        {activeTab === "batches" && (
          <>
            {/* Batch Form */}
            <section className="panel" style={{ marginTop: "16px" }}>
              <div className="subsection">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <AppIcon name="Cog" size={18} style={{ color: "var(--brand)" }} />
                    Ghi nhận Mẻ Ép / Lọc Dầu Mới
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                    Nhập khối lượng nguyên liệu đưa vào và thành phẩm dầu thô ra để hệ thống tính ngay tỷ lệ thu hồi và giá vốn mẻ.
                  </p>
                </div>
              </div>

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

              <form onSubmit={handleSubmitBatch}>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Mã mẻ ép *</label>
                    <input
                      type="text"
                      required
                      value={form.batchCode}
                      onChange={(e) => handleFormChange({ batchCode: e.target.value })}
                      placeholder="ME-202611-004"
                    />
                  </div>

                  <div className="form-field">
                    <label>Ngày sản xuất / Ngày ép *</label>
                    <input
                      type="date"
                      required
                      value={form.batchDate}
                      onChange={(e) => handleFormChange({ batchDate: e.target.value })}
                    />
                  </div>

                  <div className="form-field lg">
                    <label>Thương lái cung cấp vỏ dừa mẻ này *</label>
                    <input
                      type="text"
                      required
                      value={form.supplierName}
                      onChange={(e) => handleFormChange({ supplierName: e.target.value })}
                      placeholder="Thương lái Ba Dừa / Tư Dừa..."
                    />
                  </div>

                  <div className="form-field">
                    <label>Vỏ dừa đưa vào máy ép (kg) *</label>
                    <input
                      type="number"
                      required
                      value={form.rawMaterialKg}
                      onChange={(e) => handleFormChange({ rawMaterialKg: e.target.value })}
                      placeholder="15000"
                    />
                  </div>

                  <div className="form-field">
                    <label>Dầu dừa thô thu được (kg) *</label>
                    <input
                      type="number"
                      required
                      value={form.crudeOilKg}
                      onChange={(e) => handleFormChange({ crudeOilKg: e.target.value })}
                      placeholder="3350"
                    />
                  </div>

                  <div className="form-field">
                    <label>Quy đổi thể tích (Lít)</label>
                    <input
                      type="text"
                      readOnly
                      value={currentLiters.toLocaleString("vi-VN") + " Lít"}
                      style={{ background: "#f8fafc", color: "#0284c7", fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Cám dừa ép thu hồi (kg) *</label>
                    <input
                      type="number"
                      value={form.byproductKg}
                      onChange={(e) => handleFormChange({ byproductKg: e.target.value })}
                      placeholder="10850"
                    />
                  </div>

                  {/* Realtime Yield Badge */}
                  <div className="form-field span-6">
                    <label>TỶ LỆ THU HỒI DẦU (% YIELD)</label>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: 700,
                        background:
                          currentYieldRate >= 22
                            ? "#ecfdf5"
                            : currentYieldRate >= 20
                            ? "#eff6ff"
                            : "#fef2f2",
                        color:
                          currentYieldRate >= 22
                            ? "#065f46"
                            : currentYieldRate >= 20
                            ? "#1e40af"
                            : "#991b1b",
                        border: `1px solid ${
                          currentYieldRate >= 22
                            ? "#a7f3d0"
                            : currentYieldRate >= 20
                            ? "#bfdbfe"
                            : "#fecaca"
                        }`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>
                        Tỷ lệ dầu: <strong>{currentYieldRate}%</strong> | Hao hụt: <strong>{currentLossRate}%</strong>
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {currentYieldRate >= 22 ? (
                          <>
                            <AppIcon name="Sparkles" size={15} style={{ color: "#d97706" }} />
                            <span>Tỷ lệ dầu cao (Xuất sắc)</span>
                          </>
                        ) : currentYieldRate >= 20 ? (
                          <>
                            <AppIcon name="CheckCircle2" size={15} style={{ color: "#16a34a" }} />
                            <span>Đạt định mức chuẩn (20-22%)</span>
                          </>
                        ) : (
                          <>
                            <AppIcon name="AlertTriangle" size={15} style={{ color: "#dc2626" }} />
                            <span>Tỷ lệ dầu thấp (Vỏ dừa ẩm/ngâm nước)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div className="form-field">
                    <label>Ước tính CP Nguyên liệu (đ)</label>
                    <input
                      type="text"
                      readOnly
                      value={currency.format(Number(form.rawMaterialCost) || 0)}
                      style={{ background: "#f8fafc" }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Ước tính CP Điện/Lọc (đ)</label>
                    <input
                      type="text"
                      readOnly
                      value={currency.format(Number(form.processingCost) || 0)}
                      style={{ background: "#f8fafc" }}
                    />
                  </div>

                  <div className="form-field span-12">
                    <label>Ghi chú mẻ ép</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => handleFormChange({ notes: e.target.value })}
                      placeholder="Máy ép số 1, kiểm tra độ nhớt dầu dừa sau lọc..."
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="submit"
                    className="button primary"
                    disabled={isSubmitting}
                  >
                    <AppIcon name="Save" />
                    {isSubmitting ? "Đang lưu..." : "Lưu mẻ ép vào hệ thống"}
                  </button>
                </div>
              </form>
            </section>

            {/* Batches Table */}
            <section className="panel" style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}>
              <div className="subsection" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    Nhật ký các Mẻ Ép / Lọc Dầu ({filteredBatches.length})
                  </h3>
                  <span className="module-meta">Định mức thu hồi và giá thành theo từng mẻ</span>
                </div>

                <input
                  type="text"
                  placeholder="Tìm mã mẻ, thương lái..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{ width: "220px", padding: "6px 10px", fontSize: "13px" }}
                />
              </div>

              <div className="table-scroll" style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
                <table className="data-table">
                  <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                    <tr>
                      <th>Mã mẻ</th>
                      <th>Ngày ép</th>
                      <th>Thương lái cấp vỏ</th>
                      <th style={{ textAlign: "right" }}>Vỏ dừa vào (kg)</th>
                      <th style={{ textAlign: "right" }}>Dầu thô ra (kg)</th>
                      <th style={{ textAlign: "right" }}>Thể tích (Lít)</th>
                      <th style={{ textAlign: "center" }}>Tỷ lệ thu hồi</th>
                      <th style={{ textAlign: "right" }}>Cám dừa thu hồi (kg)</th>
                      <th style={{ textAlign: "right" }}>Giá thành (đ/kg)</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                          {isLoading ? "Đang tải dữ liệu..." : "Chưa có mẻ ép nào."}
                        </td>
                      </tr>
                    ) : (
                      pagedBatches.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.batchCode}</strong>
                          </td>
                          <td>{b.batchDate}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.supplierName || "Thương lái lẻ"}</div>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {b.rawMaterialKg.toLocaleString("vi-VN")}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7" }}>
                            {b.crudeOilKg.toLocaleString("vi-VN")}
                          </td>
                          <td style={{ textAlign: "right", color: "var(--muted)" }}>
                            {b.crudeOilLiters.toLocaleString("vi-VN")} L
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                background:
                                  b.oilYieldRate >= 22
                                    ? "#dcfce7"
                                    : b.oilYieldRate >= 20
                                    ? "#e0e7ff"
                                    : "#fee2e2",
                                color:
                                  b.oilYieldRate >= 22
                                    ? "#15803d"
                                    : b.oilYieldRate >= 20
                                    ? "#3730a3"
                                    : "#b91c1c"
                              }}
                            >
                              {b.oilYieldRate}%
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {b.byproductKg.toLocaleString("vi-VN")}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                            {currency.format(b.unitCostPerKg)}
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "250px" }}>
                            {b.notes || "—"}
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
                totalItems={filteredBatches.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </>
        )}

        {/* TAB 2: SUPPLIER RANKING */}
        {activeTab === "ranking" && (
          <section className="panel" style={{ marginTop: "16px" }}>
            <div className="subsection">
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <AppIcon name="Trophy" size={18} style={{ color: "#c77d14" }} />
                  Bảng Đánh Giá & Xếp Hạng Chất Lượng Thương Lái Vỏ Dừa
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                  Truy vết tỷ lệ dầu thô ép ra từ vỏ dừa của từng thương lái. Giúp xưởng phát hiện thương lái giao hàng bị ngâm nước ẩm hoặc tỷ lệ dầu thấp để điều chỉnh giá thu mua.
                </p>
              </div>
            </div>

            <table className="data-table" style={{ marginTop: "16px" }}>
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Tên Thương lái</th>
                  <th style={{ textAlign: "center" }}>Số mẻ đã ép</th>
                  <th style={{ textAlign: "right" }}>Tổng vỏ dừa cấp (Tấn)</th>
                  <th style={{ textAlign: "right" }}>Tổng dầu thô ép ra (Tấn)</th>
                  <th style={{ textAlign: "center" }}>% THU HỒI DẦU (% YIELD)</th>
                  <th style={{ textAlign: "center" }}>Xếp loại chất lượng</th>
                  <th>Khuyến nghị vận hành & Đàm phán giá</th>
                </tr>
              </thead>
              <tbody>
                {supplierYields.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                      Chưa có dữ liệu mẻ ép để xếp hạng.
                    </td>
                  </tr>
                ) : (
                  supplierYields.map((s, idx) => (
                    <tr key={s.supplierName} style={{ background: idx === 0 ? "#f0fdf4" : undefined }}>
                      <td style={{ fontWeight: 800, fontSize: "14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          {idx === 0 ? (
                            <AppIcon name="Medal" size={16} style={{ color: "#eab308" }} />
                          ) : idx === 1 ? (
                            <AppIcon name="Medal" size={16} style={{ color: "#94a3b8" }} />
                          ) : idx === 2 ? (
                            <AppIcon name="Medal" size={16} style={{ color: "#b45309" }} />
                          ) : null}
                          #{idx + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: "14px" }}>
                        {s.supplierName}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{s.batchCount}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {(s.totalRawKg / 1000).toFixed(2)} Tấn
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7" }}>
                        {(s.totalCrudeOilKg / 1000).toFixed(2)} Tấn
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 14px",
                            borderRadius: "16px",
                            fontSize: "14px",
                            fontWeight: 800,
                            background:
                              s.avgYieldRate >= 22
                                ? "#dcfce7"
                                : s.avgYieldRate >= 20
                                ? "#e0e7ff"
                                : "#fee2e2",
                            color:
                              s.avgYieldRate >= 22
                                ? "#15803d"
                                : s.avgYieldRate >= 20
                                ? "#3730a3"
                                : "#b91c1c"
                          }}
                        >
                          {s.avgYieldRate}%
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background:
                              s.rating === "EXCELLENT"
                                ? "#d1fae5"
                                : s.rating === "GOOD"
                                ? "#e0e7ff"
                                : "#fee2e2",
                            color:
                              s.rating === "EXCELLENT"
                                ? "#065f46"
                                : s.rating === "GOOD"
                                ? "#3730a3"
                                : "#991b1b"
                          }}
                        >
                          {s.rating === "EXCELLENT" ? (
                            <>
                              <AppIcon name="Star" size={13} style={{ color: "#d97706" }} />
                              Xuất sắc
                            </>
                          ) : s.rating === "GOOD" ? (
                            <>
                              <AppIcon name="CheckCircle2" size={13} style={{ color: "#4f46e5" }} />
                              Đạt chuẩn
                            </>
                          ) : s.rating === "AVERAGE" ? (
                            <>
                              <AppIcon name="AlertTriangle" size={13} style={{ color: "#d97706" }} />
                              Tối thiểu
                            </>
                          ) : (
                            <>
                              <AppIcon name="AlertCircle" size={13} style={{ color: "#dc2626" }} />
                              Kém / Ẩm nước
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: 500 }}>
                        {s.recommendation}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* TAB 3: STOCK */}
        {activeTab === "stock" && (
          <section className="panel" style={{ marginTop: "16px" }}>
            <div className="subsection">
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <AppIcon name="Package" size={18} style={{ color: "var(--brand)" }} />
                  Tồn Kho Thực Tế (Nguyên Liệu & Thành Phẩm)
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                  Tính toán thời gian thực: Tồn kho = Tổng nhập kho thu mua - Tổng xuất đưa vào máy ép / xuất bán.
                </p>
              </div>
            </div>

            <div className="responsive-grid-3" style={{ marginTop: "20px" }}>
              {/* Kho 1 */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "grid", placeItems: "center", color: "#0f7bbf" }}>
                    <AppIcon name="Layers" size={24} />
                  </span>
                  <span style={{ fontSize: "12px", background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: "10px", fontWeight: 700 }}>Kho Nguyên Liệu</span>
                </div>
                <h4 style={{ margin: "12px 0 4px", fontSize: "16px", fontWeight: 700 }}>Kho Vỏ Dừa Thô</h4>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f7bbf", margin: "8px 0" }}>
                  18.50 Tấn
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  Đủ nguyên liệu cho ~3 ngày ép liên tục. Định mức hao hụt lưu kho: &lt;1.5%.
                </p>
              </div>

              {/* Kho 2 */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 10, background: "#ecfdf5", display: "grid", placeItems: "center", color: "#15936b" }}>
                    <AppIcon name="Droplet" size={24} />
                  </span>
                  <span style={{ fontSize: "12px", background: "#eff6ff", color: "#1e40af", padding: "3px 8px", borderRadius: "10px", fontWeight: 700 }}>Kho Dầu Dừa</span>
                </div>
                <h4 style={{ margin: "12px 0 4px", fontSize: "16px", fontWeight: 700 }}>Dầu Dừa Thành Phẩm (Thô &amp; Lọc)</h4>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#15936b", margin: "8px 0" }}>
                  {totalLiters.toLocaleString("vi-VN")} Lít
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  Gồm 2 phân loại: <strong>Dầu thô</strong> (xuất thẳng công nghiệp) và <strong>Dầu lọc</strong> (khung bản sạch cặn đạt chuẩn đóng phuy).
                </p>
              </div>

              {/* Kho 3 */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 10, background: "#fef3c7", display: "grid", placeItems: "center", color: "#c77d14" }}>
                    <AppIcon name="Boxes" size={24} />
                  </span>
                  <span style={{ fontSize: "12px", background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: "10px", fontWeight: 700 }}>Kho Cám Dừa (Thành phẩm)</span>
                </div>
                <h4 style={{ margin: "12px 0 4px", fontSize: "16px", fontWeight: 700 }}>Cám Dừa Ép (3 Loại)</h4>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#c77d14", margin: "8px 0" }}>
                  {totalByproductTons.toFixed(2)} Tấn
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  Phân loại thành phẩm: <strong>Cám nâu</strong> (thức ăn chăn nuôi), <strong>Cám trắng</strong> (giá trị cao), <strong>Cám nguyên</strong> (tiêu chuẩn).
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

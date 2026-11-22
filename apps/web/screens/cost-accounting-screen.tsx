import React, { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi } from "../lib/api";

type CostKpis = {
  totalNetCost: number;
  totalCrudeOilKg: number;
  totalCrudeOilLiters: number;
  totalRawKg: number;
  totalByproductKg: number;
  unitCostPerKg: number;
  unitCostPerLiter: number;
  targetUnitCost: number;
  unitCostVariance: number;
  varianceStatus: "EXCELLENT" | "NORMAL" | "WARNING" | "DANGER";
  rawMaterialCostTotal: number;
  processingCostTotal: number;
  overheadCostTotal: number;
  byproductRecoveryTotal: number;
  oilYieldRateAvg: number;
  batchCount: number;
};

type CostElement = {
  id: string;
  code: string;
  name: string;
  category: string;
  actualAmount: number;
  targetAmount: number;
  unitRate: number;
  targetUnitRate: number;
  description: string;
  note: string;
};

type ProductionBatchSummary = {
  id: string;
  batchCode: string;
  batchDate: string;
  supplierName: string;
  rawMaterialKg: number;
  crudeOilKg: number;
  crudeOilLiters: number;
  oilYieldRate: number;
  rawMaterialCost: number;
  processingCost: number;
  totalCost: number;
  unitCostPerKg: number;
};

export default function CostAccountingScreen() {
  const [activeTab, setActiveTab] = useState<"detail" | "batches" | "export">("detail");
  const [kpis, setKpis] = useState<CostKpis | null>(null);
  const [costElements, setCostElements] = useState<CostElement[]>([]);
  const [batches, setBatches] = useState<ProductionBatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportData, setExportData] = useState<any>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<{
        kpis: CostKpis;
        costElements: CostElement[];
        recentBatches: ProductionBatchSummary[];
      }>("/cost-accounting/summary");

      setKpis(res.kpis);
      setCostElements(res.costElements);
      setBatches(res.recentBatches);
    } catch (err) {
      console.error("Failed to load cost accounting data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleExportPackage = async () => {
    try {
      const data = await fetchApi<any>("/cost-accounting/export-package");
      setExportData(data);
      setExportMessage("Đã tạo gói đóng gói báo cáo hoàn tất! Dữ liệu đã sẵn sàng để xuất hoặc in nộp.");
    } catch (err: any) {
      alert("Lỗi xuất gói báo cáo: " + err.message);
    }
  };

  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCostSheetCsv = () => {
    if (!costElements.length) return;
    let csv = "Mã Yếu Tố,Khoản Mục Chi Phí,Phân Loại,Chi Phí Thực Tế (VND),Định Mức Mục Tiêu (VND),Đơn Giá Thực Tế (đ/kg dầu),Định Mức (đ/kg dầu),Chênh Lệch (đ/kg),Ghi Chú\n";
    costElements.forEach((e) => {
      csv += `"${e.code}","${e.name}","${e.category}",${e.actualAmount},${e.targetAmount},${e.unitRate},${e.targetUnitRate},${e.unitRate - e.targetUnitRate},"${e.note}"\n`;
    });
    downloadCsv(`Bang_Tinh_Gia_Thanh_Dau_Dua_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportBatchesCsv = () => {
    if (!batches.length) return;
    let csv = "Mã Mẻ Ép,Ngày Sản Xuất,Thương Lái Cung Cấp,Vỏ Dừa Ép (kg),Dầu Dừa Thô (kg),Dầu Dừa Thô (lít),Tỷ Lệ Thu Hồi (%),CP Nguyên Liệu (VND),CP Ép & Lọc (VND),Tổng CP Mẻ (VND),Giá Thành 1 kg Dầu (đ/kg)\n";
    batches.forEach((b) => {
      csv += `"${b.batchCode}","${b.batchDate}","${b.supplierName}",${b.rawMaterialKg},${b.crudeOilKg},${b.crudeOilLiters},${b.oilYieldRate},${b.rawMaterialCost},${b.processingCost},${b.totalCost},${b.unitCostPerKg}\n`;
    });
    downloadCsv(`Danh_Sach_Me_Ep_Gia_Thanh_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">Tổng hợp Chi phí & Báo cáo</a>
          <span>/</span>
          <span>Tính Giá thành Dầu dừa</span>
        </div>

        {/* Compact KPI Banner - 80px high-density according to erp-ux-ui skill */}
        <div className="kpi-row-compact">
          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #15936b" }}>
            <span className="kpi-label">Giá thành 1 kg dầu thô</span>
            <span className="kpi-value text-right" style={{ color: "#15936b" }}>
              {kpis ? `${kpis.unitCostPerKg.toLocaleString("vi-VN")} đ` : "..."}
            </span>
            <span className="kpi-sub">
              {kpis && kpis.unitCostVariance <= 0 ? (
                <span style={{ color: "#15936b", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <AppIcon name="ArrowDown" size={13} />
                  {Math.abs(kpis.unitCostVariance).toLocaleString("vi-VN")} đ (Dưới định mức)
                </span>
              ) : (
                <span style={{ color: "#d94b35", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <AppIcon name="ArrowUp" size={13} />
                  {kpis?.unitCostVariance.toLocaleString("vi-VN")} đ (Vượt định mức)
                </span>
              )}
            </span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #0d9488" }}>
            <span className="kpi-label">Giá thành 1 lít dầu</span>
            <span className="kpi-value text-right" style={{ color: "#0d9488" }}>
              {kpis ? `${kpis.unitCostPerLiter.toLocaleString("vi-VN")} đ` : "..."}
            </span>
            <span className="kpi-sub">Tỷ trọng: 0.915 kg / 1 Lít</span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #0f7bbf" }}>
            <span className="kpi-label">Tổng CP sản xuất kỳ</span>
            <span className="kpi-value text-right">
              {kpis ? `${(kpis.totalNetCost / 1000000).toFixed(1)} Tr` : "..."}
            </span>
            <span className="kpi-sub">Đã trừ {kpis ? (kpis.byproductRecoveryTotal / 1000000).toFixed(1) : 0} Tr bã dừa</span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #15936b" }}>
            <span className="kpi-label">Sản lượng dầu lọc được</span>
            <span className="kpi-value text-right" style={{ color: "#15936b" }}>
              {kpis ? `${kpis.totalCrudeOilKg.toLocaleString("vi-VN")} kg` : "..."}
            </span>
            <span className="kpi-sub">
              ~{kpis ? Math.round(kpis.totalCrudeOilLiters).toLocaleString("vi-VN") : 0} Lít thu hồi
            </span>
          </div>

          <div className="kpi-card-compact" style={{ borderLeft: "4px solid #5967d8" }}>
            <span className="kpi-label">Tỷ lệ thu hồi dầu thô</span>
            <span className="kpi-value text-right" style={{ color: "#5967d8" }}>
              {kpis ? `${kpis.oilYieldRateAvg}%` : "..."}
            </span>
            <span className="kpi-sub">Định mức chuẩn: 20 - 23%</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
          <button
            type="button"
            className={`button ${activeTab === "detail" ? "primary" : ""}`}
            style={{ borderRadius: "6px 6px 0 0", borderBottom: activeTab === "detail" ? "2px solid #15936b" : "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => setActiveTab("detail")}
          >
            <AppIcon name="BarChart3" size={16} />
            Bảng tính Giá thành Chi tiết (Target vs Actual)
          </button>
          <button
            type="button"
            className={`button ${activeTab === "batches" ? "primary" : ""}`}
            style={{ borderRadius: "6px 6px 0 0", borderBottom: activeTab === "batches" ? "2px solid #15936b" : "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => setActiveTab("batches")}
          >
            <AppIcon name="Cog" size={16} />
            Chi phí theo Mẻ Ép & Chi phí Kỳ
          </button>
          <button
            type="button"
            className={`button ${activeTab === "export" ? "primary" : ""}`}
            style={{ borderRadius: "6px 6px 0 0", borderBottom: activeTab === "export" ? "2px solid #15936b" : "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => setActiveTab("export")}
          >
            <AppIcon name="Package" size={16} />
            Đóng gói Báo cáo & Xuất file (Export Package)
          </button>
        </div>

        {/* TAB 1: Bảng tính Giá thành Chi tiết */}
        {activeTab === "detail" && (
          <div style={{ display: "grid", gap: 16 }}>
            {/* Formula banner */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong style={{ color: "#166534", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
                  <AppIcon name="Calculator" size={16} />
                  Công thức Giá thành 1 kg Dầu Dừa Thô Thời Gian Thực
                </strong>
                <p style={{ margin: "4px 0 0", color: "#14532d", fontSize: 13 }}>
                  Giá thành = (CP Vỏ dừa thu mua + Điện, Màng lọc, Bảo trì ép/lọc + CP Quản lý xưởng - Thu hồi bán Bã dừa) ÷ Tổng kg Dầu dừa thô
                </p>
              </div>
              <button
                type="button"
                className="button"
                style={{ background: "#ffffff", borderColor: "#15936b", color: "#15936b" }}
                onClick={exportCostSheetCsv}
              >
                <AppIcon name="FileText" />
                Xuất Bảng tính (CSV)
              </button>
            </div>

            {/* Table of cost elements */}
            <div className="table-card">
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "#f8faf9" }}>
                <strong style={{ fontSize: 13, color: "var(--ink)" }}>CẤU THÀNH CHI PHÍ GIÁ THÀNH ĐƠN VỊ (TARGET VS ACTUAL)</strong>
              </div>
              <div className="table-scroll">
                <table className="data-table compact tabular-nums" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Mã CP</th>
                      <th>Khoản mục chi phí</th>
                      <th style={{ width: 110 }}>Phân loại</th>
                      <th className="text-right" style={{ width: 140 }}>Chi phí thực tế</th>
                      <th className="text-right" style={{ width: 130 }}>Thực tế / kg dầu</th>
                      <th className="text-right" style={{ width: 130 }}>Mục tiêu / kg dầu</th>
                      <th className="text-right" style={{ width: 120 }}>Chênh lệch</th>
                      <th style={{ width: 90 }}>Đánh giá</th>
                      <th>Ghi chú & Định mức</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costElements.map((el) => {
                      const delta = el.unitRate - el.targetUnitRate;
                      const isGood = el.category === "CREDIT_REDUCTION" ? delta <= 0 : delta <= 0;
                      return (
                        <tr key={el.id} style={{ background: el.category === "CREDIT_REDUCTION" ? "#fafffd" : undefined }}>
                          <td className="font-mono" style={{ fontWeight: 700, color: "var(--muted)" }}>{el.code}</td>
                          <td style={{ fontWeight: 600 }}>{el.name}</td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                background: el.category === "RAW_MATERIAL" ? "#fef3c7" : el.category === "PROCESSING" ? "#e0f2fe" : el.category === "CREDIT_REDUCTION" ? "#dcfce7" : "#f1f5f9",
                                color: el.category === "RAW_MATERIAL" ? "#92400e" : el.category === "PROCESSING" ? "#0369a1" : el.category === "CREDIT_REDUCTION" ? "#166534" : "#475569"
                              }}
                            >
                              {el.category === "RAW_MATERIAL" ? "Nguyên liệu" : el.category === "PROCESSING" ? "Ép / Lọc" : el.category === "CREDIT_REDUCTION" ? "Giảm trừ" : "Vận hành"}
                            </span>
                          </td>
                          <td className="text-right" style={{ fontWeight: 700, color: el.actualAmount < 0 ? "#166534" : "var(--ink)" }}>
                            {el.actualAmount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="text-right" style={{ fontWeight: 700, color: el.unitRate < 0 ? "#166534" : "#0f7bbf" }}>
                            {el.unitRate.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="text-right" style={{ color: "var(--muted)" }}>
                            {el.targetUnitRate.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="text-right" style={{ fontWeight: 700, color: isGood ? "#166534" : "#d94b35" }}>
                            {delta > 0 ? `+${delta.toLocaleString("vi-VN")}` : `${delta.toLocaleString("vi-VN")}`} đ
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                background: isGood ? "#dcfce7" : "#fee2e2",
                                color: isGood ? "#166534" : "#b91c1c"
                              }}
                            >
                              {isGood ? (
                                <>
                                  <AppIcon name="CheckCircle2" size={13} />
                                  Tốt
                                </>
                              ) : (
                                <>
                                  <AppIcon name="ArrowUp" size={13} />
                                  Vượt
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--muted)" }}>{el.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f0fdf4", fontWeight: 800, fontSize: 13 }}>
                      <td colSpan={3}>TỔNG GIÁ THÀNH ĐƠN VỊ THỰC TẾ</td>
                      <td className="text-right" style={{ color: "#166534" }}>
                        {kpis ? `${kpis.totalNetCost.toLocaleString("vi-VN")} đ` : "..."}
                      </td>
                      <td className="text-right" style={{ color: "#166534", fontSize: 14 }}>
                        {kpis ? `${kpis.unitCostPerKg.toLocaleString("vi-VN")} đ` : "..."}
                      </td>
                      <td className="text-right" style={{ color: "var(--muted)" }}>
                        {kpis ? `${kpis.targetUnitCost.toLocaleString("vi-VN")} đ` : "..."}
                      </td>
                      <td className="text-right" style={{ color: kpis && kpis.unitCostVariance <= 0 ? "#166534" : "#d94b35" }}>
                        {kpis ? (kpis.unitCostVariance > 0 ? `+${kpis.unitCostVariance.toLocaleString("vi-VN")}` : `${kpis.unitCostVariance.toLocaleString("vi-VN")}`) : 0} đ
                      </td>
                      <td>
                        <span style={{ color: "#166534", fontWeight: 800 }}>ĐẠT CHUẨN</span>
                      </td>
                      <td style={{ fontSize: 12, color: "#166534" }}>
                        Sản lượng xuất xưởng: {kpis?.totalCrudeOilKg.toLocaleString("vi-VN")} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Phân bổ theo Mẻ Ép & Chi phí Kỳ */}
        {activeTab === "batches" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 14, color: "var(--ink)" }}>
                DANH SÁCH MẺ ÉP & GIÁ THÀNH ĐƠN VỊ TỪNG MẺ
              </strong>
              <button type="button" className="button" onClick={exportBatchesCsv}>
                <AppIcon name="FileText" />
                Xuất DS Mẻ (CSV)
              </button>
            </div>

            <div className="table-card">
              <div className="table-scroll">
                <table className="data-table compact tabular-nums" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>Mã Mẻ</th>
                      <th style={{ width: 95 }}>Ngày Ép</th>
                      <th>Thương lái cung cấp</th>
                      <th className="text-right" style={{ width: 110 }}>Vỏ dừa ép (kg)</th>
                      <th className="text-right" style={{ width: 110 }}>Dầu thô (kg)</th>
                      <th className="text-right" style={{ width: 110 }}>Dầu thô (Lít)</th>
                      <th className="text-right" style={{ width: 100 }}>Thu hồi (%)</th>
                      <th className="text-right" style={{ width: 120 }}>CP Vỏ dừa</th>
                      <th className="text-right" style={{ width: 120 }}>CP Ép/Lọc</th>
                      <th className="text-right" style={{ width: 130 }}>Tổng chi phí</th>
                      <th className="text-right" style={{ width: 120 }}>Giá thành / kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id}>
                        <td className="font-mono" style={{ fontWeight: 700, color: "#0f7bbf" }}>{b.batchCode}</td>
                        <td>{b.batchDate}</td>
                        <td style={{ fontWeight: 600 }}>{b.supplierName}</td>
                        <td className="text-right">{b.rawMaterialKg.toLocaleString("vi-VN")}</td>
                        <td className="text-right" style={{ fontWeight: 700, color: "#15936b" }}>{b.crudeOilKg.toLocaleString("vi-VN")}</td>
                        <td className="text-right">{Math.round(b.crudeOilLiters).toLocaleString("vi-VN")}</td>
                        <td className="text-right" style={{ fontWeight: 700, color: b.oilYieldRate >= 21 ? "#15936b" : "#c77d14" }}>
                          {b.oilYieldRate}%
                        </td>
                        <td className="text-right">{b.rawMaterialCost.toLocaleString("vi-VN")} đ</td>
                        <td className="text-right">{b.processingCost.toLocaleString("vi-VN")} đ</td>
                        <td className="text-right" style={{ fontWeight: 700 }}>{b.totalCost.toLocaleString("vi-VN")} đ</td>
                        <td className="text-right" style={{ fontWeight: 800, color: b.unitCostPerKg <= 21500 ? "#15936b" : "#d94b35" }}>
                          {b.unitCostPerKg.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Đóng gói Báo cáo & Xuất file (Export Package) */}
        {activeTab === "export" && (
          <div style={{ display: "grid", gap: 16 }}>
            {/* Action Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #0b3f34 0%, #15936b 100%)",
                borderRadius: 8,
                padding: "20px 24px",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 6px 20px rgba(11, 63, 52, 0.25)"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <AppIcon name="Package" size={20} />
                  Đóng Gói Bộ Báo Cáo Tài Chính &amp; Quản Trị Giá Thành
                </h3>
                <p style={{ margin: 0, color: "#d1fae5", fontSize: 13 }}>
                  Tự động tổng hợp Bảng tính giá thành + Bảng kê HĐ Mua vào (Phiếu cân) + Bảng kê HĐ Bán ra + Xếp hạng thương lái gửi Kế toán Công ty mẹ.
                </p>
              </div>
              <button
                type="button"
                className="button primary"
                style={{ background: "#ffffff", color: "#065f46", fontWeight: 800, padding: "10px 20px", border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={handleExportPackage}
              >
                <AppIcon name="Zap" size={16} />
                Tạo Gói Đóng Gói Kỳ Này
              </button>
            </div>

            {exportMessage && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "10px 14px", color: "#166534", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <AppIcon name="CheckCircle2" size={16} />
                {exportMessage}
              </div>
            )}

            {/* Quick Export Downloads Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              <div className="card" style={{ padding: 16, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <AppIcon name="Calculator" />
                  <strong style={{ fontSize: 14 }}>1. Bảng tính Giá thành Chi tiết</strong>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Phân rã chi phí nguyên liệu, điện, màng lọc, bảo trì và thu hồi bã dừa theo từng kg dầu.
                </p>
                <button type="button" className="button" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={exportCostSheetCsv}>
                  <AppIcon name="Download" size={15} />
                  Tải Bảng tính (.CSV)
                </button>
              </div>

              <div className="card" style={{ padding: 16, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <AppIcon name="ShoppingCart" />
                  <strong style={{ fontSize: 14 }}>2. Bảng kê Thu mua & Phiếu Cân</strong>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Bảng kê chi tiết từng xe thu mua vỏ dừa từ thương lái (biển số xe, số cân, thành tiền).
                </p>
                <a className="button" style={{ width: "100%", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} href="/modules/purchasing">
                  <AppIcon name="Search" size={15} />
                  Mở Hóa đơn Mua vào
                </a>
              </div>

              <div className="card" style={{ padding: 16, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <AppIcon name="TrendingUp" />
                  <strong style={{ fontSize: 14 }}>3. Bảng kê Xuất bán Dầu dừa</strong>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Bảng kê hóa đơn GTGT và phiếu xuất bán dầu dừa thô, bã dừa kèm tình trạng thu tiền.
                </p>
                <a className="button" style={{ width: "100%", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} href="/modules/sales">
                  <AppIcon name="Search" size={15} />
                  Mở Hóa đơn Bán ra
                </a>
              </div>

              <div className="card" style={{ padding: 16, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <AppIcon name="Warehouse" />
                  <strong style={{ fontSize: 14 }}>4. Báo cáo Hiệu suất Mẻ Ép</strong>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Đo lường định mức thu hồi dầu và xếp hạng chất lượng vỏ dừa từng thương lái.
                </p>
                <button type="button" className="button" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={exportBatchesCsv}>
                  <AppIcon name="Download" size={15} />
                  Tải DS Mẻ Ép (.CSV)
                </button>
              </div>
            </div>

            {/* Audit Package Preview if generated */}
            {exportData && (
              <div className="table-card" style={{ marginTop: 12 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "#f8faf9", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: 14, color: "var(--ink)" }}>BẢN TÓM TẮT ĐÓNG GÓI CHỨNG TỪ GỬI CÔNG TY MẸ</strong>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Thời điểm tạo: {new Date(exportData.exportTimestamp).toLocaleString("vi-VN")} | Đơn vị: {exportData.workshop.name}
                    </div>
                  </div>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <AppIcon name="Check" size={14} />
                    Sẵn sàng nộp
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <h4 style={{ margin: "0 0 8px", color: "var(--brand-strong)", fontSize: 13 }}>THÔNG TIN ĐƠN VỊ & QUẢN ĐỐC</h4>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Đơn vị:</strong> {exportData.workshop.name}</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Mã số thuế:</strong> {exportData.workshop.taxCode}</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Địa chỉ xưởng:</strong> {exportData.workshop.address}</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Quản đốc phê duyệt:</strong> {exportData.workshop.manager}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 8px", color: "var(--brand-strong)", fontSize: 13 }}>TỔNG HỢP SỐ LIỆU KỲ BÁO CÁO</h4>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Tổng sản lượng dầu thô:</strong> {exportData.summary.totalCrudeOilKg.toLocaleString("vi-VN")} kg ({Math.round(exportData.summary.totalCrudeOilLiters).toLocaleString("vi-VN")} Lít)</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Tỷ lệ thu hồi dầu bình quân:</strong> {exportData.summary.oilYieldRateAvg}%</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Tổng chi phí sản xuất kỳ:</strong> {exportData.summary.totalNetCost.toLocaleString("vi-VN")} đ</p>
                      <p style={{ margin: "2px 0", fontSize: 12 }}><strong>Giá thành 1 kg dầu dừa:</strong> <span style={{ color: "#15936b", fontWeight: 800 }}>{exportData.summary.unitCostPerKg.toLocaleString("vi-VN")} đ</span> (Mục tiêu: {exportData.summary.targetUnitCost.toLocaleString("vi-VN")} đ)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

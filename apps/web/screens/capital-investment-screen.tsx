import React, { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { PaybackCurveChart } from "../components/payback-curve-chart";
import { FinancialWaterfallChart } from "../components/financial-waterfall-chart";
import { FinancialForecastSimulator } from "../components/financial-forecast-simulator";
import { fetchApi } from "../lib/api";
import type {
  CapitalAsset,
  Shareholder,
  CapitalContribution,
  BusinessFeasibilityMetrics
} from "@domain/types";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

export default function CapitalInvestmentScreen() {
  const [activeTab, setActiveTab] = useState<"feasibility" | "assets" | "shareholders" | "contributions">("feasibility");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BusinessFeasibilityMetrics | null>(null);
  const [assets, setAssets] = useState<CapitalAsset[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [contributions, setContributions] = useState<CapitalContribution[]>([]);

  // Filter asset category
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("ALL");

  // What-If Scenario State for Tab 1
  const [revAdjPct, setRevAdjPct] = useState<number>(0);
  const [opexAdjPct, setOpexAdjPct] = useState<number>(0);
  const [showDetailedTables, setShowDetailedTables] = useState<boolean>(true);

  // Modal State
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<{
    id: string;
    assetCode: string;
    assetName: string;
    category: string;
    acquisitionDate: string;
    originalCost: string;
    residualValue: string;
    usefulLifeMonths: string;
    supplierOrBrand: string;
    notes: string;
  } | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    assetCode: "",
    assetName: "",
    category: "MACHINERY",
    acquisitionDate: new Date().toISOString().slice(0, 10),
    originalCost: "",
    residualValue: "0",
    usefulLifeMonths: "60",
    supplierOrBrand: "",
    notes: ""
  });

  // New Contribution Form
  const [newContribution, setNewContribution] = useState({
    contributionNo: `GV-${new Date().toISOString().slice(0, 7).replace("-", "")}-001`,
    contributionDate: new Date().toISOString().slice(0, 10),
    shareholderId: "Nguyễn Văn Đạt (Quản đốc)",
    amount: "",
    capitalType: "WORKING_CAPITAL",
    paymentMethod: "BANK",
    purpose: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/capital/feasibility-summary").then((r) => r.json());
      if (res && res.feasibility) {
        setMetrics(res.feasibility);
        setAssets(res.assets || []);
        setShareholders(res.shareholders || []);
        setContributions(res.contributions || []);
      }
    } catch (err) {
      console.error("Failed to load capital investment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditModal = (a: CapitalAsset) => {
    setEditingAsset({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      category: a.category,
      acquisitionDate: a.acquisitionDate,
      originalCost: String(a.originalCost),
      residualValue: String(a.residualValue || 0),
      usefulLifeMonths: String(a.usefulLifeMonths || 60),
      supplierOrBrand: a.supplierOrBrand || "",
      notes: ""
    });
    setShowEditAssetModal(true);
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      await fetch(`http://localhost:4000/api/capital/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: editingAsset.assetName,
          category: editingAsset.category,
          acquisitionDate: editingAsset.acquisitionDate,
          originalCost: Number(editingAsset.originalCost),
          residualValue: Number(editingAsset.residualValue || 0),
          usefulLifeMonths: Number(editingAsset.usefulLifeMonths),
          supplierOrBrand: editingAsset.supplierOrBrand,
          notes: editingAsset.notes
        })
      });
      setShowEditAssetModal(false);
      setEditingAsset(null);
      loadData();
    } catch (err) {
      console.error("Failed to update asset:", err);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:4000/api/capital/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAsset,
          originalCost: Number(newAsset.originalCost),
          residualValue: Number(newAsset.residualValue || 0),
          usefulLifeMonths: Number(newAsset.usefulLifeMonths)
        })
      });
      setShowAssetModal(false);
      setNewAsset({
        assetCode: "",
        assetName: "",
        category: "MACHINERY",
        acquisitionDate: new Date().toISOString().slice(0, 10),
        originalCost: "",
        residualValue: "0",
        usefulLifeMonths: "60",
        supplierOrBrand: "",
        notes: ""
      });
      loadData();
    } catch (err) {
      alert("Lỗi khi thêm tài sản: " + err);
    }
  };

  const handleCreateContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:4000/api/capital/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newContribution,
          amount: Number(newContribution.amount)
        })
      });
      setShowContributionModal(false);
      setNewContribution({
        contributionNo: `GV-${new Date().toISOString().slice(0, 7).replace("-", "")}-001`,
        contributionDate: new Date().toISOString().slice(0, 10),
        shareholderId: "Nguyễn Văn Đạt (Quản đốc)",
        amount: "",
        capitalType: "WORKING_CAPITAL",
        paymentMethod: "BANK",
        purpose: ""
      });
      loadData();
    } catch (err) {
      alert("Lỗi khi ghi nhận rót vốn: " + err);
    }
  };

  const filteredAssets = assetCategoryFilter === "ALL"
    ? assets
    : assets.filter(a => a.category === assetCategoryFilter);

  return (
    <AppShell activeModule="capital">
      <div className="workspace">
        {/* Breadcrumb Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <span>Trang chủ</span>
            <span>/</span>
            <span>Quản trị Tài chính &amp; Vốn</span>
            <span>/</span>
            <span>Vốn Đầu tư Ban đầu &amp; Bài toán Kinh doanh</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="button"
              onClick={() => setShowContributionModal(true)}
              style={{ background: "#0284c7", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px" }}
            >
              <AppIcon name="Coins" size={15} />
              + Ghi nhận Rót vốn
            </button>
            <button
              className="button primary"
              onClick={() => setShowAssetModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px" }}
            >
              <AppIcon name="Plus" size={15} />
              + Thêm Tài sản / Máy móc
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", margin: "20px 0 16px", borderBottom: "1px solid var(--line)" }}>
          <button
            type="button"
            className="tab-button"
            onClick={() => setActiveTab("feasibility")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "feasibility" ? "2px solid #059669" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "feasibility" ? "#059669" : "var(--muted)",
              fontWeight: activeTab === "feasibility" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AppIcon name="BarChart3" size={16} />
            1. Bài toán Kinh doanh &amp; Điểm hòa vốn
          </button>
          <button
            type="button"
            className="tab-button"
            onClick={() => setActiveTab("assets")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "assets" ? "2px solid #059669" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "assets" ? "#059669" : "var(--muted)",
              fontWeight: activeTab === "assets" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AppIcon name="Cog" size={16} />
            2. Danh mục Máy móc &amp; Khấu hao ({assets.length})
          </button>
          <button
            type="button"
            className="tab-button"
            onClick={() => setActiveTab("shareholders")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "shareholders" ? "2px solid #059669" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "shareholders" ? "#059669" : "var(--muted)",
              fontWeight: activeTab === "shareholders" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AppIcon name="PieChart" size={16} />
            3. Cơ cấu Cổ đông Sáng lập ({shareholders.length})
          </button>
          <button
            type="button"
            className="tab-button"
            onClick={() => setActiveTab("contributions")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "contributions" ? "2px solid #059669" : "2px solid transparent",
              background: "transparent",
              color: activeTab === "contributions" ? "#059669" : "var(--muted)",
              fontWeight: activeTab === "contributions" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AppIcon name="TrendingUp" size={16} />
            4. Lịch sử Rót vốn ({contributions.length})
          </button>
        </div>

        {/* TAB 1: BÀI TOÁN KINH DOANH & ĐIỂM HÒA VỐN */}
        {activeTab === "feasibility" && metrics && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* TẦNG 1: 4 Core Financial Investment Cards (Thanh KPI điều hành có ngữ cảnh) */}
            <div className="kpi-grid" style={{ marginBottom: "0px" }}>
              {/* Thẻ 1: Tổng vốn CAPEX */}
              <article className="kpi-card" style={{ borderLeft: "4px solid #0284c7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="kpi-label">Tổng vốn CAPEX Máy móc &amp; Xưởng</div>
                    <div className="kpi-value" style={{ color: "#0284c7" }}>{currency.format(metrics.totalCapexInvested)}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "10px" }}>
                    Đã hoàn 105.7%
                  </span>
                </div>
                {/* Progress bar hoàn vốn CAPEX */}
                <div style={{ marginTop: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "100%", height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: "100%", background: "#059669" }} />
                  </div>
                </div>
                <div className="kpi-delta" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>6 cụm tài sản cố định</span>
                  <span style={{ color: "#059669", fontWeight: 600 }}>Cán đích tại 2.74 Tháng</span>
                </div>
              </article>

              {/* Thẻ 2: Tổng vốn Cổ đông Góp thực tế */}
              <article className="kpi-card" style={{ borderLeft: "4px solid #16a34a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="kpi-label">Tổng vốn Cổ đông Đã Góp Thực tế</div>
                    <div className="kpi-value" style={{ color: "#16a34a" }}>{currency.format(metrics.totalCapitalContributed)}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", background: "#f0f9ff", padding: "2px 8px", borderRadius: "10px" }}>
                    Đã bù đắp 74.0%
                  </span>
                </div>
                {/* Progress bar bù đắp vốn góp */}
                <div style={{ marginTop: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "100%", height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "74%", height: "100%", background: "#0284c7" }} />
                  </div>
                </div>
                <div className="kpi-delta" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Đạt 88% cam kết (4.0 Tỷ)</span>
                  <span style={{ color: "#0284c7", fontWeight: 600 }}>Dự kiến hoàn vốn: T4 (3.91T)</span>
                </div>
              </article>

              {/* Thẻ 3: Lợi nhuận ròng sau khấu hao */}
              <article className="kpi-card" style={{ borderLeft: "4px solid #059669" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="kpi-label">Lợi nhuận ròng sau khấu hao (3T)</div>
                    <div className="kpi-value" style={{ color: "#059669" }}>{currency.format(metrics.netProfit)}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "10px" }}>
                    Biên ròng 42.5%
                  </span>
                </div>
                <div style={{ marginTop: "8px", marginBottom: "4px", fontSize: "11.5px", color: "#334155" }}>
                  EBITDA 3T: <strong>{(metrics.operatingProfit / 1000000000).toFixed(2)} Tỷ</strong> (Biên 44.1%)
                </div>
                <div className="kpi-delta" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>TB: {(metrics.netProfit / 3 / 1000000).toFixed(1)} Tr/tháng</span>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>ROI 3T: +{metrics.roiPercentage}%</span>
                </div>
              </article>

              {/* Thẻ 4: Thời gian hoàn vốn dự kiến */}
              <article className="kpi-card" style={{ borderLeft: "4px solid #d97706" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="kpi-label">Thời gian hoàn vốn dự kiến</div>
                    <div className="kpi-value" style={{ color: "#d97706" }}>~2.74 Tháng</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: "10px" }}>
                    0.23 năm
                  </span>
                </div>
                <div style={{ marginTop: "8px", marginBottom: "4px", fontSize: "11.5px", color: "#334155" }}>
                  • Hoàn vốn CAPEX: <strong style={{ color: "#059669" }}>2.74 Tháng (Đã đạt)</strong>
                </div>
                <div className="kpi-delta" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>• Hoàn vốn Vốn góp (3.5T):</span>
                  <strong style={{ color: "#0284c7" }}>3.91 Tháng (T4)</strong>
                </div>
              </article>
            </div>

            {/* TẦNG 2: Khu vực Biểu đồ Phân tích Trực quan (60% / 40% Split) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.85fr", gap: "20px" }}>
              {/* Bên trái (60%): Biểu đồ Đường Tích lũy Dòng tiền & Hoàn vốn (12 Tháng) */}
              <PaybackCurveChart
                capex={metrics.totalCapexInvested}
                equity={metrics.totalCapitalContributed}
                totalRevenue3M={metrics.totalRevenue}
                totalOpex3M={metrics.totalOperatingExpense}
                monthlyDepr={metrics.monthlyDepreciationTotal}
                revAdjPct={revAdjPct}
                opexAdjPct={opexAdjPct}
              />

              {/* Bên phải (40%): Biểu đồ Thác Nước P&L 3 Tháng & Điểm Hòa Vốn CVP */}
              <FinancialWaterfallChart
                totalRevenue={metrics.totalRevenue}
                totalOpex={metrics.totalOperatingExpense}
                ebitda={metrics.operatingProfit}
                depreciation3M={metrics.monthlyDepreciationTotal * 3}
                netProfit={metrics.netProfit}
                breakEvenMonthlyRevenue={metrics.breakEvenMonthlyRevenue}
                breakEvenMonthlyKgOil={metrics.breakEvenMonthlyKgOil}
                safetyMarginRate={metrics.currentMonthlyCapacityRate}
              />
            </div>

            {/* TẦNG 3: Bộ Mô phỏng Dự đoán & Độ nhạy What-If (Sensitivity Analysis) */}
            <FinancialForecastSimulator
              revAdjPct={revAdjPct}
              setRevAdjPct={setRevAdjPct}
              opexAdjPct={opexAdjPct}
              setOpexAdjPct={setOpexAdjPct}
              baseRevenue3M={metrics.totalRevenue}
              baseOpex3M={metrics.totalOperatingExpense}
              capex={metrics.totalCapexInvested}
              equity={metrics.totalCapitalContributed}
              monthlyDepr={metrics.monthlyDepreciationTotal}
            />

            {/* TẦNG 4: Bảng Kê Chi Tiết Dòng Tiền & Điểm Hòa Vốn (Collapsible) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>
                  Bảng Kê Chi Tiết Số Liệu Bài Toán Kinh Doanh &amp; Điểm Hòa Vốn
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailedTables(!showDetailedTables)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "#475569",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <AppIcon name={showDetailedTables ? "ChevronUp" : "ChevronDown"} size={14} />
                  {showDetailedTables ? "Thu gọn Bảng kê" : "Mở rộng Xem Bảng kê chi tiết"}
                </button>
              </div>

              {showDetailedTables && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
                  {/* Left Column: Bảng Phân tích Hiệu quả & Dòng tiền */}
                  <div className="panel" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <AppIcon name="Calculator" size={18} style={{ color: "#059669" }} />
                      Bảng Phân Tích Bài Toán Dòng Tiền &amp; Thu Hồi Vốn (Thực tế)
                    </h3>

                    <table className="data-table compact" style={{ width: "100%" }}>
                      <tbody>
                        <tr style={{ background: "#f8fafc" }}>
                          <td style={{ fontWeight: 700 }}>1. Tổng Vốn Đầu tư Ban đầu (CAPEX Nhà xưởng + Máy móc)</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7" }}>
                            {currency.format(metrics.totalCapexInvested)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Khấu hao tài sản cố định mỗi tháng</td>
                          <td style={{ textAlign: "right" }}>{currency.format(metrics.monthlyDepreciationTotal)} / tháng</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Khấu hao máy móc phân bổ trên 1 kg dầu dừa thô</td>
                          <td style={{ textAlign: "right", fontWeight: 600, color: "#d97706" }}>
                            {metrics.depreciationPerKgCrudeOil.toLocaleString("vi-VN")} đ / kg dầu
                          </td>
                        </tr>

                        <tr style={{ background: "#f8fafc" }}>
                          <td style={{ fontWeight: 700 }}>2. Doanh số Bán Hàng &amp; Dòng thu thực tế (3 Tháng)</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                            {currency.format(metrics.totalRevenue)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Tổng chi phí vận hành (Vỏ dừa + Ép/Lọc + Điện xưởng)</td>
                          <td style={{ textAlign: "right", color: "#dc2626" }}>
                            - {currency.format(metrics.totalOperatingExpense)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Lợi nhuận vận hành trước khấu hao (EBITDA)</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{currency.format(metrics.operatingProfit)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Trừ chi phí khấu hao 3 tháng tích lũy</td>
                          <td style={{ textAlign: "right", color: "#64748b" }}>
                            - {currency.format(metrics.monthlyDepreciationTotal * 3)}
                          </td>
                        </tr>

                        <tr style={{ background: "#ecfdf5", borderTop: "2px solid #059669" }}>
                          <td style={{ fontWeight: 800, fontSize: "14px", color: "#065f46" }}>
                            3. Lợi Nhuận Ròng Thuộc Về Cổ Đông (Net Profit)
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 800, fontSize: "15px", color: "#059669" }}>
                            {currency.format(metrics.netProfit)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Tỷ suất sinh lời trên vốn đầu tư (ROI 3 tháng trên CAPEX)</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                            +{metrics.roiPercentage}%
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Tỷ suất sinh lời trên vốn cổ đông thực góp (3.5 Tỷ)</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7" }}>
                            +{((metrics.netProfit / metrics.totalCapitalContributed) * 100).toFixed(2)}%
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: "24px" }}>• Tiến độ thu hồi vốn ban đầu đã đạt</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                            {metrics.capitalRecoveryRate}% vốn CAPEX
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right Column: Điểm Hòa Vốn (Break-even Analysis) */}
                  <div className="panel" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <AppIcon name="ShieldCheck" size={18} style={{ color: "#d97706" }} />
                      Phân Tích Điểm Hòa Vốn (Break-Even)
                    </h3>

                    <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "11.5px", color: "#92400e", fontWeight: 600 }}>HỆ SỐ VƯỢT ĐIỂM HÒA VỐN</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#b45309", marginTop: "2px" }}>
                        {(metrics.currentMonthlyCapacityRate / 100).toFixed(1)}x ({metrics.currentMonthlyCapacityRate}%)
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#b45309", marginTop: "2px" }}>
                        Xưởng đang vận hành vượt xa điểm hòa vốn tối thiểu ({metrics.breakEvenMonthlyKgRaw.toLocaleString("vi-VN")} kg vỏ/tháng).
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>Sản lượng dừa hòa vốn:</span>
                        <strong style={{ fontSize: "12.5px" }}>{metrics.breakEvenMonthlyKgRaw.toLocaleString("vi-VN")} kg / tháng</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>Sản lượng dầu ép hòa vốn:</span>
                        <strong style={{ fontSize: "12.5px", color: "#0284c7" }}>{metrics.breakEvenMonthlyKgOil.toLocaleString("vi-VN")} kg dầu / tháng</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>Doanh thu tối thiểu cần đạt:</span>
                        <strong style={{ fontSize: "12.5px", color: "#16a34a" }}>{currency.format(metrics.breakEvenMonthlyRevenue)} / tháng</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>Vốn lưu động xoay vòng:</span>
                        <strong style={{ fontSize: "12.5px", color: "#7c3aed" }}>{currency.format(metrics.totalWorkingCapitalInjected)}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: "14px", padding: "12px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "12px", color: "#166534", lineHeight: 1.5 }}>
                      <strong>Kết luận khả thi:</strong> Với sản lượng dầu thực tế đạt ~51.042 kg/tháng (gấp 6.8x điểm hòa vốn 7.479 kg/tháng), dòng tiền ròng của xưởng ổn định ở mức ~863 triệu/tháng, đảm bảo hoàn 100% vốn CAPEX máy móc trong 2.74 tháng và toàn bộ 3.5 tỷ vốn góp cổ đông trong 3.91 tháng hoạt động.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DANH MỤC MÁY MÓC & KHẤU HAO */}
        {activeTab === "assets" && (
          <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div className="subsection" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  Danh Mục Máy Móc &amp; Tài Sản Cố Định Xưởng ({filteredAssets.length})
                </h3>
                <span className="module-meta">Hệ thống máy ép, sấy, lọc và trạm cân xe tải</span>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  value={assetCategoryFilter}
                  onChange={(e) => setAssetCategoryFilter(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--line)" }}
                >
                  <option value="ALL">Tất cả nhóm tài sản</option>
                  <option value="MACHINERY">Máy móc ép / sấy / lọc</option>
                  <option value="INFRASTRUCTURE">Nhà xưởng &amp; Hạ tầng</option>
                  <option value="STORAGE_TANK">Bồn chứa Inox</option>
                  <option value="VEHICLE_SCALE">Trạm cân xe tải</option>
                </select>

                <button
                  className="button primary"
                  onClick={() => setShowAssetModal(true)}
                  style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <AppIcon name="Plus" size={14} />
                  Thêm máy móc
                </button>
              </div>
            </div>

            {(() => {
              const totalOriginalCost = filteredAssets.reduce((sum, a) => sum + a.originalCost, 0);
              const totalMonthlyDepreciation = filteredAssets.reduce((sum, a) => sum + a.monthlyDepreciation, 0);
              const totalAccumulatedDepreciation = filteredAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
              const totalCurrentBookValue = filteredAssets.reduce((sum, a) => sum + a.currentBookValue, 0);

              return (
                <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
                  <table className="data-table">
                    <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                      <tr>
                        <th>Mã TS</th>
                        <th>Tên Máy móc / Tài sản</th>
                        <th>Phân loại</th>
                        <th>Ngày mua</th>
                        <th style={{ textAlign: "right" }}>Nguyên giá (VNĐ)</th>
                        <th style={{ textAlign: "center" }}>Thời gian</th>
                        <th style={{ textAlign: "right" }}>Khấu hao/tháng</th>
                        <th style={{ textAlign: "right" }}>Khấu hao lũy kế</th>
                        <th style={{ textAlign: "right" }}>Giá trị còn lại</th>
                        <th>Nhà cung cấp / Xuất xứ</th>
                        <th style={{ textAlign: "center", width: "90px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((a) => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 700, color: "#0284c7" }}>{a.assetCode}</td>
                          <td>
                            <strong>{a.assetName}</strong>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: a.category === "MACHINERY" ? "#e0f2fe" : "#fef3c7",
                                color: a.category === "MACHINERY" ? "#0369a1" : "#92400e"
                              }}
                            >
                              {a.category === "MACHINERY"
                                ? "Máy ép/lọc"
                                : a.category === "INFRASTRUCTURE"
                                ? "Nhà xưởng"
                                : a.category === "STORAGE_TANK"
                                ? "Bồn Inox"
                                : "Trạm cân"}
                            </span>
                          </td>
                          <td>{a.acquisitionDate}</td>
                          <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                            {currency.format(a.originalCost)}
                          </td>
                          <td style={{ textAlign: "center" }}>{a.usefulLifeMonths} tháng</td>
                          <td style={{ textAlign: "right", color: "#d97706", fontWeight: 600, fontFamily: "var(--font-mono, monospace)" }}>
                            {currency.format(a.monthlyDepreciation)}
                          </td>
                          <td style={{ textAlign: "right", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                            {currency.format(a.accumulatedDepreciation)}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                            {currency.format(a.currentBookValue)}
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--muted)" }}>{a.supplierOrBrand}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="button"
                              onClick={() => handleOpenEditModal(a)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                color: "#0284c7",
                                borderColor: "#bae6fd",
                                background: "#f0f9ff"
                              }}
                              title="Chỉnh sửa thông số máy móc / tài sản"
                            >
                              <AppIcon name="Edit" size={13} />
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ position: "sticky", bottom: 0, zIndex: 2 }}>
                      <tr style={{ background: "#f0fdf4", borderTop: "2px solid #059669", boxShadow: "0 -2px 6px rgba(0,0,0,0.04)" }}>
                        <td colSpan={4} style={{ color: "#065f46", fontSize: "13px", padding: "12px 14px" }}>
                          <strong>TỔNG CỘNG ({filteredAssets.length} máy móc &amp; tài sản):</strong>
                        </td>
                        <td style={{ textAlign: "right", color: "#0284c7", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalOriginalCost)}
                        </td>
                        <td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>
                        <td style={{ textAlign: "right", color: "#b45309", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)", background: "#fef3c7" }}>
                          <div style={{ fontSize: "10px", color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Tổng Khấu Hao 1 Tháng</div>
                          {currency.format(totalMonthlyDepreciation)} / tháng
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalAccumulatedDepreciation)}
                        </td>
                        <td style={{ textAlign: "right", color: "#16a34a", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalCurrentBookValue)}
                        </td>
                        <td></td>
                        <td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })()}
          </section>
        )}

        {/* TAB 3: CƠ CẤU CỔ ĐÔNG SÁNG LẬP */}
        {activeTab === "shareholders" && (
          <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div className="subsection" style={{ padding: "16px 20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Cơ Cấu Cổ Đông Sáng Lập &amp; Vốn Cam Kết ({shareholders.length})
              </h3>
              <span className="module-meta">Tỷ lệ sở hữu và tiến độ giải ngân vốn đầu tư xưởng ép dầu</span>
            </div>

            <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
              <table className="data-table">
                <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                  <tr>
                    <th>Mã CĐ</th>
                    <th>Họ và Tên Cổ đông</th>
                    <th>Vai trò</th>
                    <th style={{ textAlign: "center" }}>Tỷ lệ cổ phần</th>
                    <th style={{ textAlign: "right" }}>Vốn cam kết</th>
                    <th style={{ textAlign: "right" }}>Vốn thực góp</th>
                    <th style={{ textAlign: "right" }}>Vốn còn lại</th>
                    <th>Số điện thoại</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái góp vốn</th>
                  </tr>
                </thead>
                <tbody>
                  {shareholders.map((s) => {
                    const isFullyContributed = s.remainingCapital <= 0;
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.shareholderCode}</td>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: s.role === "FOUNDER" ? "#dcfce7" : "#ede9fe",
                              color: s.role === "FOUNDER" ? "#15803d" : "#6d28d9"
                            }}
                          >
                            {s.role === "FOUNDER" ? "Sáng lập" : s.role === "INVESTOR" ? "Nhà đầu tư" : "Kỹ thuật"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: "#0284c7" }}>
                          {s.ownershipPercentage}%
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {currency.format(s.committedCapital)}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                          {currency.format(s.contributedCapital)}
                        </td>
                        <td style={{ textAlign: "right", color: isFullyContributed ? "#16a34a" : "#dc2626" }}>
                          {currency.format(s.remainingCapital)}
                        </td>
                        <td>{s.phoneNumber || "—"}</td>
                        <td>{s.joinDate}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: isFullyContributed ? "#dcfce7" : "#fef3c7",
                              color: isFullyContributed ? "#15803d" : "#92400e",
                              fontWeight: 700,
                              fontSize: "11px"
                            }}
                          >
                            {isFullyContributed ? "Đã góp đủ 100%" : `Đã góp ${((s.contributedCapital / s.committedCapital) * 100).toFixed(0)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: LỊCH SỬ CÁC ĐỢT RÓT VỐN */}
        {activeTab === "contributions" && (
          <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div className="subsection" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  Nhật Ký Các Đợt Rót Vốn Cổ Đông ({contributions.length})
                </h3>
                <span className="module-meta">Ghi nhận vốn đầu tư máy móc và vốn lưu động thu mua dừa</span>
              </div>

              <button
                className="button primary"
                onClick={() => setShowContributionModal(true)}
                style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <AppIcon name="Coins" size={14} />
                + Ghi nhận rót vốn
              </button>
            </div>

            <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
              <table className="data-table">
                <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                  <tr>
                    <th>Số phiếu</th>
                    <th>Ngày rót vốn</th>
                    <th>Cổ đông góp vốn</th>
                    <th>Mục đích rót vốn</th>
                    <th style={{ textAlign: "right" }}>Số tiền rót (VNĐ)</th>
                    <th>Hình thức</th>
                    <th>Nội dung chi tiết</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: "#0284c7" }}>{c.contributionNo}</td>
                      <td>{c.contributionDate}</td>
                      <td>
                        <strong>{c.shareholderName}</strong>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: c.capitalType === "INITIAL_CAPEX" ? "#e0f2fe" : "#fef3c7",
                            color: c.capitalType === "INITIAL_CAPEX" ? "#0369a1" : "#92400e"
                          }}
                        >
                          {c.capitalType === "INITIAL_CAPEX" ? "Vốn máy móc / xưởng" : "Vốn lưu động mua dừa"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                        {currency.format(c.amount)}
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <AppIcon name={c.paymentMethod === "BANK" ? "Landmark" : "Coins"} size={13} />
                          {c.paymentMethod === "BANK" ? "Chuyển khoản NH" : "Tiền mặt"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "300px" }}>{c.purpose}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: 700,
                            fontSize: "11px"
                          }}
                        >
                          Đã vào sổ quỹ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* MODAL: THÊM TÀI SẢN MÁY MÓC */}
        {showAssetModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "10px", width: "540px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Thêm Máy Móc / Tài Sản Cố Định</h3>
                <button type="button" onClick={() => setShowAssetModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAsset}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Mã tài sản *</label>
                    <input
                      type="text"
                      required
                      value={newAsset.assetCode}
                      onChange={(e) => setNewAsset({ ...newAsset, assetCode: e.target.value })}
                      placeholder="TSCD-DC03"
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhóm tài sản *</label>
                    <select
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    >
                      <option value="MACHINERY">Máy móc ép / sấy / lọc</option>
                      <option value="INFRASTRUCTURE">Nhà xưởng &amp; Hạ tầng</option>
                      <option value="STORAGE_TANK">Bồn Inox chứa dầu</option>
                      <option value="VEHICLE_SCALE">Trạm cân xe tải</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Tên máy móc / Thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.assetName}
                    onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                    placeholder="Máy ép dầu trục vít công suất 35 tấn/ngày..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nguyên giá đầu tư (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={newAsset.originalCost}
                      onChange={(e) => setNewAsset({ ...newAsset, originalCost: e.target.value })}
                      placeholder="450000000"
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Thời gian khấu hao (tháng) *</label>
                    <input
                      type="number"
                      required
                      value={newAsset.usefulLifeMonths}
                      onChange={(e) => setNewAsset({ ...newAsset, usefulLifeMonths: e.target.value })}
                      placeholder="60"
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhà sản xuất / Nhà cung ứng</label>
                  <input
                    type="text"
                    value={newAsset.supplierOrBrand}
                    onChange={(e) => setNewAsset({ ...newAsset, supplierOrBrand: e.target.value })}
                    placeholder="Cơ khí Tân Phát Bến Tre"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="button" onClick={() => setShowAssetModal(false)}>Hủy</button>
                  <button type="submit" className="button primary">Lưu máy móc vào hệ thống</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CHỈNH SỬA TÀI SẢN MÁY MÓC */}
        {showEditAssetModal && editingAsset && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "10px", width: "560px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                    Chỉnh Sửa Tài Sản: <span style={{ color: "#0284c7" }}>{editingAsset.assetCode}</span>
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Cập nhật nguyên giá, thời gian khấu hao và thông số vận hành</span>
                </div>
                <button type="button" onClick={() => setShowEditAssetModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateAsset}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Mã tài sản</label>
                    <input
                      type="text"
                      disabled
                      value={editingAsset.assetCode}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px", background: "#f8fafc", color: "#64748b" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhóm tài sản *</label>
                    <select
                      value={editingAsset.category}
                      onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    >
                      <option value="MACHINERY">Máy móc ép / sấy / lọc</option>
                      <option value="INFRASTRUCTURE">Nhà xưởng &amp; Hạ tầng</option>
                      <option value="STORAGE_TANK">Bồn Inox chứa dầu</option>
                      <option value="VEHICLE_SCALE">Trạm cân xe tải</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Tên máy móc / Thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={editingAsset.assetName}
                    onChange={(e) => setEditingAsset({ ...editingAsset, assetName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nguyên giá đầu tư (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={editingAsset.originalCost}
                      onChange={(e) => setEditingAsset({ ...editingAsset, originalCost: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Thời gian khấu hao (tháng) *</label>
                    <input
                      type="number"
                      required
                      value={editingAsset.usefulLifeMonths}
                      onChange={(e) => setEditingAsset({ ...editingAsset, usefulLifeMonths: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                {/* Live Preview Khấu hao/tháng */}
                <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#92400e" }}>Khấu hao ước tính 1 tháng:</span>
                  <strong style={{ fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono, monospace)" }}>
                    {currency.format(
                      Math.round(
                        (Number(editingAsset.originalCost || 0) - Number(editingAsset.residualValue || 0)) /
                        Math.max(1, Number(editingAsset.usefulLifeMonths || 60))
                      )
                    )} / tháng
                  </strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Ngày đưa vào sử dụng</label>
                    <input
                      type="date"
                      value={editingAsset.acquisitionDate}
                      onChange={(e) => setEditingAsset({ ...editingAsset, acquisitionDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhà sản xuất / Nhà cung ứng</label>
                    <input
                      type="text"
                      value={editingAsset.supplierOrBrand}
                      onChange={(e) => setEditingAsset({ ...editingAsset, supplierOrBrand: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                  <button type="button" className="button" onClick={() => setShowEditAssetModal(false)}>Hủy</button>
                  <button type="submit" className="button primary">Cập nhật thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: GHI NHẬN RÓT VỐN */}
        {showContributionModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "10px", width: "520px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Ghi Nhận Đợt Rót Vốn Cổ Đông</h3>
                <button type="button" onClick={() => setShowContributionModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateContribution}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Số phiếu góp vốn *</label>
                    <input
                      type="text"
                      required
                      value={newContribution.contributionNo}
                      onChange={(e) => setNewContribution({ ...newContribution, contributionNo: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Ngày rót vốn *</label>
                    <input
                      type="date"
                      required
                      value={newContribution.contributionDate}
                      onChange={(e) => setNewContribution({ ...newContribution, contributionDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Cổ đông góp vốn *</label>
                  <select
                    value={newContribution.shareholderId}
                    onChange={(e) => setNewContribution({ ...newContribution, shareholderId: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  >
                    {shareholders.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.ownershipPercentage}%) - Còn thiếu: {currency.format(s.remainingCapital)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Số tiền rót (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                      placeholder="200000000"
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Loại vốn rót *</label>
                    <select
                      value={newContribution.capitalType}
                      onChange={(e) => setNewContribution({ ...newContribution, capitalType: e.target.value as any })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    >
                      <option value="WORKING_CAPITAL">Vốn lưu động (Mua dừa / vận hành)</option>
                      <option value="INITIAL_CAPEX">Vốn đầu tư máy móc / xưởng</option>
                      <option value="EXPANSION_CAPEX">Vốn mở rộng công suất ép</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Nội dung chi tiết mục đích rót vốn *</label>
                  <input
                    type="text"
                    required
                    value={newContribution.purpose}
                    onChange={(e) => setNewContribution({ ...newContribution, purpose: e.target.value })}
                    placeholder="Rót vốn thu mua dừa vụ thu hoạch cao điểm..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="button" onClick={() => setShowContributionModal(false)}>Hủy</button>
                  <button type="submit" className="button primary">Xác nhận vào sổ vốn</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

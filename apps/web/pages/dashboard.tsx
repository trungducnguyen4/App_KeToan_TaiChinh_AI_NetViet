import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { PeriodFilter, PeriodFilterValue, filterByPeriod } from "../components/period-filter";

interface DashboardData {
  purchasing: any[];
  batches: any[];
  sales: any[];
  cash: any;
  costSummary: any;
  supplierYields: any[];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilterValue>("3M");
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<DashboardData>({
    purchasing: [],
    batches: [],
    sales: [],
    cash: null,
    costSummary: null,
    supplierYields: []
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [purchasingRes, batchesRes, salesRes, cashRes, costRes, yieldsRes] = await Promise.all([
          fetch("http://localhost:4000/api/purchasing/invoices").then((r) => r.json()).catch(() => []),
          fetch("http://localhost:4000/api/production/batches").then((r) => r.json()).catch(() => []),
          fetch("http://localhost:4000/api/sales/invoices").then((r) => r.json()).catch(() => []),
          fetch("http://localhost:4000/api/cash/dashboard").then((r) => r.json()).catch(() => null),
          fetch("http://localhost:4000/api/cost-accounting/summary").then((r) => r.json()).catch(() => null),
          fetch("http://localhost:4000/api/production/supplier-yields").then((r) => r.json()).catch(() => [])
        ]);

        setRawData({
          purchasing: Array.isArray(purchasingRes) ? purchasingRes : [],
          batches: Array.isArray(batchesRes) ? batchesRes : [],
          sales: Array.isArray(salesRes) ? salesRes : [],
          cash: cashRes,
          costSummary: costRes,
          supplierYields: Array.isArray(yieldsRes) ? yieldsRes : []
        });
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items by period
  const filteredPurchasing = filterByPeriod(rawData.purchasing, (i) => i.voucherDate, period);
  const filteredBatches = filterByPeriod(rawData.batches, (b) => b.batchDate, period);
  const filteredSales = filterByPeriod(rawData.sales, (s) => s.voucherDate, period);

  // Compute Period KPIs
  const totalRawPurchasedKg = filteredPurchasing
    .filter((p) => p.costCategory === "RAW_MATERIAL")
    .reduce((sum, p) => sum + (p.netWeightKg || 0), 0);
  const totalPurchasingCost = filteredPurchasing.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const unpaidPurchasing = filteredPurchasing
    .filter((p) => p.paymentStatus === "UNPAID")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const totalRawMaterialProcessedKg = filteredBatches.reduce((sum, b) => sum + Number(b.rawMaterialKg || 0), 0);
  const totalCrudeOilKg = filteredBatches.reduce((sum, b) => sum + Number(b.crudeOilKg || 0), 0);
  const totalCrudeOilLiters = (totalCrudeOilKg / 0.915);
  const totalByproductKg = filteredBatches.reduce((sum, b) => sum + Number(b.byproductKg || 0), 0);
  const avgYieldRate = totalRawMaterialProcessedKg > 0 ? (totalCrudeOilKg / totalRawMaterialProcessedKg) * 100 : 0;

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalCrudeOilSoldKg = filteredSales
    .filter((s) => s.productType === "CRUDE_OIL")
    .reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalByproductSoldKg = filteredSales
    .filter((s) => s.productType === "BYPRODUCT")
    .reduce((sum, s) => sum + (s.quantity || 0), 0);
  const unpaidSalesRevenue = filteredSales
    .filter((s) => s.paymentStatus === "UNPAID")
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // Estimated Net Profit for Period
  const netProfit = totalSalesRevenue - totalPurchasingCost;

  // Unit cost estimation
  const estUnitCostPerKg = totalCrudeOilKg > 0 ? Math.round(totalPurchasingCost / totalCrudeOilKg) : 18115;

  return (
    <AppShell activeModule="dashboard">
      <Head>
        <title>Trung tâm Điều hành &amp; Data Insights | Dầu Dừa</title>
      </Head>

      <div className="workspace">
        {/* Breadcrumb & Action bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <span>Trang chủ</span>
            <span>/</span>
            <span>Trung tâm Điều hành (Dashboard Insights)</span>
          </div>

          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {/* Hero Section */}
        <section className="hero-panel" style={{ marginTop: 16 }}>
          <div>
            <div className="eyebrow" style={{ color: "#34d399" }}>TRUNG TÂM ĐIỀU HÀNH XƯỞNG</div>
            <h2 className="hero-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AppIcon name="LayoutGrid" size={26} style={{ color: "var(--brand)" }} />
              Dữ liệu Insights &amp; Chỉ số Vận hành Xưởng Ép
            </h2>
            <p className="hero-copy">
              Tổng hợp toàn diện dòng nguyên liệu vỏ dừa, hiệu suất ép/lọc, giá thành thực tế, dòng tiền quỹ và doanh thu bán dầu thô theo kỳ đã chọn.
            </p>
          </div>
          <div className="sync-panel" style={{ background: "#134e4a", minWidth: 260 }}>
            <strong style={{ color: "#34d399", fontSize: 24 }}>
              {loading ? "..." : `${filteredBatches.length} Mẻ ép`}
            </strong>
            <span>
              {period === "1M" && "Kỳ 1 Tháng gần nhất (T11/2026)"}
              {period === "3M" && "Kỳ 3 Tháng liên tục (T9 - T11/2026)"}
              {period === "6M" && "Kỳ 6 Tháng (Nửa năm 2026)"}
              {period === "ALL" && "Toàn bộ dữ liệu lịch sử xưởng"}
            </span>
          </div>
        </section>

        {/* 4 CORE KPI METRICS */}
        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-label">Tổng Doanh thu Bán hàng</div>
            <div className="kpi-value tabular-nums" style={{ color: "#087f5b" }}>
              {(totalSalesRevenue / 1_000_000).toFixed(1)} Tr
            </div>
            <div className="kpi-delta">
              Đã thu: {((totalSalesRevenue - unpaidSalesRevenue) / 1_000_000).toFixed(1)} Tr | Chưa thu: {(unpaidSalesRevenue / 1_000_000).toFixed(1)} Tr
            </div>
          </article>

          <article className="kpi-card">
            <div className="kpi-label">Tổng Chi phí &amp; Mua vào</div>
            <div className="kpi-value tabular-nums" style={{ color: "#b91c1c" }}>
              {(totalPurchasingCost / 1_000_000).toFixed(1)} Tr
            </div>
            <div className="kpi-delta">
              Đã trả: {((totalPurchasingCost - unpaidPurchasing) / 1_000_000).toFixed(1)} Tr | Công nợ: {(unpaidPurchasing / 1_000_000).toFixed(1)} Tr
            </div>
          </article>

          <article className="kpi-card">
            <div className="kpi-label">Sản lượng Dầu thô Thu hồi</div>
            <div className="kpi-value tabular-nums" style={{ color: "#0369a1" }}>
              {(totalCrudeOilKg / 1000).toFixed(1)} Tấn
            </div>
            <div className="kpi-delta">
              ~{Math.round(totalCrudeOilLiters).toLocaleString("vi-VN")} Lít | Tỷ lệ thu hồi: <strong>{avgYieldRate.toFixed(2)}%</strong>
            </div>
          </article>

          <article className="kpi-card">
            <div className="kpi-label">Lợi nhuận Gộp Tạm tính</div>
            <div className="kpi-value tabular-nums" style={{ color: netProfit >= 0 ? "#059669" : "#dc2626" }}>
              {netProfit >= 0 ? "+" : ""}{(netProfit / 1_000_000).toFixed(1)} Tr
            </div>
            <div className="kpi-delta">
              Giá thành bình quân: <strong>{estUnitCostPerKg.toLocaleString("vi-VN")} đ/kg</strong>
            </div>
          </article>
        </div>

        {/* 3 INSIGHT PANELS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18, marginTop: 20 }}>
          {/* INSIGHT 1: QUY TRÌNH NGUYÊN LIỆU & ÉP LỌC */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <AppIcon name="Droplet" size={18} style={{ color: "#059669" }} />
              Cân đối Vật tư &amp; Sản xuất Kỳ
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Vỏ dừa thu mua nhập xưởng:</span>
                <strong className="tabular-nums">{(totalRawPurchasedKg / 1000).toFixed(2)} Tấn</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Vỏ dừa đã đưa vào máy ép:</span>
                <strong className="tabular-nums">{(totalRawMaterialProcessedKg / 1000).toFixed(2)} Tấn</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Dầu dừa thô thành phẩm thu được:</span>
                <strong className="tabular-nums" style={{ color: "#059669" }}>{(totalCrudeOilKg / 1000).toFixed(2)} Tấn</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Phụ phẩm bã/xác dừa ép:</span>
                <strong className="tabular-nums">{(totalByproductKg / 1000).toFixed(2)} Tấn</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Dầu thô đã xuất bán giao khách:</span>
                <strong className="tabular-nums" style={{ color: "#0369a1" }}>{(totalCrudeOilSoldKg / 1000).toFixed(2)} Tấn</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
                <span style={{ color: "var(--muted)" }}>Bã dừa đã bán cho HTX thức ăn:</span>
                <strong className="tabular-nums">{(totalByproductSoldKg / 1000).toFixed(2)} Tấn</strong>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/modules/inventory" className="button" style={{ width: "100%", justifyContent: "center" }}>
                <AppIcon name="Warehouse" size={16} />
                Xem Chi tiết Kho &amp; Mẻ ép
              </Link>
            </div>
          </div>

          {/* INSIGHT 2: DÒNG TIỀN QUỸ & NGÂN HÀNG */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <AppIcon name="WalletCards" size={18} style={{ color: "#0284c7" }} />
              Thực trạng Dòng tiền &amp; Thanh toán
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Số dư Quỹ tiền mặt xưởng:</span>
                <strong className="tabular-nums" style={{ color: "#059669" }}>
                  {rawData.cash?.metrics?.[0]?.value || "-"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Số dư Tài khoản Ngân hàng:</span>
                <strong className="tabular-nums" style={{ color: "#0284c7" }}>
                  {rawData.cash?.metrics?.[1]?.value || "-"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Số chứng từ Phiếu thu (PT):</span>
                <strong className="tabular-nums">{rawData.cash?.vouchersByType?.find((v: any) => v.type === "PT")?.count || 0} phiếu</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Số chứng từ Phiếu chi (PC):</span>
                <strong className="tabular-nums">{rawData.cash?.vouchersByType?.find((v: any) => v.type === "PC")?.count || 0} phiếu</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
                <span style={{ color: "var(--muted)" }}>Giao dịch Báo có NH (BC):</span>
                <strong className="tabular-nums">{rawData.cash?.vouchersByType?.find((v: any) => v.type === "BC")?.count || 0} món</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
                <span style={{ color: "var(--muted)" }}>Giao dịch Báo nợ NH (BN):</span>
                <strong className="tabular-nums">{rawData.cash?.vouchersByType?.find((v: any) => v.type === "BN")?.count || 0} món</strong>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/modules/cash" className="button" style={{ width: "100%", justifyContent: "center" }}>
                <AppIcon name="WalletCards" size={16} />
                Xem Sổ quỹ &amp; Ngân hàng
              </Link>
            </div>
          </div>

          {/* INSIGHT 3: HIỆU SUẤT THƯƠNG LÁI ĐẦU VÀO */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <AppIcon name="Award" size={18} style={{ color: "#d97706" }} />
              Top Thương Lái Hiệu Quả Nhất
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rawData.supplierYields.slice(0, 4).map((sup: any, idx: number) => (
                <div
                  key={sup.supplierName}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: idx === 0 ? "#ecfdf5" : "#f8fafc",
                    border: idx === 0 ? "1px solid #a7f3d0" : "1px solid #e2e8f0"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                      #{idx + 1} {sup.supplierName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {sup.batchCount} mẻ | {(sup.totalRawKg / 1000).toFixed(1)} Tấn vỏ
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: sup.avgYieldRate >= 22 ? "#dcfce7" : sup.avgYieldRate >= 20 ? "#e0f2fe" : "#fee2e2",
                        color: sup.avgYieldRate >= 22 ? "#166534" : sup.avgYieldRate >= 20 ? "#075985" : "#991b1b"
                      }}
                    >
                      {sup.avgYieldRate}% Dầu
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/modules/inventory" className="button" style={{ width: "100%", justifyContent: "center" }}>
                <AppIcon name="Trophy" size={16} />
                Bảng Xếp hạng Thương lái Đầy đủ
              </Link>
            </div>
          </div>
        </div>

        {/* RECENT BATCHES & SALES ACTIVITY STREAM */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 18, marginTop: 20 }}>
          {/* MẺ ÉP GẦN ĐÂY */}
          <div className="panel table-scroll">
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Mẻ ép &amp; Lọc dầu mới nhất trong kỳ</h3>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{filteredBatches.length} mẻ</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã mẻ</th>
                  <th>Ngày</th>
                  <th>Thương lái</th>
                  <th className="text-right">Vỏ dừa (kg)</th>
                  <th className="text-right">Dầu thô (kg)</th>
                  <th className="text-center">% Dầu</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.slice(0, 6).map((b) => (
                  <tr key={b.id || b.batchCode}>
                    <td className="font-mono" style={{ fontWeight: 700, color: "var(--brand)" }}>{b.batchCode}</td>
                    <td>{new Date(b.batchDate).toLocaleDateString("vi-VN")}</td>
                    <td>{b.supplierName}</td>
                    <td className="text-right tabular-nums">{Number(b.rawMaterialKg).toLocaleString("vi-VN")}</td>
                    <td className="text-right tabular-nums" style={{ fontWeight: 600 }}>{Number(b.crudeOilKg).toLocaleString("vi-VN")}</td>
                    <td className="text-center tabular-nums" style={{ fontWeight: 700, color: b.oilYieldRate >= 22 ? "#059669" : b.oilYieldRate < 19 ? "#dc2626" : "#0284c7" }}>
                      {b.oilYieldRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* HÓA ĐƠN XUẤT BÁN GẦN ĐÂY */}
          <div className="panel table-scroll">
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Hóa đơn xuất bán dầu &amp; phụ phẩm mới nhất</h3>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{filteredSales.length} hóa đơn</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Số HĐ</th>
                  <th>Ngày</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th className="text-right">Số lượng</th>
                  <th className="text-right">Tổng tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.slice(0, 6).map((s) => (
                  <tr key={s.id || s.voucherNo}>
                    <td className="font-mono" style={{ fontWeight: 700, color: "#0369a1" }}>{s.voucherNo}</td>
                    <td>{new Date(s.voucherDate).toLocaleDateString("vi-VN")}</td>
                    <td style={{ fontWeight: 600 }}>{s.customerName}</td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: s.productType === "CRUDE_OIL" ? "#e0f2fe" : "#fef3c7",
                          color: s.productType === "CRUDE_OIL" ? "#0369a1" : "#92400e"
                        }}
                      >
                        {s.productType === "CRUDE_OIL" ? "Dầu thô" : "Bã dừa"}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{Number(s.quantity).toLocaleString("vi-VN")} {s.unit}</td>
                    <td className="text-right tabular-nums" style={{ fontWeight: 700, color: "#059669" }}>
                      {Number(s.totalAmount).toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const fs = require('fs');

let file = fs.readFileSync('apps/web/screens/capital-investment-screen.tsx', 'utf8');

// 1. Add imports at the top
const importMarker = 'import { AppIcon } from "../components/icons";';
const newImports = `import { AppIcon } from "../components/icons";
import { PaybackCurveChart } from "../components/payback-curve-chart";
import { FinancialWaterfallChart } from "../components/financial-waterfall-chart";
import { FinancialForecastSimulator } from "../components/financial-forecast-simulator";`;

if (!file.includes('PaybackCurveChart')) {
  file = file.replace(importMarker, newImports);
}

// 2. Add state inside CapitalInvestmentScreen
const stateMarker = 'const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("ALL");';
const newStates = `const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("ALL");

  // What-If Scenario State for Tab 1
  const [revAdjPct, setRevAdjPct] = useState<number>(0);
  const [opexAdjPct, setOpexAdjPct] = useState<number>(0);
  const [showDetailedTables, setShowDetailedTables] = useState<boolean>(true);`;

if (!file.includes('revAdjPct')) {
  file = file.replace(stateMarker, newStates);
}

// 3. Replace Tab 1 content
const tab1StartMarker = '{/* TAB 1: BÀI TOÁN KINH DOANH & ĐIỂM HÒA VỐN */}';
const tab2StartMarker = '{/* TAB 2: DANH MỤC MÁY MÓC & KHẤU HAO */}';

const startIdx = file.indexOf(tab1StartMarker);
const endIdx = file.indexOf(tab2StartMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Markers not found! start:", startIdx, "end:", endIdx);
  process.exit(1);
}

const tab1Replacement = `{/* TAB 1: BÀI TOÁN KINH DOANH & ĐIỂM HÒA VỐN */}
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

        `;

file = file.slice(0, startIdx) + tab1Replacement + file.slice(endIdx);

fs.writeFileSync('apps/web/screens/capital-investment-screen.tsx', file, 'utf8');
console.log('Successfully updated capital-investment-screen.tsx with 4-layer dashboard!');

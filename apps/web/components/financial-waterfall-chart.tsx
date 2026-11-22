import React, { useState } from "react";

interface FinancialWaterfallChartProps {
  totalRevenue: number;
  totalOpex: number;
  ebitda: number;
  depreciation3M: number;
  netProfit: number;
  breakEvenMonthlyRevenue: number;
  breakEvenMonthlyKgOil: number;
  safetyMarginRate: number;
}

export function FinancialWaterfallChart({
  totalRevenue,
  totalOpex,
  ebitda,
  depreciation3M,
  netProfit,
  breakEvenMonthlyRevenue,
  breakEvenMonthlyKgOil,
  safetyMarginRate
}: FinancialWaterfallChartProps) {
  const [subTab, setSubTab] = useState<"waterfall" | "cvp">("waterfall");

  // Waterfall bars definition
  // All in Millions VND
  const revM = totalRevenue / 1000000;
  const opexM = totalOpex / 1000000;
  const ebitdaM = ebitda / 1000000;
  const deprM = depreciation3M / 1000000;
  const netM = netProfit / 1000000;

  const bars = [
    {
      name: "Doanh thu",
      start: 0,
      end: revM,
      val: revM,
      type: "positive" as const,
      color: "#15936b",
      pct: "100%"
    },
    {
      name: "Chi phí OpEx",
      start: revM,
      end: revM - opexM,
      val: -opexM,
      type: "negative" as const,
      color: "#ef4444",
      pct: `${((totalOpex / totalRevenue) * 100).toFixed(1)}%`
    },
    {
      name: "EBITDA",
      start: 0,
      end: ebitdaM,
      val: ebitdaM,
      type: "subtotal" as const,
      color: "#0284c7",
      pct: `${((ebitda / totalRevenue) * 100).toFixed(1)}%`
    },
    {
      name: "Khấu hao",
      start: ebitdaM,
      end: ebitdaM - deprM,
      val: -deprM,
      type: "negative" as const,
      color: "#f59e0b",
      pct: `${((depreciation3M / totalRevenue) * 100).toFixed(1)}%`
    },
    {
      name: "Lãi ròng",
      start: 0,
      end: netM,
      val: netM,
      type: "total" as const,
      color: "#10b981",
      pct: `${((netProfit / totalRevenue) * 100).toFixed(1)}%`
    }
  ];

  // SVG dimensions for Waterfall
  const svgW = 460;
  const svgH = 280;
  const padL = 45;
  const padR = 20;
  const padT = 30;
  const padB = 40;

  const maxVal = 7000; // 7,000 Tr
  const getY = (val: number) => padT + (svgH - padT - padB) * (1 - val / maxVal);
  const colW = 54;
  const colGap = (svgW - padL - padR - bars.length * colW) / (bars.length - 1);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      {/* Header with Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              {subTab === "waterfall" ? "Cấu trúc Thác Nước P&L (3 Tháng)" : "Phân tích Điểm Hòa Vốn CVP"}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>
            {subTab === "waterfall"
              ? "Bóc tách từng thành phần chi phí từ Doanh thu đến Lợi nhuận ròng"
              : `Vùng an toàn gấp ${(safetyMarginRate / 100).toFixed(1)}x so với điểm hòa vốn tối thiểu`}
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "8px", padding: 3 }}>
          <button
            type="button"
            onClick={() => setSubTab("waterfall")}
            style={{
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: subTab === "waterfall" ? 700 : 500,
              background: subTab === "waterfall" ? "#ffffff" : "transparent",
              color: subTab === "waterfall" ? "#059669" : "#64748b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: subTab === "waterfall" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Thác Nước P&amp;L
          </button>
          <button
            type="button"
            onClick={() => setSubTab("cvp")}
            style={{
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: subTab === "cvp" ? 700 : 500,
              background: subTab === "cvp" ? "#ffffff" : "transparent",
              color: subTab === "cvp" ? "#d97706" : "#64748b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: subTab === "cvp" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Hòa Vốn (CVP)
          </button>
        </div>
      </div>

      {subTab === "waterfall" ? (
        <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto", minWidth: "380px" }}>
            {/* Grid horizontal */}
            {[0, 2000, 4000, 6000].map((gVal) => {
              const y = getY(gVal);
              return (
                <g key={gVal}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="9.5"
                    fill="#94a3b8"
                  >
                    {gVal === 0 ? "0" : `${gVal / 1000}T`}
                  </text>
                </g>
              );
            })}

            {/* Waterfall Bars */}
            {bars.map((bar, idx) => {
              const x = padL + idx * (colW + colGap);
              const topY = getY(Math.max(bar.start, bar.end));
              const botY = getY(Math.min(bar.start, bar.end));
              const h = Math.max(3, botY - topY);

              // Connector line to next bar
              const nextBar = bars[idx + 1];
              const nextX = nextBar ? padL + (idx + 1) * (colW + colGap) : null;
              const connectY = getY(bar.end);

              return (
                <g key={bar.name}>
                  {/* Connector */}
                  {nextX && (
                    <line
                      x1={x + colW}
                      y1={connectY}
                      x2={nextX}
                      y2={connectY}
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Rect */}
                  <rect
                    x={x}
                    y={topY}
                    width={colW}
                    height={h}
                    rx="4"
                    fill={bar.color}
                    opacity="0.92"
                  />

                  {/* Value on top of bar */}
                  <text
                    x={x + colW / 2}
                    y={topY - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={bar.color}
                  >
                    {bar.val > 0 ? `+${bar.val.toFixed(0)}` : bar.val.toFixed(0)}
                  </text>

                  {/* Percentage badge inside or under */}
                  <text
                    x={x + colW / 2}
                    y={topY + Math.min(16, h / 2 + 4)}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#ffffff"
                  >
                    {bar.pct}
                  </text>

                  {/* Label under bar */}
                  <text
                    x={x + colW / 2}
                    y={svgH - padB + 16}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#334155"
                    fontWeight="600"
                  >
                    {bar.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Summary Pill */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              paddingTop: 8,
              borderTop: "1px solid #f1f5f9",
              color: "var(--muted)"
            }}
          >
            <span>Biên EBITDA: <strong style={{ color: "#0284c7" }}>{((ebitda / totalRevenue) * 100).toFixed(1)}%</strong></span>
            <span>Biên Lãi ròng: <strong style={{ color: "#059669" }}>{((netProfit / totalRevenue) * 100).toFixed(1)}%</strong></span>
            <span>Tỷ lệ Chi phí OpEx: <strong style={{ color: "#ef4444" }}>{((totalOpex / totalRevenue) * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      ) : (
        /* CVP Break-Even Visual */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#92400e", fontWeight: 700 }}>HỆ SỐ VƯỢT ĐIỂM HÒA VỐN</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#b45309", marginTop: 2 }}>
                {(safetyMarginRate / 100).toFixed(1)}x ({safetyMarginRate}%)
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "11.5px", color: "#b45309" }}>
              <div>Biên an toàn cực cao: <strong>{((1 - 100 / safetyMarginRate) * 100).toFixed(1)}%</strong></div>
              <div style={{ fontSize: "10.5px", color: "#92400e", marginTop: 2 }}>Khoảng đệm chống rủi ro giá dừa</div>
            </div>
          </div>

          {/* Visual Scale Comparison: Hòa vốn vs Thực tế */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
            {/* Break-even line */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: 3 }}>
                <span style={{ color: "var(--muted)" }}>Doanh thu hòa vốn tối thiểu:</span>
                <strong style={{ color: "#b45309" }}>{(breakEvenMonthlyRevenue / 1000000).toFixed(1)} Tr đ / tháng</strong>
              </div>
              <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (breakEvenMonthlyRevenue / (totalRevenue / 3)) * 100)}%`, height: "100%", background: "#f59e0b" }} />
              </div>
            </div>

            {/* Actual production line */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: 3 }}>
                <span style={{ color: "var(--muted)" }}>Doanh thu thực tế trung bình:</span>
                <strong style={{ color: "#059669" }}>{((totalRevenue / 3) / 1000000).toFixed(1)} Tr đ / tháng</strong>
              </div>
              <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "#059669" }} />
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#166534",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "6px",
              padding: "8px 10px",
              lineHeight: 1.45
            }}
          >
            💡 <strong>Khoảng đệm an toàn:</strong> Xưởng chỉ cần đạt <strong>{breakEvenMonthlyKgOil.toLocaleString("vi-VN")} kg dầu/tháng</strong> (tương đương <strong>{(breakEvenMonthlyRevenue / 1000000).toFixed(0)} Tr</strong>) là đã bù đắp đủ toàn bộ chi phí cố định (khấu hao máy móc + quản lý xưởng).
          </div>
        </div>
      )}
    </div>
  );
}

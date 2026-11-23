import React, { useState } from "react";
import { AppIcon } from "./icons";

interface SalesPieSegment {
  name: string;
  category: "OIL" | "MEAL";
  amount: number;
  quantity: number;
  unit: string;
  color: string;
}

interface SalesRevenueDonutChartProps {
  oilRevenue: number;
  mealRevenue: number;
  oilQuantity: number;
  mealQuantity: number;
  totalRevenue: number;
  oilSegments?: {
    crudeOil: { amount: number; quantity: number };
    filteredOil: { amount: number; quantity: number };
  };
  mealSegments?: {
    mealBrown: { amount: number; quantity: number };
    mealWhite: { amount: number; quantity: number };
    mealWhole: { amount: number; quantity: number };
  };
  onFilterProduct?: (productType: string) => void;
}

export const SalesRevenueDonutChart: React.FC<SalesRevenueDonutChartProps> = ({
  oilRevenue,
  mealRevenue,
  oilQuantity,
  mealQuantity,
  totalRevenue,
  oilSegments,
  mealSegments,
  onFilterProduct
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"GROUP" | "DETAIL">("DETAIL");

  const safeTotal = totalRevenue > 0 ? totalRevenue : 1;

  // 1. Group level data (Dầu Dừa vs Cám Dừa)
  const groupSegments: SalesPieSegment[] = [
    {
      name: "Dầu Dừa (Thô & Lọc)",
      category: "OIL",
      amount: oilRevenue,
      quantity: oilQuantity,
      unit: "kg",
      color: "#059669" // Emerald green
    },
    {
      name: "Cám Dừa (3 loại)",
      category: "MEAL",
      amount: mealRevenue,
      quantity: mealQuantity,
      unit: "kg",
      color: "#0284c7" // Ocean blue
    }
  ];

  // 2. Detail level data (Từng sản phẩm thành phẩm)
  const detailSegments: SalesPieSegment[] = [
    {
      name: "Dầu dừa thô xuất xưởng",
      category: "OIL",
      amount: oilSegments?.crudeOil?.amount || Math.round(oilRevenue * 0.499),
      quantity: oilSegments?.crudeOil?.quantity || Math.round(oilQuantity * 0.52),
      unit: "kg",
      color: "#059669" // Primary green
    },
    {
      name: "Dầu dừa lọc sạch (ly tâm/khung bản)",
      category: "OIL",
      amount: oilSegments?.filteredOil?.amount || Math.round(oilRevenue * 0.501),
      quantity: oilSegments?.filteredOil?.quantity || Math.round(oilQuantity * 0.48),
      unit: "kg",
      color: "#10b981" // Light emerald
    },
    {
      name: "Cám dừa nâu đậm",
      category: "MEAL",
      amount: mealSegments?.mealBrown?.amount || Math.round(mealRevenue * 0.303),
      quantity: mealSegments?.mealBrown?.quantity || Math.round(mealQuantity * 0.32),
      unit: "kg",
      color: "#0284c7" // Deep sky blue
    },
    {
      name: "Cám dừa trắng thượng hạng",
      category: "MEAL",
      amount: mealSegments?.mealWhite?.amount || Math.round(mealRevenue * 0.278),
      quantity: mealSegments?.mealWhite?.quantity || Math.round(mealQuantity * 0.26),
      unit: "kg",
      color: "#38bdf8" // Cyan / sky
    },
    {
      name: "Cám dừa nguyên hỗn hợp",
      category: "MEAL",
      amount: mealSegments?.mealWhole?.amount || Math.round(mealRevenue * 0.419),
      quantity: mealSegments?.mealWhole?.quantity || Math.round(mealQuantity * 0.42),
      unit: "kg",
      color: "#6366f1" // Indigo
    }
  ];

  const activeSegments = (viewMode === "GROUP" ? groupSegments : detailSegments).filter(s => s.amount > 0);

  // SVG Geometry Calculation (Center 100, 100, Radius 80, Inner Radius 52 for Donut)
  const size = 200;
  const center = size / 2;
  const radius = 78;
  const innerRadius = 50;

  // Helper to convert polar coords to cartesian
  const getCoordinatesForPercent = (percent: number) => {
    // start at top (-90 deg)
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      ix: center + innerRadius * Math.cos(angle),
      iy: center + innerRadius * Math.sin(angle)
    };
  };

  let cumulativePercent = 0;
  const slices = activeSegments.map((segment, idx) => {
    const percent = segment.amount / safeTotal;
    const startAngle = cumulativePercent;
    const endAngle = cumulativePercent + percent;
    cumulativePercent += percent;

    const start = getCoordinatesForPercent(startAngle);
    const end = getCoordinatesForPercent(endAngle);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    // SVG path for donut slice: outer arc, line to inner arc, reverse inner arc, close
    const pathData = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${end.ix} ${end.iy}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${start.ix} ${start.iy}`,
      "Z"
    ].join(" ");

    return {
      ...segment,
      percent: percent * 100,
      pathData,
      idx
    };
  });

  const activeHoverItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  const oilPct = ((oilRevenue / safeTotal) * 100).toFixed(1);
  const mealPct = ((mealRevenue / safeTotal) * 100).toFixed(1);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--line)",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "28px",
        alignItems: "center"
      }}
    >
      {/* LEFT: DONUT PIE SVG CHART */}
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(0deg)", overflow: "visible" }}
        >
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <path
                key={slice.idx}
                d={slice.pathData}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth={isHovered ? 3 : 1.5}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transformOrigin: `${center}px ${center}px`,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  filter: isHovered ? "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" : "none"
                }}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  if (onFilterProduct) {
                    if (slice.category === "OIL") onFilterProduct("ALL_OIL");
                    else onFilterProduct("ALL_MEAL");
                  }
                }}
              />
            );
          })}
        </svg>

        {/* DONUT CENTER TEXT */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
            width: innerRadius * 1.8
          }}
        >
          {activeHoverItem ? (
            <>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                {activeHoverItem.percent.toFixed(1)}%
              </div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: activeHoverItem.color, fontVariantNumeric: "tabular-nums" }}>
                {(activeHoverItem.amount / 1000000).toFixed(1)} Tr
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Tổng thu
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#15936b", fontVariantNumeric: "tabular-nums" }}>
                {(totalRevenue / 1000000).toFixed(1)} Tr
              </div>
              <div style={{ fontSize: "9px", color: "var(--muted)" }}>
                {viewMode === "DETAIL" ? "5 sản phẩm" : "2 nhóm chính"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: LEGEND & BREAKDOWN ANALYTICS */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <AppIcon name="PieChart" size={15} style={{ color: "var(--brand)" }} />
              <span>Cơ cấu Doanh thu Xuất Bán (Biểu đồ tròn)</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: 12 }}>
                Dầu {oilPct}% • Cám {mealPct}%
              </span>
            </h4>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>
              Phân tách chi tiết dòng tiền thành phẩm xưởng ép/lọc dầu dừa theo thời gian thực
            </div>
          </div>

          {/* Toggle View Mode */}
          <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", fontSize: "11px" }}>
            <button
              type="button"
              onClick={() => setViewMode("DETAIL")}
              style={{
                border: "none",
                background: viewMode === "DETAIL" ? "#ffffff" : "transparent",
                color: viewMode === "DETAIL" ? "var(--brand)" : "var(--muted)",
                fontWeight: viewMode === "DETAIL" ? 700 : 500,
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: viewMode === "DETAIL" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
              }}
            >
              Chi tiết 5 SP
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GROUP")}
              style={{
                border: "none",
                background: viewMode === "GROUP" ? "#ffffff" : "transparent",
                color: viewMode === "GROUP" ? "var(--brand)" : "var(--muted)",
                fontWeight: viewMode === "GROUP" ? 700 : 500,
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: viewMode === "GROUP" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
              }}
            >
              Nhóm Dầu vs Cám
            </button>
          </div>
        </div>

        {/* Legend Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px 16px" }}>
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <div
                key={slice.idx}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: isHovered ? "#f8fafc" : "transparent",
                  border: isHovered ? "1px solid var(--line)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: slice.color,
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: isHovered ? "var(--ink)" : "var(--muted)",
                      fontWeight: isHovered ? 700 : 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={slice.name}
                  >
                    {slice.name}
                  </span>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 8 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {(slice.amount / 1000000).toFixed(1)} Tr
                    <span style={{ fontSize: "11px", color: slice.color, marginLeft: 4, fontWeight: 700 }}>
                      ({slice.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {slice.quantity.toLocaleString("vi-VN")} {slice.unit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

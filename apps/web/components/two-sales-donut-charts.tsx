import React, { useState } from "react";

interface DonutSlice {
  name: string;
  amount: number;
  quantity: number;
  unit: string;
  color: string;
  filterValue: string;
}

interface MiniDonutProps {
  title: string;
  subtitle?: string;
  totalAmount: number;
  totalQuantity: number;
  unit: string;
  slices: DonutSlice[];
  themeColor: string;
  onFilterProduct?: (productType: string) => void;
}

const SingleDonut: React.FC<MiniDonutProps> = ({
  title,
  subtitle,
  totalAmount,
  totalQuantity,
  unit,
  slices,
  themeColor,
  onFilterProduct
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safeTotal = totalAmount > 0 ? totalAmount : 1;
  const size = 160;
  const center = size / 2;
  const radius = 64;
  const innerRadius = 42;

  const getCoordinates = (percent: number) => {
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      ix: center + innerRadius * Math.cos(angle),
      iy: center + innerRadius * Math.sin(angle)
    };
  };

  let cumulativePercent = 0;
  const arcSlices = slices.map((s, idx) => {
    const percent = s.amount / safeTotal;
    const startAngle = cumulativePercent;
    const endAngle = cumulativePercent + percent;
    cumulativePercent += percent;

    const start = getCoordinates(startAngle);
    const end = getCoordinates(endAngle);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${end.ix} ${end.iy}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${start.ix} ${start.iy}`,
      "Z"
    ].join(" ");

    return {
      ...s,
      percent: percent * 100,
      pathData,
      idx
    };
  });

  const activeHover = hoveredIdx !== null ? arcSlices[hoveredIdx] : null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--line)",
        borderRadius: "8px",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {subtitle && (
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {subtitle}
            </div>
          )}
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: themeColor }} />
            {title}
          </h4>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "17px", fontWeight: 800, color: themeColor, fontVariantNumeric: "tabular-nums" }}>
            {(totalAmount / 1000000).toFixed(1)} Tr
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
            {totalQuantity.toLocaleString("vi-VN")} {unit}
          </div>
        </div>
      </div>

      {/* Donut & Legend Split */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px", alignItems: "center" }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {arcSlices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;
              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transformOrigin: `${center}px ${center}px`,
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    filter: isHovered ? "drop-shadow(0 3px 5px rgba(0,0,0,0.15))" : "none"
                  }}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onFilterProduct && onFilterProduct(slice.filterValue)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
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
            {activeHover ? (
              <>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>
                  {activeHover.percent.toFixed(1)}%
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: activeHover.color, fontVariantNumeric: "tabular-nums" }}>
                  {(activeHover.amount / 1000000).toFixed(1)} Tr
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>TỶ TRỌNG</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: themeColor }}>
                  {slices.length} dòng
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {arcSlices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <div
                key={slice.idx}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onFilterProduct && onFilterProduct(slice.filterValue)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: isHovered ? "#f8fafc" : "transparent",
                  border: isHovered ? "1px solid var(--line)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: slice.color, flexShrink: 0 }} />
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
                <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 6 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {(slice.amount / 1000000).toFixed(1)} Tr
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: slice.color, marginLeft: 4 }}>
                    ({slice.percent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TwoDonutChartsProps {
  oilRevenue: number;
  mealRevenue: number;
  oilQuantity: number;
  mealQuantity: number;
  crudeOilAmount: number;
  crudeOilQty: number;
  filteredOilAmount: number;
  filteredOilQty: number;
  mealBrownAmount: number;
  mealBrownQty: number;
  mealWhiteAmount: number;
  mealWhiteQty: number;
  mealWholeAmount: number;
  mealWholeQty: number;
  onFilterProduct?: (productType: string) => void;
}

export const TwoSalesDonutCharts: React.FC<TwoDonutChartsProps> = ({
  oilRevenue,
  mealRevenue,
  oilQuantity,
  mealQuantity,
  crudeOilAmount,
  crudeOilQty,
  filteredOilAmount,
  filteredOilQty,
  mealBrownAmount,
  mealBrownQty,
  mealWhiteAmount,
  mealWhiteQty,
  mealWholeAmount,
  mealWholeQty,
  onFilterProduct
}) => {
  const oilSlices: DonutSlice[] = [
    {
      name: "Dầu dừa thô",
      amount: crudeOilAmount,
      quantity: crudeOilQty,
      unit: "kg",
      color: "#059669", // Emerald
      filterValue: "CRUDE_OIL"
    },
    {
      name: "Dầu dừa lọc",
      amount: filteredOilAmount,
      quantity: filteredOilQty,
      unit: "kg",
      color: "#10b981", // Light emerald
      filterValue: "FILTERED_OIL"
    }
  ];

  const mealSlices: DonutSlice[] = [
    {
      name: "Cám nâu",
      amount: mealBrownAmount,
      quantity: mealBrownQty,
      unit: "kg",
      color: "#0284c7", // Sky blue
      filterValue: "MEAL_BROWN"
    },
    {
      name: "Cám trắng",
      amount: mealWhiteAmount,
      quantity: mealWhiteQty,
      unit: "kg",
      color: "#38bdf8", // Cyan
      filterValue: "MEAL_WHITE"
    },
    {
      name: "Cám nguyên",
      amount: mealWholeAmount,
      quantity: mealWholeQty,
      unit: "kg",
      color: "#6366f1", // Indigo
      filterValue: "MEAL_WHOLE"
    }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "14px",
        marginBottom: "16px"
      }}
    >
      {/* CHART 1: DOANH THU DẦU DỪA */}
      <SingleDonut
        title="Cơ cấu Doanh thu Dầu Dừa"
        totalAmount={oilRevenue}
        totalQuantity={oilQuantity}
        unit="kg"
        slices={oilSlices}
        themeColor="#059669"
        onFilterProduct={onFilterProduct}
      />

      {/* CHART 2: DOANH THU CÁM DỪA */}
      <SingleDonut
        title="Cơ cấu Doanh thu Cám Dừa"
        totalAmount={mealRevenue}
        totalQuantity={mealQuantity}
        unit="kg"
        slices={mealSlices}
        themeColor="#0284c7"
        onFilterProduct={onFilterProduct}
      />
    </div>
  );
};

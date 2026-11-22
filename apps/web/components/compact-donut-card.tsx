import React, { useState } from "react";

interface DonutSlice {
  name: string;
  amount: number;
  quantity: number;
  unit: string;
  color: string;
  filterValue: string;
}

interface CompactDonutCardProps {
  title: string;
  totalAmount: number;
  totalQuantity: number;
  unit: string;
  slices: DonutSlice[];
  themeColor: string;
  onFilterProduct?: (productType: string) => void;
}

export const CompactDonutCard: React.FC<CompactDonutCardProps> = ({
  title,
  totalAmount,
  totalQuantity,
  unit,
  slices,
  themeColor,
  onFilterProduct
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safeTotal = totalAmount > 0 ? totalAmount : 1;
  const size = 68;
  const center = size / 2;
  const radius = 28;
  const innerRadius = 18;

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
      className="kpi-card-compact"
      style={{
        borderLeft: `4px solid ${themeColor}`,
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "84px"
      }}
    >
      {/* Top Header: Label & Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="kpi-label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={title}>
          {title}
        </span>
        <span className="kpi-value text-right" style={{ color: themeColor, fontSize: "17px", marginLeft: 8 }}>
          {(totalAmount / 1000000).toFixed(1)} Tr
        </span>
      </div>

      {/* Middle Body: Donut Chart + Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        {/* SVG Mini Donut */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {arcSlices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;
              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    transformOrigin: `${center}px ${center}px`,
                    transform: isHovered ? "scale(1.08)" : "scale(1)"
                  }}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onFilterProduct && onFilterProduct(slice.filterValue)}
                />
              );
            })}
          </svg>

          {/* Center text for hover */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              fontSize: "9px",
              fontWeight: 800,
              color: activeHover ? activeHover.color : "var(--muted)",
              lineHeight: 1
            }}
          >
            {activeHover ? `${Math.round(activeHover.percent)}%` : slices.length}
          </div>
        </div>

        {/* Compact Legend Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
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
                  fontSize: "11px",
                  cursor: "pointer",
                  borderRadius: 3,
                  padding: "1px 2px",
                  background: isHovered ? "#f1f5f9" : "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: slice.color, flexShrink: 0 }} />
                  <span style={{ color: isHovered ? "var(--ink)" : "var(--muted)", fontWeight: isHovered ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {slice.name}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingLeft: 4 }}>
                  <span style={{ color: slice.color }}>{slice.percent.toFixed(0)}%</span>
                  <span style={{ color: "var(--muted)", fontWeight: 500, marginLeft: 2, fontSize: "10px" }}>
                    ({(slice.amount / 1000000).toFixed(0)}Tr)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtext footer */}
      <div className="kpi-sub" style={{ marginTop: 2, fontSize: "11px" }}>
        {totalQuantity.toLocaleString("vi-VN")} {unit} thành phẩm
      </div>
    </div>
  );
};

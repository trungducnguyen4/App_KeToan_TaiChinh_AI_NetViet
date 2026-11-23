import React, { useState } from "react";
import { AppIcon } from "./icons";

interface PaybackCurveChartProps {
  capex: number;
  equity: number;
  totalRevenue3M: number;
  totalOpex3M: number;
  monthlyDepr: number;
  revAdjPct: number;
  opexAdjPct: number;
}

export function PaybackCurveChart({
  capex,
  equity,
  totalRevenue3M,
  totalOpex3M,
  monthlyDepr,
  revAdjPct,
  opexAdjPct
}: PaybackCurveChartProps) {
  const [viewMode, setViewMode] = useState<"capex" | "equity">("capex");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const initialCapital = viewMode === "capex" ? capex : equity;
  const revM = totalRevenue3M / 3;
  const opexM = totalOpex3M / 3;
  const actualEbitdaM = revM - opexM;

  // Build 13 points: T0 to T12
  const points: {
    month: string;
    monthIndex: number;
    isActual: boolean;
    revenue: number;
    opex: number;
    ebitda: number;
    cumCashFlow: number;
  }[] = [];

  let cum = -initialCapital;
  points.push({
    month: "T0",
    monthIndex: 0,
    isActual: true,
    revenue: 0,
    opex: 0,
    ebitda: 0,
    cumCashFlow: cum
  });

  let paybackMonth: number | null = null;

  for (let m = 1; m <= 12; m++) {
    const isActual = m <= 3;
    const r = isActual ? revM : revM * (1 + revAdjPct / 100);
    const o = isActual ? opexM : opexM * (1 + opexAdjPct / 100);
    const eb = r - o;
    const prevCum = cum;
    cum += eb;

    if (paybackMonth === null && prevCum < 0 && cum >= 0) {
      // Linear interpolation to find precise payback month
      paybackMonth = m - 1 + (-prevCum) / eb;
    }

    points.push({
      month: `T${m}`,
      monthIndex: m,
      isActual,
      revenue: r,
      opex: o,
      ebitda: eb,
      cumCashFlow: cum
    });
  }

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 280;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 35;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Y scale range
  const minVal = -4000000000; // -4.0 tỷ
  const maxVal = 10000000000; // +10.0 tỷ
  const valRange = maxVal - minVal;

  const getX = (idx: number) => padLeft + (idx / 12) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minVal) / valRange) * chartH;

  const zeroY = getY(0);

  // Path generator
  const actualPoints = points.filter(p => p.monthIndex <= 3);
  const forecastPoints = points.filter(p => p.monthIndex >= 3);

  const actualPathD = actualPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.monthIndex).toFixed(1)} ${getY(p.cumCashFlow).toFixed(1)}`)
    .join(" ");

  const forecastPathD = forecastPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.monthIndex).toFixed(1)} ${getY(p.cumCashFlow).toFixed(1)}`)
    .join(" ");

  // Fill area between curve and zero line
  const allPathD = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.monthIndex).toFixed(1)} ${getY(p.cumCashFlow).toFixed(1)}`)
    .join(" ");
  const areaD = `${allPathD} L ${getX(12).toFixed(1)} ${zeroY.toFixed(1)} L ${getX(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  // Payback X coordinate
  const paybackX = paybackMonth !== null ? getX(paybackMonth) : null;

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
              Biểu đồ Dòng tiền Tích lũy &amp; Thu hồi vốn (12 Tháng)
            </span>
            <span
              style={{
                fontSize: "11px",
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600
              }}
            >
              {paybackMonth ? `Hoàn vốn: ${paybackMonth.toFixed(2)} Tháng` : "Chưa hoàn vốn"}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>
            T0–T3: Số liệu thực tế vận hành • T4–T12: Dự phóng dòng tiền theo kịch bản
          </div>
        </div>

        {/* Toggle CAPEX vs Equity */}
        <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "8px", padding: 3 }}>
          <button
            type="button"
            onClick={() => setViewMode("capex")}
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: viewMode === "capex" ? 700 : 500,
              background: viewMode === "capex" ? "#ffffff" : "transparent",
              color: viewMode === "capex" ? "#0284c7" : "#64748b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: viewMode === "capex" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s"
            }}
          >
            Theo CAPEX (2,45 Tỷ)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("equity")}
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: viewMode === "equity" ? 700 : 500,
              background: viewMode === "equity" ? "#ffffff" : "transparent",
              color: viewMode === "equity" ? "#16a34a" : "#64748b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: viewMode === "equity" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s"
            }}
          >
            Theo Vốn Góp (3,50 Tỷ)
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "auto", minWidth: "500px", display: "block" }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="lineActualGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {[-4, -2, 0, 2, 4, 6, 8, 10].map((tVal) => {
            const val = tVal * 1000000000;
            const y = getY(val);
            const isZero = tVal === 0;
            return (
              <g key={tVal}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={isZero ? "#64748b" : "#f1f5f9"}
                  strokeWidth={isZero ? 1.5 : 1}
                  strokeDasharray={isZero ? "4 4" : undefined}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={isZero ? "#0f172a" : "#94a3b8"}
                  fontWeight={isZero ? 700 : 400}
                >
                  {tVal === 0 ? "0 đ" : `${tVal > 0 ? "+" : ""}${tVal} Tỷ`}
                </text>
              </g>
            );
          })}

          {/* Actual vs Forecast Vertical Divider line at T3 */}
          <line
            x1={getX(3)}
            y1={padTop}
            x2={getX(3)}
            y2={svgHeight - padBottom}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={getX(3) - 6}
            y={padTop + 12}
            textAnchor="end"
            fontSize="9"
            fill="#059669"
            fontWeight="700"
          >
            ← Thực tế
          </text>
          <text
            x={getX(3) + 6}
            y={padTop + 12}
            textAnchor="start"
            fontSize="9"
            fill="#0284c7"
            fontWeight="700"
          >
            Dự báo →
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Forecast Path (T3 - T12) dashed */}
          <path
            d={forecastPathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          {/* Actual Path (T0 - T3) solid */}
          <path
            d={actualPathD}
            fill="none"
            stroke="url(#lineActualGrad)"
            strokeWidth="3.2"
          />

          {/* Payback Point Marker */}
          {paybackX !== null && (
            <g>
              <circle cx={paybackX} cy={zeroY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <line
                x1={paybackX}
                y1={zeroY - 24}
                x2={paybackX}
                y2={zeroY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <rect
                x={paybackX - 42}
                y={zeroY - 38}
                width="84"
                height="18"
                rx="4"
                fill="#f59e0b"
              />
              <text
                x={paybackX}
                y={zeroY - 25}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="800"
                fill="#ffffff"
              >
                Hoàn vốn {paybackMonth?.toFixed(2)}T
              </text>
            </g>
          )}

          {/* Data Points */}
          {points.map((p) => {
            const cx = getX(p.monthIndex);
            const cy = getY(p.cumCashFlow);
            const isHovered = hoveredMonth === p.monthIndex;

            return (
              <g
                key={p.month}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredMonth(p.monthIndex)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Hit area */}
                <circle cx={cx} cy={cy} r="14" fill="transparent" />

                {/* Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : p.monthIndex <= 3 ? 4.5 : 3.5}
                  fill={p.cumCashFlow >= 0 ? "#10b981" : "#ef4444"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* X axis Label */}
                <text
                  x={cx}
                  y={svgHeight - padBottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill={p.monthIndex <= 3 ? "#059669" : "#64748b"}
                  fontWeight={p.monthIndex <= 3 ? 700 : 500}
                >
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredMonth !== null && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 14,
              background: "rgba(15, 23, 42, 0.92)",
              color: "#ffffff",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              pointerEvents: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}
          >
            <div style={{ fontWeight: 700, borderBottom: "1px solid #334155", paddingBottom: 2, marginBottom: 2 }}>
              Tháng {points[hoveredMonth].month} ({points[hoveredMonth].isActual ? "Số liệu thực tế" : "Dự phóng kịch bản"})
            </div>
            <div>Doanh thu: {(points[hoveredMonth].revenue / 1000000).toFixed(1)} Tr đ</div>
            <div>Chi phí OpEx: {(points[hoveredMonth].opex / 1000000).toFixed(1)} Tr đ</div>
            <div>EBITDA: {(points[hoveredMonth].ebitda / 1000000).toFixed(1)} Tr đ</div>
            <div
              style={{
                fontWeight: 700,
                color: points[hoveredMonth].cumCashFlow >= 0 ? "#34d399" : "#f87171",
                marginTop: 2
              }}
            >
              Dòng tiền lũy kế: {(points[hoveredMonth].cumCashFlow / 1000000).toFixed(1)} Tr đ
            </div>
          </div>
        )}
      </div>

      {/* Legend & Key Takeaway */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          fontSize: "11px",
          color: "var(--muted)",
          borderTop: "1px solid #f1f5f9",
          paddingTop: 8,
          gap: 12
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 3, background: "#059669", borderRadius: 2 }} />
            <strong style={{ color: "#0f172a" }}>Nét liền:</strong> Đã vận hành (T0–T3)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 3, background: "#0284c7", borderRadius: 2 }} />
            <strong style={{ color: "#0f172a" }}>Nét đứt:</strong> Dự báo (T4–T12)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
            <strong style={{ color: "#0f172a" }}>Mốc hòa vốn</strong>
          </span>
        </div>

        <div style={{ color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AppIcon name="CheckCircle2" size={13} style={{ color: "#059669" }} />
          <span>
            {viewMode === "capex"
              ? "CAPEX 2,45 Tỷ đã được bù đắp 100% tại Tháng 2,74 (trong T3)"
              : "Toàn bộ 3,50 Tỷ vốn góp cổ đông dự kiến hoàn tất tại Tháng 3,91 (trong T4)"}
          </span>
        </div>
      </div>
    </div>
  );
}

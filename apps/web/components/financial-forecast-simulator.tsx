import React from "react";

interface FinancialForecastSimulatorProps {
  revAdjPct: number;
  setRevAdjPct: (val: number) => void;
  opexAdjPct: number;
  setOpexAdjPct: (val: number) => void;
  baseRevenue3M: number;
  baseOpex3M: number;
  capex: number;
  equity: number;
  monthlyDepr: number;
}

export function FinancialForecastSimulator({
  revAdjPct,
  setRevAdjPct,
  opexAdjPct,
  setOpexAdjPct,
  baseRevenue3M,
  baseOpex3M,
  capex,
  equity,
  monthlyDepr
}: FinancialForecastSimulatorProps) {
  const revM = baseRevenue3M / 3;
  const opexM = baseOpex3M / 3;
  const actualEbitdaM = revM - opexM;

  const forecastRevM = revM * (1 + revAdjPct / 100);
  const forecastOpexM = opexM * (1 + opexAdjPct / 100);
  const forecastEbitdaM = forecastRevM - forecastOpexM;
  const forecastEbitdaMargin = forecastRevM > 0 ? (forecastEbitdaM / forecastRevM) * 100 : 0;

  // 12-month aggregated (3M actuals + 9M forecast)
  const totalEbitda12M = actualEbitdaM * 3 + forecastEbitdaM * 9;
  const endingCumCf12MCapex = totalEbitda12M - capex;
  const endingCumCf12MEquity = totalEbitda12M - equity;

  // Payback for Equity 3.5B
  // 3M actual EBITDA = actualEbitdaM * 3 = 2,686,272,590
  const actual3MEbitda = actualEbitdaM * 3;
  const remainingEquity = equity - actual3MEbitda; // ~813.7M
  let paybackEquityMonths: number | null = null;
  if (remainingEquity <= 0) {
    paybackEquityMonths = (equity / actualEbitdaM);
  } else if (forecastEbitdaM > 0) {
    paybackEquityMonths = 3 + (remainingEquity / forecastEbitdaM);
  }

  // Active preset determination
  const isConservative = revAdjPct === -15 && opexAdjPct === 25;
  const isBase = revAdjPct === 0 && opexAdjPct === 0;
  const isOptimistic = revAdjPct === 15 && opexAdjPct === -5;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}
    >
      {/* Header & Presets */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            Mô phỏng Độ nhạy &amp; Dự báo Dòng tiền (What-If Analysis)
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>
            Giả lập biến động giá bán và chi phí nguyên liệu cho 9 tháng tiếp theo (T4–T12)
          </div>
        </div>

        {/* 3 Quick Preset Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setRevAdjPct(-15);
              setOpexAdjPct(25);
            }}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: isConservative ? 700 : 500,
              background: isConservative ? "#fee2e2" : "#f8fafc",
              color: isConservative ? "#991b1b" : "#64748b",
              border: isConservative ? "1px solid #f87171" : "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            🛡️ Thận trọng (-15% DT, +25% CP)
          </button>
          <button
            type="button"
            onClick={() => {
              setRevAdjPct(0);
              setOpexAdjPct(0);
            }}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: isBase ? 700 : 500,
              background: isBase ? "#ecfdf5" : "#f8fafc",
              color: isBase ? "#065f46" : "#64748b",
              border: isBase ? "1px solid #6ee7b7" : "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            ⚖️ Cơ sở (Giữ mức 3T)
          </button>
          <button
            type="button"
            onClick={() => {
              setRevAdjPct(15);
              setOpexAdjPct(-5);
            }}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: isOptimistic ? 700 : 500,
              background: isOptimistic ? "#e0f2fe" : "#f8fafc",
              color: isOptimistic ? "#0369a1" : "#64748b",
              border: isOptimistic ? "1px solid #7dd3fc" : "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            🚀 Lạc quan (+15% DT, -5% CP)
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Slider 1: Revenue / Selling Price */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              Biến động Doanh thu / Giá bán dầu
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: revAdjPct > 0 ? "#15936b" : revAdjPct < 0 ? "#dc2626" : "#0f172a"
              }}
            >
              {revAdjPct > 0 ? `+${revAdjPct}%` : `${revAdjPct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            step="5"
            value={revAdjPct}
            onChange={(e) => setRevAdjPct(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#15936b", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--muted)", marginTop: 4 }}>
            <span>-25% (Hạ giá/Ế ẩm)</span>
            <span>Doanh thu: {(forecastRevM / 1000000).toFixed(1)} Tr/tháng</span>
            <span>+25% (Được giá)</span>
          </div>
        </div>

        {/* Slider 2: OpEx / Raw Material Cost */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              Biến động Chi phí Vận hành (Dừa + Điện)
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: opexAdjPct > 0 ? "#dc2626" : opexAdjPct < 0 ? "#15936b" : "#0f172a"
              }}
            >
              {opexAdjPct > 0 ? `+${opexAdjPct}%` : `${opexAdjPct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="35"
            step="5"
            value={opexAdjPct}
            onChange={(e) => setOpexAdjPct(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#dc2626", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--muted)", marginTop: 4 }}>
            <span>-15% (Dừa rẻ)</span>
            <span>Chi phí: {(forecastOpexM / 1000000).toFixed(1)} Tr/tháng</span>
            <span>+35% (Mất mùa dừa)</span>
          </div>
        </div>
      </div>

      {/* Live Impact Results Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>EBITDA dự báo / tháng</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: forecastEbitdaM >= 0 ? "#0284c7" : "#dc2626", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {(forecastEbitdaM / 1000000).toFixed(1)} Tr
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>
            Biên: <strong>{forecastEbitdaMargin.toFixed(1)}%</strong>
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Tổng EBITDA (12T)</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#059669", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {(totalEbitda12M / 1000000000).toFixed(2)} Tỷ
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>
            3T thật + 9T dự phóng
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Dòng tiền T12 (sau CAPEX)</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: endingCumCf12MCapex >= 0 ? "#10b981" : "#ef4444", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {endingCumCf12MCapex >= 0 ? `+${(endingCumCf12MCapex / 1000000000).toFixed(2)}` : (endingCumCf12MCapex / 1000000000).toFixed(2)} Tỷ
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>
            Thặng dư tiền mặt
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Hoàn vốn Vốn Góp (3.5T)</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#d97706", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {paybackEquityMonths !== null ? `${paybackEquityMonths.toFixed(2)} Tháng` : "Không thể"}
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>
            {paybackEquityMonths && paybackEquityMonths <= 4 ? "Trong Tháng 4 tới" : `Vào Tháng ${paybackEquityMonths ? Math.ceil(paybackEquityMonths) : "--"}`}
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Đánh giá Rủi ro</div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: isConservative ? "#b91c1c" : isBase ? "#047857" : "#0369a1",
              marginTop: 4
            }}
          >
            {isConservative ? "⚠️ Cảnh báo Chi phí" : isBase ? "✅ Khả thi & Ổn định" : "🌟 Tăng trưởng Mạnh"}
          </div>
          <div style={{ fontSize: "9.5px", color: "var(--muted)", marginTop: 2, lineHeight: 1.25 }}>
            {isConservative
              ? "Biên lợi nhuận giảm về 17.8%, cần kiểm soát giá dừa"
              : isBase
              ? "Dòng tiền mạnh, hoàn vốn cổ đông ngay trong T4"
              : "Thặng dư lớn, sẵn sàng đầu tư dây chuyền 2"}
          </div>
        </div>
      </div>
    </div>
  );
}

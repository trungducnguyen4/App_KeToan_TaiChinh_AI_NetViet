import React from "react";
import { AppIcon } from "./icons";

export type PeriodFilterValue = "1M" | "3M" | "6M" | "ALL";

export interface PeriodFilterProps {
  value: PeriodFilterValue;
  onChange: (val: PeriodFilterValue) => void;
  startDate?: string;
  endDate?: string;
}

export function PeriodFilter({ value, onChange, startDate, endDate }: PeriodFilterProps) {
  const options: { id: PeriodFilterValue; label: string; desc: string }[] = [
    { id: "1M", label: "1 Tháng", desc: "T11/2026 (Tháng gần nhất)" },
    { id: "3M", label: "3 Tháng", desc: "T9 - T11/2026 (Quý 4)" },
    { id: "6M", label: "6 Tháng", desc: "T6 - T11/2026 (Nửa năm)" },
    { id: "ALL", label: "Toàn bộ", desc: "Tất cả kỳ sản xuất" }
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "3px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          color: "#059669",
          fontSize: "12px",
          fontWeight: 700,
          borderRight: "1px solid #e2e8f0",
          marginRight: "4px"
        }}
      >
        <AppIcon name="Clock" size={14} style={{ marginRight: 4 }} />
        Kỳ báo cáo:
      </div>
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.desc}
            onClick={() => onChange(opt.id)}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              background: isActive ? "#059669" : "transparent",
              color: isActive ? "#ffffff" : "#475569",
              fontWeight: isActive ? 700 : 500,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Helper utility to filter date-based items by period
 * Reference date anchor: 2026-11-21 (current operational date)
 */
export function filterByPeriod<T>(
  items: T[],
  getDate: (item: T) => string | Date,
  period: PeriodFilterValue
): T[] {
  if (period === "ALL") return items;

  const anchor = new Date("2026-11-22T00:00:00.000Z");
  let monthsBack = 1;
  if (period === "3M") monthsBack = 3;
  if (period === "6M") monthsBack = 6;

  const threshold = new Date(anchor);
  threshold.setMonth(threshold.getMonth() - monthsBack);

  return items.filter((item) => {
    const raw = getDate(item);
    if (!raw) return true;
    const d = new Date(raw);
    return d >= threshold;
  });
}

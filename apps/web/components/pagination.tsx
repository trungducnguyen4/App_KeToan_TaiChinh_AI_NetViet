import React, { useState } from "react";
import { AppIcon } from "./icons";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong tổng số <strong>{totalItems}</strong> dòng
        </span>
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: safePage <= 1 ? "#f1f5f9" : "#ffffff",
            color: safePage <= 1 ? "#94a3b8" : "#0f172a",
            cursor: safePage <= 1 ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600
          }}
        >
          <AppIcon name="ChevronDown" size={14} style={{ transform: "rotate(90deg)" }} />
          Trước
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} style={{ padding: "0 6px", color: "#94a3b8" }}>
                ...
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === safePage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: "30px",
                height: "30px",
                padding: "0 6px",
                borderRadius: "6px",
                border: isActive ? "1px solid #059669" : "1px solid #e2e8f0",
                background: isActive ? "#059669" : "#ffffff",
                color: isActive ? "#ffffff" : "#1e293b",
                fontWeight: isActive ? 700 : 500,
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: safePage >= totalPages ? "#f1f5f9" : "#ffffff",
            color: safePage >= totalPages ? "#94a3b8" : "#0f172a",
            cursor: safePage >= totalPages ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600
          }}
        >
          Sau
          <AppIcon name="ChevronDown" size={14} style={{ transform: "rotate(-90deg)" }} />
        </button>
      </div>

      <div className="pagination-size">
        {onPageSizeChange && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ whiteSpace: "nowrap" }}>Số dòng / trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

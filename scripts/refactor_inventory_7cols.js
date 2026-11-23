const fs = require('fs');

const path = 'apps/web/screens/inventory-production-screen.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add helper functions before export default function
const funcMarker = 'export default function InventoryProductionScreen()';
if (!code.includes(funcMarker)) {
  console.error('Function marker not found!');
  process.exit(1);
}

const helpers = `function formatDateVi(dateStr?: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return \`\${parts[2]}/\${parts[1]}/\${parts[0]}\`;
  }
  return dateStr;
}

function parseSupplierName(raw?: string): { name: string; location: string } {
  if (!raw) return { name: "Thương lái lẻ", location: "Bến Tre" };
  const cleaned = raw.replace(/^Thương lái\\s+/i, "");
  const match = cleaned.match(/^(.*?)\\s*\\((.*?)\\)$/);
  if (match) {
    return { name: match[1].trim(), location: match[2].trim() };
  }
  return { name: cleaned, location: "" };
}

function cleanBatchNotes(notes?: string, yieldRate?: number): string {
  if (!notes) return "—";
  let cleaned = notes;
  if (yieldRate !== undefined) {
    const formattedYield = yieldRate.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
    cleaned = cleaned.replace(/19\\.26%/g, formattedYield).replace(/19\\.25%/g, formattedYield);
  }
  return cleaned;
}

`;

code = code.replace(funcMarker, helpers + funcMarker);

// 2. Replace the table section
const startMarker = '<div className="table-scroll"';
const endMarker = '{/* Pagination */}';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Table markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const replacement = `<div className="table-scroll" style={{ overflowX: "auto", width: "100%" }}>
                <table className="data-table">
                  <thead style={{ background: "#edf5f2", borderBottom: "1px solid #d1fae5" }}>
                    <tr>
                      <th style={{ width: 140, whiteSpace: "nowrap" }}>Mẻ ép</th>
                      <th style={{ minWidth: 170 }}>Thương lái</th>
                      <th style={{ width: 120, textAlign: "right", whiteSpace: "nowrap" }}>Vỏ vào (kg)</th>
                      <th style={{ width: 140, textAlign: "right", whiteSpace: "nowrap" }}>Dầu thu hồi</th>
                      <th style={{ width: 125, textAlign: "center", whiteSpace: "nowrap" }}>Tỷ lệ thu hồi</th>
                      <th style={{ width: 120, textAlign: "right", whiteSpace: "nowrap" }}>Cám dừa (kg)</th>
                      <th style={{ minWidth: 220, textAlign: "right" }}>Giá thành &amp; Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                          {isLoading ? "Đang tải dữ liệu..." : "Chưa có mẻ ép nào."}
                        </td>
                      </tr>
                    ) : (
                      pagedBatches.map((b) => {
                        const sup = parseSupplierName(b.supplierName);
                        const isOverCost = b.oilYieldRate < 20 || b.unitCostPerKg >= 18500;
                        const formattedYield = b.oilYieldRate.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
                        const displayNotes = cleanBatchNotes(b.notes, b.oilYieldRate);

                        return (
                          <tr key={b.id}>
                            {/* 1. Mẻ ép */}
                            <td>
                              <strong style={{ fontFamily: "monospace", fontSize: 13, color: "#0f172a", whiteSpace: "nowrap" }}>
                                {b.batchCode}
                              </strong>
                              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, whiteSpace: "nowrap" }}>
                                {formatDateVi(b.batchDate)}
                              </div>
                            </td>

                            {/* 2. Thương lái */}
                            <td>
                              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
                                {sup.name}
                              </div>
                              {sup.location && (
                                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                                  {sup.location}
                                </div>
                              )}
                            </td>

                            {/* 3. Vỏ vào (kg) */}
                            <td style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                                {b.rawMaterialKg.toLocaleString("vi-VN")}
                              </div>
                            </td>

                            {/* 4. Dầu thu hồi */}
                            <td style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                                {b.crudeOilKg.toLocaleString("vi-VN")} kg
                              </div>
                              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                                {b.crudeOilLiters.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
                              </div>
                            </td>

                            {/* 5. Tỷ lệ thu hồi */}
                            <td style={{ textAlign: "center" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 9px",
                                  borderRadius: 9999,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                  background:
                                    b.oilYieldRate >= 22
                                      ? "#dcfce7"
                                      : b.oilYieldRate >= 20
                                      ? "#e0f2fe"
                                      : "#fee2e2",
                                  color:
                                    b.oilYieldRate >= 22
                                      ? "#15803d"
                                      : b.oilYieldRate >= 20
                                      ? "#0369a1"
                                      : "#b91c1c",
                                  border:
                                    b.oilYieldRate >= 22
                                      ? "1px solid #bbf7d0"
                                      : b.oilYieldRate >= 20
                                      ? "1px solid #bae6fd"
                                      : "1px solid #fecaca"
                                }}
                              >
                                {formattedYield}
                              </span>
                            </td>

                            {/* 6. Cám dừa (kg) */}
                            <td style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                                {b.byproductKg.toLocaleString("vi-VN")}
                              </div>
                            </td>

                            {/* 7. Giá thành & Ghi chú */}
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "#64748b" }}>Giá thành:</span>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    fontVariantNumeric: "tabular-nums",
                                    color: isOverCost ? "#dc2626" : "#0f172a"
                                  }}
                                >
                                  {currency.format(b.unitCostPerKg)}/kg
                                </span>
                              </div>
                              <div
                                title={b.notes || ""}
                                style={{
                                  fontSize: 11.5,
                                  color: "#64748b",
                                  marginTop: 3,
                                  textAlign: "left",
                                  lineHeight: 1.35,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden"
                                }}
                              >
                                {displayNotes}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>\n\n              `;

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync(path, code, 'utf8');
console.log('Successfully refactored inventory production batches table into 7 columns!');

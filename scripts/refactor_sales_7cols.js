const fs = require('fs');

const path = 'apps/web/screens/sales-invoice-screen.tsx';
let code = fs.readFileSync(path, 'utf8');

const startMarker = '<div className="table-scroll"';
const endMarker = '{/* Pagination */}';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const replacement = `<div className="table-scroll" style={{ overflowX: "auto", width: "100%" }}>
            <table className="data-table compact tabular-nums" style={{ width: "100%" }}>
              <thead style={{ background: "#edf5f2", borderBottom: "1px solid #d1fae5" }}>
                <tr>
                  <th style={{ width: 160, whiteSpace: "nowrap" }}>Chứng từ</th>
                  <th style={{ minWidth: 220 }}>Khách hàng / MST</th>
                  <th style={{ width: 160, whiteSpace: "nowrap" }}>Sản phẩm</th>
                  <th style={{ width: 140, textAlign: "right", whiteSpace: "nowrap" }}>Khối lượng &amp; Đơn giá</th>
                  <th style={{ width: 140, textAlign: "right", whiteSpace: "nowrap" }}>Tổng tiền (VNĐ)</th>
                  <th style={{ width: 140, textAlign: "center", whiteSpace: "nowrap" }}>Thanh toán</th>
                  <th style={{ width: 120, textAlign: "center", whiteSpace: "nowrap" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedInvoices.map((inv) => {
                  const def = PRODUCT_DEFINITIONS[inv.productType] || {
                    name: inv.productName || "Sản phẩm",
                    category: "OIL",
                    badgeColor: "#0369a1",
                    badgeBg: "#e0f2fe"
                  };

                  return (
                    <tr key={inv.id}>
                      {/* 1. Chứng từ */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                          <strong style={{ fontFamily: "monospace", fontSize: 13, color: "#0f172a", whiteSpace: "nowrap" }}>
                            {inv.voucherNo}
                          </strong>
                          {inv.invoiceSeries && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontSize: 10.5,
                                fontWeight: 600,
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {inv.invoiceSeries}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{inv.voucherDate}</span>
                          {inv.paymentStatus === "PAID" ? (
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>• Hạn: {inv.dueDate || "-"}</span>
                          ) : inv.isOverdue ? (
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#be123c", background: "#ffe4e6", padding: "1px 5px", borderRadius: 3 }}>
                              Quá hạn {inv.overdueDays}N
                            </span>
                          ) : (
                            <span style={{ fontSize: 10.5, color: "#0369a1", background: "#f0f9ff", padding: "1px 5px", borderRadius: 3 }}>
                              Còn {inv.daysUntilDue}N
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Khách hàng / MST */}
                      <td>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{inv.customerName}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>
                          {inv.taxCode ? \`MST: \${inv.taxCode}\` : "Khách lẻ / Chưa có MST"}
                        </div>
                      </td>

                      {/* 3. Sản phẩm */}
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 700,
                            background: def.badgeBg,
                            color: def.badgeColor,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {def.category === "OIL" ? (
                            <AppIcon name="Droplet" size={13} />
                          ) : (
                            <AppIcon name="Leaf" size={13} />
                          )}
                          {def.name}
                        </span>
                      </td>

                      {/* 4. Khối lượng & Đơn giá */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          {inv.quantity.toLocaleString("vi-VN")} {inv.unit}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          × {inv.unitPrice.toLocaleString("vi-VN")} đ
                        </div>
                      </td>

                      {/* 5. Tổng tiền */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13.5, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          {inv.totalAmount.toLocaleString("vi-VN")} đ
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap" }}>
                          VAT: {inv.vatRate}%
                        </div>
                      </td>

                      {/* 6. Thanh toán */}
                      <td style={{ textAlign: "center" }}>
                        {inv.paymentStatus === "PAID" ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 9px",
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              background: "#dcfce7",
                              color: "#15803d",
                              border: "1px solid #bbf7d0"
                            }}
                          >
                            Đã thu đủ
                          </span>
                        ) : inv.paymentStatus === "PARTIAL" ? (
                          <div>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 9999,
                                fontSize: 11,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                background: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fde68a"
                              }}
                            >
                              Thu 1 phần
                            </span>
                            <div style={{ fontSize: 10.5, marginTop: 2, color: "#b45309", fontWeight: 600, whiteSpace: "nowrap" }}>
                              Còn nợ: {(inv.remainingAmount || (inv.totalAmount - inv.paidAmount)).toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 9999,
                                fontSize: 11,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca"
                              }}
                            >
                              Chưa thu
                            </span>
                            <div style={{ fontSize: 10.5, marginTop: 2, color: "#b91c1c", whiteSpace: "nowrap" }}>
                              Nợ: {inv.totalAmount.toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 7. Thao tác */}
                      <td style={{ textAlign: "center" }}>
                        {inv.paymentStatus !== "PAID" ? (
                          <button
                            type="button"
                            className="button"
                            style={{
                              padding: "4px 8px",
                              fontSize: 11,
                              background: "#059669",
                              color: "#fff",
                              border: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              borderRadius: 4,
                              cursor: "pointer",
                              fontWeight: 600,
                              whiteSpace: "nowrap"
                            }}
                            onClick={() => handleOpenPayment(inv)}
                          >
                            <AppIcon name="Coins" size={12} />
                            {inv.paymentStatus === "PARTIAL" ? "Thu tiếp" : "Thu tiền"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button"
                            onClick={() => setViewHistoryInvoice(inv)}
                            title="Bấm để xem lịch sử thanh toán"
                            style={{
                              padding: "3px 8px",
                              fontSize: 11,
                              color: "#475569",
                              background: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              whiteSpace: "nowrap"
                            }}
                          >
                            <AppIcon name="FileText" size={12} />
                            {inv.paymentVouchers?.[0]?.voucherNo || "Chi tiết"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--muted)" }}>
                      Không có hóa đơn nào khớp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>\n\n`;

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync(path, code, 'utf8');
console.log('Successfully replaced sales table with 7-column ERP structure!');

const fs = require('fs');

let file = fs.readFileSync('apps/web/screens/capital-investment-screen.tsx', 'utf8');

// Replace <table className="data-table" with <table className="data-table compact"
file = file.replace(
  '<table className="data-table" style={{ width: "100%", fontSize: "12.5px" }}>',
  '<table className="data-table compact" style={{ width: "100%", minWidth: "1050px" }}>'
);

// Enhance the input fields and layout for inline edit
const inlineRowOld = `                            <tr
                              key={a.id}
                              style={{
                                background: "#f0fdf4",
                                borderTop: "2px solid #059669",
                                borderBottom: "2px solid #059669"
                              }}
                            >
                              <td style={{ fontWeight: 700, color: "#0284c7" }}>
                                {a.assetCode}
                                <div style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>[Đang sửa]</div>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={inlineEditData.assetName}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, assetName: e.target.value })}
                                  style={{
                                    width: "100%",
                                    padding: "5px 8px",
                                    fontSize: "12.5px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                  placeholder="Nhập tên tài sản / thiết bị..."
                                />
                              </td>
                              <td>
                                <select
                                  value={inlineEditData.category}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, category: e.target.value })}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    fontSize: "11.5px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                >
                                  <option value="MACHINERY">Máy ép/lọc</option>
                                  <option value="INFRASTRUCTURE">Nhà xưởng</option>
                                  <option value="STORAGE_TANK">Bồn Inox</option>
                                  <option value="VEHICLE_SCALE">Trạm cân</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="date"
                                  value={inlineEditData.acquisitionDate}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, acquisitionDate: e.target.value })}
                                  style={{
                                    width: "100%",
                                    padding: "4px 4px",
                                    fontSize: "11px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                />
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <input
                                  type="number"
                                  value={inlineEditData.originalCost}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, originalCost: Number(e.target.value) })}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    fontSize: "12.5px",
                                    textAlign: "right",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff",
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontWeight: 700
                                  }}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                  <input
                                    type="number"
                                    value={inlineEditData.usefulLifeMonths}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, usefulLifeMonths: Number(e.target.value) })}
                                    style={{
                                      width: "48px",
                                      padding: "4px 4px",
                                      fontSize: "12px",
                                      textAlign: "center",
                                      borderRadius: "4px",
                                      border: "1.5px solid #059669",
                                      background: "#ffffff"
                                    }}
                                  />
                                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>th</span>
                                </div>
                              </td>
                              <td style={{ textAlign: "right", color: "#d97706", fontWeight: 800, fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(liveMonthlyDepr)}
                              </td>
                              <td style={{ textAlign: "right", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(a.accumulatedDepreciation)}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(Math.max(0, Number(inlineEditData.originalCost || 0) - a.accumulatedDepreciation))}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={inlineEditData.supplierOrBrand}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, supplierOrBrand: e.target.value })}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    fontSize: "11.5px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                  placeholder="Nhà cung ứng / thương hiệu..."
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlineEdit(a.id)}
                                    style={{
                                      padding: "4px 6px",
                                      fontSize: "11px",
                                      background: "#059669",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                      fontWeight: 700
                                    }}
                                    title="Lưu thay đổi vào hệ thống"
                                  >
                                    <AppIcon name="Check" size={12} />
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEdit}
                                    style={{
                                      padding: "4px 5px",
                                      fontSize: "11px",
                                      background: "#f8fafc",
                                      color: "#64748b",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 1
                                    }}
                                    title="Hủy sửa"
                                  >
                                    <AppIcon name="X" size={11} />
                                    Hủy
                                  </button>
                                </div>
                              </td>
                            </tr>`;

const inlineRowNew = `                            <tr
                              key={a.id}
                              style={{
                                background: "#f0fdf4",
                                borderTop: "2px solid #059669",
                                borderBottom: "2px solid #059669"
                              }}
                            >
                              <td style={{ fontWeight: 700, color: "#0284c7" }}>
                                {a.assetCode}
                                <div style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>[Đang sửa]</div>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={inlineEditData.assetName}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, assetName: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "4px 6px",
                                    fontSize: "12px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                  placeholder="Tên máy móc..."
                                />
                              </td>
                              <td>
                                <select
                                  value={inlineEditData.category}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, category: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "4px 4px",
                                    fontSize: "11px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                >
                                  <option value="MACHINERY">Máy ép/lọc</option>
                                  <option value="INFRASTRUCTURE">Nhà xưởng</option>
                                  <option value="STORAGE_TANK">Bồn Inox</option>
                                  <option value="VEHICLE_SCALE">Trạm cân</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="date"
                                  value={inlineEditData.acquisitionDate}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, acquisitionDate: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "3px 2px",
                                    fontSize: "11px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                />
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <input
                                  type="number"
                                  value={inlineEditData.originalCost}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, originalCost: Number(e.target.value) })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "4px 4px",
                                    fontSize: "12px",
                                    textAlign: "right",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff",
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontWeight: 700
                                  }}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                                  <input
                                    type="number"
                                    value={inlineEditData.usefulLifeMonths}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, usefulLifeMonths: Number(e.target.value) })}
                                    style={{
                                      width: "40px",
                                      boxSizing: "border-box",
                                      padding: "3px 2px",
                                      fontSize: "11.5px",
                                      textAlign: "center",
                                      borderRadius: "4px",
                                      border: "1.5px solid #059669",
                                      background: "#ffffff"
                                    }}
                                  />
                                  <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>th</span>
                                </div>
                              </td>
                              <td style={{ textAlign: "right", color: "#d97706", fontWeight: 800, fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(liveMonthlyDepr)}
                              </td>
                              <td style={{ textAlign: "right", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(a.accumulatedDepreciation)}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                                {currency.format(Math.max(0, Number(inlineEditData.originalCost || 0) - a.accumulatedDepreciation))}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={inlineEditData.supplierOrBrand}
                                  onChange={(e) => setInlineEditData({ ...inlineEditData, supplierOrBrand: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "4px 6px",
                                    fontSize: "11px",
                                    borderRadius: "4px",
                                    border: "1.5px solid #059669",
                                    background: "#ffffff"
                                  }}
                                  placeholder="Nhà cung ứng..."
                                />
                              </td>
                              <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlineEdit(a.id)}
                                    style={{
                                      padding: "4px 8px",
                                      fontSize: "11px",
                                      background: "#059669",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                      fontWeight: 700
                                    }}
                                    title="Lưu thay đổi vào hệ thống"
                                  >
                                    <AppIcon name="Check" size={12} />
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEdit}
                                    style={{
                                      padding: "4px 7px",
                                      fontSize: "11px",
                                      background: "#f1f5f9",
                                      color: "#64748b",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2
                                    }}
                                    title="Hủy sửa"
                                  >
                                    <AppIcon name="X" size={11} />
                                    Hủy
                                  </button>
                                </div>
                              </td>
                            </tr>`;

file = file.replace(inlineRowOld, inlineRowNew);

fs.writeFileSync('apps/web/screens/capital-investment-screen.tsx', file, 'utf8');
console.log('Successfully optimized compact table and inline edit row!');

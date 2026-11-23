const fs = require('fs');

let file = fs.readFileSync('apps/web/screens/capital-investment-screen.tsx', 'utf8');

// 1. Replace modal state & edit modal handler with in-line edit state & handler
const oldEditStateTarget = `const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<{
    id: string;
    assetCode: string;
    assetName: string;
    category: string;
    acquisitionDate: string;
    originalCost: string;
    residualValue: string;
    usefulLifeMonths: string;
    supplierOrBrand: string;
    notes: string;
  } | null>(null);`;

const newInlineState = `// In-line Edit State for Assets
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<{
    assetName: string;
    category: string;
    acquisitionDate: string;
    originalCost: number;
    usefulLifeMonths: number;
    supplierOrBrand: string;
  }>({
    assetName: "",
    category: "MACHINERY",
    acquisitionDate: "",
    originalCost: 0,
    usefulLifeMonths: 60,
    supplierOrBrand: ""
  });`;

if (file.includes('showEditAssetModal')) {
  file = file.replace(oldEditStateTarget, newInlineState);
}

// 2. Replace handleOpenEditModal and handleUpdateAsset with inline handlers
const oldHandlersTarget = `const handleOpenEditModal = (a: CapitalAsset) => {
    setEditingAsset({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      category: a.category,
      acquisitionDate: a.acquisitionDate,
      originalCost: String(a.originalCost),
      residualValue: String(a.residualValue || 0),
      usefulLifeMonths: String(a.usefulLifeMonths || 60),
      supplierOrBrand: a.supplierOrBrand || "",
      notes: ""
    });
    setShowEditAssetModal(true);
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      await fetch(\`http://localhost:4000/api/capital/assets/\${editingAsset.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: editingAsset.assetName,
          category: editingAsset.category,
          acquisitionDate: editingAsset.acquisitionDate,
          originalCost: Number(editingAsset.originalCost),
          residualValue: Number(editingAsset.residualValue || 0),
          usefulLifeMonths: Number(editingAsset.usefulLifeMonths),
          supplierOrBrand: editingAsset.supplierOrBrand,
          notes: editingAsset.notes
        })
      });
      setShowEditAssetModal(false);
      setEditingAsset(null);
      loadData();
    } catch (err) {
      console.error("Failed to update asset:", err);
    }
  };`;

const newInlineHandlers = `const handleStartInlineEdit = (a: CapitalAsset) => {
    setInlineEditingId(a.id);
    setInlineEditData({
      assetName: a.assetName,
      category: a.category,
      acquisitionDate: a.acquisitionDate,
      originalCost: a.originalCost,
      usefulLifeMonths: a.usefulLifeMonths,
      supplierOrBrand: a.supplierOrBrand || ""
    });
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleSaveInlineEdit = async (id: string) => {
    try {
      await fetch(\`http://localhost:4000/api/capital/assets/\${id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: inlineEditData.assetName,
          category: inlineEditData.category,
          acquisitionDate: inlineEditData.acquisitionDate,
          originalCost: Number(inlineEditData.originalCost),
          usefulLifeMonths: Number(inlineEditData.usefulLifeMonths),
          supplierOrBrand: inlineEditData.supplierOrBrand
        })
      });
      setInlineEditingId(null);
      await loadData();
    } catch (err) {
      console.error("Failed to save inline asset edit:", err);
    }
  };`;

if (file.includes('handleOpenEditModal')) {
  file = file.replace(oldHandlersTarget, newInlineHandlers);
}

// 3. Replace Tab 2 Table content with in-line edit rows
const tab2TableSearchStart = '{(() => {\r\n              const totalOriginalCost = filteredAssets.reduce((sum, a) => sum + a.originalCost, 0);';
const tab2TableSearchStartLF = '{(() => {\n              const totalOriginalCost = filteredAssets.reduce((sum, a) => sum + a.originalCost, 0);';

const tab2FindStr = file.includes(tab2TableSearchStart) ? tab2TableSearchStart : tab2TableSearchStartLF;
const tab2StartIdx = file.indexOf(tab2FindStr);
const tab2EndIdx = file.indexOf('</section>', tab2StartIdx);

if (tab2StartIdx === -1 || tab2EndIdx === -1) {
  console.error("Tab 2 table start or end not found!");
  process.exit(1);
}

const newTab2Content = `{(() => {
              const totalOriginalCost = filteredAssets.reduce((sum, a) => {
                const cost = a.id === inlineEditingId ? Number(inlineEditData.originalCost || 0) : a.originalCost;
                return sum + cost;
              }, 0);

              const totalMonthlyDepreciation = filteredAssets.reduce((sum, a) => {
                if (a.id === inlineEditingId) {
                  const liveDepr = Math.round(Number(inlineEditData.originalCost || 0) / Math.max(1, Number(inlineEditData.usefulLifeMonths || 60)));
                  return sum + liveDepr;
                }
                return sum + a.monthlyDepreciation;
              }, 0);

              const totalAccumulatedDepreciation = filteredAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
              const totalCurrentBookValue = filteredAssets.reduce((sum, a) => {
                if (a.id === inlineEditingId) {
                  return sum + Math.max(0, Number(inlineEditData.originalCost || 0) - a.accumulatedDepreciation);
                }
                return sum + a.currentBookValue;
              }, 0);

              return (
                <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
                  <table className="data-table">
                    <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                      <tr>
                        <th style={{ width: "95px" }}>Mã TS</th>
                        <th>Tên Máy móc / Tài sản</th>
                        <th style={{ width: "115px" }}>Phân loại</th>
                        <th style={{ width: "110px" }}>Ngày mua</th>
                        <th style={{ textAlign: "right", width: "135px" }}>Nguyên giá (VNĐ)</th>
                        <th style={{ textAlign: "center", width: "95px" }}>Thời gian</th>
                        <th style={{ textAlign: "right", width: "135px" }}>Khấu hao/tháng</th>
                        <th style={{ textAlign: "right", width: "125px" }}>Khấu hao lũy kế</th>
                        <th style={{ textAlign: "right", width: "135px" }}>Giá trị còn lại</th>
                        <th>Nhà cung cấp / Xuất xứ</th>
                        <th style={{ textAlign: "center", width: "110px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((a) => {
                        const isEditing = inlineEditingId === a.id;
                        const liveMonthlyDepr = isEditing
                          ? Math.round(Number(inlineEditData.originalCost || 0) / Math.max(1, Number(inlineEditData.usefulLifeMonths || 60)))
                          : a.monthlyDepreciation;

                        if (isEditing) {
                          return (
                            <tr
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
                                      padding: "4px 8px",
                                      fontSize: "11.5px",
                                      background: "#059669",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      fontWeight: 700
                                    }}
                                    title="Lưu thay đổi vào hệ thống"
                                  >
                                    <AppIcon name="Check" size={13} />
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEdit}
                                    style={{
                                      padding: "4px 6px",
                                      fontSize: "11.5px",
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
                                    <AppIcon name="X" size={12} />
                                    Hủy
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 700, color: "#0284c7" }}>{a.assetCode}</td>
                            <td>
                              <strong>{a.assetName}</strong>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: a.category === "MACHINERY" ? "#e0f2fe" : "#fef3c7",
                                  color: a.category === "MACHINERY" ? "#0369a1" : "#92400e"
                                }}
                              >
                                {a.category === "MACHINERY"
                                  ? "Máy ép/lọc"
                                  : a.category === "INFRASTRUCTURE"
                                  ? "Nhà xưởng"
                                  : a.category === "STORAGE_TANK"
                                  ? "Bồn Inox"
                                  : "Trạm cân"}
                              </span>
                            </td>
                            <td>{a.acquisitionDate}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                              {currency.format(a.originalCost)}
                            </td>
                            <td style={{ textAlign: "center" }}>{a.usefulLifeMonths} tháng</td>
                            <td style={{ textAlign: "right", color: "#d97706", fontWeight: 600, fontFamily: "var(--font-mono, monospace)" }}>
                              {currency.format(a.monthlyDepreciation)}
                            </td>
                            <td style={{ textAlign: "right", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                              {currency.format(a.accumulatedDepreciation)}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                              {currency.format(a.currentBookValue)}
                            </td>
                            <td style={{ fontSize: "12px", color: "var(--muted)" }}>{a.supplierOrBrand}</td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="button"
                                onClick={() => handleStartInlineEdit(a)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "#0284c7",
                                  borderColor: "#bae6fd",
                                  background: "#f0f9ff"
                                }}
                                title="Chỉnh sửa in-line trực tiếp trên bảng"
                              >
                                <AppIcon name="Edit" size={13} />
                                Sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot style={{ position: "sticky", bottom: 0, zIndex: 2 }}>
                      <tr style={{ background: "#f0fdf4", borderTop: "2px solid #059669", boxShadow: "0 -2px 6px rgba(0,0,0,0.04)" }}>
                        <td colSpan={4} style={{ color: "#065f46", fontSize: "13px", padding: "12px 14px" }}>
                          <strong>TỔNG CỘNG ({filteredAssets.length} máy móc &amp; tài sản):</strong>
                        </td>
                        <td style={{ textAlign: "right", color: "#0284c7", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalOriginalCost)}
                        </td>
                        <td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>
                        <td style={{ textAlign: "right", color: "#b45309", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)", background: "#fef3c7" }}>
                          <div style={{ fontSize: "10px", color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Tổng Khấu Hao 1 Tháng</div>
                          {currency.format(totalMonthlyDepreciation)} / tháng
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalAccumulatedDepreciation)}
                        </td>
                        <td style={{ textAlign: "right", color: "#16a34a", fontWeight: 800, fontSize: "13.5px", fontFamily: "var(--font-mono, monospace)" }}>
                          {currency.format(totalCurrentBookValue)}
                        </td>
                        <td></td>
                        <td style={{ textAlign: "center", color: "var(--muted)" }}>—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })()}`;

file = file.slice(0, tab2StartIdx) + newTab2Content + file.slice(tab2EndIdx);

// 4. Remove old edit modal block if present
const modalStartStr = '{/* MODAL: CHỈNH SỬA TÀI SẢN MÁY MÓC */}';
const modalEndStr = '{/* MODAL: GHI NHẬN RÓT VỐN */}';
const mStart = file.indexOf(modalStartStr);
const mEnd = file.indexOf(modalEndStr);

if (mStart !== -1 && mEnd !== -1) {
  file = file.slice(0, mStart) + file.slice(mEnd);
}

fs.writeFileSync('apps/web/screens/capital-investment-screen.tsx', file, 'utf8');
console.log('Successfully switched to in-line editing!');

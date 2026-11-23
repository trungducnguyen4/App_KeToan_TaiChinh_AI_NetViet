const fs = require('fs');

let file = fs.readFileSync('apps/web/screens/capital-investment-screen.tsx', 'utf8');

// 1. Add Edit Asset State
const stateTarget = 'const [showAssetModal, setShowAssetModal] = useState(false);';
const newEditStates = `const [showAssetModal, setShowAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
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

if (!file.includes('showEditAssetModal')) {
  file = file.replace(stateTarget, newEditStates);
}

// 2. Add handleOpenEditModal and handleUpdateAsset
const handleCreateAssetTarget = 'const handleCreateAsset = async (e: React.FormEvent) => {';
const newEditHandlers = `const handleOpenEditModal = (a: CapitalAsset) => {
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
  };

  const handleCreateAsset = async (e: React.FormEvent) => {`;

if (!file.includes('handleOpenEditModal')) {
  file = file.replace(handleCreateAssetTarget, newEditHandlers);
}

// 3. Update Tab 2 (Danh mục Máy móc & Khấu hao) table to add Action column and tfoot with SUM 1 THÁNG
const tab2TableOld = `            <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
              <table className="data-table">
                <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                  <tr>
                    <th>Mã TS</th>
                    <th>Tên Máy móc / Tài sản</th>
                    <th>Phân loại</th>
                    <th>Ngày mua</th>
                    <th style={{ textAlign: "right" }}>Nguyên giá (VNĐ)</th>
                    <th style={{ textAlign: "center" }}>Thời gian</th>
                    <th style={{ textAlign: "right" }}>Khấu hao/tháng</th>
                    <th style={{ textAlign: "right" }}>Khấu hao lũy kế</th>
                    <th style={{ textAlign: "right" }}>Giá trị còn lại</th>
                    <th>Nhà cung cấp / Xuất xứ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((a) => (
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
                      <td style={{ textAlign: "right", color: "#d97706", fontFamily: "var(--font-mono, monospace)" }}>
                        {currency.format(a.monthlyDepreciation)}
                      </td>
                      <td style={{ textAlign: "right", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                        {currency.format(a.accumulatedDepreciation)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono, monospace)" }}>
                        {currency.format(a.currentBookValue)}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--muted)" }}>{a.supplierOrBrand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>`;

const tab2TableNew = `            {(() => {
              const totalOriginalCost = filteredAssets.reduce((sum, a) => sum + a.originalCost, 0);
              const totalMonthlyDepreciation = filteredAssets.reduce((sum, a) => sum + a.monthlyDepreciation, 0);
              const totalAccumulatedDepreciation = filteredAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
              const totalCurrentBookValue = filteredAssets.reduce((sum, a) => sum + a.currentBookValue, 0);

              return (
                <div style={{ maxHeight: "calc(100vh - 280px)", minHeight: "360px", overflow: "auto" }}>
                  <table className="data-table">
                    <thead style={{ position: "sticky", top: 0, zIndex: 3, background: "#edf5f2" }}>
                      <tr>
                        <th>Mã TS</th>
                        <th>Tên Máy móc / Tài sản</th>
                        <th>Phân loại</th>
                        <th>Ngày mua</th>
                        <th style={{ textAlign: "right" }}>Nguyên giá (VNĐ)</th>
                        <th style={{ textAlign: "center" }}>Thời gian</th>
                        <th style={{ textAlign: "right" }}>Khấu hao/tháng</th>
                        <th style={{ textAlign: "right" }}>Khấu hao lũy kế</th>
                        <th style={{ textAlign: "right" }}>Giá trị còn lại</th>
                        <th>Nhà cung cấp / Xuất xứ</th>
                        <th style={{ textAlign: "center", width: "90px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((a) => (
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
                              onClick={() => handleOpenEditModal(a)}
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
                              title="Chỉnh sửa thông số máy móc / tài sản"
                            >
                              <AppIcon name="Edit" size={13} />
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
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

if (file.includes('Mã TS</th>')) {
  file = file.replace(tab2TableOld, tab2TableNew);
}

// 4. Add Edit Asset Modal right before showContributionModal
const contributionModalTarget = '{/* MODAL: GHI NHẬN RÓT VỐN */}';
const editModalComponent = `{/* MODAL: CHỈNH SỬA TÀI SẢN MÁY MÓC */}
        {showEditAssetModal && editingAsset && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "10px", width: "560px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                    Chỉnh Sửa Tài Sản: <span style={{ color: "#0284c7" }}>{editingAsset.assetCode}</span>
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Cập nhật nguyên giá, thời gian khấu hao và thông số vận hành</span>
                </div>
                <button type="button" onClick={() => setShowEditAssetModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <AppIcon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateAsset}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Mã tài sản</label>
                    <input
                      type="text"
                      disabled
                      value={editingAsset.assetCode}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px", background: "#f8fafc", color: "#64748b" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhóm tài sản *</label>
                    <select
                      value={editingAsset.category}
                      onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    >
                      <option value="MACHINERY">Máy móc ép / sấy / lọc</option>
                      <option value="INFRASTRUCTURE">Nhà xưởng &amp; Hạ tầng</option>
                      <option value="STORAGE_TANK">Bồn Inox chứa dầu</option>
                      <option value="VEHICLE_SCALE">Trạm cân xe tải</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Tên máy móc / Thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={editingAsset.assetName}
                    onChange={(e) => setEditingAsset({ ...editingAsset, assetName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nguyên giá đầu tư (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={editingAsset.originalCost}
                      onChange={(e) => setEditingAsset({ ...editingAsset, originalCost: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Thời gian khấu hao (tháng) *</label>
                    <input
                      type="number"
                      required
                      value={editingAsset.usefulLifeMonths}
                      onChange={(e) => setEditingAsset({ ...editingAsset, usefulLifeMonths: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                {/* Live Preview Khấu hao/tháng */}
                <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#92400e" }}>Khấu hao ước tính 1 tháng:</span>
                  <strong style={{ fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono, monospace)" }}>
                    {currency.format(
                      Math.round(
                        (Number(editingAsset.originalCost || 0) - Number(editingAsset.residualValue || 0)) /
                        Math.max(1, Number(editingAsset.usefulLifeMonths || 60))
                      )
                    )} / tháng
                  </strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Ngày đưa vào sử dụng</label>
                    <input
                      type="date"
                      value={editingAsset.acquisitionDate}
                      onChange={(e) => setEditingAsset({ ...editingAsset, acquisitionDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Nhà sản xuất / Nhà cung ứng</label>
                    <input
                      type="text"
                      value={editingAsset.supplierOrBrand}
                      onChange={(e) => setEditingAsset({ ...editingAsset, supplierOrBrand: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                  <button type="button" className="button" onClick={() => setShowEditAssetModal(false)}>Hủy</button>
                  <button type="submit" className="button primary">Cập nhật thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        `;

if (!file.includes('showEditAssetModal && editingAsset')) {
  file = file.replace(contributionModalTarget, editModalComponent + contributionModalTarget);
}

fs.writeFileSync('apps/web/screens/capital-investment-screen.tsx', file, 'utf8');
console.log('Successfully updated capital-investment-screen.tsx with sum 1 month and edit modal!');

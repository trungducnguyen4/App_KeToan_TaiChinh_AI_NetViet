const fs = require('fs');

let content = fs.readFileSync('apps/web/screens/sales-invoice-screen.tsx', 'utf8');
const lines = content.split('\r\n');

// Lines 351 to 473
const startLineIdx = lines.findIndex(l => l.includes('{/* Compact KPI Row - 80px according to erp-ux-ui skill */}'));
const toolbarIdx = lines.findIndex(l => l.includes('{/* Toolbar & Filter */}'));

if (startLineIdx === -1 || toolbarIdx === -1) {
  console.error('Indexes not found!');
  process.exit(1);
}

const endLineIdx = toolbarIdx - 1; // line before Toolbar & Filter

const new3BoxesRow = [
  '        {/* 3 Box ngang hàng (33.33% mỗi box): Box Tài chính Doanh thu & Công nợ gộp + 2 Box Biểu đồ tròn Dầu Dừa & Cám Dừa */}',
  '        <div className="kpi-row-compact" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>',
  '          {/* Box 1 (33.33%): Gộp Tổng doanh thu xuất bán & Công nợ chưa thu */}',
  '          <div',
  '            className="kpi-card-compact"',
  '            style={{',
  '              borderLeft: "4px solid #15936b",',
  '              padding: "10px 14px",',
  '              display: "flex",',
  '              flexDirection: "column",',
  '              justifyContent: "space-between",',
  '              minHeight: "84px"',
  '            }}',
  '          >',
  '            {/* 2 Cột chỉ số chính: Doanh thu (Trái) & Công nợ (Phải) */}',
  '            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "baseline" }}>',
  '              <div>',
  '                <span className="kpi-label" style={{ fontSize: "11px" }}>Tổng doanh thu xuất bán</span>',
  '                <div style={{ fontSize: "17px", fontWeight: 800, color: "#15936b", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>',
  '                  {(totalRevenue / 1000000).toFixed(1)} Tr',
  '                </div>',
  '              </div>',
  '              <div style={{ textAlign: "right" }}>',
  '                <span className="kpi-label" style={{ fontSize: "11px", color: overdueInvoices.length > 0 ? "#be123c" : "var(--muted)" }}>',
  '                  Công nợ chưa thu',
  '                </span>',
  '                <div style={{ fontSize: "17px", fontWeight: 800, color: overdueInvoices.length > 0 ? "#be123c" : unpaidTotal > 0 ? "#d94b35" : "#15936b", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>',
  '                  {unpaidTotal > 0 ? `${(unpaidTotal / 1000000).toFixed(1)} Tr` : "0 đ"}',
  '                </div>',
  '              </div>',
  '            </div>',
  '',
  '            {/* Progress bar: Tỷ lệ thực thu & Nợ quá hạn */}',
  '            <div style={{ marginTop: 6, marginBottom: 4 }}>',
  '              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginBottom: 2 }}>',
  '                <span>Đã thu {collectionRate}% ({(totalCollected / 1000000).toFixed(1)} Tr)</span>',
  '                {overdueInvoices.length > 0 ? (',
  '                  <span style={{ color: "#be123c", fontWeight: 700 }}>⚠️ Quá hạn: {(overdueTotal / 1000000).toFixed(1)} Tr</span>',
  '                ) : (',
  '                  <span style={{ color: "#15936b", fontWeight: 600 }}>Trong hạn</span>',
  '                )}',
  '              </div>',
  '              <div style={{ width: "100%", height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", display: "flex" }}>',
  '                <div style={{ width: `${Math.min(100, Number(collectionRate))}%`, height: "100%", background: "#15936b", transition: "width 0.3s ease" }} />',
  '                {unpaidTotal > 0 && (',
  '                  <div style={{ width: `${Math.min(100 - Number(collectionRate), ((unpaidTotal / (totalRevenue || 1)) * 100))}%`, height: "100%", background: overdueInvoices.length > 0 ? "#f43f5e" : "#fbbf24" }} />',
  '                )}',
  '              </div>',
  '            </div>',
  '',
  '            {/* Subtext footer */}',
  '            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>',
  '              <span>{totalInvoicesCount} HĐ ({paidInvoicesCount} đã tất toán)</span>',
  '              <span style={{ color: overdueInvoices.length > 0 ? "#be123c" : "var(--muted)", fontWeight: overdueInvoices.length > 0 ? 600 : 400 }}>',
  '                {unpaidCount > 0 ? `${unpaidCount} HĐ còn nợ` : "Đã thu đủ 100%"}',
  '              </span>',
  '            </div>',
  '          </div>',
  '',
  '          {/* Box 2 (33.33%): Biểu đồ tròn Dầu Dừa */}',
  '          <CompactDonutCard',
  '            title="Doanh thu Dầu Dừa"',
  '            totalAmount={oilRevenue}',
  '            totalQuantity={oilQuantity}',
  '            unit="kg"',
  '            themeColor="#d97706"',
  '            slices={[',
  '              { name: "Dầu dừa thô", amount: crudeOilAmount, quantity: crudeOilQty, unit: "kg", color: "#d97706", filterValue: "CRUDE_OIL" },',
  '              { name: "Dầu dừa lọc", amount: filteredOilAmount, quantity: filteredOilQty, unit: "kg", color: "#059669", filterValue: "FILTERED_OIL" }',
  '            ]}',
  '            onFilterProduct={(val) => {',
  '              setFilterProduct(val);',
  '              setCurrentPage(1);',
  '            }}',
  '          />',
  '',
  '          {/* Box 3 (33.33%): Biểu đồ tròn Cám Dừa */}',
  '          <CompactDonutCard',
  '            title="Doanh thu Cám Dừa"',
  '            totalAmount={mealRevenue}',
  '            totalQuantity={mealQuantity}',
  '            unit="kg"',
  '            themeColor="#854d0e"',
  '            slices={[',
  '              { name: "Cám nâu", amount: mealBrownAmount, quantity: mealBrownQty, unit: "kg", color: "#854d0e", filterValue: "MEAL_BROWN" },',
  '              { name: "Cám trắng", amount: mealWhiteAmount, quantity: mealWhiteQty, unit: "kg", color: "#0ea5e9", filterValue: "MEAL_WHITE" },',
  '              { name: "Cám nguyên", amount: mealWholeAmount, quantity: mealWholeQty, unit: "kg", color: "#f59e0b", filterValue: "MEAL_WHOLE" }',
  '            ]}',
  '            onFilterProduct={(val) => {',
  '              setFilterProduct(val);',
  '              setCurrentPage(1);',
  '            }}',
  '          />',
  '        </div>',
  ''
];

console.log('Replacing lines from', startLineIdx, 'to', endLineIdx);
lines.splice(startLineIdx, (endLineIdx - startLineIdx + 1), ...new3BoxesRow);

fs.writeFileSync('apps/web/screens/sales-invoice-screen.tsx', lines.join('\r\n'), 'utf8');
console.log('Successfully merged into 3 boxes at 33.33% each!');

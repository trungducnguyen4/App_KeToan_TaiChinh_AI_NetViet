/**
 * Mock theo app_quan_tri_schema_mysql.sql.
 * Tên thuộc tính giữ snake_case để nhìn ra trực tiếp cột SQL nguồn.
 */
export type MaterializedMetricMock = {
  id: string;
  organization_id: string;
  metric_code: string;
  metric_date: string;
  dimension_key: string | null;
  metric_value: number;
  created_at: string;
};

export type VoucherMock = {
  id: string;
  organization_id: string;
  voucher_type: "PT" | "PC" | "BN" | "BC";
  voucher_no: string;
  voucher_date: string;
  posting_date: string;
  status: "posted";
  approval_status: "approved";
  description: string;
  total_debit: number;
  total_credit: number;
  source_record_id: string;
};

export type MonitoringAlertCategory =
  | "debt_overdue"
  | "expense_limit"
  | "cashflow_negative"
  | "journal_anomaly";

export type MonitoringAlertSeverity = "critical" | "high" | "medium" | "low";
export type MonitoringAlertStatus = "new" | "reviewing" | "resolved";

export type MonitoringAlertMock = {
  id: string;
  category: MonitoringAlertCategory;
  severity: MonitoringAlertSeverity;
  status: MonitoringAlertStatus;
  title: string;
  sourceModule: string;
  entityRef: string;
  amount: number;
  threshold: string;
  actual: string;
  variance: string;
  period: string;
  detectedAt: string;
  owner: string;
  recommendation: string;
  drilldownHref: string;
  analysisFields: Array<{ label: string; value: string }>;
};

export const reportMetricMocks: MaterializedMetricMock[] = [
  ...[
    [1, 9010, 4914, 68961], [2, 8420, 5620, 71761], [3, 7580, 6180, 73161], [4, 8660, 5940, 75881],
    [5, 7240, 6280, 76841], [6, 11420, 8120, 80141], [7, 8540, 6040, 82641], [8, 9010, 4914, 86937]
  ].flatMap(([month, cashIn, cashOut, closing]) => {
    const date = `2026-${String(month).padStart(2, "0")}-28`;
    const totals = [
      ["cash_in", cashIn], ["cash_out", cashOut], ["cash_closing", closing]
    ].map(([metricCode, value], index) => ({
      id: `metric-cash-${month}-${index}`,
      organization_id: "org-ttp-paper",
      metric_code: String(metricCode),
      metric_date: date,
      dimension_key: "VND",
      metric_value: Number(value),
      created_at: `${date}T23:55:00+07:00`
    }));
    const dimensions = [
      ["cash_in_by_source", "sales", cashIn * 0.72],
      ["cash_in_by_source", "asset_disposal", cashIn * 0.11],
      ["cash_in_by_source", "borrowing", cashIn * 0.1],
      ["cash_in_by_source", "other", cashIn * 0.07],
      ["cash_out_by_purpose", "inventory", cashOut * 0.52],
      ["cash_out_by_purpose", "selling_admin", cashOut * 0.24],
      ["cash_out_by_purpose", "payroll", cashOut * 0.15],
      ["cash_out_by_purpose", "tax_interest", cashOut * 0.09]
    ].map(([metricCode, dimension, value], index) => ({
      id: `metric-cash-dimension-${month}-${index}`,
      organization_id: "org-ttp-paper",
      metric_code: String(metricCode),
      metric_date: date,
      dimension_key: String(dimension),
      metric_value: Number(value),
      created_at: `${date}T23:55:00+07:00`
    }));
    return [...totals, ...dimensions];
  }),
  { id: "metric-ar", organization_id: "org-ttp-paper", metric_code: "receivable_total", metric_date: "2026-07-13", dimension_key: "131", metric_value: 4820000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-ap", organization_id: "org-ttp-paper", metric_code: "payable_total", metric_date: "2026-07-13", dimension_key: "331", metric_value: 3160000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-overdue", organization_id: "org-ttp-paper", metric_code: "debt_overdue", metric_date: "2026-07-13", dimension_key: null, metric_value: 684000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-revenue", organization_id: "org-ttp-paper", metric_code: "revenue_net", metric_date: "2026-07-13", dimension_key: "511", metric_value: 8640000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-cost", organization_id: "org-ttp-paper", metric_code: "cost_total", metric_date: "2026-07-13", dimension_key: "621|622|627|641|642", metric_value: 6180000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-assets", organization_id: "org-ttp-paper", metric_code: "asset_total", metric_date: "2026-07-13", dimension_key: null, metric_value: 42800000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-liabilities", organization_id: "org-ttp-paper", metric_code: "liability_total", metric_date: "2026-07-13", dimension_key: null, metric_value: 16400000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-equity", organization_id: "org-ttp-paper", metric_code: "equity_total", metric_date: "2026-07-13", dimension_key: null, metric_value: 26400000000, created_at: "2026-07-13T08:00:00+07:00" },
  { id: "metric-workit-diff", organization_id: "org-ttp-paper", metric_code: "workit_difference", metric_date: "2026-07-13", dimension_key: "GD1", metric_value: 0, created_at: "2026-07-13T08:00:00+07:00" }
];

export const voucherMocks: VoucherMock[] = [
  { id: "voucher-pt-01", organization_id: "org-ttp-paper", voucher_type: "PT", voucher_no: "PT1-26070012", voucher_date: "2026-07-13", posting_date: "2026-07-13", status: "posted", approval_status: "approved", description: "Thu tiền Công ty Minh An", total_debit: 245000000, total_credit: 245000000, source_record_id: "WORKIT-PT-1207" },
  { id: "voucher-bn-01", organization_id: "org-ttp-paper", voucher_type: "BN", voucher_no: "BN1-26070008", voucher_date: "2026-07-14", posting_date: "2026-07-14", status: "posted", approval_status: "approved", description: "Thanh toán NCC Tín Phát", total_debit: 118000000, total_credit: 118000000, source_record_id: "WORKIT-BN-0807" },
  { id: "voucher-bc-01", organization_id: "org-ttp-paper", voucher_type: "BC", voucher_no: "BC1-26070018", voucher_date: "2026-07-16", posting_date: "2026-07-16", status: "posted", approval_status: "approved", description: "Thu công nợ khách hàng", total_debit: 320000000, total_credit: 320000000, source_record_id: "WORKIT-BC-1807" },
  { id: "voucher-pc-01", organization_id: "org-ttp-paper", voucher_type: "PC", voucher_no: "PC1-26070041", voucher_date: "2026-07-18", posting_date: "2026-07-18", status: "posted", approval_status: "approved", description: "Chi công nợ nhà cung cấp", total_debit: 164000000, total_credit: 164000000, source_record_id: "WORKIT-PC-4107" }
];

export const monitoringAlertMocks: MonitoringAlertMock[] = [
  {
    id: "alert-debt-001",
    category: "debt_overdue",
    severity: "critical",
    status: "new",
    title: "Khách hàng Minh An quá hạn 35 ngày",
    sourceModule: "Công nợ",
    entityRef: "KH-MINH-AN / BH-26060018",
    amount: 180000000,
    threshold: "Quá hạn > 30 ngày hoặc > 100 triệu",
    actual: "35 ngày quá hạn, 180.000.000 VND",
    variance: "+80.000.000 VND so với ngưỡng cao",
    period: "Tháng 07/2026",
    detectedAt: "2026-07-14 07:45",
    owner: "Kế toán công nợ",
    recommendation: "Liên hệ thu ngay, tạm dừng hạn mức bán chịu mới.",
    drilldownHref: "/modules/receivables",
    analysisFields: [
      { label: "Tài khoản", value: "131 - Phải thu khách hàng" },
      { label: "Ngày đến hạn", value: "10/06/2026" },
      { label: "Tuổi nợ", value: "31-60 ngày" },
      { label: "Số tiền còn nợ", value: "820.000.000 VND" },
      { label: "Số tiền quá hạn", value: "180.000.000 VND" },
      { label: "Mức ưu tiên", value: "Cao" },
    ],
  },
  {
    id: "alert-expense-001",
    category: "expense_limit",
    severity: "high",
    status: "reviewing",
    title: "Chi phí quản lý vượt định mức 18%",
    sourceModule: "Sổ cái & hạch toán",
    entityRef: "TK 642 / BP-VAN-PHONG",
    amount: 118000000,
    threshold: "Vượt ngân sách > 10%",
    actual: "Thực chi 118.000.000 / ngân sách 100.000.000",
    variance: "+18.000.000 VND (+18%)",
    period: "Tháng 07/2026",
    detectedAt: "2026-07-14 08:05",
    owner: "Kế toán tổng hợp",
    recommendation: "Kiểm tra chứng từ PC1-26070041 và yêu cầu phê duyệt bổ sung.",
    drilldownHref: "/modules/accounting/report/account-ledger",
    analysisFields: [
      { label: "Tài khoản", value: "642 - Chi phí quản lý doanh nghiệp" },
      { label: "Bộ phận", value: "Văn phòng" },
      { label: "Dự án", value: "DA-MO-RONG-KHO" },
      { label: "Định mức", value: "100.000.000 VND" },
      { label: "Thực chi", value: "118.000.000 VND" },
      { label: "Chênh lệch", value: "18%" },
    ],
  },
  {
    id: "alert-cashflow-001",
    category: "cashflow_negative",
    severity: "critical",
    status: "new",
    title: "Dự báo dòng tiền âm sau 14 ngày",
    sourceModule: "Sổ quỹ & ngân hàng",
    entityRef: "VCB-001 / Cash forecast 14D",
    amount: 420000000,
    threshold: "Số dư dự báo < 0 trong 30 ngày",
    actual: "Ngày 28/07/2026 dự kiến thiếu 420.000.000 VND",
    variance: "-420.000.000 VND",
    period: "14 ngày tới",
    detectedAt: "2026-07-14 08:20",
    owner: "Giám đốc tài chính",
    recommendation: "Ưu tiên thu KH-MINH-AN và đổi lịch thanh toán NCC-TTP.",
    drilldownHref: "/modules/cash",
    analysisFields: [
      { label: "Số dư hiện tại", value: "2.353.000.000 VND" },
      { label: "Dòng tiền vào dự kiến", value: "1.050.000.000 VND" },
      { label: "Dòng tiền ra dự kiến", value: "3.823.000.000 VND" },
      { label: "Ngày âm tiền", value: "28/07/2026" },
      { label: "Thiếu hụt", value: "420.000.000 VND" },
      { label: "Độ tin cậy", value: "82%" },
    ],
  },
  {
    id: "alert-journal-001",
    category: "journal_anomaly",
    severity: "high",
    status: "new",
    title: "Phiếu hạch toán lệch Nợ/Có",
    sourceModule: "Sổ cái & hạch toán",
    entityRef: "HT-26070027",
    amount: 12500000,
    threshold: "Tổng Nợ phải bằng Tổng Có",
    actual: "Tổng Nợ 312.500.000 / Tổng Có 300.000.000",
    variance: "Lệch 12.500.000 VND",
    period: "Tháng 07/2026",
    detectedAt: "2026-07-14 09:10",
    owner: "Kế toán tổng hợp",
    recommendation: "Tạm giữ ghi sổ, kiểm tra dòng hạch toán đối ứng và chứng từ gốc.",
    drilldownHref: "/modules/accounting/journal-vouchers",
    analysisFields: [
      { label: "Mã chứng từ", value: "HT" },
      { label: "Số chứng từ", value: "HT-26070027" },
      { label: "Tổng Nợ", value: "312.500.000 VND" },
      { label: "Tổng Có", value: "300.000.000 VND" },
      { label: "Số lệch", value: "12.500.000 VND" },
      { label: "Chứng từ gốc", value: "Chưa gắn" },
    ],
  },
  {
    id: "alert-journal-002",
    category: "journal_anomaly",
    severity: "medium",
    status: "reviewing",
    title: "Bút toán giá trị lớn sửa ngoài giờ",
    sourceModule: "Sổ cái & hạch toán",
    entityRef: "HT-26070031",
    amount: 780000000,
    threshold: "Sửa sau 19:00 và giá trị > 500 triệu",
    actual: "Sửa lúc 21:38, tổng tiền 780.000.000 VND",
    variance: "Vượt ngưỡng giá trị 280.000.000 VND",
    period: "Tháng 07/2026",
    detectedAt: "2026-07-14 09:35",
    owner: "Kế toán trưởng",
    recommendation: "Yêu cầu xác nhận người sửa và đối chiếu phê duyệt nội bộ.",
    drilldownHref: "/modules/accounting/journal-vouchers",
    analysisFields: [
      { label: "Người tạo", value: "user-accountant-02" },
      { label: "Người sửa gần nhất", value: "user-accountant-05" },
      { label: "Ngày sửa", value: "13/07/2026 21:38" },
      { label: "Tài khoản liên quan", value: "112, 331, 642" },
      { label: "Dự án", value: "Thiếu thông tin" },
      { label: "Nguồn dữ liệu", value: "WORKIT-HT-26070031" },
    ],
  },
];

export const ledgerBalanceMocks = [
  { id: "ledger-111", organization_id: "org-ttp-paper", period_year: 2026, period_month: 7, account_code: "111", account_name: "Tiền mặt", opening_debit: 2480000000, opening_credit: 0, period_debit: 840000000, period_credit: 620000000, closing_debit: 2700000000, closing_credit: 0, calculated_at: "2026-07-13T08:00:00+07:00" },
  { id: "ledger-112", organization_id: "org-ttp-paper", period_year: 2026, period_month: 7, account_code: "112", account_name: "Tiền gửi ngân hàng", opening_debit: 8140000000, opening_credit: 0, period_debit: 2480000000, period_credit: 2120000000, closing_debit: 8500000000, closing_credit: 0, calculated_at: "2026-07-13T08:00:00+07:00" },
  { id: "ledger-131", organization_id: "org-ttp-paper", period_year: 2026, period_month: 7, account_code: "131", account_name: "Phải thu khách hàng", opening_debit: 4260000000, opening_credit: 0, period_debit: 1820000000, period_credit: 1260000000, closing_debit: 4820000000, closing_credit: 0, calculated_at: "2026-07-13T08:00:00+07:00" },
  { id: "ledger-331", organization_id: "org-ttp-paper", period_year: 2026, period_month: 7, account_code: "331", account_name: "Phải trả nhà cung cấp", opening_debit: 0, opening_credit: 2940000000, period_debit: 980000000, period_credit: 1200000000, closing_debit: 0, closing_credit: 3160000000, calculated_at: "2026-07-13T08:00:00+07:00" }
];

// View mock sau khi JOIN opening_balance_*_lines với customers/suppliers/accounts.
export const debtOpeningBalanceMocks = [
  { id: "ob-ar-01", batch_id: "ob-2026-07", counterparty_type: "customer", counterparty_code: "KH-MINH-AN", counterparty_name: "Công ty Minh An", account_code: "131", invoice_no: "BH-26060018", due_date: "2026-07-10", amount: 820000000, overdue_amount: 180000000, priority: "Cao", recommendation: "Liên hệ thu ngay" },
  { id: "ob-ar-02", batch_id: "ob-2026-07", counterparty_type: "customer", counterparty_code: "KH-CP32", counterparty_name: "Công ty Cổ phần 32", account_code: "131", invoice_no: "BH-26060032", due_date: "2026-07-12", amount: 640000000, overdue_amount: 95000000, priority: "Cao", recommendation: "Gửi nhắc nợ" },
  { id: "ob-ap-01", batch_id: "ob-2026-07", counterparty_type: "supplier", counterparty_code: "NCC-TTP", counterparty_name: "NCC Tín Phát", account_code: "331", invoice_no: "MH-26070008", due_date: "2026-07-18", amount: 510000000, overdue_amount: 0, priority: "Trung bình", recommendation: "Chuẩn bị thanh toán" },
  { id: "ob-ap-02", batch_id: "ob-2026-07", counterparty_type: "supplier", counterparty_code: "NCC-MINH", counterparty_name: "NCC Minh Long", account_code: "331", invoice_no: "MH-26060005", due_date: "2026-07-08", amount: 380000000, overdue_amount: 60000000, priority: "Cao", recommendation: "Đối chiếu hóa đơn" }
];

// View mock cho dashboard công nợ: opening_balance_*_lines + ledger_balances + customers/suppliers.
export const debtDashboardMocks = {
  receivables: [
    { counterparty_code: "KH-MINH-AN", counterparty_name: "Công ty Minh An", opening_amount: 980000000, current_amount: 1515604553, overdue_amount: 180000000 },
    { counterparty_code: "KH-CP32", counterparty_name: "Công ty Cổ phần 32", opening_amount: 870000000, current_amount: 1020000000, overdue_amount: 95000000 },
    { counterparty_code: "KH-AG", counterparty_name: "Hợp tác xã Lúa gạo An Giang", opening_amount: 410000000, current_amount: 442800000, overdue_amount: 0 },
    { counterparty_code: "KH-DCL", counterparty_name: "Công ty CP Dược phẩm Cửu Long", opening_amount: 365000000, current_amount: 390804296, overdue_amount: 62000000 },
    { counterparty_code: "KH-ECS", counterparty_name: "Công ty TNHH Dịch vụ E-Customs FCS", opening_amount: 210000000, current_amount: 254085958, overdue_amount: 0 },
    { counterparty_code: "KH-HV", counterparty_name: "Công ty Hồng Vân", opening_amount: 225000000, current_amount: 249710000, overdue_amount: 45000000 },
    { counterparty_code: "KH-BV", counterparty_name: "Bệnh viện Đa khoa Cao su Đồng Nai", opening_amount: 172000000, current_amount: 186493266, overdue_amount: 0 },
    { counterparty_code: "KH-BD", counterparty_name: "Công ty CP Thương mại & Du lịch Bản Đôn", opening_amount: 98000000, current_amount: 122888294, overdue_amount: 18000000 },
    { counterparty_code: "KH-BFC", counterparty_name: "Công ty CP Thực phẩm Bình Tây", opening_amount: 116000000, current_amount: 121950944, overdue_amount: 0 },
    { counterparty_code: "KH-NK", counterparty_name: "Công ty CP Thép Nam Kim", opening_amount: 105000000, current_amount: 118703594, overdue_amount: 12000000 }
  ],
  payables: [
    { counterparty_code: "NCC-TTP", counterparty_name: "Công ty CP Vật tư Y tế Hồng Thiện Mỹ", opening_amount: 4250000000, current_amount: 5146668000, overdue_amount: 640000000 },
    { counterparty_code: "NCC-BT", counterparty_name: "Câu lạc bộ Doanh nhân Bến Tre", opening_amount: 1320000000, current_amount: 1464383529, overdue_amount: 0 },
    { counterparty_code: "NCC-VFC", counterparty_name: "Công ty CP Khử trùng Việt Nam - CN HCM", opening_amount: 940000000, current_amount: 1083003896, overdue_amount: 120000000 },
    { counterparty_code: "NCC-BNP", counterparty_name: "Công ty Bánh Ngọt Pháp", opening_amount: 480000000, current_amount: 537472122, overdue_amount: 0 },
    { counterparty_code: "NCC-HV", counterparty_name: "Hồng Vân", opening_amount: 390000000, current_amount: 472500000, overdue_amount: 78000000 },
    { counterparty_code: "NCC-QA", counterparty_name: "Công ty TNHH Quốc Anh Tiền Giang", opening_amount: 245000000, current_amount: 278009572, overdue_amount: 0 },
    { counterparty_code: "NCC-FIS", counterparty_name: "Công ty TNHH Hệ thống Thông tin GMC FPT", opening_amount: 228000000, current_amount: 261567822, overdue_amount: 35000000 },
    { counterparty_code: "NCC-NV", counterparty_name: "Công ty CP Nhật Nam", opening_amount: 145000000, current_amount: 172311346, overdue_amount: 0 },
    { counterparty_code: "NCC-BNA", counterparty_name: "Công ty CP Bánh Ngọt Anh", opening_amount: 128000000, current_amount: 137842546, overdue_amount: 0 },
    { counterparty_code: "NCC-DAH", counterparty_name: "Công ty TNHH MTV Gò Đàng An Hiệp", opening_amount: 110000000, current_amount: 123983622, overdue_amount: 22000000 }
  ]
};

// View mock tổng hợp journal_entry_lines theo contract_id/item_id và nhóm TK 511/621/622/627/641/642.
export const profitabilityMocks = [
  { source_id: "SO-2607012", item_code: "PAPER-KRAFT", item_name: "Giấy Kraft", revenue: 1280000000, cost_of_goods: 840000000, operating_cost: 92000000 },
  { source_id: "SO-2607018", item_code: "PAPER-DUPLEX", item_name: "Giấy Duplex", revenue: 980000000, cost_of_goods: 690000000, operating_cost: 78000000 },
  { source_id: "SO-2607021", item_code: "PAPER-IVORY", item_name: "Giấy Ivory", revenue: 760000000, cost_of_goods: 610000000, operating_cost: 82000000 },
  { source_id: "SO-2607025", item_code: "PAPER-COUCHE", item_name: "Giấy Couche", revenue: 1140000000, cost_of_goods: 720000000, operating_cost: 88000000 }
];

export const reportSnapshotMock = {
  id: "snapshot-cash-flow-2026-07",
  organization_id: "org-ttp-paper",
  report_code: "CASH_FLOW_MANAGEMENT",
  period_year: 2026,
  period_month: 7,
  snapshot_key: "cash-flow:2026-07:v1",
  generated_at: "2026-07-13T08:05:00+07:00",
  generated_by: "user-director"
};

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

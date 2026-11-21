import type { CashDashboardMetric, CashVoucherScreenSpec, KpiCard, ScreenSpec, WorkitModule } from "./types";

export const workitModules: WorkitModule[] = [
  {
    key: "purchasing",
    code: "60",
    name: "Hóa đơn Vào & Thu mua",
    description: "Bảng kê thu mua vỏ dừa từ thương lái (phiếu cân), hóa đơn chi phí sản xuất và quản lý tệp đính kèm.",
    icon: "ShoppingCart",
    accent: "#c77d14",
    status: "ready",
    route: "/modules/purchasing",
    primaryScreens: ["Phiếu cân thu mua vỏ dừa", "Hóa đơn chi phí VAT", "Bảng kê thu mua thương lái"]
  },
  {
    key: "sales",
    code: "40",
    name: "Hóa đơn Đầu ra",
    description: "Hóa đơn xuất bán dầu dừa thô, bán phụ phẩm bã dừa, quản lý hóa đơn GTGT điện tử.",
    icon: "TrendingUp",
    accent: "#e05d38",
    status: "ready",
    route: "/modules/sales",
    primaryScreens: ["Hóa đơn bán dầu dừa thô", "Hóa đơn bán bã dừa phụ phẩm", "Bảng kê bán hàng"]
  },
  {
    key: "inventory",
    code: "62",
    name: "Kho & Công đoạn Ép/Lọc",
    description: "Nhập vỏ dừa thô, chuyển công đoạn ép/lọc, nhập kho dầu dừa thô và đo lường tỷ lệ thu hồi.",
    icon: "Warehouse",
    accent: "#0d9488",
    status: "ready",
    route: "/modules/inventory",
    primaryScreens: ["Mẻ ép & Lọc dầu", "Kho vỏ dừa", "Kho dầu dừa thô", "Kho bã dừa"]
  },
  {
    key: "cash",
    code: "32",
    name: "Thu chi & Thanh toán",
    description: "Phiếu chi thanh toán thương lái, phiếu thu tiền bán dầu, tạm ứng và ủy nhiệm chi.",
    icon: "WalletCards",
    accent: "#0f7bbf",
    status: "ready",
    route: "/modules/cash",
    primaryScreens: ["Phiếu chi tiền mặt", "Phiếu thu tiền mặt", "Báo nợ ngân hàng", "Báo có ngân hàng"]
  },
  {
    key: "receivables",
    code: "38",
    name: "Công nợ Thương lái & KH",
    description: "Công nợ phải trả thương lái thu mua vỏ dừa và công nợ phải thu khách mua dầu dừa.",
    icon: "ReceiptText",
    accent: "#5967d8",
    status: "ready",
    route: "/modules/receivables",
    primaryScreens: ["Công nợ phải trả thương lái", "Công nợ phải thu khách hàng", "Cấn trừ công nợ"]
  },
  {
    key: "accounting",
    code: "50",
    name: "Tổng hợp Chi phí & Báo cáo",
    description: "Tính giá thành 1 kg/lít dầu thô, tổng hợp chi phí sản xuất, đóng gói bộ chứng từ gửi công ty.",
    icon: "Calculator",
    accent: "#15936b",
    status: "ready",
    route: "/modules/accounting",
    primaryScreens: [
      "Bảng tính Giá thành Dầu thô",
      "Tổng hợp Chi phí Sản xuất",
      "Đóng gói Kỳ báo cáo (Export)",
      "Phiếu hạch toán"
    ]
  },
  {
    key: "masterData",
    code: "90",
    name: "Danh mục",
    description: "Thương lái thu mua, khách hàng mua dầu, vật tư màng lọc, kho bãi và tài khoản.",
    icon: "Database",
    accent: "#276749",
    status: "ready",
    route: "/modules/master-data",
    primaryScreens: ["Thương lái", "Khách hàng", "Vật tư & Hàng hóa", "Kho bãi", "Tài khoản ngân hàng"]
  },
  {
    key: "system",
    code: "95",
    name: "Hệ thống",
    description: "Người dùng, phân quyền, cấu hình xưởng, audit log và sao lưu.",
    icon: "ShieldCheck",
    accent: "#334155",
    status: "ready",
    route: "/modules/system",
    primaryScreens: ["Người dùng", "Vai trò", "Cấu hình xưởng", "Nhật ký audit"]
  }
];

export const accountingKpis: KpiCard[] = [
  { label: "Sản lượng vỏ dừa ép", value: "125.4 Tấn", delta: "Trong kỳ hiện tại", tone: "blue" },
  { label: "Sản lượng dầu dừa thô", value: "26.8 Tấn", delta: "~29,500 Lít thu hồi", tone: "green" },
  { label: "Tỷ lệ thu hồi dầu", value: "21.37%", delta: "Định mức chuẩn: 20-23%", tone: "green" },
  { label: "Chi phí nguyên liệu", value: "4,200 đ/kg", delta: "Bình quân vỏ dừa", tone: "amber" },
  { label: "Chi phí ép & lọc", value: "1,850 đ/kg", delta: "Điện + màng lọc + máy", tone: "blue" },
  { label: "Giá thành 1 kg dầu thô", value: "21,450 đ", delta: "Tính theo thời gian thực", tone: "green" },
  { label: "Doanh thu xuất bán", value: "804.0 Tr", delta: "Dầu dừa thô xuất xưởng", tone: "blue" },
  { label: "Thu hồi phụ phẩm", value: "38.2 Tr", delta: "Bã dừa ép làm thức ăn/phân", tone: "green" },
  { label: "Biên lợi nhuận gộp", value: "18.5%", delta: "Ước tính theo mẻ sản xuất", tone: "green" }
];

export const cashDashboardMetrics: CashDashboardMetric[] = [
  { label: "Quỹ tiền mặt xưởng", value: "345.5 Tr", hint: "Chi trả tiền xe vỏ dừa tại xưởng", tone: "green" },
  { label: "Tài khoản ngân hàng", value: "1.82 Tỷ", hint: "Chuyển khoản thương lái & nhận tiền dầu", tone: "blue" },
  { label: "Công nợ thương lái đến hạn", value: "68.0 Tr", hint: "2 chuyến vỏ dừa đang chờ cân", tone: "amber" },
  { label: "Chứng từ chờ duyệt", value: "4", hint: "Hóa đơn tiền điện & 3 phiếu cân", tone: "red" }
];

export const journalVoucherScreen: ScreenSpec = {
  key: "journal-vouchers",
  title: "Phiếu hạch toán",
  moduleKey: "accounting",
  route: "/modules/accounting/journal-vouchers",
  description: "Ghi nhận chứng từ HT, bút toán Nợ/Có, thanh toán hóa đơn và tệp đính kèm.",
  listColumns: [
    "Mã CT",
    "Số",
    "Ngày",
    "Tổng tiền",
    "Nội dung",
    "Mã đơn vị",
    "Tên đơn vị",
    "Loại tiền",
    "Trạng thái"
  ],
  fields: [
    { key: "voucherType", label: "Mã CT", type: "text", required: true, width: "sm" },
    { key: "voucherDate", label: "Ngày CT", type: "date", required: true, width: "sm" },
    { key: "voucherNo", label: "Số CT", type: "text", required: true, width: "md" },
    { key: "currency", label: "Loại tiền", type: "currency", required: true, width: "sm" },
    { key: "sourceDocument", label: "CT gốc", type: "text", width: "lg" },
    { key: "counterpartyCode", label: "Mã đơn vị", type: "lookup", width: "sm" },
    { key: "counterpartyName", label: "Tên đơn vị", type: "text", width: "xl" },
    { key: "address", label: "Địa chỉ", type: "text", width: "xl" },
    { key: "taxCode", label: "Mã số thuế", type: "text", width: "md" },
    { key: "phone", label: "ĐT", type: "text", width: "sm" },
    { key: "contactCode", label: "Mã liên hệ", type: "lookup", width: "sm" },
    { key: "contactName", label: "Người liên hệ", type: "text", width: "md" },
    { key: "contactPhone", label: "ĐT liên hệ", type: "text", width: "sm" },
    { key: "content", label: "Nội dung", type: "textarea", required: true, width: "xl" },
    { key: "dueDays", label: "Số ngày nợ", type: "number", width: "sm" },
    { key: "dueDate", label: "Ngày đến hạn", type: "date", width: "sm" }
  ]
};

export const contractManagementScreen: ScreenSpec = {
  key: "contract-management",
  title: "Quản lý khế ước",
  moduleKey: "accounting",
  route: "/modules/accounting/contracts",
  description: "Theo dõi số khế ước, số tiền, lãi suất, tiền đã trả và công nợ còn lại.",
  listColumns: [
    "Số khế ước",
    "Tên đối tượng",
    "Số tiền",
    "Lãi suất",
    "Tiền đã trả",
    "Tiền còn lại",
    "Ngày vay",
    "Ngày trả",
    "Số ngày đến hạn",
    "Ghi chú"
  ],
  fields: [
    { key: "contractNo", label: "Số khế ước", type: "text", required: true, width: "sm" },
    { key: "counterpartyName", label: "Tên đối tượng", type: "text", required: true, width: "xl" },
    { key: "amount", label: "Số tiền", type: "currency", required: true, width: "sm" },
    { key: "interestRate", label: "Lãi suất", type: "number", width: "sm" },
    { key: "paidAmount", label: "Tiền đã trả", type: "currency", width: "sm" },
    { key: "remainingAmount", label: "Tiền còn lại", type: "currency", width: "sm" },
    { key: "loanDate", label: "Ngày vay", type: "date", width: "sm" },
    { key: "dueDate", label: "Ngày trả", type: "date", width: "sm" },
    { key: "daysToDue", label: "Số ngày đến hạn", type: "number", width: "sm" },
    { key: "note", label: "Ghi chú", type: "textarea", width: "xl" }
  ]
};

export const taxNotificationScreen: ScreenSpec = {
  key: "tax-notifications",
  title: "Quản lý thông báo thuế",
  moduleKey: "accounting",
  route: "/modules/accounting/tax-notifications",
  description: "Quản lý thông báo thuế, thông tin cơ quan thuế, người nhận và trạng thái xử lý.",
  listColumns: [
    "Mã CQT",
    "Tên CQT",
    "Mã dịch vụ",
    "Tên dịch vụ",
    "Phiên bản",
    "Mã người nhận",
    "Tên người nhận",
    "Địa chỉ người nhận",
    "Mã thông báo",
    "Tên thông báo",
    "Phiên bản thông báo",
    "Số thông báo",
    "Ngày thông báo",
    "Trạng thái",
    "Ngày nộp"
  ],
  fields: [
    { key: "taxAuthorityCode", label: "Mã CQT", type: "text", required: true, width: "sm" },
    { key: "taxAuthorityName", label: "Tên CQT", type: "text", required: true, width: "xl" },
    { key: "serviceCode", label: "Mã dịch vụ", type: "text", width: "sm" },
    { key: "serviceName", label: "Tên dịch vụ", type: "text", width: "lg" },
    { key: "version", label: "Phiên bản", type: "text", width: "sm" },
    { key: "recipientCode", label: "Mã người nhận", type: "text", width: "sm" },
    { key: "recipientName", label: "Tên người nhận", type: "text", width: "lg" },
    { key: "recipientAddress", label: "Địa chỉ người nhận", type: "text", width: "xl" },
    { key: "notificationCode", label: "Mã thông báo", type: "text", width: "sm" },
    { key: "notificationName", label: "Tên thông báo", type: "text", width: "xl" },
    { key: "notificationVersion", label: "Phiên bản thông báo", type: "text", width: "sm" },
    { key: "notificationNo", label: "Số thông báo", type: "text", width: "sm" },
    { key: "notificationDate", label: "Ngày thông báo", type: "date", width: "sm" },
    { key: "status", label: "Trạng thái", type: "text", width: "sm" },
    { key: "submittedAt", label: "Ngày nộp", type: "date", width: "sm" }
  ]
};

export const inputEInvoiceScreen: ScreenSpec = {
  key: "input-einvoice",
  title: "Quản lý HĐĐT đầu vào",
  moduleKey: "accounting",
  route: "/modules/accounting/input-einvoices",
  description: "Nhập HĐĐT đầu vào, theo dõi chờ duyệt và thống kê danh mục hóa đơn.",
  listColumns: [
    "Số HĐ",
    "Ngày HĐ",
    "Nhà cung cấp",
    "Giá trị",
    "Thuế GTGT",
    "Mẫu số",
    "Ký hiệu",
    "Trạng thái"
  ],
  fields: [
    { key: "invoiceNo", label: "Số HĐ", type: "text", required: true, width: "sm" },
    { key: "invoiceDate", label: "Ngày HĐ", type: "date", required: true, width: "sm" },
    { key: "supplierName", label: "Nhà cung cấp", type: "text", required: true, width: "xl" },
    { key: "amount", label: "Giá trị", type: "currency", width: "sm" },
    { key: "vatAmount", label: "Thuế GTGT", type: "currency", width: "sm" },
    { key: "templateNo", label: "Mẫu số", type: "text", width: "sm" },
    { key: "series", label: "Ký hiệu", type: "text", width: "sm" },
    { key: "status", label: "Trạng thái", type: "text", width: "sm" }
  ]
};

const cashCommonFields = [
  { key: "voucherDate", label: "Ngày CT", type: "date", required: true, width: "sm" },
  { key: "voucherNo", label: "Số CT", type: "text", required: true, width: "md" },
  { key: "currency", label: "Loại tiền", type: "currency", required: true, width: "sm" },
  { key: "counterpartyCode", label: "Mã đối tượng", type: "lookup", width: "sm" },
  { key: "counterpartyName", label: "Tên đối tượng", type: "text", width: "lg" },
  { key: "referenceInvoiceNo", label: "Hóa đơn tham chiếu", type: "text", width: "md" },
  { key: "content", label: "Nội dung", type: "textarea", required: true, width: "xl" }
] as const;

export const cashVoucherScreens: CashVoucherScreenSpec[] = [
  {
    key: "cash-receipts",
    title: "Phiếu thu tiền mặt",
    moduleKey: "cash",
    route: "/modules/cash/receipts",
    description: "Quản lý PT, thu tiền mặt, đối tượng công nợ và thu tiền theo hóa đơn.",
    voucherType: "PT",
    paymentChannel: "cash",
    counterpartyLabel: "Người nộp / Khách hàng",
    amountLabel: "Số tiền thu",
    listColumns: ["Mã CT", "Số", "Ngày", "Quỹ", "Đối tượng", "Nội dung", "Số tiền", "Trạng thái"],
    fields: [
      { key: "voucherType", label: "Mã CT", type: "text", required: true, width: "sm" },
      { key: "cashBookCode", label: "Sổ quỹ", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "cash-payments",
    title: "Phiếu chi tiền mặt",
    moduleKey: "cash",
    route: "/modules/cash/payments",
    description: "Quản lý PC, chi tiền mặt cho thương lái/NCC, tạm ứng và hoàn ứng.",
    voucherType: "PC",
    paymentChannel: "cash",
    counterpartyLabel: "Người nhận / Nhà cung cấp",
    amountLabel: "Số tiền chi",
    listColumns: ["Mã CT", "Số", "Ngày", "Quỹ", "Đối tượng", "Nội dung", "Số tiền", "Trạng thái"],
    fields: [
      { key: "voucherType", label: "Mã CT", type: "text", required: true, width: "sm" },
      { key: "cashBookCode", label: "Sổ quỹ", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "bank-debits",
    title: "Báo nợ ngân hàng",
    moduleKey: "cash",
    route: "/modules/cash/bank-debits",
    description: "Quản lý BN, chi tiền qua ngân hàng và đối chiếu với sao kê.",
    voucherType: "BN",
    paymentChannel: "bank",
    counterpartyLabel: "Thương lái / Nhà cung cấp",
    amountLabel: "Số tiền chi",
    listColumns: ["Mã CT", "Số", "Ngày", "Tài khoản NH", "Đối tượng", "Nội dung", "Số tiền", "Đối chiếu"],
    fields: [
      { key: "voucherType", label: "Mã CT", type: "text", required: true, width: "sm" },
      { key: "bankAccountCode", label: "Tài khoản NH", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "bank-credits",
    title: "Báo có ngân hàng",
    moduleKey: "cash",
    route: "/modules/cash/bank-credits",
    description: "Quản lý BC, thu tiền qua ngân hàng và đối chiếu với sao kê.",
    voucherType: "BC",
    paymentChannel: "bank",
    counterpartyLabel: "Khách hàng / Đối tượng thu",
    amountLabel: "Số tiền thu",
    listColumns: ["Mã CT", "Số", "Ngày", "Tài khoản NH", "Đối tượng", "Nội dung", "Số tiền", "Đối chiếu"],
    fields: [
      { key: "voucherType", label: "Mã CT", type: "text", required: true, width: "sm" },
      { key: "bankAccountCode", label: "Tài khoản NH", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  }
];

export const bankStatementScreen: ScreenSpec = {
  key: "bank-statements",
  title: "Sao kê ngân hàng",
  moduleKey: "cash",
  route: "/modules/cash/bank-statements",
  description: "Import sao kê, xem dòng giao dịch và đánh dấu trạng thái đối chiếu.",
  listColumns: ["Số sao kê", "Tài khoản NH", "Ngày sao kê", "Số dòng", "Số dư đầu", "Số dư cuối", "Nguồn"],
  fields: [
    { key: "bankAccountCode", label: "Tài khoản NH", type: "lookup", required: true, width: "sm" },
    { key: "statementDate", label: "Ngày sao kê", type: "date", required: true, width: "sm" },
    { key: "sourceName", label: "Nguồn import", type: "text", width: "md" }
  ]
};

export const reconciliationScreen: ScreenSpec = {
  key: "bank-reconciliation",
  title: "Đối chiếu ngân hàng",
  moduleKey: "cash",
  route: "/modules/cash/reconciliation",
  description: "Đối chiếu BN/BC với sao kê ngân hàng theo số tiền, ngày và tham chiếu.",
  listColumns: ["Loại", "Số chứng từ", "Ngày", "Đối tượng", "Nội dung", "Số tiền", "Trạng thái"],
  fields: [
    { key: "bankAccountCode", label: "Tài khoản NH", type: "lookup", required: true, width: "sm" },
    { key: "statementDate", label: "Ngày sao kê", type: "date", width: "sm" },
    { key: "matchingStatus", label: "Trạng thái đối chiếu", type: "text", width: "sm" }
  ]
};

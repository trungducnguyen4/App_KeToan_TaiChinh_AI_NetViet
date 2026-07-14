import type { CashDashboardMetric, CashVoucherScreenSpec, KpiCard, ScreenSpec, WorkitModule } from "./types";

export const workitModules: WorkitModule[] = [
  {
    key: "accounting",
    code: "50",
    name: "Kế toán",
    description: "Sổ cái, phiếu hạch toán, kết chuyển, báo cáo tài chính.",
    icon: "Calculator",
    accent: "#15936b",
    status: "ready",
    route: "/modules/accounting",
    primaryScreens: [
      "Phiếu hạch toán",
      "Quản lý khế ước",
      "Thông báo thuế",
      "Quản lý HĐĐT đầu vào",
      "Kết chuyển cuối kỳ",
      "Bút toán kết chuyển cuối kỳ",
      "Khai báo số dư TK ban đầu",
      "Khai báo bút toán kết chuyển"
    ]
  },
  {
    key: "cash",
    code: "32",
    name: "Thu chi",
    description: "Đề nghị thanh toán, tạm ứng, phiếu thu chi và ngân hàng.",
    icon: "WalletCards",
    accent: "#0f7bbf",
    status: "ready",
    route: "/modules/cash",
    primaryScreens: ["Phiếu thu", "Phiếu chi", "Báo nợ ngân hàng", "Báo có ngân hàng", "Sao kê", "Đối chiếu"]
  },
  {
    key: "receivables",
    code: "38",
    name: "Công nợ",
    description: "Theo dõi TK131/TK331 theo khách hàng, nhà cung cấp, hóa đơn, hạn thanh toán và tuổi nợ.",
    icon: "ReceiptText",
    accent: "#5967d8",
    status: "scaffold",
    route: "/modules/receivables",
    primaryScreens: ["Tổng quan công nợ", "Công nợ phải thu", "Công nợ phải trả", "Nhắc nợ và cảnh báo"]
  },
  {
    key: "inventory",
    code: "62",
    name: "Tồn kho",
    description: "Nhập xuất tồn, điều chuyển kho và cảnh báo tồn min/max.",
    icon: "Warehouse",
    accent: "#0d9488",
    status: "scaffold",
    route: "/modules/inventory",
    primaryScreens: ["Đề nghị nhập kho", "Đề nghị xuất kho", "Điều chuyển kho"]
  },
  {
    key: "sales",
    code: "40",
    name: "Bán hàng",
    description: "Báo giá, đơn hàng, hợp đồng, giao hàng và hóa đơn bán.",
    icon: "TrendingUp",
    accent: "#e05d38",
    status: "scaffold",
    route: "/modules/sales",
    primaryScreens: ["Đơn hàng bán", "Hợp đồng bán", "Hóa đơn bán hàng"]
  },
  {
    key: "purchasing",
    code: "60",
    name: "Mua hàng",
    description: "Đề nghị mua sắm, NCC báo giá, đơn hàng và hóa đơn mua.",
    icon: "ShoppingCart",
    accent: "#c77d14",
    status: "scaffold",
    route: "/modules/purchasing",
    primaryScreens: ["Đề nghị mua sắm", "Đơn hàng mua", "Hóa đơn mua hàng"]
  },
  {
    key: "masterData",
    code: "90",
    name: "Danh mục",
    description: "Tài khoản, khách hàng, NCC, hàng hóa, kho và nhân viên.",
    icon: "Database",
    accent: "#276749",
    status: "syncing",
    route: "/modules/master-data",
    primaryScreens: ["Tài khoản", "Khách hàng", "Nhà cung cấp", "Hàng hóa"]
  },
  {
    key: "system",
    code: "95",
    name: "Hệ thống",
    description: "Người dùng, vai trò, cấu hình đồng bộ, audit và AI jobs.",
    icon: "ShieldCheck",
    accent: "#334155",
    status: "scaffold",
    route: "/modules/system",
    primaryScreens: ["Người dùng", "Vai trò", "Đồng bộ Workit", "Nhật ký audit"]
  }
];

export const accountingKpis: KpiCard[] = [
  { label: "ROA", value: "0.0%", delta: "Theo số liệu demo", tone: "green" },
  { label: "ROE", value: "0.0%", delta: "Chờ đồng bộ Workit", tone: "blue" },
  { label: "Biên lợi nhuận dòng", value: "0.0%", delta: "Tháng hiện tại", tone: "blue" },
  { label: "Biên lợi nhuận gộp", value: "0.0%", delta: "Theo kết quả kinh doanh", tone: "green" },
  { label: "Tỷ lệ nợ trên vốn chủ", value: "0.0", delta: "Theo dõi rủi ro tài chính", tone: "red" },
  { label: "Tỷ lệ nợ trên tổng tài sản", value: "0.0", delta: "Cân đối theo báo cáo", tone: "amber" },
  { label: "Dòng tiền thuần từ HĐKD", value: "0", delta: "Luồng tiền từ hệ thống", tone: "blue" },
  { label: "Hệ số thanh toán hiện hành", value: "1.00", delta: "Ngưỡng an toàn", tone: "green" },
  { label: "Hệ số thanh toán nhanh", value: "1.00", delta: "Đang theo dõi", tone: "gray" }
];

export const cashDashboardMetrics: CashDashboardMetric[] = [
  { label: "Số dư quỹ tiền mặt", value: "2.48B", hint: "Tổng hợp PT/PC trong kỳ", tone: "green" },
  { label: "Số dư tiền gửi", value: "8.14B", hint: "Tổng hợp BN/BC và sao kê", tone: "blue" },
  { label: "Dòng cần đối chiếu", value: "12", hint: "Statement line chưa khớp", tone: "amber" },
  { label: "Chứng từ chờ duyệt", value: "9", hint: "M2 cần xử lý trong ngày", tone: "red" }
];

export const journalVoucherScreen: ScreenSpec = {
  key: "journal-vouchers",
  title: "Phiếu hạch toán",
  moduleKey: "accounting",
  route: "/modules/accounting/journal-vouchers",
  description: "Ghi nhận chứng từ HT, bút toán Nợ/Có, thanh toán hóa đơn và tệp đính kèm.",
  listColumns: [
    "Mã ctừ",
    "Số",
    "Ngày",
    "Mã đơn vị",
    "Tên đơn vị",
    "Tổng tiền",
    "Tổng tiền NTệ",
    "Nội dung",
    "Liên hệ",
    "Địa chỉ",
    "Dự án",
    "Số ctừ gốc",
    "Ctừ tham chiếu",
    "Loại tiền",
    "Người tạo",
    "Ngày tạo",
    "Người sửa gần nhất",
    "Ngày sửa gần nhất"
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
  listColumns: ["Số HĐ", "Ngày HĐ", "Nhà cung cấp", "Giá trị", "Thuế GTGT", "Mẫu số", "Ký hiệu", "Trạng thái"],
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
    counterpartyLabel: "Người nộp / khách hàng",
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
    description: "Quản lý PC, chi tiền mặt cho NCC, tạm ứng và hoàn ứng.",
    voucherType: "PC",
    paymentChannel: "cash",
    counterpartyLabel: "Người nhận / nhà cung cấp",
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
    counterpartyLabel: "Nhà cung cấp / đối tượng chi",
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
    counterpartyLabel: "Khách hàng / đối tượng thu",
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

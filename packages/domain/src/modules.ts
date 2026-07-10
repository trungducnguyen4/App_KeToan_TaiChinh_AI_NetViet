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
    description: "Phải thu, phải trả, tuổi nợ, hạn mức và kế hoạch dòng tiền.",
    icon: "ReceiptText",
    accent: "#5967d8",
    status: "scaffold",
    route: "/modules/receivables",
    primaryScreens: ["Công nợ phải thu", "Công nợ phải trả", "Cấn trừ công nợ"]
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
  { label: "So du quy tien mat", value: "2.48B", hint: "Tong hop PT/PC trong ky", tone: "green" },
  { label: "So du tien gui", value: "8.14B", hint: "Tong hop BN/BC va sao ke", tone: "blue" },
  { label: "Dong can doi cho doi chieu", value: "12", hint: "Statement line chua khop", tone: "amber" },
  { label: "Chung tu cho duyet", value: "9", hint: "M2 can xu ly trong ngay", tone: "red" }
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
  { key: "voucherDate", label: "Ngay CT", type: "date", required: true, width: "sm" },
  { key: "voucherNo", label: "So CT", type: "text", required: true, width: "md" },
  { key: "currency", label: "Loai tien", type: "currency", required: true, width: "sm" },
  { key: "counterpartyCode", label: "Ma doi tuong", type: "lookup", width: "sm" },
  { key: "counterpartyName", label: "Ten doi tuong", type: "text", width: "lg" },
  { key: "referenceInvoiceNo", label: "Hoa don tham chieu", type: "text", width: "md" },
  { key: "content", label: "Noi dung", type: "textarea", required: true, width: "xl" }
] as const;

export const cashVoucherScreens: CashVoucherScreenSpec[] = [
  {
    key: "cash-receipts",
    title: "Phieu thu tien mat",
    moduleKey: "cash",
    route: "/modules/cash/receipts",
    description: "Quan ly PT, thu tien mat, doi tuong cong no va thu tien theo hoa don.",
    voucherType: "PT",
    paymentChannel: "cash",
    counterpartyLabel: "Nguoi nop / khach hang",
    amountLabel: "So tien thu",
    listColumns: ["Ma CT", "So", "Ngay", "Quy", "Doi tuong", "Noi dung", "So tien", "Trang thai"],
    fields: [
      { key: "voucherType", label: "Ma CT", type: "text", required: true, width: "sm" },
      { key: "cashBookCode", label: "So quy", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "cash-payments",
    title: "Phieu chi tien mat",
    moduleKey: "cash",
    route: "/modules/cash/payments",
    description: "Quan ly PC, chi tien mat cho NCC, tam ung va hoan ung.",
    voucherType: "PC",
    paymentChannel: "cash",
    counterpartyLabel: "Nguoi nhan / nha cung cap",
    amountLabel: "So tien chi",
    listColumns: ["Ma CT", "So", "Ngay", "Quy", "Doi tuong", "Noi dung", "So tien", "Trang thai"],
    fields: [
      { key: "voucherType", label: "Ma CT", type: "text", required: true, width: "sm" },
      { key: "cashBookCode", label: "So quy", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "bank-debits",
    title: "Bao no ngan hang",
    moduleKey: "cash",
    route: "/modules/cash/bank-debits",
    description: "Quan ly BN, chi tien qua ngan hang va doi chieu voi sao ke.",
    voucherType: "BN",
    paymentChannel: "bank",
    counterpartyLabel: "Nha cung cap / doi tuong chi",
    amountLabel: "So tien chi",
    listColumns: ["Ma CT", "So", "Ngay", "Tai khoan NH", "Doi tuong", "Noi dung", "So tien", "Doi chieu"],
    fields: [
      { key: "voucherType", label: "Ma CT", type: "text", required: true, width: "sm" },
      { key: "bankAccountCode", label: "Tai khoan NH", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  },
  {
    key: "bank-credits",
    title: "Bao co ngan hang",
    moduleKey: "cash",
    route: "/modules/cash/bank-credits",
    description: "Quan ly BC, thu tien qua ngan hang va doi chieu voi sao ke.",
    voucherType: "BC",
    paymentChannel: "bank",
    counterpartyLabel: "Khach hang / doi tuong thu",
    amountLabel: "So tien thu",
    listColumns: ["Ma CT", "So", "Ngay", "Tai khoan NH", "Doi tuong", "Noi dung", "So tien", "Doi chieu"],
    fields: [
      { key: "voucherType", label: "Ma CT", type: "text", required: true, width: "sm" },
      { key: "bankAccountCode", label: "Tai khoan NH", type: "lookup", required: true, width: "sm" },
      ...cashCommonFields
    ]
  }
];

export const bankStatementScreen: ScreenSpec = {
  key: "bank-statements",
  title: "Sao ke ngan hang",
  moduleKey: "cash",
  route: "/modules/cash/bank-statements",
  description: "Import sao ke, xem line giao dich va danh dau trang thai doi chieu.",
  listColumns: ["So sao ke", "Tai khoan NH", "Ngay sao ke", "So dong", "So du dau", "So du cuoi", "Nguon"],
  fields: [
    { key: "bankAccountCode", label: "Tai khoan NH", type: "lookup", required: true, width: "sm" },
    { key: "statementDate", label: "Ngay sao ke", type: "date", required: true, width: "sm" },
    { key: "sourceName", label: "Nguon import", type: "text", width: "md" }
  ]
};

export const reconciliationScreen: ScreenSpec = {
  key: "bank-reconciliation",
  title: "Doi chieu ngan hang",
  moduleKey: "cash",
  route: "/modules/cash/reconciliation",
  description: "Doi chieu BN/BC voi sao ke ngan hang theo so tien, ngay va tham chieu.",
  listColumns: ["Loai", "So chung tu", "Ngay", "Doi tuong", "Noi dung", "So tien", "Trang thai"],
  fields: [
    { key: "bankAccountCode", label: "Tai khoan NH", type: "lookup", required: true, width: "sm" },
    { key: "statementDate", label: "Ngay sao ke", type: "date", width: "sm" },
    { key: "matchingStatus", label: "Trang thai doi chieu", type: "text", width: "sm" }
  ]
};

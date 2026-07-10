import type { ApprovalItem, BankStatementRecord, ReconciliationItem, VoucherRecord } from "./types";

export const approvalItems: ApprovalItem[] = [
  {
    id: "approval-001",
    module: "Thanh toán",
    voucherNo: "TT1-26070001",
    content: "5.000.000 Thanh toán tiền hàng",
    requester: "Tổng giám đốc",
    status: "overdue",
    dueAt: "2026-07-04 08:13"
  },
  {
    id: "approval-002",
    module: "Đơn hàng bán",
    voucherNo: "SO1-26060003",
    content: "118.800.000 Công ty Cổ phần 32",
    requester: "Phòng Kinh doanh",
    status: "overdue",
    dueAt: "2026-06-02 15:38"
  },
  {
    id: "approval-003",
    module: "Đề nghị mua sắm",
    voucherNo: "DNMS-26070007",
    content: "Mua bổ sung vật tư sản xuất",
    requester: "Kho Nguyên liệu",
    status: "today",
    dueAt: "2026-07-09 17:00"
  }
];

export const journalVouchers: VoucherRecord[] = [
  {
    id: "voucher-001",
    voucherType: "HT1",
    voucherNo: "26070003",
    voucherDate: "2026-07-09",
    currency: "VND",
    counterpartyCode: "AAA",
    counterpartyName: "Công ty AAA",
    content: "Ghi nhận điều chỉnh chi phí tháng 07",
    amount: 5000000,
    status: "draft",
    createdBy: "DEMO.TGD",
    updatedAt: "2026-07-09T08:30:00+07:00",
    lines: [
      {
        id: "line-001",
        debitAccount: "642",
        debitDimension1: "CPQL",
        creditAccount: "331",
        creditDimension1: "AAA",
        amount: 5000000,
        description: "Chi phí quản lý doanh nghiệp"
      }
    ]
  },
  {
    id: "voucher-002",
    voucherType: "HT1",
    voucherNo: "26070002",
    voucherDate: "2026-07-08",
    currency: "VND",
    counterpartyCode: "NCC01",
    counterpartyName: "Nhà cung cấp Minh Long",
    content: "Kết chuyển chi phí sản xuất chung",
    amount: 12800000,
    status: "pending_approval",
    createdBy: "Kế toán tổng hợp",
    updatedAt: "2026-07-08T16:20:00+07:00",
    lines: [
      {
        id: "line-002",
        debitAccount: "154",
        debitDimension1: "SX",
        creditAccount: "627",
        creditDimension1: "CPSXC",
        amount: 12800000,
        description: "Phân bổ chi phí sản xuất chung"
      }
    ]
  },
  {
    id: "voucher-003",
    voucherType: "HT1",
    voucherNo: "26070001",
    voucherDate: "2026-07-02",
    currency: "VND",
    counterpartyCode: "KH32",
    counterpartyName: "Công ty Cổ phần 32",
    content: "Điều chỉnh công nợ phải thu theo hóa đơn",
    amount: 118800000,
    status: "approved",
    createdBy: "Kế toán công nợ",
    updatedAt: "2026-07-02T15:38:00+07:00",
    lines: [
      {
        id: "line-003",
        debitAccount: "131",
        debitDimension1: "KH32",
        creditAccount: "511",
        amount: 108000000,
        description: "Doanh thu bán hàng"
      },
      {
        id: "line-004",
        debitAccount: "131",
        debitDimension1: "KH32",
        creditAccount: "3331",
        amount: 10800000,
        description: "Thuế GTGT đầu ra"
      }
    ]
  }
];

export const cashVouchers: VoucherRecord[] = [
  {
    id: "cash-voucher-001",
    voucherType: "PT",
    voucherNo: "PT1-26070012",
    voucherDate: "2026-07-09",
    currency: "VND",
    paymentChannel: "cash",
    cashBookCode: "TM-01",
    counterpartyCode: "KH-A",
    counterpartyName: "Cong ty AAA",
    referenceInvoiceNo: "BH-26070018",
    content: "Thu tien khach hang cho hoa don BH-26070018",
    amount: 24500000,
    matchedAmount: 0,
    reconciliationStatus: "unmatched",
    status: "pending_approval",
    createdBy: "Thu quy",
    updatedAt: "2026-07-09T09:15:00+07:00",
    lines: [
      {
        id: "cash-line-001",
        debitAccount: "1111",
        debitDimension1: "TM-01",
        creditAccount: "131",
        creditDimension1: "KH-A",
        amount: 24500000,
        description: "Thu tien mat khach hang"
      }
    ]
  },
  {
    id: "cash-voucher-002",
    voucherType: "PC",
    voucherNo: "PC1-26070007",
    voucherDate: "2026-07-08",
    currency: "VND",
    paymentChannel: "cash",
    cashBookCode: "TM-01",
    counterpartyCode: "NCC-MINH",
    counterpartyName: "Nha cung cap Minh Long",
    referenceInvoiceNo: "MH-26070005",
    content: "Chi tien mat thanh toan hoa don mua hang",
    amount: 18000000,
    matchedAmount: 0,
    reconciliationStatus: "unmatched",
    status: "approved",
    createdBy: "Ke toan thanh toan",
    updatedAt: "2026-07-08T14:00:00+07:00",
    lines: [
      {
        id: "cash-line-002",
        debitAccount: "331",
        debitDimension1: "NCC-MINH",
        creditAccount: "1111",
        creditDimension1: "TM-01",
        amount: 18000000,
        description: "Chi tien mat tra nha cung cap"
      }
    ]
  },
  {
    id: "cash-voucher-003",
    voucherType: "BN",
    voucherNo: "BN1-26070003",
    voucherDate: "2026-07-09",
    currency: "VND",
    paymentChannel: "bank",
    bankAccountCode: "VCB-001",
    counterpartyCode: "NCC-TTP",
    counterpartyName: "Nha cung cap TTP",
    referenceInvoiceNo: "MH-26070008",
    content: "Bao no thanh toan chuyen khoan cho nha cung cap",
    amount: 62000000,
    matchedAmount: 62000000,
    reconciliationStatus: "matched",
    status: "posted",
    createdBy: "Ke toan ngan hang",
    updatedAt: "2026-07-09T10:20:00+07:00",
    lines: [
      {
        id: "cash-line-003",
        debitAccount: "331",
        debitDimension1: "NCC-TTP",
        creditAccount: "1121",
        creditDimension1: "VCB-001",
        amount: 62000000,
        description: "Chuyen khoan thanh toan NCC"
      }
    ]
  },
  {
    id: "cash-voucher-004",
    voucherType: "BC",
    voucherNo: "BC1-26070005",
    voucherDate: "2026-07-09",
    currency: "VND",
    paymentChannel: "bank",
    bankAccountCode: "VCB-001",
    counterpartyCode: "KH32",
    counterpartyName: "Cong ty Co phan 32",
    referenceInvoiceNo: "BH-26070011",
    content: "Bao co thu tien khach hang qua ngan hang",
    amount: 54000000,
    matchedAmount: 30000000,
    reconciliationStatus: "partial",
    status: "approved",
    createdBy: "Ke toan ngan hang",
    updatedAt: "2026-07-09T11:05:00+07:00",
    lines: [
      {
        id: "cash-line-004",
        debitAccount: "1121",
        debitDimension1: "VCB-001",
        creditAccount: "131",
        creditDimension1: "KH32",
        amount: 54000000,
        description: "Thu tien chuyen khoan khach hang"
      }
    ]
  }
];

export const bankStatements: BankStatementRecord[] = [
  {
    id: "statement-001",
    bankAccountCode: "VCB-001",
    statementNo: "VCB-09072026",
    statementDate: "2026-07-09",
    openingBalance: 8012000000,
    closingBalance: 8069000000,
    importedAt: "2026-07-09T12:10:00+07:00",
    lineCount: 3,
    sourceName: "VCB CSV Import",
    lines: [
      {
        id: "statement-line-001",
        lineNo: 1,
        transactionDate: "2026-07-09",
        description: "Thu tien KH32 BH-26070011",
        debitAmount: 0,
        creditAmount: 30000000,
        runningBalance: 8042000000,
        referenceNo: "BC1-26070005",
        matchingStatus: "partial"
      },
      {
        id: "statement-line-002",
        lineNo: 2,
        transactionDate: "2026-07-09",
        description: "Thanh toan NCC TTP MH-26070008",
        debitAmount: 62000000,
        creditAmount: 0,
        runningBalance: 7980000000,
        referenceNo: "BN1-26070003",
        matchingStatus: "matched"
      },
      {
        id: "statement-line-003",
        lineNo: 3,
        transactionDate: "2026-07-09",
        description: "Thu tien khach hang le",
        debitAmount: 0,
        creditAmount: 8700000,
        runningBalance: 8069000000,
        referenceNo: "",
        matchingStatus: "unmatched"
      }
    ]
  }
];

export const reconciliationItems = {
  vouchers: [
    {
      id: "recon-voucher-001",
      voucherId: "cash-voucher-004",
      voucherType: "BC",
      voucherNo: "BC1-26070005",
      transactionDate: "2026-07-09",
      counterpartyName: "Cong ty Co phan 32",
      description: "Thu tien chuyen khoan khach hang",
      amount: 24000000,
      bankAccountCode: "VCB-001",
      matchingStatus: "partial"
    },
    {
      id: "recon-voucher-002",
      voucherId: "cash-voucher-001",
      voucherType: "PT",
      voucherNo: "PT1-26070012",
      transactionDate: "2026-07-09",
      counterpartyName: "Cong ty AAA",
      description: "Thu tien mat khach hang",
      amount: 24500000,
      bankAccountCode: "",
      matchingStatus: "unmatched"
    }
  ] satisfies ReconciliationItem[],
  statements: [
    {
      id: "recon-statement-001",
      statementLineId: "statement-line-003",
      transactionDate: "2026-07-09",
      description: "Thu tien khach hang le",
      amount: 8700000,
      bankAccountCode: "VCB-001",
      matchingStatus: "unmatched"
    },
    {
      id: "recon-statement-002",
      statementLineId: "statement-line-001",
      transactionDate: "2026-07-09",
      description: "Thu tien KH32 BH-26070011",
      amount: 24000000,
      bankAccountCode: "VCB-001",
      matchingStatus: "partial"
    }
  ] satisfies ReconciliationItem[]
};

export const workitSyncContracts = [
  {
    entity: "cash_receipts",
    source: "WORKIT",
    mode: "incremental",
    keyField: "source_record_id",
    updatedField: "updated_at",
    requiredFields: ["voucher_no", "voucher_date", "amount", "cash_book_code", "counterparty_code"]
  },
  {
    entity: "cash_payments",
    source: "WORKIT",
    mode: "incremental",
    keyField: "source_record_id",
    updatedField: "updated_at",
    requiredFields: ["voucher_no", "voucher_date", "amount", "cash_book_code", "counterparty_code"]
  },
  {
    entity: "bank_debits",
    source: "WORKIT",
    mode: "incremental",
    keyField: "source_record_id",
    updatedField: "updated_at",
    requiredFields: ["voucher_no", "voucher_date", "amount", "bank_account_code", "counterparty_code"]
  },
  {
    entity: "bank_credits",
    source: "WORKIT",
    mode: "incremental",
    keyField: "source_record_id",
    updatedField: "updated_at",
    requiredFields: ["voucher_no", "voucher_date", "amount", "bank_account_code", "counterparty_code"]
  },
  {
    entity: "bank_statement_lines",
    source: "WORKIT",
    mode: "incremental",
    keyField: "source_record_id",
    updatedField: "updated_at",
    requiredFields: ["statement_no", "transaction_date", "debit_amount", "credit_amount", "bank_account_code"]
  }
];

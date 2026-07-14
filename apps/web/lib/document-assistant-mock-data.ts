export type AssistantClassification = "invoice" | "bank_statement" | "journal_source" | "unknown";
export type AssistantMappingStatus = "Tin cậy cao" | "Cần xác nhận" | "Chưa map";

export type AssistantMappingSuggestion = {
  id: string;
  sourceType: "KH" | "NCC" | "Hợp đồng" | "Tài khoản";
  sourceValue: string;
  suggestedValue: string;
  confidence: number;
  status: AssistantMappingStatus;
  reason: string;
};

export type AssistantJournalLine = {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  dimension: string;
  description: string;
};

export type AssistantStatementLine = {
  id: string;
  transactionTime: string;
  referenceNo: string;
  description: string;
  amount: number;
  direction: "Thu" | "Chi";
  suggestedVoucher: string;
  matchStatus: "Matched" | "Partial" | "Unmatched" | "Review";
  confidence: number;
};

export type DocumentAssistantMock = {
  id: string;
  fileName: string;
  sourceModule: string;
  classification: AssistantClassification;
  classificationLabel: string;
  confidence: number;
  extractedFields: Array<{ label: string; value: string }>;
  mappingSuggestions: AssistantMappingSuggestion[];
  journalLines: AssistantJournalLine[];
  statementLines?: AssistantStatementLine[];
  recommendation: string;
};

export const documentAssistantMocks: DocumentAssistantMock[] = [
  {
    id: "doc-invoice-ncc-001",
    fileName: "NCC_TinPhat_HD_000876.pdf",
    sourceModule: "Hóa đơn đầu vào",
    classification: "invoice",
    classificationLabel: "Hóa đơn NCC",
    confidence: 96,
    extractedFields: [
      { label: "Số hóa đơn", value: "HD-TP-000876" },
      { label: "Ngày hóa đơn", value: "2026-07-12" },
      { label: "Nhà cung cấp", value: "Công ty TNHH Tín Phát" },
      { label: "MST", value: "0312456789" },
      { label: "Tiền hàng", value: "84.000.000 đ" },
      { label: "VAT", value: "8.400.000 đ" },
      { label: "Tổng thanh toán", value: "92.400.000 đ" },
      { label: "Nội dung", value: "Dịch vụ vận chuyển tháng 07/2026" }
    ],
    mappingSuggestions: [
      {
        id: "map-ncc-tinphat",
        sourceType: "NCC",
        sourceValue: "Công ty TNHH Tín Phát / 0312456789",
        suggestedValue: "NCC-TTP - Nhà cung cấp Tín Phát",
        confidence: 97,
        status: "Tin cậy cao",
        reason: "Trùng MST, tên gần đúng và lịch sử hóa đơn mua."
      },
      {
        id: "map-contract-log-2026",
        sourceType: "Hợp đồng",
        sourceValue: "Dịch vụ vận chuyển tháng 07/2026",
        suggestedValue: "HDVC-2026-07 - Hợp đồng logistics tháng 07",
        confidence: 86,
        status: "Cần xác nhận",
        reason: "Nội dung khớp từ khóa vận chuyển và kỳ tháng 07."
      },
      {
        id: "map-account-6427",
        sourceType: "Tài khoản",
        sourceValue: "Dịch vụ vận chuyển",
        suggestedValue: "6427 - Chi phí dịch vụ mua ngoài",
        confidence: 91,
        status: "Tin cậy cao",
        reason: "Theo rule chi phí dịch vụ và lịch sử định khoản NCC."
      }
    ],
    journalLines: [
      {
        debitAccount: "6427",
        creditAccount: "331",
        amount: 84000000,
        dimension: "NCC-TTP / HDVC-2026-07",
        description: "Ghi nhận chi phí dịch vụ vận chuyển."
      },
      {
        debitAccount: "1331",
        creditAccount: "331",
        amount: 8400000,
        dimension: "NCC-TTP",
        description: "Thuế GTGT đầu vào được khấu trừ."
      }
    ],
    recommendation: "Tạo hóa đơn đầu vào chờ duyệt, sau đó kế toán xác nhận mapping NCC và hợp đồng."
  },
  {
    id: "doc-bank-vcb-001",
    fileName: "VCB_statement_2026-07-14.csv",
    sourceModule: "Sổ quỹ & ngân hàng",
    classification: "bank_statement",
    classificationLabel: "Sao kê ngân hàng",
    confidence: 94,
    extractedFields: [
      { label: "Ngân hàng", value: "Vietcombank" },
      { label: "Số tài khoản", value: "VCB-001 - 0123456789" },
      { label: "Ngày sao kê", value: "2026-07-14" },
      { label: "Số dòng đọc được", value: "5" },
      { label: "Định dạng", value: "CSV/XLSX chuẩn hóa" }
    ],
    mappingSuggestions: [
      {
        id: "map-kh-minhan",
        sourceType: "KH",
        sourceValue: "KH Minh An thanh toán HD00256",
        suggestedValue: "KH-MINH-AN - Công ty Minh An",
        confidence: 95,
        status: "Tin cậy cao",
        reason: "Nội dung chuyển khoản chứa mã hóa đơn và tên khách hàng."
      },
      {
        id: "map-account-1121",
        sourceType: "Tài khoản",
        sourceValue: "VCB-001",
        suggestedValue: "1121 - Tiền gửi VCB",
        confidence: 99,
        status: "Tin cậy cao",
        reason: "Trùng tài khoản ngân hàng đã mapping."
      }
    ],
    journalLines: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount: 12500000,
        dimension: "KH-MINH-AN / HD00256",
        description: "Khách hàng thanh toán công nợ qua ngân hàng."
      },
      {
        debitAccount: "6428",
        creditAccount: "1121",
        amount: 55000,
        dimension: "VCB-001",
        description: "Tạo chứng từ nháp phí ngân hàng."
      }
    ],
    statementLines: [
      {
        id: "ai-st-001",
        transactionTime: "2026-07-14 09:12:30",
        referenceNo: "FT-AI-26071401",
        description: "KH Minh An thanh toan HD00256",
        amount: 12500000,
        direction: "Thu",
        suggestedVoucher: "BC-DEMO-M01",
        matchStatus: "Matched",
        confidence: 99
      },
      {
        id: "ai-st-002",
        transactionTime: "2026-07-14 10:05:44",
        referenceNo: "FT-AI-26071402",
        description: "KH32 thanh toan mot phan BH-26070011",
        amount: 24000000,
        direction: "Thu",
        suggestedVoucher: "BC-PART-01",
        matchStatus: "Partial",
        confidence: 91
      },
      {
        id: "ai-st-003",
        transactionTime: "2026-07-14 15:42:08",
        referenceNo: "FEE-VCB-0714",
        description: "Phi dich vu ngan hang",
        amount: 55000,
        direction: "Chi",
        suggestedVoucher: "HT-NHAP-PHI-001",
        matchStatus: "Unmatched",
        confidence: 88
      }
    ],
    recommendation: "Đưa các dòng matched/partial sang đối chiếu, dòng phí ngân hàng tạo chứng từ nháp để kế toán duyệt."
  },
  {
    id: "doc-journal-source-001",
    fileName: "Bien_ban_doi_chieu_cong_no_KH32.pdf",
    sourceModule: "Sổ cái & hạch toán",
    classification: "journal_source",
    classificationLabel: "Nguồn hạch toán",
    confidence: 89,
    extractedFields: [
      { label: "Đối tượng", value: "KH32 - Công ty Cổ phần 32" },
      { label: "Kỳ đối chiếu", value: "07/2026" },
      { label: "Số tiền xác nhận", value: "240.000.000 đ" },
      { label: "Chứng từ gốc", value: "BBĐC-KH32-0726" },
      { label: "Nội dung", value: "Điều chỉnh công nợ phải thu sau đối chiếu" }
    ],
    mappingSuggestions: [
      {
        id: "map-kh32",
        sourceType: "KH",
        sourceValue: "Công ty Cổ phần 32",
        suggestedValue: "KH32 - Công ty Cổ phần 32",
        confidence: 98,
        status: "Tin cậy cao",
        reason: "Trùng mã khách hàng, tên pháp lý và lịch sử công nợ."
      },
      {
        id: "map-account-131",
        sourceType: "Tài khoản",
        sourceValue: "Công nợ phải thu khách hàng",
        suggestedValue: "131 - Phải thu khách hàng",
        confidence: 94,
        status: "Tin cậy cao",
        reason: "Loại chứng từ là biên bản đối chiếu công nợ phải thu."
      }
    ],
    journalLines: [
      {
        debitAccount: "131",
        creditAccount: "711",
        amount: 240000000,
        dimension: "KH32 / BBĐC-KH32-0726",
        description: "Điều chỉnh tăng công nợ theo biên bản đối chiếu."
      }
    ],
    recommendation: "Tạo phiếu hạch toán nháp để kế toán kiểm tra chứng từ gốc trước khi ghi sổ."
  }
];

export const invoiceAssistantMock = documentAssistantMocks[0];
export const bankStatementAssistantMock = documentAssistantMocks[1];
export const journalAssistantMock = documentAssistantMocks[2];

export const assistantMappingSuggestions = documentAssistantMocks.flatMap((item) =>
  item.mappingSuggestions.map((mapping) => ({
    ...mapping,
    documentFile: item.fileName,
    sourceModule: item.sourceModule
  }))
);

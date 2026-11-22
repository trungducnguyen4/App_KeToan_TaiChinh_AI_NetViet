export type ModuleKey =
  | "accounting"
  | "cash"
  | "receivables"
  | "inventory"
  | "sales"
  | "purchasing"
  | "capital"
  | "masterData"
  | "system";

export type ModuleStatus = "ready" | "scaffold" | "syncing";

export type VoucherStatus = "draft" | "pending_approval" | "approved" | "posted" | "voided";
export type CashVoucherType = "PT" | "PC" | "BN" | "BC";
export type PaymentChannel = "cash" | "bank";
export type MatchingStatus = "unmatched" | "partial" | "matched";
export type SyncEntityName =
  | "cash_receipts"
  | "cash_payments"
  | "bank_debits"
  | "bank_credits"
  | "bank_statement_lines";

export type ApprovalDeadline = "overdue" | "today" | "soon" | "normal";

export interface WorkitModule {
  key: ModuleKey;
  code: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  status: ModuleStatus;
  route: string;
  primaryScreens: string[];
}

export interface KpiCard {
  label: string;
  value: string;
  delta?: string;
  tone: "green" | "blue" | "amber" | "red" | "gray";
}

export interface ApprovalItem {
  id: string;
  module: string;
  voucherNo: string;
  content: string;
  requester: string;
  status: ApprovalDeadline;
  dueAt: string;
}

export interface JournalLine {
  id: string;
  debitAccount: string;
  debitDimension1?: string;
  debitDimension2?: string;
  creditAccount: string;
  creditDimension1?: string;
  creditDimension2?: string;
  foreignAmount?: number;
  amount: number;
  description: string;
}

export interface VoucherRecord {
  id: string;
  voucherType: string;
  voucherNo: string;
  voucherDate: string;
  currency: string;
  paymentChannel?: PaymentChannel;
  bankAccountCode?: string;
  cashBookCode?: string;
  matchedAmount?: number;
  reconciliationStatus?: MatchingStatus;
  referenceInvoiceNo?: string;
  counterpartyCode?: string;
  counterpartyName?: string;
  content: string;
  amount: number;
  status: VoucherStatus;
  createdBy: string;
  updatedAt: string;
  lines: JournalLine[];
}

export interface FieldSpec {
  key: string;
  label: string;
  type: "text" | "date" | "month" | "currency" | "textarea" | "lookup" | "number";
  required?: boolean;
  width?: "sm" | "md" | "lg" | "xl";
}

export interface ScreenSpec {
  key: string;
  title: string;
  moduleKey: ModuleKey;
  route: string;
  description: string;
  listColumns: string[];
  fields: FieldSpec[];
}

export interface CashVoucherScreenSpec extends ScreenSpec {
  voucherType: CashVoucherType;
  paymentChannel: PaymentChannel;
  counterpartyLabel: string;
  amountLabel: string;
}

export interface BankStatementLineRecord {
  id: string;
  lineNo: number;
  transactionDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  referenceNo?: string;
  matchingStatus: MatchingStatus;
}

export interface BankStatementRecord {
  id: string;
  bankAccountCode: string;
  statementNo: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  importedAt: string;
  lineCount: number;
  sourceName: string;
  lines: BankStatementLineRecord[];
}

export interface ReconciliationItem {
  id: string;
  voucherId?: string;
  statementLineId?: string;
  voucherType?: CashVoucherType;
  voucherNo?: string;
  transactionDate: string;
  counterpartyName?: string;
  description: string;
  amount: number;
  bankAccountCode?: string;
  matchingStatus: MatchingStatus;
}

export interface CashDashboardMetric {
  label: string;
  value: string;
  hint: string;
  tone: "green" | "blue" | "amber" | "red" | "gray";
}

export type DocType = "PURCHASE_SLIP" | "VAT_INVOICE";
export type CostCategory = "RAW_MATERIAL" | "PROCESSING" | "OVERHEAD";
export type ProcessStage = "EP" | "LOC" | "DONG_PHUY";
export type AllocationMode = "BATCH" | "PERIOD";

export interface PurchasingInvoiceItem {
  id: string;
  voucherNo: string;
  voucherDate: string;
  docType: DocType;
  supplierName: string;
  supplierCode?: string;
  taxCode?: string;
  invoiceSeries?: string;
  invoiceTemplate?: string;
  costCategory: CostCategory;
  processStage?: ProcessStage;
  allocationMode: AllocationMode;
  batchId?: string;
  batchCode?: string;
  vehiclePlate?: string;
  grossWeightKg?: number;
  tareWeightKg?: number;
  netWeightKg?: number;
  unitPrice?: number;
  handlingFee?: number;
  subtotal: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount: number;
  description?: string;
  paymentStatus: "UNPAID" | "PAID";
  paymentVoucherNo?: string;
  checksum?: string;
  attachmentFileName?: string;
  createdAt: string;
}

export interface ProductionBatchRecord {
  id: string;
  batchCode: string;
  batchDate: string;
  supplierId?: string;
  supplierName?: string;
  rawMaterialKg: number;
  crudeOilKg: number;
  crudeOilLiters: number;
  byproductKg: number;
  oilYieldRate: number;
  lossRate: number;
  rawMaterialCost: number;
  processingCost: number;
  overheadCost: number;
  byproductRecovery: number;
  totalCost: number;
  unitCostPerKg: number;
  status: "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: string;
}

export interface SupplierYieldPerformance {
  supplierName: string;
  batchCount: number;
  totalRawKg: number;
  totalCrudeOilKg: number;
  totalByproductKg: number;
  avgYieldRate: number;
  rating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  recommendation: string;
}

// ==========================================
// CAPEX, EQUITY & BUSINESS FEASIBILITY TYPES
// ==========================================

export type AssetCategory =
  | "MACHINERY"      // Dây chuyền máy móc ép dầu (máy ép, sấy, lọc, ly tâm)
  | "INFRASTRUCTURE" // Nhà xưởng, nền bê tông, mái che, bể lắng, hố nước thải
  | "STORAGE_TANK"   // Bồn chứa inox, téc dầu, hệ thống đường ống
  | "VEHICLE_SCALE"  // Trạm cân xe tải, xe nâng, bốc dỡ
  | "OFFICE_TECH";   // Thiết bị vi tính, camera giám sát xưởng

export interface CapitalAsset {
  id: string;
  assetCode: string;
  assetName: string;
  category: AssetCategory;
  acquisitionDate: string;
  originalCost: number;       // Nguyên giá (VNĐ)
  residualValue: number;      // Giá trị thanh lý ước tính
  usefulLifeMonths: number;   // Số tháng khấu hao (ví dụ: 60 tháng = 5 năm)
  monthlyDepreciation: number;// Mức khấu hao mỗi tháng (VNĐ/tháng)
  accumulatedDepreciation: number; // Khấu hao lũy kế đến hiện tại
  currentBookValue: number;   // Giá trị còn lại trên sổ sách
  supplierOrBrand?: string;   // Nhà cung cấp / Xuất xứ máy
  status: "ACTIVE" | "MAINTENANCE" | "DISPOSED";
  notes?: string;
}

export type ContributorRole = "FOUNDER" | "INVESTOR" | "OPERATOR";

export interface Shareholder {
  id: string;
  shareholderCode: string;
  name: string;
  role: ContributorRole;
  ownershipPercentage: number; // Tỷ lệ sở hữu (%)
  committedCapital: number;    // Vốn cam kết góp (VNĐ)
  contributedCapital: number;  // Vốn thực tế đã góp (VNĐ)
  remainingCapital: number;    // Vốn còn phải góp
  phoneNumber?: string;
  joinDate: string;
  notes?: string;
}

export type CapitalType =
  | "INITIAL_CAPEX"     // Vốn đầu tư ban đầu (máy móc, xưởng)
  | "WORKING_CAPITAL"   // Vốn lưu động (tiền mua dừa, trả lương)
  | "EXPANSION_CAPEX";  // Vốn mở rộng công suất / nâng cấp

export interface CapitalContribution {
  id: string;
  contributionNo: string;
  contributionDate: string;
  shareholderId: string;
  shareholderName: string;
  amount: number;
  capitalType: CapitalType;
  paymentMethod: "BANK" | "CASH" | "ASSET";
  bankAccount?: string;
  purpose: string;
  verifiedBy: string;
  status: "COMPLETED" | "PENDING";
}

export interface BusinessFeasibilityMetrics {
  // 1. Tổng mức đầu tư
  totalCapexInvested: number;          // Tổng nguyên giá máy móc & nhà xưởng
  totalWorkingCapitalInjected: number; // Tổng vốn lưu động đã rót
  totalCapitalContributed: number;     // Tổng vốn các cổ đông đã góp thực tế
  totalCapitalCommitted: number;       // Tổng vốn cam kết

  // 2. Khấu hao hàng tháng
  monthlyDepreciationTotal: number;     // Tổng khấu hao máy móc xưởng / tháng
  depreciationPerKgCrudeOil: number;   // Chi phí khấu hao phân bổ trên 1 kg dầu ép ra

  // 3. Kết quả kinh doanh & Dòng tiền
  totalRevenue: number;                // Tổng doanh thu bán dầu + bã
  totalOperatingExpense: number;       // Chi phí dừa + điện + nhân công + vận hành
  grossProfit: number;                 // Lợi nhuận gộp
  operatingProfit: number;             // Lợi nhuận trước khấu hao (EBITDA)
  netProfit: number;                   // Lợi nhuận ròng sau khấu hao máy móc

  // 4. Chỉ số kinh doanh & Điểm hòa vốn
  roiPercentage: number;               // Tỷ suất sinh lời trên tổng vốn đầu tư (ROI %)
  breakEvenMonthlyKgRaw: number;       // Sản lượng dừa cần ép/tháng để hòa vốn
  breakEvenMonthlyKgOil: number;       // Sản lượng dầu cần bán/tháng để hòa vốn
  breakEvenMonthlyRevenue: number;     // Doanh thu tối thiểu cần đạt/tháng
  currentMonthlyCapacityRate: number;  // Tỷ lệ công suất hiện tại so với hòa vốn (%)

  // 5. Dự phóng thời gian hoàn vốn
  estimatedPaybackMonths: number;      // Thời gian hoàn vốn dự kiến (Số tháng)
  estimatedPaybackYears: number;       // Số năm hoàn vốn
  capitalRecoveredToDate: number;      // Số tiền đã thu hồi được đến hiện tại
  capitalRecoveryRate: number;         // Tỷ lệ hoàn vốn đã đạt (% vốn)
}


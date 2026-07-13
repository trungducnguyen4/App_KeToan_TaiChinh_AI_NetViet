export type ModuleKey =
  | "accounting"
  | "cash"
  | "receivables"
  | "inventory"
  | "sales"
  | "purchasing"
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
  bankAccountName?: string;
  cashBookCode?: string;
  matchedAmount?: number;
  reconciliationStatus?: MatchingStatus;
  referenceInvoiceNo?: string;
  sourceVoucherNo?: string;
  referenceNo?: string;
  counterpartyCode?: string;
  counterpartyName?: string;
  counterpartyAddress?: string;
  projectName?: string;
  content: string;
  amount: number;
  status: VoucherStatus;
  createdBy: string;
  createdAt?: string;
  updatedBy?: string;
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

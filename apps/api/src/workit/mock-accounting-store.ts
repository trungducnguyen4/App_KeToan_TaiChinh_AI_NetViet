import { randomUUID } from "node:crypto";
import { bankStatements, cashVouchers, journalVouchers } from "@domain/index";
import type {
  BankStatementRecord,
  CashDashboardMetric,
  CashVoucherType,
  MatchingStatus,
  ReconciliationItem,
  VoucherRecord,
} from "@domain/types";

type VoucherQuery = { q?: string; status?: string; type?: CashVoucherType };
type StatementLineInput = {
  transactionDate: string;
  referenceNo?: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  amount?: number;
};
type ImportStatementInput = Pick<
  BankStatementRecord,
  "statementNo" | "bankAccountCode" | "statementDate" | "openingBalance" | "closingBalance"
> & {
  sourceName?: string;
  lines: StatementLineInput[];
};
type MatchInput = {
  voucherId: string;
  bankStatementLineId: string;
  matchedAmount: number;
  note?: string;
};
type DebtInvoice = {
  id: string;
  accountCode: "131" | "331";
  invoiceNo: string;
  counterpartyCode: string;
  counterpartyName: string;
  counterpartyType: "customer" | "supplier";
  contractNo?: string;
  dueDate: string;
  originalAmount: number;
  paidAmount: number;
  memo: string;
  allocations: Array<{ voucherId: string; voucherNo: string; amount: number }>;
};
type ReconciliationMatch = {
  id: string;
  voucherId: string;
  statementLineId: string;
  matchedAmount: number;
  note?: string;
};
export type MonitoringAlertCategory =
  | "debt_overdue"
  | "expense_limit"
  | "cashflow_negative"
  | "journal_anomaly";
export type MonitoringAlertSeverity = "critical" | "high" | "medium" | "low";
export type MonitoringAlertStatus = "new" | "reviewing" | "resolved";
export type MockMonitoringAlert = {
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

const nowIso = () => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const amountOfLine = (line: StatementLineInput | BankStatementRecord["lines"][number]) =>
  Math.max(Number(line.debitAmount ?? 0), Number(line.creditAmount ?? 0), Number("amount" in line ? line.amount ?? 0 : 0));
const dayMs = 24 * 60 * 60 * 1000;
const toDateOnly = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00Z`);
const daysBetween = (from: string, to = new Date().toISOString().slice(0, 10)) =>
  Math.floor((toDateOnly(to).getTime() - toDateOnly(from).getTime()) / dayMs);
const formatVnd = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} VND`;

class MockAccountingStore {
  private vouchers: VoucherRecord[] = clone([...cashVouchers, ...journalVouchers]);
  private statements: BankStatementRecord[] = clone(bankStatements);
  private alertStatusOverrides = new Map<string, MonitoringAlertStatus>();
  private matches: ReconciliationMatch[] = [
    {
      id: "match-seed-001",
      voucherId: "cash-voucher-003",
      statementLineId: "statement-line-002",
      matchedAmount: 62_000_000,
      note: "Seed matched BN with bank statement",
    },
    {
      id: "match-seed-002",
      voucherId: "cash-voucher-004",
      statementLineId: "statement-line-001",
      matchedAmount: 30_000_000,
      note: "Seed partial BC with bank statement",
    },
  ];
  private debtInvoices: DebtInvoice[] = [
    {
      id: "ar-bh-26070011",
      accountCode: "131",
      invoiceNo: "BH-26070011",
      counterpartyCode: "KH32",
      counterpartyName: "Công ty Cổ phần 32",
      counterpartyType: "customer",
      contractNo: "HDBH-KH32-2026",
      dueDate: "2026-07-18",
      originalAmount: 54_000_000,
      paidAmount: 30_000_000,
      memo: "Công nợ phải thu TK 131 theo hóa đơn",
      allocations: [{ voucherId: "cash-voucher-004", voucherNo: "BC1-26070005", amount: 30_000_000 }],
    },
    {
      id: "ar-bh-26070018",
      accountCode: "131",
      invoiceNo: "BH-26070018",
      counterpartyCode: "KH-A",
      counterpartyName: "Công ty AAA",
      counterpartyType: "customer",
      contractNo: "HDBH-AAA-2026",
      dueDate: "2026-07-20",
      originalAmount: 24_500_000,
      paidAmount: 0,
      memo: "Hóa đơn bán hàng chưa thu tiền",
      allocations: [],
    },
    {
      id: "ap-mh-26070008",
      accountCode: "331",
      invoiceNo: "MH-26070008",
      counterpartyCode: "NCC-TTP",
      counterpartyName: "Nhà cung cấp TTP",
      counterpartyType: "supplier",
      contractNo: "HDVC-2026-07",
      dueDate: "2026-07-14",
      originalAmount: 62_000_000,
      paidAmount: 62_000_000,
      memo: "Công nợ phải trả TK 331 đã thanh toán",
      allocations: [{ voucherId: "cash-voucher-003", voucherNo: "BN1-26070003", amount: 62_000_000 }],
    },
    {
      id: "ap-mh-26070005",
      accountCode: "331",
      invoiceNo: "MH-26070005",
      counterpartyCode: "NCC-MINH",
      counterpartyName: "Nhà cung cấp Minh Long",
      counterpartyType: "supplier",
      contractNo: "HDM-2026-07",
      dueDate: "2026-07-16",
      originalAmount: 18_000_000,
      paidAmount: 0,
      memo: "Hóa đơn mua hàng chưa thanh toán",
      allocations: [],
    },
    {
      id: "ar-bh-26060018",
      accountCode: "131",
      invoiceNo: "BH-26060018",
      counterpartyCode: "KH-MINH-AN",
      counterpartyName: "Công ty Minh An",
      counterpartyType: "customer",
      contractNo: "HDBH-MINH-AN-2026",
      dueDate: "2026-06-10",
      originalAmount: 180_000_000,
      paidAmount: 0,
      memo: "Công nợ phải thu quá hạn cân nhắc nợ",
      allocations: [],
    },
    {
      id: "ap-mh-26060005",
      accountCode: "331",
      invoiceNo: "MH-26060005",
      counterpartyCode: "NCC-MINH",
      counterpartyName: "Nhà cung cấp Minh Long",
      counterpartyType: "supplier",
      contractNo: "HDM-MINH-2026",
      dueDate: "2026-07-08",
      originalAmount: 60_000_000,
      paidAmount: 0,
      memo: "Công nợ phải trả quá hạn cần đối chiếu trước khi thanh toán",
      allocations: [],
    },
  ];

  listCashVouchers(query?: VoucherQuery) {
    const search = query?.q?.trim().toLowerCase();
    return this.vouchers
      .filter((voucher) => ["PT", "PC", "BN", "BC"].includes(voucher.voucherType))
      .filter((voucher) => !query?.type || voucher.voucherType === query.type)
      .filter((voucher) => !query?.status || voucher.status === query.status)
      .filter((voucher) => {
        if (!search) return true;
        return [voucher.voucherNo, voucher.content, voucher.counterpartyName, voucher.referenceInvoiceNo]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      })
      .sort((a, b) => b.voucherDate.localeCompare(a.voucherDate))
      .map(clone);
  }

  getCashVoucher(id: string) {
    const voucher = this.vouchers.find((item) => item.id === id && ["PT", "PC", "BN", "BC"].includes(item.voucherType));
    if (!voucher) return undefined;
    return clone(voucher);
  }

  createCashVoucher(input: any) {
    const voucher: VoucherRecord = {
      ...clone(input),
      id: `mock-voucher-${randomUUID()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      matchedAmount: input.matchedAmount ?? 0,
      reconciliationStatus: input.paymentChannel === "bank" ? "unmatched" : "matched",
      lines: input.lines.map((line: any, index: number) => ({
        ...line,
        id: line.id || `mock-line-${Date.now()}-${index}`,
      })),
    };

    this.vouchers.unshift(voucher);
    return clone(voucher);
  }

  updateCashVoucher(id: string, input: any) {
    const index = this.vouchers.findIndex((item) => item.id === id);
    if (index < 0) return undefined;
    this.vouchers[index] = {
      ...this.vouchers[index],
      ...clone(input),
      id,
      updatedAt: nowIso(),
      lines: input.lines ?? this.vouchers[index].lines,
    };
    return clone(this.vouchers[index]);
  }

  getCashDashboard() {
    const cashVouchers = this.listCashVouchers();
    const byType = (type: CashVoucherType) => cashVouchers.filter((item) => item.voucherType === type);
    const sum = (type: CashVoucherType) => byType(type).reduce((total, item) => total + item.amount, 0);
    const unmatchedStatements = this.statements.flatMap((item) => item.lines).filter((line) => line.matchingStatus !== "matched").length;
    const metrics: CashDashboardMetric[] = [
      { label: "Số dư quỹ tiền mặt", value: this.formatCompact(sum("PT") - sum("PC")), hint: `${byType("PT").length} PT / ${byType("PC").length} PC`, tone: "green" },
      { label: "Số dư tiền gửi", value: this.formatCompact(sum("BC") - sum("BN")), hint: `${byType("BC").length} BC / ${byType("BN").length} BN`, tone: "blue" },
      { label: "Dòng cần đối chiếu", value: `${unmatchedStatements}`, hint: "Dòng sao kê chưa khớp", tone: "amber" },
      { label: "Chứng từ chờ duyệt", value: `${cashVouchers.filter((item) => item.status === "pending_approval").length}`, hint: "Hàng đợi duyệt giả lập", tone: "red" },
    ];

    return {
      metrics,
      vouchersByType: (["PT", "PC", "BN", "BC"] as CashVoucherType[]).map((type) => ({ type, count: byType(type).length })),
      unmatchedStatements,
      pendingApprovals: cashVouchers.filter((item) => item.status === "pending_approval").length,
    };
  }

  listBankStatements() {
    return clone(this.statements);
  }

  importBankStatement(input: ImportStatementInput) {
    const statement: BankStatementRecord = {
      id: `mock-statement-${randomUUID()}`,
      bankAccountCode: input.bankAccountCode,
      statementNo: input.statementNo,
      statementDate: input.statementDate,
      openingBalance: input.openingBalance,
      closingBalance: input.closingBalance,
      importedAt: nowIso(),
      lineCount: input.lines.length,
      sourceName: input.sourceName ?? "mock-import",
      lines: input.lines.map((line, index) => ({
        id: `mock-statement-line-${randomUUID()}`,
        lineNo: index + 1,
        transactionDate: line.transactionDate,
        description: line.description,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        runningBalance: index === input.lines.length - 1 ? input.closingBalance : 0,
        referenceNo: line.referenceNo,
        matchingStatus: "unmatched",
      })),
    };
    this.statements.unshift(statement);
    return clone(statement);
  }

  getReconciliation() {
    const vouchers = this.listCashVouchers()
      .filter((voucher) => ["BN", "BC"].includes(voucher.voucherType) && voucher.reconciliationStatus !== "matched")
      .map<ReconciliationItem>((voucher) => ({
        id: `recon-${voucher.id}`,
        voucherId: voucher.id,
        voucherType: voucher.voucherType as CashVoucherType,
        voucherNo: voucher.voucherNo,
        transactionDate: voucher.voucherDate,
        counterpartyName: voucher.counterpartyName,
        description: voucher.content,
        amount: Math.max(0, voucher.amount - (voucher.matchedAmount ?? 0)),
        bankAccountCode: voucher.bankAccountCode,
        matchingStatus: voucher.reconciliationStatus ?? "unmatched",
      }));
    const statements = this.statements
      .flatMap((statement) => statement.lines.map((line) => ({ statement, line })))
      .filter(({ line }) => line.matchingStatus !== "matched")
      .map<ReconciliationItem>(({ statement, line }) => ({
        id: `recon-line-${line.id}`,
        statementLineId: line.id,
        transactionDate: line.transactionDate,
        description: line.description,
        amount: Math.max(0, amountOfLine(line) - this.sumLineMatched(line.id)),
        bankAccountCode: statement.bankAccountCode,
        matchingStatus: line.matchingStatus,
      }));

    return { vouchers, statements };
  }

  getDebtCandidates() {
    return this.debtInvoices
      .filter((invoice) => invoice.originalAmount - invoice.paidAmount > 0)
      .map((invoice) => ({
        document_id: invoice.invoiceNo,
        invoice_no: invoice.invoiceNo,
        partner_name: invoice.counterpartyName,
        partner_code: invoice.counterpartyCode,
        amount: invoice.originalAmount - invoice.paidAmount,
        document_date: invoice.dueDate,
        account_code: invoice.accountCode,
        counterparty_type: invoice.counterpartyType,
        contract_no: invoice.contractNo,
        note: invoice.memo,
      }));
  }

  matchReconciliation(input: MatchInput) {
    const voucher = this.vouchers.find((item) => item.id === input.voucherId);
    const line = this.findStatementLine(input.bankStatementLineId);
    if (!voucher || !line) return undefined;

    const voucherRemaining = Math.max(0, voucher.amount - (voucher.matchedAmount ?? 0));
    const lineRemaining = Math.max(0, amountOfLine(line.line) - this.sumLineMatched(line.line.id));
    if (input.matchedAmount <= 0 || input.matchedAmount > voucherRemaining || input.matchedAmount > lineRemaining) {
      throw new Error("Matched amount exceeds remaining voucher or statement amount");
    }

    const match: ReconciliationMatch = {
      id: `mock-match-${randomUUID()}`,
      voucherId: voucher.id,
      statementLineId: line.line.id,
      matchedAmount: input.matchedAmount,
      note: input.note,
    };
    this.matches.push(match);
    this.refreshVoucherStatus(voucher);
    this.refreshStatementLineStatus(line.line);
    this.allocateDebt(voucher, input.matchedAmount);

    return {
      id: match.id,
      voucherId: match.voucherId,
      bankStatementLineId: match.statementLineId,
      matchedAmount: match.matchedAmount,
      status: "matched",
    };
  }

  unmatchReconciliation(matchId: string) {
    const index = this.matches.findIndex((item) => item.id === matchId);
    if (index < 0) return undefined;
    const [match] = this.matches.splice(index, 1);
    const voucher = this.vouchers.find((item) => item.id === match.voucherId);
    const line = this.findStatementLine(match.statementLineId)?.line;
    if (voucher) this.refreshVoucherStatus(voucher);
    if (line) this.refreshStatementLineStatus(line);
    this.removeDebtAllocation(match.voucherId, match.matchedAmount);
    return { status: "unmatched", matchId };
  }

  confirmAiReconciliation(input: any) {
    const amount = Math.max(Number(input.statementLine?.debitAmount ?? 0), Number(input.statementLine?.creditAmount ?? 0), Number(input.statementLine?.amount ?? 0));
    let statementLine = this.findSimilarStatementLine(input.statementLine);
    let importedStatementLine = false;
    if (!statementLine) {
      const statement = this.importBankStatement({
        bankAccountCode: input.bankAccountCode ?? "VCB-001",
        statementNo: `AI-ST-${Date.now()}`,
        statementDate: input.statementLine?.transactionDate ?? new Date().toISOString().slice(0, 10),
        openingBalance: 0,
        closingBalance: amount,
        sourceName: input.sourceFileName ?? "ai-confirm",
        lines: [input.statementLine],
      });
      statementLine = { statement, line: statement.lines[0] };
      importedStatementLine = true;
    }

    let voucher = this.findVoucherForCandidate(input.candidateDocument, input.statementLine);
    let createdVoucher = false;
    if (!voucher) {
      voucher = this.createDraftVoucherFromAi(input, amount);
      createdVoucher = true;
    }

    const matchedAmount = Math.min(amount, Math.max(0, voucher.amount - (voucher.matchedAmount ?? 0)), Math.max(0, amountOfLine(statementLine.line) - this.sumLineMatched(statementLine.line.id)));
    const match = this.matchReconciliation({
      voucherId: voucher.id,
      bankStatementLineId: statementLine.line.id,
      matchedAmount,
      note: input.note ?? "AI confirmed reconciliation",
    });
    return {
      ...match,
      createdVoucher,
      importedStatementLine,
      voucherNo: voucher.voucherNo,
      voucherType: voucher.voucherType,
      statementLineId: statementLine.line.id,
      matchedAmount,
    };
  }

  detectMissingVouchers(period = "2026-07") {
    const voucherInvoiceNos = new Set(this.vouchers.map((item) => item.referenceInvoiceNo).filter(Boolean));
    const missingInvoices = this.debtInvoices
      .filter((invoice) => !voucherInvoiceNos.has(invoice.invoiceNo) || invoice.originalAmount - invoice.paidAmount > 0)
      .map((invoice) => ({
        source: invoice.accountCode === "131" ? "HĐĐT đầu ra / công nợ 131" : "HĐĐT đầu vào / công nợ 331",
        reference_no: invoice.invoiceNo,
        issue: invoice.originalAmount - invoice.paidAmount > 0 ? "Hóa đơn còn số dư chưa tất toán" : "Hóa đơn chưa có chứng từ hạch toán",
        amount: invoice.originalAmount - invoice.paidAmount,
        recommendation: invoice.accountCode === "131" ? "Đối chiếu BC/PT và phân bổ thu tiền." : "Đối chiếu BN/PC và phân bổ thanh toán.",
      }));
    const missingBank = this.statements
      .flatMap((statement) => statement.lines)
      .filter((line) => line.matchingStatus !== "matched")
      .map((line) => ({
        source: "Sao kê ngân hàng",
        reference_no: line.referenceNo || line.id,
        issue: "Giao dịch ngân hàng chưa đối chiếu BN/BC",
        amount: amountOfLine(line),
        recommendation: "Chạy đối chiếu sao kê hoặc tạo chứng từ nháp.",
      }));

    const items = [...missingInvoices, ...missingBank].filter((item) => item.amount > 0);
    return {
      period,
      missing_count: items.length,
      duplicate_risk_count: this.findDuplicateRiskCount(),
      items,
    };
  }

  getVoucherDetail(voucherNo: string) {
    const voucher = this.vouchers.find((item) => item.voucherNo === voucherNo || item.id === voucherNo);
    if (!voucher) return undefined;
    return {
      voucher_no: voucher.voucherNo,
      voucher_date: voucher.voucherDate,
      description: voucher.content,
      amount: voucher.amount,
      status: voucher.status,
      entries: voucher.lines.map((line) => ({
        debit_account: line.debitAccount,
        credit_account: line.creditAccount,
        amount: line.amount,
      })),
    };
  }

  suggestBankReconciliation(statementLineId?: string) {
    const line = statementLineId ? this.findStatementLine(statementLineId)?.line : this.statements.flatMap((item) => item.lines).find((item) => item.matchingStatus !== "matched");
    const candidates = this.listCashVouchers()
      .filter((voucher) => ["BN", "BC"].includes(voucher.voucherType) && voucher.reconciliationStatus !== "matched")
      .map((voucher) => {
        const amountScore = line ? 1 - Math.min(1, Math.abs(voucher.amount - amountOfLine(line)) / Math.max(voucher.amount, amountOfLine(line), 1)) : 0.5;
        const text = `${line?.description ?? ""} ${line?.referenceNo ?? ""}`.toLowerCase();
        const textScore = [voucher.voucherNo, voucher.referenceInvoiceNo, voucher.counterpartyCode, voucher.counterpartyName]
          .filter(Boolean)
          .some((value) => text.includes(String(value).toLowerCase()))
          ? 0.35
          : 0;
        return {
          document_id: voucher.id,
          invoice_no: voucher.referenceInvoiceNo,
          match_score: Number(Math.min(0.99, amountScore * 0.6 + textScore + 0.05).toFixed(2)),
          matched_signals: ["amount", ...(textScore ? ["reference_or_counterparty"] : [])],
          risk_flags: voucher.amount !== amountOfLine(line ?? ({} as any)) ? ["amount_difference"] : [],
          reason: `So sánh đối chiếu theo số tiền, ngày và diễn giải với ${voucher.voucherNo}.`,
        };
      })
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3);
    return { statement_line_id: statementLineId ?? line?.id ?? null, suggested_matches: candidates };
  }

  listAlerts(category?: MonitoringAlertCategory) {
    const alerts = [
      ...this.buildDebtOverdueAlerts(),
      this.buildExpenseLimitAlert(),
      this.buildNegativeCashflowAlert(),
      this.buildJournalAnomalyAlert(),
    ]
      .filter((alert): alert is MockMonitoringAlert => Boolean(alert))
      .map((alert) => ({
        ...alert,
        status: this.alertStatusOverrides.get(alert.id) ?? alert.status,
      }))
      .filter((alert) => !category || alert.category === category)
      .sort((a, b) => this.severityRank(b.severity) - this.severityRank(a.severity));

    return clone(alerts);
  }

  getAlert(id: string) {
    return this.listAlerts().find((alert) => alert.id === id);
  }

  updateAlertStatus(id: string, status: MonitoringAlertStatus) {
    const alert = this.getAlert(id);
    if (!alert) return undefined;
    this.alertStatusOverrides.set(id, status);
    return this.getAlert(id);
  }

  getAlertDashboard(category?: MonitoringAlertCategory) {
    const alerts = this.listAlerts(category);
    return {
      generatedAt: nowIso(),
      source: "backend-mock-alert-engine",
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter((alert) => alert.severity === "critical").length,
        reviewing: alerts.filter((alert) => alert.status === "reviewing").length,
        sourceModules: new Set(alerts.map((alert) => alert.sourceModule)).size,
      },
    };
  }

  private createDraftVoucherFromAi(input: any, amount: number) {
    const isDebit = Number(input.statementLine?.debitAmount ?? 0) > 0;
    const voucherType: CashVoucherType = isDebit ? "BN" : "BC";
    const accountCode = input.candidateDocument?.account_code;
    return this.createCashVoucher({
      voucherType,
      voucherNo: `${voucherType}-AI-${Date.now()}`,
      voucherDate: input.statementLine?.transactionDate ?? new Date().toISOString().slice(0, 10),
      currency: "VND",
      paymentChannel: "bank",
      bankAccountCode: input.bankAccountCode ?? "VCB-001",
      counterpartyCode: input.candidateDocument?.partner_code,
      counterpartyName: input.candidateDocument?.partner_name ?? input.statementLine?.counterparty ?? "Chua xac dinh",
      referenceInvoiceNo: input.candidateDocument?.invoice_no,
      content: input.statementLine?.description ?? "AI tao chung tu doi chieu",
      amount,
      status: "pending_approval",
      createdBy: "AI mock",
      lines: [
        {
          id: `line-ai-${Date.now()}`,
          debitAccount: isDebit ? accountCode || "331" : "1121",
          creditAccount: isDebit ? "1121" : accountCode || "131",
          amount,
          description: input.statementLine?.description ?? "AI tao chung tu doi chieu",
        },
      ],
    } as any);
  }

  private findVoucherForCandidate(candidate: any, statementLine: any) {
    const keys = [candidate?.document_id, candidate?.invoice_no, statementLine?.referenceNo].filter(Boolean).map((item) => String(item).toLowerCase());
    return this.vouchers.find((voucher) =>
      keys.some((key) =>
        [voucher.id, voucher.voucherNo, voucher.referenceInvoiceNo].filter(Boolean).some((value) => String(value).toLowerCase() === key),
      ),
    );
  }

  private findSimilarStatementLine(statementLine: any) {
    return this.statements
      .flatMap((statement) => statement.lines.map((line) => ({ statement, line })))
      .find(({ line }) =>
        (statementLine?.referenceNo && line.referenceNo === statementLine.referenceNo) ||
        (line.description === statementLine?.description && line.transactionDate === statementLine?.transactionDate && amountOfLine(line) === amountOfLine(statementLine)),
      );
  }

  private findStatementLine(lineId: string) {
    for (const statement of this.statements) {
      const line = statement.lines.find((item) => item.id === lineId);
      if (line) return { statement, line };
    }
    return undefined;
  }

  private sumLineMatched(statementLineId: string) {
    return this.matches.filter((item) => item.statementLineId === statementLineId).reduce((sum, item) => sum + item.matchedAmount, 0);
  }

  private refreshVoucherStatus(voucher: VoucherRecord) {
    voucher.matchedAmount = this.matches.filter((item) => item.voucherId === voucher.id).reduce((sum, item) => sum + item.matchedAmount, 0);
    voucher.reconciliationStatus = this.toStatus(voucher.matchedAmount, voucher.amount);
    voucher.updatedAt = nowIso();
  }

  private refreshStatementLineStatus(line: BankStatementRecord["lines"][number]) {
    line.matchingStatus = this.toStatus(this.sumLineMatched(line.id), amountOfLine(line));
  }

  private allocateDebt(voucher: VoucherRecord, amount: number) {
    const invoice = this.debtInvoices.find((item) => item.invoiceNo === voucher.referenceInvoiceNo);
    if (!invoice) return;
    const remaining = Math.max(0, invoice.originalAmount - invoice.paidAmount);
    const allocationAmount = Math.min(amount, remaining);
    invoice.paidAmount += allocationAmount;
    invoice.allocations.push({ voucherId: voucher.id, voucherNo: voucher.voucherNo, amount: allocationAmount });
  }

  private removeDebtAllocation(voucherId: string, amount: number) {
    const invoice = this.debtInvoices.find((item) => item.allocations.some((allocation) => allocation.voucherId === voucherId));
    if (!invoice) return;
    invoice.paidAmount = Math.max(0, invoice.paidAmount - amount);
    invoice.allocations = invoice.allocations.filter((allocation) => allocation.voucherId !== voucherId);
  }

  private toStatus(matched: number, total: number): MatchingStatus {
    if (matched <= 0) return "unmatched";
    if (matched >= total) return "matched";
    return "partial";
  }

  private findDuplicateRiskCount() {
    const seen = new Set<string>();
    let duplicates = 0;
    for (const voucher of this.vouchers) {
      const key = `${voucher.voucherType}:${voucher.referenceInvoiceNo || voucher.content}:${voucher.amount}`;
      if (seen.has(key)) duplicates += 1;
      seen.add(key);
    }
    return duplicates;
  }

  private formatCompact(value: number) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value);
  }

  private buildDebtOverdueAlerts() {
    return this.debtInvoices
      .map((invoice) => ({
        invoice,
        remaining: invoice.originalAmount - invoice.paidAmount,
        overdueDays: daysBetween(invoice.dueDate),
      }))
      .filter(({ remaining, overdueDays }) => remaining > 0 && overdueDays > 0)
      .map<MockMonitoringAlert>(({ invoice, remaining, overdueDays }) => {
        const severity: MonitoringAlertSeverity =
          overdueDays > 30 || remaining >= 100_000_000 ? "critical" : overdueDays > 7 ? "high" : "medium";
        const accountLabel = invoice.accountCode === "131" ? "Phải thu khách hàng" : "Phải trả nhà cung cấp";
        return {
          id: `alert-debt-${invoice.id}`,
          category: "debt_overdue",
          severity,
          status: "new",
          title: `${invoice.counterpartyName} quá hạn ${overdueDays} ngày`,
          sourceModule: "Công nợ",
          entityRef: `${invoice.counterpartyCode} / ${invoice.invoiceNo}`,
          amount: remaining,
          threshold: "Quá hạn > 0 ngày hoặc số tiền còn nợ > 0",
          actual: `${overdueDays} ngày quá hạn, ${formatVnd(remaining)}`,
          variance: `Trễ ${overdueDays} ngày so với ngày đến hạn ${invoice.dueDate}`,
          period: "Kỳ hiện tại",
          detectedAt: nowIso(),
          owner: invoice.accountCode === "131" ? "Kế toán công nợ phải thu" : "Kế toán công nợ phải trả",
          recommendation:
            invoice.accountCode === "131"
              ? "Ưu tiên nhắc nợ, đối chiếu lịch thanh toán và tạm dừng bán chịu mới nếu cần."
              : "Đối chiếu chứng từ trước khi lập lịch thanh toán hoặc thương lượng gia hạn.",
          drilldownHref: "/modules/receivables",
          analysisFields: [
            { label: "Tài khoản", value: `${invoice.accountCode} - ${accountLabel}` },
            { label: "Hóa đơn", value: invoice.invoiceNo },
            { label: "Ngày đến hạn", value: invoice.dueDate },
            { label: "Số ngày quá hạn", value: `${overdueDays}` },
            { label: "Số tiền còn nợ", value: formatVnd(remaining) },
            { label: "Hợp đồng", value: invoice.contractNo ?? "Chưa gán" },
          ],
        };
      });
  }

  private buildExpenseLimitAlert(): MockMonitoringAlert {
    const budgetAmount = 100_000_000;
    const actualAmount = 118_000_000;
    const variance = actualAmount - budgetAmount;
    const ratio = variance / budgetAmount;
    return {
      id: "alert-expense-642-office",
      category: "expense_limit",
      severity: ratio >= 0.15 ? "high" : "medium",
      status: "reviewing",
      title: "Chi phí quản lý vượt định mức 18%",
      sourceModule: "Sổ cái & hạch toán",
      entityRef: "TK 642 / BP-VAN-PHONG",
      amount: actualAmount,
      threshold: "Vượt ngân sách > 10%",
      actual: `Thực chi ${formatVnd(actualAmount)} / ngân sách ${formatVnd(budgetAmount)}`,
      variance: `+${formatVnd(variance)} (+${Math.round(ratio * 100)}%)`,
      period: "Tháng 07/2026",
      detectedAt: nowIso(),
      owner: "Kế toán tổng hợp",
      recommendation: "Kiểm tra chứng từ chi phí lớn và yêu cầu phê duyệt bổ sung cho phần vượt định mức.",
      drilldownHref: "/modules/accounting/report/account-ledger",
      analysisFields: [
        { label: "Tài khoản", value: "642 - Chi phí quản lý doanh nghiệp" },
        { label: "Bộ phận", value: "Văn phòng" },
        { label: "Định mức", value: formatVnd(budgetAmount) },
        { label: "Thực chi", value: formatVnd(actualAmount) },
        { label: "Chênh lệch", value: `${Math.round(ratio * 100)}%` },
        { label: "Rule", value: "actual > budget * 110%" },
      ],
    };
  }

  private buildNegativeCashflowAlert(): MockMonitoringAlert {
    const openingBalance = 120_000_000;
    const forecastEvents = [
      { date: "2026-07-16", label: "Thu KH32 theo hóa đơn BH-26070011", amount: 54_000_000 },
      { date: "2026-07-17", label: "Thanh toán lương và bảo hiểm", amount: -420_000_000 },
      { date: "2026-07-18", label: "Thu KH-MINH-AN dự kiến", amount: 180_000_000 },
      { date: "2026-07-20", label: "Thanh toán thuế GTGT", amount: -260_000_000 },
    ];
    let balance = openingBalance;
    let firstNegative: { date: string; balance: number; label: string } | undefined;
    for (const event of forecastEvents) {
      balance += event.amount;
      if (!firstNegative && balance < 0) {
        firstNegative = { date: event.date, balance, label: event.label };
      }
    }
    const shortage = Math.abs(firstNegative?.balance ?? 0);
    return {
      id: "alert-cashflow-negative-14d",
      category: "cashflow_negative",
      severity: shortage >= 200_000_000 ? "critical" : "high",
      status: "new",
      title: "Dự báo dòng tiền âm trong 14 ngày",
      sourceModule: "Sổ quỹ & ngân hàng",
      entityRef: "VCB-001 / Cash forecast 14D",
      amount: shortage,
      threshold: "Số dư dự báo < 0 trong 30 ngày",
      actual: `${firstNegative?.date ?? "N/A"} dự kiến thiếu ${formatVnd(shortage)}`,
      variance: `-${formatVnd(shortage)}`,
      period: "14 ngày tới",
      detectedAt: nowIso(),
      owner: "Giám đốc tài chính",
      recommendation: "Ưu tiên thu KH-MINH-AN, dời lịch thanh toán chi lớn hoặc bổ sung nguồn ngắn hạn.",
      drilldownHref: "/modules/cash",
      analysisFields: [
        { label: "Số dư hiện tại", value: formatVnd(openingBalance) },
        { label: "Ngày âm tiền", value: firstNegative?.date ?? "Chưa phát sinh" },
        { label: "Tác nhân chính", value: firstNegative?.label ?? "Không có" },
        { label: "Thiếu hụt", value: formatVnd(shortage) },
        { label: "Độ dài dự báo", value: "14 ngày" },
        { label: "Rule", value: "projectedBalance < 0" },
      ],
    };
  }

  private buildJournalAnomalyAlert(): MockMonitoringAlert {
    const debitTotal = 312_500_000;
    const creditTotal = 300_000_000;
    const variance = debitTotal - creditTotal;
    return {
      id: "alert-journal-unbalanced-ht-26070027",
      category: "journal_anomaly",
      severity: "high",
      status: "new",
      title: "Phiếu hạch toán lệch Nợ/Có",
      sourceModule: "Sổ cái & hạch toán",
      entityRef: "HT-26070027",
      amount: Math.abs(variance),
      threshold: "Tổng Nợ phải bằng Tổng Có",
      actual: `Tổng Nợ ${formatVnd(debitTotal)} / Tổng Có ${formatVnd(creditTotal)}`,
      variance: `Lệch ${formatVnd(Math.abs(variance))}`,
      period: "Tháng 07/2026",
      detectedAt: nowIso(),
      owner: "Kế toán tổng hợp",
      recommendation: "Tạm giữ ghi sổ, kiểm tra dòng hạch toán đối ứng và chứng từ gốc.",
      drilldownHref: "/modules/accounting/journal-vouchers",
      analysisFields: [
        { label: "Mã chứng từ", value: "HT" },
        { label: "Số chứng từ", value: "HT-26070027" },
        { label: "Tổng Nợ", value: formatVnd(debitTotal) },
        { label: "Tổng Có", value: formatVnd(creditTotal) },
        { label: "Số lệch", value: formatVnd(Math.abs(variance)) },
        { label: "Rule", value: "sum(debit) !== sum(credit)" },
      ],
    };
  }

  private severityRank(severity: MonitoringAlertSeverity) {
    return { low: 1, medium: 2, high: 3, critical: 4 }[severity];
  }
}

export const mockAccountingStore = new MockAccountingStore();

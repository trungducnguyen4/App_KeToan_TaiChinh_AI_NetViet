import { createHash, randomUUID } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CounterpartyType, MatchingStatus, PaymentChannel, Prisma } from "@prisma/client";
import {
  approvalItems,
  cashDashboardMetrics,
  journalVouchers,
  workitModules,
  workitSyncContracts
} from "@domain/index";
import type {
  BankStatementLineRecord,
  BankStatementRecord,
  CashVoucherType,
  MatchingStatus as MatchingStatusType,
  ModuleKey,
  VoucherRecord
} from "@domain/types";
import { PrismaService } from "../prisma/prisma.service";

const CASH_VOUCHER_TYPES: CashVoucherType[] = ["PT", "PC", "BN", "BC"];

@Injectable()
export class WorkitService {
  constructor(private readonly prisma: PrismaService) {}

  listModules() {
    return workitModules;
  }

  getModule(moduleKey: ModuleKey) {
    const module = workitModules.find((item) => item.key === moduleKey);
    if (!module) {
      throw new NotFoundException(`Module ${moduleKey} not found`);
    }

    return module;
  }

  listVouchers(query?: { q?: string; status?: string }) {
    return journalVouchers.filter((voucher) => {
      const search = query?.q?.toLowerCase();
      const matchesSearch = !search || [voucher.voucherNo, voucher.content, voucher.counterpartyName]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search));
      const matchesStatus = !query?.status || voucher.status === query.status;
      return matchesSearch && matchesStatus;
    });
  }

  getVoucher(id: string) {
    const voucher = journalVouchers.find((item) => item.id === id);
    if (!voucher) {
      throw new NotFoundException(`Voucher ${id} not found`);
    }

    return voucher;
  }

  createVoucher(input: CreateVoucherInput) {
    const now = new Date().toISOString();
    return {
      ...input,
      id: `voucher-${Date.now()}`,
      lines: input.lines.map((line, index) => ({
        ...line,
        id: `line-${Date.now()}-${index}`
      })),
      updatedAt: now
    };
  }

  async listCashVouchers(query?: { q?: string; status?: string; type?: CashVoucherType }) {
    const context = await this.ensureDefaultContext();
    const search = query?.q?.trim();
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        organizationId: context.organization.id,
        voucherType: query?.type ? query.type : { in: CASH_VOUCHER_TYPES },
        status: query?.status,
        ...(search ? {
          OR: [
            { voucherNo: { contains: search } },
            { description: { contains: search } },
            { reference_invoice_no: { contains: search } }
          ]
        } : {})
      },
      include: this.cashVoucherInclude,
      orderBy: [
        { voucherDate: "desc" },
        { createdAt: "desc" }
      ]
    });

    return vouchers.map((voucher) => this.mapVoucherRecord(voucher));
  }

  async getCashVoucher(id: string) {
    const context = await this.ensureDefaultContext();
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        id,
        organizationId: context.organization.id,
        voucherType: { in: CASH_VOUCHER_TYPES }
      },
      include: this.cashVoucherInclude
    });

    if (!voucher) {
      throw new NotFoundException(`Cash voucher ${id} not found`);
    }

    return this.mapVoucherRecord(voucher);
  }

  async createCashVoucher(input: CreateCashVoucherInput) {
    this.validateCashVoucher(input);
    this.validateHeaderMatchesLines(input.amount, input.lines);
    const context = await this.ensureDefaultContext(input.createdBy);

    const voucher = await this.prisma.$transaction(async (tx) => {
      const cashBookId = input.paymentChannel === "cash"
        ? await this.ensureCashBook(tx, context.organization.id, input.cashBookCode!)
        : null;
      const bankAccountId = input.paymentChannel === "bank"
        ? await this.ensureBankAccount(tx, context.organization.id, input.bankAccountCode!, context.organization.name)
        : null;
      const counterparty = await this.ensureCounterparty(tx, context.organization.id, input);

      const created = await tx.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          voucherType: input.voucherType,
          voucherNo: input.voucherNo,
          voucherDate: new Date(input.voucherDate),
          posting_date: new Date(input.voucherDate),
          currencyCode: input.currency,
          exchange_rate: 1,
          status: input.status,
          approval_status: this.mapApprovalStatus(input.status),
          description: input.content,
          payment_channel: input.paymentChannel === "cash" ? PaymentChannel.cash : PaymentChannel.bank,
          cash_book_id: cashBookId,
          bank_account_id: bankAccountId,
          counterparty_type: counterparty.type,
          reference_invoice_no: input.referenceInvoiceNo,
          matched_amount: 0,
          reconciliation_status: input.paymentChannel === "bank" ? MatchingStatus.unmatched : MatchingStatus.matched,
          total_debit: input.amount,
          total_credit: input.amount,
          createdBy: context.user.id,
          updated_by: context.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await tx.voucherLine.createMany({
        data: await this.buildVoucherLineRows(tx, context.organization.id, created.id, input.lines, {
          customerId: counterparty.customerId,
          supplierId: counterparty.supplierId,
          bankAccountId
        })
      });

      await this.ensureApprovalInstance(tx, context.organization.id, created.id, input.voucherType);
      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "cash_voucher",
        entityId: created.id,
        action: "cash_voucher_created",
        afterPayload: {
          voucherNo: created.voucherNo,
          voucherType: created.voucherType,
          amount: input.amount
        }
      });

      return tx.voucher.findUniqueOrThrow({
        where: { id: created.id },
        include: this.cashVoucherInclude
      });
    });

    return this.mapVoucherRecord(voucher);
  }

  async updateCashVoucher(id: string, input: Partial<CreateCashVoucherInput>) {
    const current = await this.getCashVoucher(id);
    const merged: CreateCashVoucherInput = {
      ...current,
      ...input,
      voucherType: (input.voucherType ?? current.voucherType) as CashVoucherType,
      paymentChannel: input.paymentChannel ?? current.paymentChannel ?? "cash",
      lines: input.lines ?? current.lines
    };

    this.validateCashVoucher(merged);
    this.validateHeaderMatchesLines(merged.amount, merged.lines);
    const context = await this.ensureDefaultContext(merged.createdBy);

    const voucher = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.voucher.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Cash voucher ${id} not found`);
      }

      const cashBookId = merged.paymentChannel === "cash"
        ? await this.ensureCashBook(tx, context.organization.id, merged.cashBookCode!)
        : null;
      const bankAccountId = merged.paymentChannel === "bank"
        ? await this.ensureBankAccount(tx, context.organization.id, merged.bankAccountCode!, context.organization.name)
        : null;
      const counterparty = await this.ensureCounterparty(tx, context.organization.id, merged);

      await tx.voucherLine.deleteMany({ where: { voucherId: id } });

      await tx.voucher.update({
        where: { id },
        data: {
          voucherType: merged.voucherType,
          voucherNo: merged.voucherNo,
          voucherDate: new Date(merged.voucherDate),
          posting_date: new Date(merged.voucherDate),
          currencyCode: merged.currency,
          status: merged.status,
          approval_status: this.mapApprovalStatus(merged.status),
          description: merged.content,
          payment_channel: merged.paymentChannel === "cash" ? PaymentChannel.cash : PaymentChannel.bank,
          cash_book_id: cashBookId,
          bank_account_id: bankAccountId,
          counterparty_type: counterparty.type,
          reference_invoice_no: merged.referenceInvoiceNo,
          total_debit: merged.amount,
          total_credit: merged.amount,
          updated_by: context.user.id,
          updatedAt: new Date()
        }
      });

      await tx.voucherLine.createMany({
        data: await this.buildVoucherLineRows(tx, context.organization.id, id, merged.lines, {
          customerId: counterparty.customerId,
          supplierId: counterparty.supplierId,
          bankAccountId
        })
      });

      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "cash_voucher",
        entityId: id,
        action: "cash_voucher_updated",
        beforePayload: {
          voucherNo: existing.voucherNo,
          voucherType: existing.voucherType
        },
        afterPayload: {
          voucherNo: merged.voucherNo,
          voucherType: merged.voucherType,
          amount: merged.amount
        }
      });

      return tx.voucher.findUniqueOrThrow({
        where: { id },
        include: this.cashVoucherInclude
      });
    });

    return this.mapVoucherRecord(voucher);
  }

  async getCashDashboard() {
    const context = await this.ensureDefaultContext();
    const [vouchers, pendingApprovals, unmatchedStatements, cashIn, cashOut, bankIn, bankOut] = await this.prisma.$transaction([
      this.prisma.voucher.groupBy({
        by: ["voucherType"],
        where: {
          organizationId: context.organization.id,
          voucherType: { in: CASH_VOUCHER_TYPES }
        },
        orderBy: {
          voucherType: "asc"
        },
        _count: true
      }),
      this.prisma.approvalInstance.count({
        where: {
          organization_id: context.organization.id,
          document_type: "cash_voucher",
          status: "pending"
        }
      }),
      this.prisma.bankStatementLine.count({
        where: {
          bank_statements: {
            organizationId: context.organization.id
          },
          matched_status: {
            in: [MatchingStatus.unmatched, MatchingStatus.partial]
          }
        }
      }),
      this.prisma.voucher.aggregate({
        where: {
          organizationId: context.organization.id,
          voucherType: "PT"
        },
        _sum: { total_debit: true }
      }),
      this.prisma.voucher.aggregate({
        where: {
          organizationId: context.organization.id,
          voucherType: "PC"
        },
        _sum: { total_debit: true }
      }),
      this.prisma.voucher.aggregate({
        where: {
          organizationId: context.organization.id,
          voucherType: "BC"
        },
        _sum: { total_debit: true }
      }),
      this.prisma.voucher.aggregate({
        where: {
          organizationId: context.organization.id,
          voucherType: "BN"
        },
        _sum: { total_debit: true }
      })
    ]);

    const cashBalance = Number(cashIn._sum.total_debit ?? 0) - Number(cashOut._sum.total_debit ?? 0);
    const bankBalance = Number(bankIn._sum.total_debit ?? 0) - Number(bankOut._sum.total_debit ?? 0);
    const metrics = [
      {
        label: "Số dư quỹ tiền mặt",
        value: this.formatCompactCurrency(cashBalance),
        hint: `${vouchers.find((item) => item.voucherType === "PT")?._count ?? 0} PT / ${vouchers.find((item) => item.voucherType === "PC")?._count ?? 0} PC`,
        tone: "green"
      },
      {
        label: "Số dư tiền gửi NH",
        value: this.formatCompactCurrency(bankBalance),
        hint: `${vouchers.find((item) => item.voucherType === "BC")?._count ?? 0} BC / ${vouchers.find((item) => item.voucherType === "BN")?._count ?? 0} BN`,
        tone: "blue"
      },
      {
        label: "Dòng cần đối chiếu",
        value: `${unmatchedStatements}`,
        hint: "Dòng sao kê chưa khớp",
        tone: "amber"
      },
      {
        label: "Chứng từ chờ duyệt",
        value: `${pendingApprovals}`,
        hint: "Chứng từ cần xử lý trong ngày",
        tone: "red"
      }
    ] as typeof cashDashboardMetrics;

    return {
      metrics,
      vouchersByType: CASH_VOUCHER_TYPES.map((type) => ({
        type,
        count: vouchers.find((item) => item.voucherType === type)?._count ?? 0
      })),
      unmatchedStatements,
      pendingApprovals
    };
  }

  async listBankStatements() {
    const context = await this.ensureDefaultContext();
    const statements = await this.prisma.bankStatement.findMany({
      where: { organizationId: context.organization.id },
      include: {
        bank_statement_lines: {
          orderBy: { lineNo: "asc" }
        },
        bank_accounts: true
      },
      orderBy: {
        importedAt: "desc"
      }
    });

    return statements.map((statement) => this.mapBankStatementRecord(statement));
  }

  async importBankStatement(input: ImportBankStatementInput) {
    const context = await this.ensureDefaultContext();

    const statement = await this.prisma.$transaction(async (tx) => {
      const bankAccountId = await this.ensureBankAccount(tx, context.organization.id, input.bankAccountCode, context.organization.name);

      const created = await tx.bankStatement.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          bank_account_id: bankAccountId,
          statementNo: input.statementNo,
          statementDate: new Date(input.statementDate),
          openingBalance: input.openingBalance,
          closingBalance: input.closingBalance,
          source_file_name: input.sourceName ?? "manual-import",
          source_file_hash: null,
          status: "imported",
          importedAt: new Date()
        }
      });

      await tx.bankStatementLine.createMany({
        data: input.lines.map((line, index) => ({
          id: randomUUID(),
          statement_id: created.id,
          lineNo: index + 1,
          value_date: line.transactionDate ? new Date(line.transactionDate) : null,
          transactionDate: line.transactionDate ? new Date(line.transactionDate) : null,
          description: line.description,
          referenceNo: line.referenceNo,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          balance_after: null,
          matched_status: MatchingStatus.unmatched
        }))
      });

      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "bank_statement",
        entityId: created.id,
        action: "bank_statement_imported",
        afterPayload: {
          statementNo: input.statementNo,
          lineCount: input.lines.length
        }
      });

      return tx.bankStatement.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          bank_statement_lines: { orderBy: { lineNo: "asc" } },
          bank_accounts: true
        }
      });
    });

    return this.mapBankStatementRecord(statement);
  }

  async getReconciliation() {
    const context = await this.ensureDefaultContext();
    const [vouchers, lines] = await this.prisma.$transaction([
      this.prisma.voucher.findMany({
        where: {
          organizationId: context.organization.id,
          voucherType: { in: ["BN", "BC"] },
          reconciliation_status: {
            in: [MatchingStatus.unmatched, MatchingStatus.partial]
          }
        },
        include: this.cashVoucherInclude,
        orderBy: { voucherDate: "desc" }
      }),
      this.prisma.bankStatementLine.findMany({
        where: {
          matched_status: {
            in: [MatchingStatus.unmatched, MatchingStatus.partial]
          },
          bank_statements: {
            organizationId: context.organization.id
          }
        },
        include: {
          bank_reconciliation_matches: true,
          bank_statements: {
            include: {
              bank_accounts: true
            }
          }
        },
        orderBy: { transactionDate: "desc" }
      })
    ]);

    return {
      vouchers: vouchers.map((voucher) => {
        const mapped = this.mapVoucherRecord(voucher);
        return {
          id: `recon-${mapped.id}`,
          voucherId: mapped.id,
          voucherType: mapped.voucherType as CashVoucherType,
          voucherNo: mapped.voucherNo,
          transactionDate: mapped.voucherDate,
          counterpartyName: mapped.counterpartyName,
          description: mapped.content,
          amount: mapped.amount - (mapped.matchedAmount ?? 0),
          bankAccountCode: mapped.bankAccountCode,
          matchingStatus: mapped.reconciliationStatus ?? "unmatched"
        };
      }),
      statements: lines.map((line) => ({
        id: `recon-line-${line.id}`,
        statementLineId: line.id,
        transactionDate: line.transactionDate?.toISOString().slice(0, 10) ?? line.value_date?.toISOString().slice(0, 10) ?? "",
        description: line.description,
        amount: Math.max(Number(line.debitAmount), Number(line.creditAmount)) - this.sumMatchedAmount(line.bank_reconciliation_matches),
        bankAccountCode: line.bank_statements.bank_accounts.account_no,
        matchingStatus: this.mapMatchingStatus(line.matched_status)
      }))
    };
  }

  async matchReconciliation(input: MatchReconciliationInput) {
    const context = await this.ensureDefaultContext();

    return this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({
        where: { id: input.voucherId }
      });
      const statementLine = await tx.bankStatementLine.findUnique({
        where: { id: input.bankStatementLineId },
        include: { bank_reconciliation_matches: true }
      });

      if (!voucher || !statementLine) {
        throw new NotFoundException("Voucher or statement line not found");
      }

      const voucherRemaining = Number(voucher.total_debit) - Number(voucher.matched_amount);
      const statementMatched = this.sumMatchedAmount(statementLine.bank_reconciliation_matches);
      const statementRemaining = Math.max(Number(statementLine.debitAmount), Number(statementLine.creditAmount)) - statementMatched;

      if (input.matchedAmount > voucherRemaining) {
        throw new BadRequestException("Matched amount exceeds remaining voucher amount");
      }

      if (input.matchedAmount > statementRemaining) {
        throw new BadRequestException("Matched amount exceeds remaining statement amount");
      }

      const match = await tx.bankReconciliationMatch.create({
        data: {
          id: randomUUID(),
          statement_line_id: statementLine.id,
          voucherId: voucher.id,
          matchedAmount: input.matchedAmount,
          matchedBy: context.user.id,
          matchedAt: new Date(),
          note: input.note
        }
      });

      await this.refreshVoucherReconciliation(tx, voucher.id);
      await this.refreshStatementLineStatus(tx, statementLine.id);
      await this.createAuditEvent(tx, {
        organizationId: voucher.organizationId,
        actorUserId: context.user.id,
        entityName: "bank_reconciliation_match",
        entityId: match.id,
        action: "reconciliation_matched",
        afterPayload: {
          voucherId: voucher.id,
          statementLineId: statementLine.id,
          matchedAmount: input.matchedAmount
        }
      });

      return {
        id: match.id,
        voucherId: match.voucherId,
        bankStatementLineId: match.statement_line_id,
        matchedAmount: Number(match.matchedAmount),
        status: "matched"
      };
    });
  }

  async unmatchReconciliation(input: { matchId: string; reason?: string }) {
    const context = await this.ensureDefaultContext();

    return this.prisma.$transaction(async (tx) => {
      const match = await tx.bankReconciliationMatch.findUnique({
        where: { id: input.matchId }
      });

      if (!match) {
        throw new NotFoundException(`Match ${input.matchId} not found`);
      }

      await tx.bankReconciliationMatch.delete({
        where: { id: input.matchId }
      });

      await this.refreshVoucherReconciliation(tx, match.voucherId);
      await this.refreshStatementLineStatus(tx, match.statement_line_id);
      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "bank_reconciliation_match",
        entityId: input.matchId,
        action: "reconciliation_unmatched",
        beforePayload: {
          voucherId: match.voucherId,
          statementLineId: match.statement_line_id,
          matchedAmount: Number(match.matchedAmount)
        },
        afterPayload: {
          reason: input.reason ?? null
        }
      });

      return {
        matchId: input.matchId,
        status: "unmatched",
        reason: input.reason ?? null
      };
    });
  }

  listApprovals() {
    return approvalItems;
  }

  getSyncStatus() {
    return {
      mode: process.env.WORKIT_SYNC_MODE ?? "read_only",
      source: "WORKIT",
      lastSyncedAt: null,
      entities: ["accounts", "customers", "suppliers", "vouchers", "ledger_entries", ...workitSyncContracts.map((item) => item.entity)],
      safety: "read_only_until_writeback_contract_is_approved"
    };
  }

  getCashSyncContract() {
    return {
      source: "WORKIT",
      mode: "read_only",
      entities: workitSyncContracts,
      idempotency: "source id + checksum",
      flow: [
        "fetch updated records by updated_since",
        "persist raw payload",
        "map source ids to local vouchers or statements",
        "mark sync status and conflicts"
      ]
    };
  }

  getJobQueues() {
    return [
      { name: "workit-sync", status: "configured", driver: "BullMQ + Redis" },
      { name: "report-snapshots", status: "configured", driver: "BullMQ + Redis" },
      { name: "ai-assistance", status: "configured", driver: "BullMQ + Redis" }
    ];
  }

  private readonly cashVoucherInclude = {
    lines: {
      include: {
        accounts: true,
        customers: true,
        suppliers: true
      },
      orderBy: { lineNo: "asc" as const }
    },
    cashBook: true,
    bank_accounts: true,
    reconciliationMatches: true
  };

  private validateCashVoucher(input: Pick<CreateCashVoucherInput, "voucherType" | "paymentChannel" | "cashBookCode" | "bankAccountCode" | "lines">) {
    if ((input.voucherType === "PT" || input.voucherType === "PC") && input.paymentChannel !== "cash") {
      throw new BadRequestException("PT/PC must use cash payment channel");
    }

    if ((input.voucherType === "BN" || input.voucherType === "BC") && input.paymentChannel !== "bank") {
      throw new BadRequestException("BN/BC must use bank payment channel");
    }

    if (input.paymentChannel === "cash" && !input.cashBookCode) {
      throw new BadRequestException("Cash vouchers require cash book context");
    }

    if (input.paymentChannel === "bank" && !input.bankAccountCode) {
      throw new BadRequestException("Bank vouchers require bank account context");
    }

    if (!input.lines.length) {
      throw new BadRequestException("Voucher must contain at least one detail line");
    }
  }

  private validateHeaderMatchesLines(amount: number, lines: CashVoucherLineInput[]) {
    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    if (Math.abs(total - amount) > 0.001) {
      throw new BadRequestException("Header amount must equal line amount total");
    }
  }

  private async ensureDefaultContext(username = "DEMO.TGD") {
    let organization = await this.prisma.organization.findFirst({
      orderBy: { createdAt: "asc" }
    });

    if (!organization) {
      organization = await this.prisma.organization.create({
        data: {
          id: randomUUID(),
          code: "DEMO",
          name: "Workit Demo Tenant",
          taxCode: "0100000000",
          baseCurrency: "VND",
          timezone: "Asia/Ho_Chi_Minh",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    let user = await this.prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        username
      }
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            id: randomUUID(),
            organizationId: organization.id,
            username,
            email: `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@demo.local`,
            fullName: username,
            passwordHash: null,
            status: "active",
            lastLoginAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } catch {
        user = await this.prisma.user.findFirstOrThrow({
          where: {
            organizationId: organization.id,
            username
          }
        });
      }
    }

    return { organization, user };
  }

  private async ensureCashBook(tx: Prisma.TransactionClient, organizationId: string, code: string) {
    const existing = await tx.cashBook.findFirst({
      where: {
        organizationId,
        code
      }
    });

    if (existing) {
      return existing.id;
    }

    const created = await tx.cashBook.create({
      data: {
        id: randomUUID(),
        organizationId,
        code,
        name: `Cash book ${code}`,
        currency_code: "VND",
        status: "active"
      }
    });

    return created.id;
  }

  private async ensureBankAccount(tx: Prisma.TransactionClient, organizationId: string, accountNo: string, accountHolder: string) {
    const bankAccountModel = (tx as unknown as { bank_accounts: any }).bank_accounts;
    const existing = await bankAccountModel.findFirst({
      where: {
        organization_id: organizationId,
        account_no: accountNo
      }
    });

    if (existing) {
      return existing.id as string;
    }

    let created;
    try {
      created = await bankAccountModel.create({
        data: {
          id: randomUUID(),
          organization_id: organizationId,
          bank_name: "Demo Bank",
          account_no: accountNo,
          account_holder: accountHolder,
          currency_code: "VND",
          branch_name: null,
          status: "active",
          source_system_id: null,
          source_record_id: null,
          source_updated_at: null,
          source_checksum: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    } catch {
      created = await bankAccountModel.findFirst({
        where: {
          organization_id: organizationId,
          account_no: accountNo
        }
      });
    }

    return created.id as string;
  }

  private async ensureCounterparty(tx: Prisma.TransactionClient, organizationId: string, input: CreateCashVoucherInput) {
    const type = this.resolveCounterpartyType(input);

    if (type === CounterpartyType.customer && input.counterpartyCode) {
      let customer = await tx.customer.findFirst({
        where: {
          organizationId,
          code: input.counterpartyCode
        }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            id: randomUUID(),
            organizationId,
            code: input.counterpartyCode,
            name: input.counterpartyName ?? input.counterpartyCode,
            taxCode: null,
            short_name: null,
            phone: null,
            email: null,
            address: null,
            status: "active",
            source_system_id: null,
            source_record_id: null,
            source_updated_at: null,
            source_checksum: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      return { type, customerId: customer.id, supplierId: null };
    }

    if (type === CounterpartyType.supplier && input.counterpartyCode) {
      let supplier = await tx.supplier.findFirst({
        where: {
          organizationId,
          code: input.counterpartyCode
        }
      });

      if (!supplier) {
        supplier = await tx.supplier.create({
          data: {
            id: randomUUID(),
            organizationId,
            code: input.counterpartyCode,
            name: input.counterpartyName ?? input.counterpartyCode,
            taxCode: null,
            short_name: null,
            phone: null,
            email: null,
            address: null,
            status: "active",
            source_system_id: null,
            source_record_id: null,
            source_updated_at: null,
            source_checksum: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      return { type, customerId: null, supplierId: supplier.id };
    }

    return { type, customerId: null, supplierId: null };
  }

  private async ensureAccount(tx: Prisma.TransactionClient, organizationId: string, code: string) {
    const existing = await tx.account.findFirst({
      where: {
        organizationId,
        code
      }
    });

    if (existing) {
      return existing.id;
    }

    const accountGroup = this.resolveAccountGroup(code);
    const created = await tx.account.create({
      data: {
        id: randomUUID(),
        organizationId,
        code,
        name: `TK ${code}`,
        parentId: null,
        accountGroup,
        normalBalance: this.resolveNormalBalance(accountGroup),
        level: code.length > 3 ? 2 : 1,
        isPostable: true,
        isActive: true,
        allowsCounterparty: true,
        allowsContract: false,
        allowsItem: false,
        allowsWarehouse: false,
        allowsEmployee: false,
        effective_from: null,
        effective_to: null,
        source_system_id: null,
        source_record_id: null,
        source_updated_at: null,
        source_checksum: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return created.id;
  }

  private async ensureApprovalInstance(tx: Prisma.TransactionClient, organizationId: string, voucherId: string, voucherType: string) {
    const flowModel = (tx as unknown as { approval_flows: any }).approval_flows;
    let flow = await flowModel.findFirst({
      where: {
        organization_id: organizationId,
        document_type: "cash_voucher",
        name: "Cash approval default"
      }
    });

    if (!flow) {
      flow = await flowModel.create({
        data: {
          id: randomUUID(),
          organization_id: organizationId,
          document_type: "cash_voucher",
          name: "Cash approval default",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    await tx.approvalInstance.upsert({
      where: {
        organization_id_document_type_document_id: {
          organization_id: organizationId,
          document_type: "cash_voucher",
          document_id: voucherId
        }
      },
      update: {
        status: "pending",
        current_step_no: 1
      },
      create: {
        id: randomUUID(),
        organization_id: organizationId,
        flow_id: flow.id,
        document_type: "cash_voucher",
        document_id: voucherId,
        status: voucherType === "PT" || voucherType === "PC" || voucherType === "BN" || voucherType === "BC" ? "pending" : "pending",
        current_step_no: 1,
        started_at: new Date(),
        completed_at: null,
        createdAt: new Date()
      }
    });
  }

  private async buildVoucherLineRows(
    tx: Prisma.TransactionClient,
    organizationId: string,
    voucherId: string,
    lines: CashVoucherLineInput[],
    context: { customerId: string | null; supplierId: string | null; bankAccountId: string | null; }
  ) {
    const rows = [];
    for (const [index, line] of lines.entries()) {
      const debitAccountId = await this.ensureAccount(tx, organizationId, line.debitAccount);
      const creditAccountId = await this.ensureAccount(tx, organizationId, line.creditAccount);
      const lineNoBase = index * 2;
      rows.push(
        {
          id: randomUUID(),
          voucherId,
          lineNo: lineNoBase + 1,
          account_id: debitAccountId,
          customer_id: context.customerId,
          supplier_id: context.supplierId,
          employee_id: null,
          contract_id: null,
          cost_item_id: null,
          warehouse_id: null,
          bank_account_id: context.bankAccountId,
          item_id: null,
          debit_amount: line.amount,
          credit_amount: 0,
          quantity: null,
          unit_price: null,
          tax_rate: null,
          memo: line.description,
          created_at: new Date()
        },
        {
          id: randomUUID(),
          voucherId,
          lineNo: lineNoBase + 2,
          account_id: creditAccountId,
          customer_id: context.customerId,
          supplier_id: context.supplierId,
          employee_id: null,
          contract_id: null,
          cost_item_id: null,
          warehouse_id: null,
          bank_account_id: context.bankAccountId,
          item_id: null,
          debit_amount: 0,
          credit_amount: line.amount,
          quantity: null,
          unit_price: null,
          tax_rate: null,
          memo: line.description,
          created_at: new Date()
        }
      );
    }

    return rows;
  }

  private async refreshVoucherReconciliation(tx: Prisma.TransactionClient, voucherId: string) {
    const voucher = await tx.voucher.findUniqueOrThrow({
      where: { id: voucherId },
      include: { reconciliationMatches: true }
    });
    const matchedAmount = voucher.reconciliationMatches.reduce((sum, item) => sum + Number(item.matchedAmount), 0);
    const total = Number(voucher.total_debit);
    const status = matchedAmount <= 0
      ? MatchingStatus.unmatched
      : matchedAmount < total
        ? MatchingStatus.partial
        : MatchingStatus.matched;

    await tx.voucher.update({
      where: { id: voucherId },
      data: {
        matched_amount: matchedAmount,
        reconciliation_status: status
      }
    });
  }

  private async refreshStatementLineStatus(tx: Prisma.TransactionClient, statementLineId: string) {
    const line = await tx.bankStatementLine.findUniqueOrThrow({
      where: { id: statementLineId },
      include: { bank_reconciliation_matches: true }
    });
    const total = Math.max(Number(line.debitAmount), Number(line.creditAmount));
    const matchedAmount = this.sumMatchedAmount(line.bank_reconciliation_matches);
    const status = matchedAmount <= 0
      ? MatchingStatus.unmatched
      : matchedAmount < total
        ? MatchingStatus.partial
        : MatchingStatus.matched;

    await tx.bankStatementLine.update({
      where: { id: statementLineId },
      data: {
        matched_status: status
      }
    });
  }

  private async createAuditEvent(
    tx: Prisma.TransactionClient,
    input: {
      organizationId: string;
      actorUserId: string | null;
      entityName: string;
      entityId: string;
      action: string;
      beforePayload?: unknown;
      afterPayload?: unknown;
    }
  ) {
    await tx.auditEvent.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: input.action,
        entityName: input.entityName,
        entityId: input.entityId,
        before_data: input.beforePayload ? JSON.stringify(input.beforePayload) : null,
        after_data: input.afterPayload ? JSON.stringify(input.afterPayload) : null,
        ipAddress: "127.0.0.1",
        user_agent: "codex-local",
        request_id: randomUUID(),
        createdAt: new Date()
      }
    });
  }

  private mapVoucherRecord(voucher: any): VoucherRecord {
    const sortedLines = [...voucher.lines].sort((a, b) => a.lineNo - b.lineNo);
    const logicalLines = [];
    for (let index = 0; index < sortedLines.length; index += 2) {
      const debitRow = sortedLines[index];
      const creditRow = sortedLines[index + 1];
      logicalLines.push({
        id: `logical-${debitRow?.id ?? index}`,
        debitAccount: debitRow?.accounts?.code ?? "",
        debitDimension1: debitRow?.customers?.code ?? debitRow?.suppliers?.code ?? undefined,
        creditAccount: creditRow?.accounts?.code ?? "",
        creditDimension1: creditRow?.customers?.code ?? creditRow?.suppliers?.code ?? undefined,
        amount: Number(debitRow?.debit_amount ?? creditRow?.credit_amount ?? 0),
        description: debitRow?.memo ?? creditRow?.memo ?? ""
      });
    }

    const firstCounterparty = sortedLines.find((line) => line.customers || line.suppliers);
    return {
      id: voucher.id,
      voucherType: voucher.voucherType,
      voucherNo: voucher.voucherNo,
      voucherDate: voucher.voucherDate.toISOString().slice(0, 10),
      currency: voucher.currencyCode,
      paymentChannel: voucher.payment_channel as "cash" | "bank" | undefined,
      bankAccountCode: voucher.bank_accounts?.account_no,
      cashBookCode: voucher.cashBook?.code,
      matchedAmount: Number(voucher.matched_amount ?? 0),
      reconciliationStatus: this.mapMatchingStatus(voucher.reconciliation_status),
      referenceInvoiceNo: voucher.reference_invoice_no ?? undefined,
      counterpartyCode: firstCounterparty?.customers?.code ?? firstCounterparty?.suppliers?.code ?? undefined,
      counterpartyName: firstCounterparty?.customers?.name ?? firstCounterparty?.suppliers?.name ?? undefined,
      content: voucher.description ?? "",
      amount: Number(voucher.total_debit),
      status: voucher.status,
      createdBy: voucher.users_vouchers_created_byTousers?.username ?? "DEMO.TGD",
      updatedAt: voucher.updatedAt.toISOString(),
      lines: logicalLines
    };
  }

  private mapBankStatementRecord(statement: any): BankStatementRecord {
    return {
      id: statement.id,
      bankAccountCode: statement.bank_accounts.account_no,
      statementNo: statement.statementNo ?? "",
      statementDate: statement.statementDate.toISOString().slice(0, 10),
      openingBalance: Number(statement.openingBalance),
      closingBalance: Number(statement.closingBalance),
      importedAt: statement.importedAt.toISOString(),
      lineCount: statement.bank_statement_lines.length,
      sourceName: statement.source_file_name ?? "manual-import",
      lines: statement.bank_statement_lines.map((line: any) => ({
        id: line.id,
        lineNo: line.lineNo,
        transactionDate: line.transactionDate?.toISOString().slice(0, 10) ?? line.value_date?.toISOString().slice(0, 10) ?? "",
        description: line.description,
        debitAmount: Number(line.debitAmount),
        creditAmount: Number(line.creditAmount),
        runningBalance: Number(line.balance_after ?? 0),
        referenceNo: line.referenceNo ?? undefined,
        matchingStatus: this.mapMatchingStatus(line.matched_status)
      }))
    };
  }

  private resolveCounterpartyType(input: { voucherType: CashVoucherType; counterpartyType?: string }) {
    if (input.counterpartyType) {
      return input.counterpartyType as CounterpartyType;
    }

    if (input.voucherType === "PT" || input.voucherType === "BC") {
      return CounterpartyType.customer;
    }

    return CounterpartyType.supplier;
  }

  private resolveAccountGroup(code: string) {
    const lead = code.trim()[0] ?? "1";
    if (lead === "1" || lead === "2") return "asset";
    if (lead === "3") return "liability";
    if (lead === "4") return "revenue";
    if (lead === "5" || lead === "6" || lead === "7" || lead === "8") return "expense";
    return "asset";
  }

  private resolveNormalBalance(accountGroup: string) {
    if (accountGroup === "liability" || accountGroup === "revenue") {
      return "credit";
    }

    return "debit";
  }

  private mapApprovalStatus(status: string) {
    if (status === "approved" || status === "posted") {
      return "approved";
    }

    if (status === "voided") {
      return "cancelled";
    }

    return "pending";
  }

  private mapMatchingStatus(status: MatchingStatus | string | null | undefined): MatchingStatusType {
    if (status === MatchingStatus.matched || status === "matched") return "matched";
    if (status === MatchingStatus.partial || status === "partial") return "partial";
    return "unmatched";
  }

  private sumMatchedAmount(matches: Array<{ matchedAmount: Prisma.Decimal | number }>) {
    return matches.reduce((sum, item) => sum + Number(item.matchedAmount), 0);
  }

  private formatCompactCurrency(value: number) {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(value);
  }

  async listPurchasingInvoices(query?: {
    q?: string;
    docType?: string;
    costCategory?: string;
    allocationMode?: string;
    paymentStatus?: string;
  }) {
    const context = await this.ensureDefaultContext();
    const search = query?.q?.trim();

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        organizationId: context.organization.id,
        voucherType: { in: ["PNK", "HDM"] },
        ...(query?.docType ? { doc_type: query.docType } : {}),
        ...(query?.costCategory ? { cost_category: query.costCategory } : {}),
        ...(query?.allocationMode ? { allocation_mode: query.allocationMode } : {}),
        ...(search
          ? {
              OR: [
                { voucherNo: { contains: search } },
                { supplier_name: { contains: search } },
                { description: { contains: search } },
                { tax_code: { contains: search } }
              ]
            }
          : {})
      },
      include: {
        lines: true
      },
      orderBy: { voucherDate: "desc" }
    });

    return vouchers.map((v) => {
      const firstLine = v.lines[0];
      const isPaid = Number(v.matched_amount) >= Number(v.total_credit) && Number(v.total_credit) > 0;
      return {
        id: v.id,
        voucherNo: v.voucherNo,
        voucherDate: v.voucherDate.toISOString().slice(0, 10),
        docType: (v.doc_type || (v.voucherType === "PNK" ? "PURCHASE_SLIP" : "VAT_INVOICE")) as any,
        supplierName: v.supplier_name || "Thương lái vựa dừa",
        supplierCode: undefined,
        taxCode: v.tax_code || undefined,
        invoiceSeries: v.invoice_series || undefined,
        invoiceTemplate: v.invoice_template || undefined,
        costCategory: (v.cost_category || "RAW_MATERIAL") as any,
        processStage: (v.process_stage || undefined) as any,
        allocationMode: (v.allocation_mode || "BATCH") as any,
        batchId: v.batch_id || undefined,
        netWeightKg: firstLine?.quantity ? Number(firstLine.quantity) : undefined,
        unitPrice: firstLine?.unit_price ? Number(firstLine.unit_price) : undefined,
        subtotal: Number(firstLine?.debit_amount || v.total_debit),
        vatRate: firstLine?.tax_rate ? Number(firstLine.tax_rate) : undefined,
        vatAmount: Number(v.total_credit) - Number(firstLine?.debit_amount || 0),
        totalAmount: Number(v.total_credit),
        description: v.description || "",
        paymentStatus: isPaid ? "PAID" : "UNPAID",
        paymentVoucherNo: isPaid ? v.reference_invoice_no : undefined,
        checksum: v.source_checksum || undefined,
        createdAt: v.createdAt.toISOString()
      };
    });
  }

  async checkDuplicateInvoice(query: { taxCode?: string; series?: string; invoiceNo?: string; docType?: string }) {
    const context = await this.ensureDefaultContext();
    if (!query.invoiceNo?.trim()) {
      return { isDuplicate: false };
    }

    if (query.docType === "VAT_INVOICE") {
      const normTax = (query.taxCode || "").trim().toUpperCase();
      const normSeries = (query.series || "").trim().toUpperCase();
      const normNo = (query.invoiceNo || "").trim().toUpperCase();
      const checksum = createHash("md5").update(`${normTax}_${normSeries}_${normNo}`).digest("hex");

      const existing = await this.prisma.voucher.findFirst({
        where: {
          organizationId: context.organization.id,
          source_checksum: checksum
        }
      });

      if (existing) {
        return {
          isDuplicate: true,
          message: `Trùng hóa đơn: Số ${existing.voucherNo} (Ký hiệu ${existing.invoice_series || "N/A"}) của NCC ${existing.supplier_name || "N/A"} đã tồn tại trong hệ thống ngày ${new Date(existing.voucherDate).toLocaleDateString("vi-VN")}.`,
          existingVoucher: {
            id: existing.id,
            voucherNo: existing.voucherNo,
            voucherDate: existing.voucherDate,
            amount: Number(existing.total_credit),
            supplierName: existing.supplier_name
          }
        };
      }
    } else {
      const existing = await this.prisma.voucher.findFirst({
        where: {
          organizationId: context.organization.id,
          voucherNo: query.invoiceNo.trim()
        }
      });

      if (existing) {
        return {
          isDuplicate: true,
          message: `Trùng số phiếu: Phiếu số ${existing.voucherNo} đã tồn tại trong hệ thống.`,
          existingVoucher: {
            id: existing.id,
            voucherNo: existing.voucherNo,
            voucherDate: existing.voucherDate,
            amount: Number(existing.total_credit)
          }
        };
      }
    }

    return { isDuplicate: false };
  }

  async createPurchasingInvoice(input: CreatePurchasingInvoiceInput) {
    const context = await this.ensureDefaultContext(input.createdBy);

    let checksum = "";
    if (input.docType === "VAT_INVOICE") {
      const normTax = (input.taxCode || "").trim().toUpperCase();
      const normSeries = (input.invoiceSeries || "").trim().toUpperCase();
      const normNo = (input.voucherNo || "").trim().toUpperCase();
      if (!normNo) {
        throw new BadRequestException("Số hóa đơn GTGT không được để trống.");
      }
      checksum = createHash("md5").update(`${normTax}_${normSeries}_${normNo}`).digest("hex");

      const existing = await this.prisma.voucher.findFirst({
        where: {
          organizationId: context.organization.id,
          source_checksum: checksum
        }
      });
      if (existing) {
        throw new BadRequestException(
          `CẢNH BÁO TRÙNG HÓA ĐƠN: Hóa đơn số ${input.voucherNo} (Ký hiệu: ${input.invoiceSeries || "N/A"}, MST: ${input.taxCode || "N/A"}) đã tồn tại trong hệ thống (nhập ngày ${new Date(existing.voucherDate).toLocaleDateString("vi-VN")}).`
        );
      }
    } else {
      const existing = await this.prisma.voucher.findFirst({
        where: {
          organizationId: context.organization.id,
          voucherType: "PNK",
          voucherNo: input.voucherNo
        }
      });
      if (existing) {
        throw new BadRequestException(
          `CẢNH BÁO TRÙNG PHIẾU CÂN: Phiếu số ${input.voucherNo} đã tồn tại trong hệ thống.`
        );
      }
      checksum = createHash("md5").update(`PURCHASE_${input.voucherNo.trim().toUpperCase()}`).digest("hex");
    }

    const voucher = await this.prisma.$transaction(async (tx) => {
      let supplierId: string | null = null;
      if (input.supplierName) {
        const sup = await tx.supplier.findFirst({
          where: {
            organizationId: context.organization.id,
            OR: [
              ...(input.supplierCode ? [{ code: input.supplierCode }] : []),
              { name: input.supplierName },
              ...(input.taxCode ? [{ taxCode: input.taxCode }] : [])
            ]
          }
        });
        if (sup) {
          supplierId = sup.id;
        } else {
          const uniqueCode = input.supplierCode || `NCC-${Date.now().toString().slice(-6)}`;
          const existingCode = await tx.supplier.findFirst({
            where: { organizationId: context.organization.id, code: uniqueCode }
          });
          const safeCode = existingCode ? `NCC-${Date.now().toString().slice(-6)}` : uniqueCode;

          const newSup = await tx.supplier.create({
            data: {
              id: randomUUID(),
              organizationId: context.organization.id,
              code: safeCode,
              name: input.supplierName,
              taxCode: input.taxCode || null,
              status: "active",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          supplierId = newSup.id;
        }
      }

      let debitAccountCode = "152";
      if (input.costCategory === "PROCESSING") debitAccountCode = "154";
      else if (input.costCategory === "OVERHEAD") debitAccountCode = "642";

      const debitAccountId = await this.ensureAccount(tx, context.organization.id, debitAccountCode);
      const creditAccountId = await this.ensureAccount(tx, context.organization.id, "331");

      const created = await tx.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          voucherType: input.docType === "PURCHASE_SLIP" ? "PNK" : "HDM",
          voucherNo: input.voucherNo,
          voucherDate: new Date(input.voucherDate),
          posting_date: new Date(input.voucherDate),
          currencyCode: "VND",
          exchange_rate: 1,
          status: "approved",
          approval_status: "approved",
          description: input.description || (input.docType === "PURCHASE_SLIP"
            ? `Thu mua vỏ dừa xe ${input.vehiclePlate || ""} từ thương lái ${input.supplierName} (${input.netWeightKg || 0} kg)`
            : `Hóa đơn chi phí ${input.costCategory} từ ${input.supplierName}`),
          counterparty_type: CounterpartyType.supplier,
          reference_invoice_no: input.voucherNo,
          source_checksum: checksum,
          batch_id: input.batchId || null,
          doc_type: input.docType,
          cost_category: input.costCategory,
          process_stage: input.processStage || null,
          allocation_mode: input.allocationMode,
          invoice_series: input.invoiceSeries || null,
          invoice_template: input.invoiceTemplate || null,
          tax_code: input.taxCode || null,
          supplier_name: input.supplierName,
          total_debit: input.totalAmount,
          total_credit: input.totalAmount,
          createdBy: context.user.id,
          updated_by: context.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: created.id,
          lineNo: 1,
          account_id: debitAccountId,
          supplier_id: supplierId,
          debit_amount: input.subtotal,
          credit_amount: 0,
          quantity: input.netWeightKg || null,
          unit_price: input.unitPrice || null,
          tax_rate: input.vatRate || null,
          cost_category: input.costCategory,
          process_stage: input.processStage || null,
          memo: created.description,
          created_at: new Date()
        }
      });

      if (input.vatAmount && input.vatAmount > 0) {
        const vatAccountId = await this.ensureAccount(tx, context.organization.id, "1331");
        await tx.voucherLine.create({
          data: {
            id: randomUUID(),
            voucherId: created.id,
            lineNo: 2,
            account_id: vatAccountId,
            supplier_id: supplierId,
            debit_amount: input.vatAmount,
            credit_amount: 0,
            tax_rate: input.vatRate || null,
            cost_category: input.costCategory,
            process_stage: input.processStage || null,
            memo: `Thuế GTGT HĐ ${input.voucherNo}`,
            created_at: new Date()
          }
        });
      }

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: created.id,
          lineNo: 3,
          account_id: creditAccountId,
          supplier_id: supplierId,
          debit_amount: 0,
          credit_amount: input.totalAmount,
          memo: `Công nợ phải trả ${input.supplierName}`,
          created_at: new Date()
        }
      });

      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "purchasing_invoice",
        entityId: created.id,
        action: "purchasing_invoice_created",
        afterPayload: {
          voucherNo: created.voucherNo,
          docType: input.docType,
          totalAmount: input.totalAmount,
          supplierName: input.supplierName
        }
      });

      return created;
    });

    return voucher;
  }

  async createPaymentForInvoice(invoiceId: string, input: { paymentChannel: "cash" | "bank"; cashBookCode?: string; bankAccountCode?: string; createdBy?: string }) {
    const context = await this.ensureDefaultContext(input.createdBy);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.voucher.findUnique({
        where: { id: invoiceId },
        include: { lines: true }
      });

      if (!invoice) {
        throw new NotFoundException(`Không tìm thấy chứng từ với ID ${invoiceId}`);
      }

      const paymentType: CashVoucherType = input.paymentChannel === "cash" ? "PC" : "BN";
      const paymentNo = `${paymentType}-${Date.now().toString().slice(-6)}`;
      const amount = Number(invoice.total_credit);

      const cashBookId = input.paymentChannel === "cash"
        ? await this.ensureCashBook(tx, context.organization.id, input.cashBookCode || "QUY-XUONG")
        : null;
      const bankAccountId = input.paymentChannel === "bank"
        ? await this.ensureBankAccount(tx, context.organization.id, input.bankAccountCode || "VCB-001", context.organization.name)
        : null;

      const paymentVoucher = await tx.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          voucherType: paymentType,
          voucherNo: paymentNo,
          voucherDate: new Date(),
          posting_date: new Date(),
          currencyCode: "VND",
          exchange_rate: 1,
          status: "approved",
          approval_status: "approved",
          description: `Thanh toán cho ${invoice.supplier_name || "NCC"} theo ${invoice.doc_type === "PURCHASE_SLIP" ? "phiếu cân" : "hóa đơn"} ${invoice.voucherNo}`,
          payment_channel: input.paymentChannel === "cash" ? PaymentChannel.cash : PaymentChannel.bank,
          cash_book_id: cashBookId,
          bank_account_id: bankAccountId,
          counterparty_type: CounterpartyType.supplier,
          reference_invoice_no: invoice.voucherNo,
          total_debit: amount,
          total_credit: amount,
          createdBy: context.user.id,
          updated_by: context.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      const debitAccountId = await this.ensureAccount(tx, context.organization.id, "331");
      const creditAccountId = await this.ensureAccount(tx, context.organization.id, input.paymentChannel === "cash" ? "1111" : "1121");

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: paymentVoucher.id,
          lineNo: 1,
          account_id: debitAccountId,
          debit_amount: amount,
          credit_amount: 0,
          memo: `Thanh toán công nợ ${invoice.supplier_name || "NCC"}`,
          created_at: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: paymentVoucher.id,
          lineNo: 2,
          account_id: creditAccountId,
          bank_account_id: bankAccountId,
          debit_amount: 0,
          credit_amount: amount,
          memo: paymentVoucher.description,
          created_at: new Date()
        }
      });

      await tx.voucher.update({
        where: { id: invoiceId },
        data: {
          matched_amount: amount,
          status: "posted"
        }
      });

      return {
        paymentVoucher,
        updatedInvoice: invoice
      };
    });
  }

  async listProductionBatches(query?: { q?: string; status?: string }) {
    const context = await this.ensureDefaultContext();
    const search = query?.q?.trim();

    const batches = await this.prisma.productionBatch.findMany({
      where: {
        organizationId: context.organization.id,
        ...(query?.status ? { status: query.status } : {}),
        ...(search ? {
          OR: [
            { batchCode: { contains: search } },
            { supplierName: { contains: search } },
            { notes: { contains: search } }
          ]
        } : {})
      },
      orderBy: { batchDate: "desc" }
    });

    return batches.map((b) => ({
      id: b.id,
      batchCode: b.batchCode,
      batchDate: b.batchDate.toISOString().slice(0, 10),
      supplierId: b.supplierId || undefined,
      supplierName: b.supplierName || undefined,
      rawMaterialKg: Number(b.rawMaterialKg),
      crudeOilKg: Number(b.crudeOilKg),
      crudeOilLiters: Number(b.crudeOilLiters),
      byproductKg: Number(b.byproductKg),
      oilYieldRate: Number(b.oilYieldRate),
      lossRate: Number(b.lossRate),
      rawMaterialCost: Number(b.rawMaterialCost),
      processingCost: Number(b.processingCost),
      overheadCost: Number(b.overheadCost),
      byproductRecovery: Number(b.byproductRecovery),
      totalCost: Number(b.totalCost),
      unitCostPerKg: Number(b.unitCostPerKg),
      status: b.status as any,
      notes: b.notes || undefined,
      createdAt: b.createdAt.toISOString()
    }));
  }

  async createProductionBatch(input: CreateProductionBatchInput) {
    const context = await this.ensureDefaultContext(input.createdBy);

    const crudeOilLiters = Number((input.crudeOilKg / 0.915).toFixed(1));
    const byproductKg = input.byproductKg ?? 0;
    const oilYieldRate = input.rawMaterialKg > 0 
      ? Number(((input.crudeOilKg / input.rawMaterialKg) * 100).toFixed(2))
      : 0;
    const byproductRate = input.rawMaterialKg > 0
      ? Number(((byproductKg / input.rawMaterialKg) * 100).toFixed(2))
      : 0;
    const lossRate = Number(Math.max(0, 100 - oilYieldRate - byproductRate).toFixed(2));

    const rawCost = input.rawMaterialCost ?? (input.rawMaterialKg * 4200);
    const procCost = input.processingCost ?? (input.crudeOilKg * 1850);
    const ovhCost = input.overheadCost ?? (input.crudeOilKg * 500);
    const bprCost = input.byproductRecovery ?? (byproductKg * 1200);
    const totalCost = rawCost + procCost + ovhCost - bprCost;
    const unitCostPerKg = input.crudeOilKg > 0 ? Math.round(totalCost / input.crudeOilKg) : 0;

    const batch = await this.prisma.productionBatch.create({
      data: {
        id: randomUUID(),
        organizationId: context.organization.id,
        batchCode: input.batchCode,
        batchDate: new Date(input.batchDate),
        supplierName: input.supplierName || null,
        supplierId: input.supplierId || null,
        rawMaterialKg: input.rawMaterialKg,
        crudeOilKg: input.crudeOilKg,
        crudeOilLiters: crudeOilLiters,
        byproductKg: byproductKg,
        oilYieldRate: oilYieldRate,
        lossRate: lossRate,
        rawMaterialCost: rawCost,
        processingCost: procCost,
        overheadCost: ovhCost,
        byproductRecovery: bprCost,
        totalCost: totalCost,
        unitCostPerKg: unitCostPerKg,
        status: input.status || "COMPLETED",
        notes: input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return batch;
  }

  async getSupplierYieldPerformance() {
    const context = await this.ensureDefaultContext();
    const batches = await this.prisma.productionBatch.findMany({
      where: { organizationId: context.organization.id }
    });

    const map = new Map<string, {
      supplierName: string;
      batchCount: number;
      totalRawKg: number;
      totalCrudeOilKg: number;
      totalByproductKg: number;
    }>();

    for (const b of batches) {
      const name = b.supplierName || "Thương lái lẻ";
      const existing = map.get(name) || {
        supplierName: name,
        batchCount: 0,
        totalRawKg: 0,
        totalCrudeOilKg: 0,
        totalByproductKg: 0
      };

      existing.batchCount += 1;
      existing.totalRawKg += Number(b.rawMaterialKg);
      existing.totalCrudeOilKg += Number(b.crudeOilKg);
      existing.totalByproductKg += Number(b.byproductKg);
      map.set(name, existing);
    }

    const results = Array.from(map.values()).map((item) => {
      const avgYieldRate = item.totalRawKg > 0
        ? Number(((item.totalCrudeOilKg / item.totalRawKg) * 100).toFixed(2))
        : 0;

      let rating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" = "AVERAGE";
      let recommendation = "";

      if (avgYieldRate >= 22.0) {
        rating = "EXCELLENT";
        recommendation = "[XUẤT SẮC] Vỏ dừa già, khô, tỷ lệ dầu rất cao (>22%). Ưu tiên tăng sản lượng thu mua.";
      } else if (avgYieldRate >= 20.0) {
        rating = "GOOD";
        recommendation = "[ĐẠT CHUẨN] Đạt chuẩn định mức xưởng (20-22%). Giữ nguyên giá thu mua.";
      } else if (avgYieldRate >= 18.5) {
        rating = "AVERAGE";
        recommendation = "[TRUNG BÌNH] Tỷ lệ dầu ở ngưỡng tối thiểu (18.5-20%). Cần kiểm tra kỹ độ ẩm khi cân.";
      } else {
        rating = "POOR";
        recommendation = "[CẢNH BÁO] Vỏ dừa nhiều nước hoặc dừa non (<18%). Đàm phán giảm giá thu mua hoặc trừ tỷ lệ nước.";
      }

      return {
        supplierName: item.supplierName,
        batchCount: item.batchCount,
        totalRawKg: item.totalRawKg,
        totalCrudeOilKg: item.totalCrudeOilKg,
        totalByproductKg: item.totalByproductKg,
        avgYieldRate,
        rating,
        recommendation
      };
    });

    results.sort((a, b) => b.avgYieldRate - a.avgYieldRate);
    return results;
  }

  private async ensureCustomer(
    tx: Prisma.TransactionClient,
    organizationId: string,
    customerName: string,
    taxCode?: string,
    customerCode?: string
  ): Promise<string> {
    const existing = await tx.customer.findFirst({
      where: {
        organizationId,
        OR: [
          ...(customerCode ? [{ code: customerCode }] : []),
          { name: customerName },
          ...(taxCode ? [{ taxCode }] : [])
        ]
      }
    });

    if (existing) {
      return existing.id;
    }

    const baseCode = (customerCode || customerName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 10);
    const safeCode = `KH_${baseCode || "KHACH"}_${Date.now().toString().slice(-4)}`;

    const created = await tx.customer.create({
      data: {
        id: randomUUID(),
        organizationId,
        code: safeCode,
        name: customerName,
        taxCode: taxCode || null,
        status: "active",
        createdAt: new Date()
      }
    });

    return created.id;
  }

  async getCostAccountingSummary() {
    const context = await this.ensureDefaultContext();

    const batches = await this.prisma.productionBatch.findMany({
      where: { organizationId: context.organization.id },
      orderBy: { batchDate: "desc" }
    });

    const totalRawKgProcessed = batches.reduce((sum, b) => sum + Number(b.rawMaterialKg), 0);
    const totalCrudeOilKgProduced = batches.reduce((sum, b) => sum + Number(b.crudeOilKg), 0);
    const totalCrudeOilLitersProduced = batches.reduce((sum, b) => sum + Number(b.crudeOilLiters), 0);
    const totalByproductKgProduced = batches.reduce((sum, b) => sum + Number(b.byproductKg), 0);

    const costVouchers = await this.prisma.voucher.findMany({
      where: {
        organizationId: context.organization.id,
        voucherType: { in: ["PNK", "HDM"] }
      },
      include: {
        lines: true
      }
    });

    let rawMaterialCost = 0;
    let rawMaterialKgPurchased = 0;
    let processingCostEp = 0;
    let processingCostLoc = 0;
    let processingCostDongPhuy = 0;
    let overheadCost = 0;

    for (const v of costVouchers) {
      const amount = v.lines.reduce((s, l) => s + Number(l.debit_amount || 0), 0);
      const kg = v.lines.reduce((s, l) => s + Number(l.quantity || 0), 0);

      if (v.cost_category === "RAW_MATERIAL" || !v.cost_category) {
        rawMaterialCost += amount;
        rawMaterialKgPurchased += kg;
      } else if (v.cost_category === "PROCESSING") {
        if (v.process_stage === "EP") processingCostEp += amount;
        else if (v.process_stage === "LOC") processingCostLoc += amount;
        else processingCostDongPhuy += amount;
      } else if (v.cost_category === "OVERHEAD") {
        overheadCost += amount;
      }
    }

    const totalBatchRawCost = batches.reduce((sum, b) => sum + Number(b.rawMaterialCost || 0), 0);
    const totalBatchProcCost = batches.reduce((sum, b) => sum + Number(b.processingCost || 0), 0);
    const totalBatchOvhCost = batches.reduce((sum, b) => sum + Number(b.overheadCost || 0), 0);
    const totalBatchBprRecovery = batches.reduce((sum, b) => sum + Number(b.byproductRecovery || 0), 0);

    const effectiveRawCost = Math.max(rawMaterialCost, totalBatchRawCost);
    const effectiveProcessingCost = Math.max(processingCostEp + processingCostLoc + processingCostDongPhuy, totalBatchProcCost);
    const effectiveOverheadCost = Math.max(overheadCost, totalBatchOvhCost);
    const effectiveByproductRecovery = totalBatchBprRecovery > 0 ? totalBatchBprRecovery : Math.round(totalByproductKgProduced * 1200);

    const totalNetProductionCost = effectiveRawCost + effectiveProcessingCost + effectiveOverheadCost - effectiveByproductRecovery;
    
    const unitCostPerKg = totalCrudeOilKgProduced > 0 
      ? Math.round(totalNetProductionCost / totalCrudeOilKgProduced) 
      : 21450;
    const unitCostPerLiter = totalCrudeOilLitersProduced > 0 
      ? Math.round(totalNetProductionCost / totalCrudeOilLitersProduced) 
      : Math.round(unitCostPerKg / 1.093);

    const avgYieldRate = totalRawKgProcessed > 0
      ? Number(((totalCrudeOilKgProduced / totalRawKgProcessed) * 100).toFixed(2))
      : 21.37;

    const targetUnitCost = 21500;
    const unitCostVariance = unitCostPerKg - targetUnitCost;
    const varianceStatus = unitCostVariance <= 0 ? "EXCELLENT" : unitCostVariance <= 800 ? "WARNING" : "DANGER";

    const costElements = [
      {
        id: "1",
        code: "CP_RAW",
        name: "Nguyên liệu vỏ dừa thu mua",
        category: "RAW_MATERIAL",
        actualAmount: effectiveRawCost,
        targetAmount: Math.round(totalCrudeOilKgProduced * (4200 / 0.21)),
        unitRate: totalCrudeOilKgProduced > 0 ? Math.round(effectiveRawCost / totalCrudeOilKgProduced) : 19600,
        targetUnitRate: 20000,
        description: "Tiền thu mua vỏ dừa từ thương lái + cước xe bốc xếp",
        note: `Thu hồi bình quân ${avgYieldRate}% dầu thô`
      },
      {
        id: "2",
        code: "CP_POWER",
        name: "Điện sản xuất máy ép & bơm dầu",
        category: "PROCESSING",
        actualAmount: Math.round(effectiveProcessingCost * 0.55),
        targetAmount: Math.round(totalCrudeOilKgProduced * 950),
        unitRate: totalCrudeOilKgProduced > 0 ? Math.round((effectiveProcessingCost * 0.55) / totalCrudeOilKgProduced) : 950,
        targetUnitRate: 1000,
        description: "Điện 3 pha động cơ ép trục vít & bơm dầu cao áp",
        note: "Đo theo công tơ xưởng sản xuất"
      },
      {
        id: "3",
        code: "CP_FILTER",
        name: "Màng lọc & Vật tư tiêu hao ép/lọc",
        category: "PROCESSING",
        actualAmount: Math.round(effectiveProcessingCost * 0.25),
        targetAmount: Math.round(totalCrudeOilKgProduced * 450),
        unitRate: totalCrudeOilKgProduced > 0 ? Math.round((effectiveProcessingCost * 0.25) / totalCrudeOilKgProduced) : 450,
        targetUnitRate: 500,
        description: "Túi lọc PP, vải lọc khung bản, hóa chất tẩy rửa",
        note: "Thay túi lọc định kỳ sau mỗi 5 tấn dầu"
      },
      {
        id: "4",
        code: "CP_MAINT",
        name: "Bảo dưỡng & Sửa chữa máy ép",
        category: "PROCESSING",
        actualAmount: Math.round(effectiveProcessingCost * 0.20),
        targetAmount: Math.round(totalCrudeOilKgProduced * 350),
        unitRate: totalCrudeOilKgProduced > 0 ? Math.round((effectiveProcessingCost * 0.20) / totalCrudeOilKgProduced) : 350,
        targetUnitRate: 400,
        description: "Hàn đắp trục vít ép, mài dao băm vỏ, mỡ bôi trơn máy",
        note: "Bảo trì định kỳ hàng tháng"
      },
      {
        id: "5",
        code: "CP_OVERHEAD",
        name: "Chi phí Vận hành chung & Thuê xưởng",
        category: "OVERHEAD",
        actualAmount: effectiveOverheadCost,
        targetAmount: Math.round(totalCrudeOilKgProduced * 500),
        unitRate: totalCrudeOilKgProduced > 0 ? Math.round(effectiveOverheadCost / totalCrudeOilKgProduced) : 500,
        targetUnitRate: 550,
        description: "Thuê mặt bằng xưởng ép, nước, quản lý và khấu hao",
        note: "Phân bổ đều theo sản lượng lít dầu xuất kỳ"
      },
      {
        id: "6",
        code: "CP_BYPRODUCT",
        name: "Giảm trừ: Doanh thu bán cám dừa (thành phẩm)",
        category: "CREDIT_REDUCTION",
        actualAmount: -effectiveByproductRecovery,
        targetAmount: -Math.round(totalByproductKgProduced * 1200),
        unitRate: totalCrudeOilKgProduced > 0 ? -Math.round(effectiveByproductRecovery / totalCrudeOilKgProduced) : -1700,
        targetUnitRate: -1600,
        description: "Thu hồi cám dừa thành phẩm (cám nâu, cám trắng, cám nguyên) bán cho trại thức ăn gia súc & phân bón",
        note: `Giá bán ~1,200 - 1,800 đ/kg (${totalByproductKgProduced.toLocaleString("vi-VN")} kg)`
      }
    ];

    return {
      kpis: {
        totalNetCost: totalNetProductionCost,
        totalCrudeOilKg: totalCrudeOilKgProduced,
        totalCrudeOilLiters: totalCrudeOilLitersProduced,
        totalRawKg: totalRawKgProcessed,
        totalByproductKg: totalByproductKgProduced,
        unitCostPerKg,
        unitCostPerLiter,
        targetUnitCost,
        unitCostVariance,
        varianceStatus,
        rawMaterialCostTotal: effectiveRawCost,
        processingCostTotal: effectiveProcessingCost,
        overheadCostTotal: effectiveOverheadCost,
        byproductRecoveryTotal: effectiveByproductRecovery,
        oilYieldRateAvg: avgYieldRate,
        batchCount: batches.length
      },
      costElements,
      recentBatches: batches.slice(0, 10).map((b) => ({
        id: b.id,
        batchCode: b.batchCode,
        batchDate: b.batchDate.toISOString().slice(0, 10),
        supplierName: b.supplierName || "Thương lái lẻ",
        rawMaterialKg: Number(b.rawMaterialKg),
        crudeOilKg: Number(b.crudeOilKg),
        crudeOilLiters: Number(b.crudeOilLiters),
        oilYieldRate: Number(b.oilYieldRate),
        rawMaterialCost: Number(b.rawMaterialCost || 0),
        processingCost: Number(b.processingCost || 0),
        totalCost: Number(b.totalCost || 0),
        unitCostPerKg: Number(b.unitCostPerKg || 0)
      }))
    };
  }

  async exportCostReportPackage() {
    const summary = await this.getCostAccountingSummary();
    const purchasing = await this.listPurchasingInvoices();
    const sales = await this.listSalesInvoices();
    const suppliers = await this.getSupplierYieldPerformance();

    return {
      exportTimestamp: new Date().toISOString(),
      workshop: {
        name: "Xưởng Thu mua & Ép Dầu dừa Bến Tre",
        taxCode: "0318999888",
        address: "Cụm Công nghiệp Long Định, Châu Thành, Bến Tre",
        manager: "Nguyễn Văn Đạt - Quản đốc Xưởng",
        currency: "VND"
      },
      summary: summary.kpis,
      costElements: summary.costElements,
      productionBatches: summary.recentBatches,
      supplierRankings: suppliers,
      purchasingInvoices: purchasing,
      salesInvoices: sales
    };
  }

  async listSalesInvoices(query?: {
    q?: string;
    status?: string;
    paymentStatus?: string;
    productType?: string;
  }) {
    const context = await this.ensureDefaultContext();
    const search = query?.q?.trim();

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        organizationId: context.organization.id,
        voucherType: "HDB",
        ...(search
          ? {
              OR: [
                { voucherNo: { contains: search } },
                { description: { contains: search } },
                { tax_code: { contains: search } }
              ]
            }
          : {})
      },
      include: {
        lines: true
      },
      orderBy: { voucherDate: "desc" }
    });

    const results = [];
    for (const v of vouchers) {
      const payments = await this.prisma.voucher.findMany({
        where: {
          organizationId: context.organization.id,
          reference_invoice_no: v.voucherNo,
          voucherType: { in: ["PT", "BC"] }
        },
        select: {
          voucherNo: true,
          voucherType: true,
          total_debit: true,
          voucherDate: true
        }
      });

      const paidAmount = payments.reduce((sum, p) => sum + Number(p.total_debit || 0), 0);

      const firstLine = v.lines.find((l) => l.quantity && Number(l.quantity) > 0) || v.lines[0];
      const quantity = firstLine?.quantity ? Number(firstLine.quantity) : 0;
      const unitPrice = firstLine?.unit_price ? Number(firstLine.unit_price) : 0;
      const vatRate = (v.lines.find((l) => l.tax_rate && Number(l.tax_rate) > 0)?.tax_rate)
        ? Number(v.lines.find((l) => l.tax_rate && Number(l.tax_rate) > 0)?.tax_rate)
        : (firstLine?.tax_rate ? Number(firstLine.tax_rate) : 0);

      const productType = (v.cost_category || firstLine?.cost_category || "CRUDE_OIL") as SalesProductType;
      const productName = getSalesProductName(productType);
      const unit = "Kg";

      const subtotal = Math.round(quantity * unitPrice);
      const vatAmount = Math.round((subtotal * vatRate) / 100);
      const totalAmount = Number(v.total_debit || subtotal + vatAmount);
      const customerName = v.supplier_name || (v.description?.split("cho khách ")[1]?.split(" (")[0]) || "Khách mua dầu";

      const remainingAmount = Math.max(0, totalAmount - paidAmount);
      let paymentStatus: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";
      if (paidAmount >= totalAmount) {
        paymentStatus = "PAID";
      } else if (paidAmount > 0) {
        paymentStatus = "PARTIAL";
      }

      // Thời hạn công nợ (N ngày) & Hạn thanh toán (Due Date)
      const termDays = v.payment_term_days !== null && v.payment_term_days !== undefined ? v.payment_term_days : 15;
      const dueDateObj = v.due_date ? new Date(v.due_date) : new Date(v.voucherDate.getTime() + termDays * 86400000);
      const dueDateStr = dueDateObj.toISOString().slice(0, 10);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueCompare = new Date(dueDateObj);
      dueCompare.setHours(0, 0, 0, 0);
      const diffMs = dueCompare.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / 86400000);

      const isOverdue = paymentStatus !== "PAID" && diffDays < 0;
      const overdueDays = isOverdue ? Math.abs(diffDays) : 0;
      const daysUntilDue = diffDays;

      const item = {
        id: v.id,
        voucherNo: v.voucherNo,
        voucherDate: v.voucherDate.toISOString().slice(0, 10),
        dueDate: dueDateStr,
        paymentTermDays: termDays,
        isOverdue,
        overdueDays,
        daysUntilDue,
        customerName,
        taxCode: v.tax_code || undefined,
        invoiceSeries: v.invoice_series || undefined,
        invoiceTemplate: v.invoice_template || undefined,
        docType: (v.doc_type || "VAT_INVOICE") as "VAT_INVOICE" | "SALES_RECEIPT",
        productType,
        productName,
        unit,
        quantity,
        unitPrice,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        batchId: v.batch_id || undefined,
        description: v.description || undefined,
        paymentStatus,
        paidAmount,
        remainingAmount,
        paymentVouchers: payments.map((p) => ({
          voucherNo: p.voucherNo,
          voucherType: p.voucherType,
          amount: Number(p.total_debit || 0),
          date: p.voucherDate.toISOString().slice(0, 10)
        }))
      };

      if (query?.paymentStatus && query.paymentStatus !== "ALL") {
        if (query.paymentStatus === "OVERDUE") {
          if (!item.isOverdue) continue;
        } else if (item.paymentStatus !== query.paymentStatus) {
          continue;
        }
      }
      if (query?.productType && item.productType !== query.productType) continue;
      if (query?.productType && item.productType !== query.productType) continue;

      results.push(item);
    }

    return results;
  }

  async createSalesInvoice(input: CreateSalesInvoiceInput) {
    const context = await this.ensureDefaultContext();

    const voucher = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.voucher.findFirst({
        where: {
          organizationId: context.organization.id,
          voucherType: "HDB",
          voucherNo: input.voucherNo
        }
      });

      if (existing) {
        throw new ConflictException(`Số hóa đơn ${input.voucherNo} đã tồn tại trong hệ thống`);
      }

      const customerId = await this.ensureCustomer(
        tx,
        context.organization.id,
        input.customerName,
        input.taxCode,
        input.customerCode
      );

      const arAccountId = await this.ensureAccount(tx, context.organization.id, "131");
      const revenueAccountId = await this.ensureAccount(tx, context.organization.id, "511");

      const productLabel = getSalesProductName(input.productType);
      const desc = input.description || `Xuất bán ${productLabel} cho khách ${input.customerName} (${input.quantity} ${input.unit || "kg"})`;

      const termDays = input.paymentTermDays !== undefined ? input.paymentTermDays : (input.dueDate ? Math.round((new Date(input.dueDate).getTime() - new Date(input.voucherDate).getTime()) / 86400000) : 15);
      const calculatedDueDate = input.dueDate ? new Date(input.dueDate) : new Date(new Date(input.voucherDate).getTime() + (termDays || 15) * 86400000);

      const created = await tx.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          voucherType: "HDB",
          voucherNo: input.voucherNo,
          voucherDate: new Date(input.voucherDate),
          posting_date: new Date(input.voucherDate),
          due_date: calculatedDueDate,
          payment_term_days: termDays,
          currencyCode: "VND",
          exchange_rate: 1,
          status: "approved",
          approval_status: "approved",
          description: desc,
          counterparty_type: CounterpartyType.customer,
          reference_invoice_no: input.voucherNo,
          batch_id: input.batchId || null,
          doc_type: input.docType,
          cost_category: input.productType,
          invoice_series: input.invoiceSeries || null,
          invoice_template: input.invoiceTemplate || null,
          tax_code: input.taxCode || null,
          supplier_name: input.customerName,
          total_debit: input.totalAmount,
          total_credit: input.totalAmount,
          createdBy: context.user.id,
          updated_by: context.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: created.id,
          lineNo: 1,
          account_id: arAccountId,
          customer_id: customerId,
          debit_amount: input.totalAmount,
          credit_amount: 0,
          quantity: input.quantity,
          unit_price: input.unitPrice,
          tax_rate: input.vatRate || null,
          cost_category: input.productType,
          memo: desc,
          created_at: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: created.id,
          lineNo: 2,
          account_id: revenueAccountId,
          customer_id: customerId,
          debit_amount: 0,
          credit_amount: input.subtotal,
          quantity: input.quantity,
          unit_price: input.unitPrice,
          tax_rate: input.vatRate || null,
          cost_category: input.productType,
          memo: `Doanh thu xuất bán ${productLabel}`,
          created_at: new Date()
        }
      });

      if (input.vatAmount && input.vatAmount > 0) {
        const vatAccountId = await this.ensureAccount(tx, context.organization.id, "3331");
        await tx.voucherLine.create({
          data: {
            id: randomUUID(),
            voucherId: created.id,
            lineNo: 3,
            account_id: vatAccountId,
            customer_id: customerId,
            debit_amount: 0,
            credit_amount: input.vatAmount,
            tax_rate: input.vatRate || null,
            cost_category: input.productType,
            memo: `Thuế GTGT đầu ra HĐ ${input.voucherNo}`,
            created_at: new Date()
          }
        });
      }

      await this.createAuditEvent(tx, {
        organizationId: context.organization.id,
        actorUserId: context.user.id,
        entityName: "sales_invoice",
        entityId: created.id,
        action: "sales_invoice_created",
        afterPayload: {
          voucherNo: created.voucherNo,
          docType: input.docType,
          totalAmount: input.totalAmount,
          customerName: input.customerName
        }
      });

      return created;
    });

    return voucher;
  }

  async createPaymentForSalesInvoice(
    voucherId: string,
    input: {
      paymentChannel: "cash" | "bank";
      amount?: number;
      paymentDate?: string;
      cashBookCode?: string;
      bankAccountCode?: string;
      description?: string;
    }
  ) {
    const context = await this.ensureDefaultContext();

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.voucher.findUnique({
        where: { id: voucherId },
        include: { lines: true }
      });

      if (!invoice) {
        throw new NotFoundException("Không tìm thấy hóa đơn bán hàng");
      }

      // 1. Tính tổng số tiền đã thanh toán trước đó
      const existingPayments = await tx.voucher.findMany({
        where: {
          organizationId: context.organization.id,
          reference_invoice_no: invoice.voucherNo,
          voucherType: { in: ["PT", "BC"] }
        },
        select: { total_debit: true }
      });

      const alreadyPaid = existingPayments.reduce((sum, p) => sum + Number(p.total_debit || 0), 0);
      const invoiceTotal = Number(invoice.total_debit || 0);
      const remaining = Math.max(0, invoiceTotal - alreadyPaid);

      if (remaining <= 0) {
        throw new BadRequestException("Hóa đơn này đã được thanh toán đủ toàn bộ công nợ");
      }

      // Số tiền thu đợt này (mặc định thu hết phần còn lại nếu không nhập hoặc nhập lớn hơn)
      const paymentAmount = input.amount && input.amount > 0 ? Math.min(input.amount, remaining) : remaining;

      const receiptVoucherType = input.paymentChannel === "cash" ? "PT" : "BC";
      const existingReceipts = await tx.voucher.count({
        where: {
          organizationId: context.organization.id,
          voucherType: receiptVoucherType
        }
      });
      const voucherNo = `${receiptVoucherType}-${String(existingReceipts + 1).padStart(4, "0")}`;

      const arAccountId = await this.ensureAccount(tx, context.organization.id, "131");
      let assetAccountId: string;

      if (input.paymentChannel === "cash") {
        assetAccountId = await this.ensureAccount(tx, context.organization.id, "1111");
      } else {
        assetAccountId = await this.ensureAccount(tx, context.organization.id, "1121");
      }

      const payDate = input.paymentDate ? new Date(input.paymentDate) : new Date();
      const isFull = paymentAmount >= remaining;
      const paymentSeq = existingPayments.length + 1;
      const desc = input.description || (isFull
        ? `Thu tiền bán hàng theo hóa đơn ${invoice.voucherNo} từ khách ${invoice.supplier_name || ""}`
        : `Thu tiền bán hàng (Đợt ${paymentSeq}) theo hóa đơn ${invoice.voucherNo} từ khách ${invoice.supplier_name || ""}`);

      const paymentVoucher = await tx.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: context.organization.id,
          voucherType: receiptVoucherType,
          voucherNo,
          voucherDate: payDate,
          posting_date: payDate,
          currencyCode: "VND",
          exchange_rate: 1,
          status: "approved",
          approval_status: "approved",
          description: desc,
          payment_channel: input.paymentChannel === "cash" ? PaymentChannel.cash : PaymentChannel.bank,
          counterparty_type: CounterpartyType.customer,
          reference_invoice_no: invoice.voucherNo,
          total_debit: paymentAmount,
          total_credit: paymentAmount,
          supplier_name: invoice.supplier_name,
          tax_code: invoice.tax_code,
          createdBy: context.user.id,
          updated_by: context.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: paymentVoucher.id,
          lineNo: 1,
          account_id: assetAccountId,
          debit_amount: paymentAmount,
          credit_amount: 0,
          memo: desc,
          created_at: new Date()
        }
      });

      await tx.voucherLine.create({
        data: {
          id: randomUUID(),
          voucherId: paymentVoucher.id,
          lineNo: 2,
          account_id: arAccountId,
          debit_amount: 0,
          credit_amount: paymentAmount,
          memo: `Cấn trừ công nợ phải thu HĐ ${invoice.voucherNo} (Đợt ${paymentSeq})`,
          created_at: new Date()
        }
      });

      return paymentVoucher;
    });
  }

  // ==========================================
  // CAPITAL INVESTMENT, CAPEX & FEASIBILITY
  // ==========================================

  async getCapitalFeasibilitySummary() {
    const context = await this.ensureDefaultContext();

    // 1. Lấy danh sách tài sản cố định máy móc
    const rawAssets = await this.prisma.fixed_assets.findMany({
      where: { organization_id: context.organization.id },
      orderBy: { acquisition_date: "asc" }
    });

    const assets = rawAssets.map((a) => {
      const origCost = Number(a.original_cost || 0);
      const resVal = Number(a.residual_value || 0);
      const usefulMonths = a.useful_life_months || 60;
      const monthlyDeprec = usefulMonths > 0 ? (origCost - resVal) / usefulMonths : 0;

      // Tính số tháng đã khấu hao từ acquisition_date đến hiện tại
      const acqDate = new Date(a.acquisition_date);
      const now = new Date();
      const monthsElapsed = Math.max(0, (now.getFullYear() - acqDate.getFullYear()) * 12 + (now.getMonth() - acqDate.getMonth()) + 1);
      const accumDeprec = Math.min(origCost - resVal, Math.round(monthlyDeprec * monthsElapsed));
      const bookVal = Math.max(resVal, origCost - accumDeprec);

      return {
        id: a.id,
        assetCode: a.asset_code,
        assetName: a.asset_name,
        category: a.asset_category as any,
        acquisitionDate: a.acquisition_date.toISOString().slice(0, 10),
        originalCost: origCost,
        residualValue: resVal,
        usefulLifeMonths: usefulMonths,
        monthlyDepreciation: Math.round(monthlyDeprec),
        accumulatedDepreciation: accumDeprec,
        currentBookValue: bookVal,
        supplierOrBrand: a.source_record_id || "Bến Tre Cơ Khí",
        status: (a.status as any) || "ACTIVE",
        notes: a.depreciation_method || ""
      };
    });

    // 2. Lấy danh sách Cổ đông & các khoản rót vốn từ bảng voucher (VoucherType = 'GOP_VON' hoặc 'BC_VON')
    const contributionVouchers = await this.prisma.voucher.findMany({
      where: {
        organizationId: context.organization.id,
        voucherType: { in: ["GOP_VON", "BC_VON"] }
      },
      orderBy: { voucherDate: "asc" }
    });

    const contributions = contributionVouchers.map((v) => ({
      id: v.id,
      contributionNo: v.voucherNo,
      contributionDate: v.voucherDate.toISOString().slice(0, 10),
      shareholderId: v.source_record_id || "SH-DEFAULT",
      shareholderName: v.supplier_name || "Cổ đông sáng lập",
      amount: Number(v.total_debit || 0),
      capitalType: (v.cost_category as any) || "INITIAL_CAPEX",
      paymentMethod: (v.payment_channel === "bank" ? "BANK" : "CASH") as any,
      bankAccount: v.bank_account_id || "Vietcombank Bến Tre",
      purpose: v.description || "Góp vốn thành lập xưởng ép dầu",
      verifiedBy: "Kế toán trưởng",
      status: "COMPLETED" as const
    }));

    // 3. Danh sách cổ đông tổng hợp
    const shareholderMap = new Map<string, {
      id: string;
      code: string;
      name: string;
      role: "FOUNDER" | "INVESTOR" | "OPERATOR";
      percentage: number;
      committed: number;
      contributed: number;
      phone: string;
      joinDate: string;
    }>();

    // Default base shareholders nếu chưa có
    const defaultShareholders = [
      { id: "SH-01", code: "CD-01", name: "Nguyễn Văn Đạt (Quản đốc)", role: "FOUNDER" as const, percentage: 45, committed: 1800000000, contributed: 0, phone: "0918.234.567", joinDate: "2026-06-01" },
      { id: "SH-02", code: "CD-02", name: "Trần Minh Quang (Đầu tư)", role: "INVESTOR" as const, percentage: 35, committed: 1400000000, contributed: 0, phone: "0903.888.999", joinDate: "2026-06-01" },
      { id: "SH-03", code: "CD-03", name: "Lê Hoàng Phúc (Vận hành & Kỹ thuật)", role: "OPERATOR" as const, percentage: 20, committed: 800000000, contributed: 0, phone: "0987.654.321", joinDate: "2026-06-01" }
    ];

    defaultShareholders.forEach(s => shareholderMap.set(s.name, { ...s }));

    contributions.forEach(c => {
      let sh = shareholderMap.get(c.shareholderName);
      if (!sh) {
        sh = {
          id: c.shareholderId,
          code: `CD-${shareholderMap.size + 1}`,
          name: c.shareholderName,
          role: "INVESTOR",
          percentage: 0,
          committed: c.amount,
          contributed: 0,
          phone: "0900.000.000",
          joinDate: c.contributionDate
        };
        shareholderMap.set(c.shareholderName, sh);
      }
      sh.contributed += c.amount;
    });

    const shareholders = Array.from(shareholderMap.values()).map(s => ({
      id: s.id,
      shareholderCode: s.code,
      name: s.name,
      role: s.role,
      ownershipPercentage: s.percentage,
      committedCapital: s.committed,
      contributedCapital: s.contributed,
      remainingCapital: Math.max(0, s.committed - s.contributed),
      phoneNumber: s.phone,
      joinDate: s.joinDate,
      notes: "Cổ đông tham gia từ giai đoạn chuẩn bị mặt bằng & dây chuyền ép dầu"
    }));

    // 4. Lấy dữ liệu hoạt động thực tế (Doanh thu & Chi phí)
    const costSummary = await this.getCostAccountingSummary();
    const salesInvoices = await this.listSalesInvoices();

    const totalCapexInvested = assets.reduce((sum, a) => sum + a.originalCost, 0);
    const totalWorkingCapitalInjected = contributions
      .filter(c => c.capitalType === "WORKING_CAPITAL")
      .reduce((sum, c) => sum + c.amount, 0);
    const totalCapitalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalCapitalCommitted = shareholders.reduce((sum, s) => sum + s.committedCapital, 0);

    const monthlyDepreciationTotal = assets.reduce((sum, a) => sum + a.monthlyDepreciation, 0);

    // Tổng doanh thu thực tế đã xuất bán
    const totalRevenue = salesInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Chi phí vận hành thực tế
    const totalOperatingExpense = (costSummary.kpis.rawMaterialCostTotal || 0) +
      (costSummary.kpis.processingCostTotal || 0) +
      (costSummary.kpis.overheadCostTotal || 0);

    const grossProfit = totalRevenue - totalOperatingExpense;
    const operatingProfit = grossProfit; // EBITDA
    // Trừ khấu hao tích lũy trong 3 tháng vận hành thực tế
    const threeMonthsDepreciation = monthlyDepreciationTotal * 3;
    const netProfit = operatingProfit - threeMonthsDepreciation;

    // Phân bổ khấu hao trên mỗi kg dầu dừa
    const totalCrudeOilKg = costSummary.kpis.totalCrudeOilKg || 1;
    const depreciationPerKgCrudeOil = Math.round(threeMonthsDepreciation / totalCrudeOilKg);

    // Chỉ số hiệu quả kinh doanh & Điểm hòa vốn
    const investedBase = Math.max(totalCapexInvested, 1);
    const roiPercentage = Number(((netProfit / investedBase) * 100).toFixed(2));

    // Điểm hòa vốn: Giả định biên đóng góp (Contribution Margin) trên mỗi kg vỏ dừa
    // Giá bán dầu bình quân ~ 32.500 đ/kg dầu thô, tỷ lệ thu hồi ~ 21.4% => 1 kg vỏ dừa cho ra ~ 6.955 đ doanh thu dầu + bã dừa
    // Chi phí biến đổi (mua dừa + điện ép) ~ 4.200 + 1.100 = 5.300 đ/kg vỏ dừa
    // Biên đóng góp trên 1 kg vỏ dừa ~ 1.655 đ/kg
    const contributionMarginPerKgRaw = 1655;
    const fixedCostsMonthly = monthlyDepreciationTotal + (costSummary.kpis.overheadCostTotal / 3 || 35000000);
    const breakEvenMonthlyKgRaw = Math.round(fixedCostsMonthly / contributionMarginPerKgRaw);
    const breakEvenMonthlyKgOil = Math.round(breakEvenMonthlyKgRaw * 0.214);
    const breakEvenMonthlyRevenue = Math.round(breakEvenMonthlyKgOil * 32500 + breakEvenMonthlyKgRaw * 0.73 * 1250);

    // So sánh công suất thực tế/tháng hiện tại
    const currentMonthlyRawAvg = Math.round((costSummary.kpis.totalRawKg || 346200) / 3);
    const currentMonthlyCapacityRate = Number(((currentMonthlyRawAvg / breakEvenMonthlyKgRaw) * 100).toFixed(1));

    // Dự phóng thời gian hoàn vốn
    // Lợi nhuận ròng bình quân/tháng = netProfit / 3
    const avgMonthlyNetProfit = Math.max(1, netProfit / 3);
    const estimatedPaybackMonths = Number((totalCapexInvested / avgMonthlyNetProfit).toFixed(1));
    const estimatedPaybackYears = Number((estimatedPaybackMonths / 12).toFixed(2));
    const capitalRecoveredToDate = Math.max(0, netProfit);
    const capitalRecoveryRate = Number(((capitalRecoveredToDate / investedBase) * 100).toFixed(1));

    return {
      feasibility: {
        totalCapexInvested,
        totalWorkingCapitalInjected,
        totalCapitalContributed,
        totalCapitalCommitted,
        monthlyDepreciationTotal,
        depreciationPerKgCrudeOil,
        totalRevenue,
        totalOperatingExpense,
        grossProfit,
        operatingProfit,
        netProfit,
        roiPercentage,
        breakEvenMonthlyKgRaw,
        breakEvenMonthlyKgOil,
        breakEvenMonthlyRevenue,
        currentMonthlyCapacityRate,
        estimatedPaybackMonths,
        estimatedPaybackYears,
        capitalRecoveredToDate,
        capitalRecoveryRate
      },
      assets,
      shareholders,
      contributions
    };
  }

  async listCapitalAssets(category?: string) {
    const summary = await this.getCapitalFeasibilitySummary();
    if (!category || category === "ALL") return summary.assets;
    return summary.assets.filter(a => a.category === category);
  }

  async createCapitalAsset(input: CreateCapitalAssetInput) {
    const context = await this.ensureDefaultContext();
    const existing = await this.prisma.fixed_assets.findFirst({
      where: {
        organization_id: context.organization.id,
        asset_code: input.assetCode
      }
    });

    if (existing) {
      throw new ConflictException(`Mã tài sản ${input.assetCode} đã tồn tại trong hệ thống`);
    }

    const created = await this.prisma.fixed_assets.create({
      data: {
        id: randomUUID(),
        organization_id: context.organization.id,
        asset_code: input.assetCode,
        asset_name: input.assetName,
        asset_category: input.category,
        acquisition_date: new Date(input.acquisitionDate),
        original_cost: input.originalCost,
        residual_value: input.residualValue || 0,
        useful_life_months: input.usefulLifeMonths,
        depreciation_method: input.notes || "Đường thẳng (Straight-line)",
        status: "ACTIVE",
        source_record_id: input.supplierOrBrand || "Bến Tre Cơ Khí",
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return created;
  }

  async listShareholders() {
    const summary = await this.getCapitalFeasibilitySummary();
    return summary.shareholders;
  }

  async createShareholder(input: CreateShareholderInput) {
    return {
      id: randomUUID(),
      ...input,
      contributedCapital: 0,
      remainingCapital: input.committedCapital
    };
  }

  async listCapitalContributions() {
    const summary = await this.getCapitalFeasibilitySummary();
    return summary.contributions;
  }

  async createCapitalContribution(input: CreateCapitalContributionInput) {
    const context = await this.ensureDefaultContext();
    const voucherType = input.paymentMethod === "BANK" ? "BC_VON" : "GOP_VON";

    const created = await this.prisma.voucher.create({
      data: {
        id: randomUUID(),
        organizationId: context.organization.id,
        voucherType: voucherType,
        voucherNo: input.contributionNo,
        voucherDate: new Date(input.contributionDate),
        status: "posted",
        approval_status: "approved",
        description: input.purpose,
        total_debit: input.amount,
        total_credit: input.amount,
        supplier_name: input.shareholderId,
        cost_category: input.capitalType,
        payment_channel: input.paymentMethod === "BANK" ? "bank" : "cash",
        source_record_id: input.shareholderId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return created;
  }
}


type BaseLineInput = {
  debitAccount: string;
  debitDimension1?: string;
  creditAccount: string;
  creditDimension1?: string;
  amount: number;
  description: string;
};

type CreateVoucherInput = {
  voucherType: string;
  voucherNo: string;
  voucherDate: string;
  currency: string;
  counterpartyCode?: string;
  counterpartyName?: string;
  content: string;
  amount: number;
  status: "draft" | "pending_approval" | "approved" | "posted" | "voided";
  createdBy: string;
  lines: BaseLineInput[];
};

type CashVoucherLineInput = BaseLineInput;

type CreateCashVoucherInput = Omit<VoucherRecord, "id" | "updatedAt" | "lines" | "voucherType"> & {
  voucherType: CashVoucherType;
  paymentChannel: "cash" | "bank";
  lines: CashVoucherLineInput[];
};

type ImportBankStatementInput = Pick<BankStatementRecord, "statementNo" | "bankAccountCode" | "statementDate" | "openingBalance" | "closingBalance"> & {
  sourceName?: string;
  lines: Array<Pick<BankStatementLineRecord, "transactionDate" | "referenceNo" | "description" | "debitAmount" | "creditAmount"> & { amount?: number }>;
};

type MatchReconciliationInput = {
  voucherId: string;
  bankStatementLineId: string;
  matchedAmount: number;
  note?: string;
};

export type CreatePurchasingInvoiceInput = {
  docType: "PURCHASE_SLIP" | "VAT_INVOICE";
  voucherNo: string;
  voucherDate: string;
  supplierName: string;
  supplierCode?: string;
  taxCode?: string;
  invoiceSeries?: string;
  invoiceTemplate?: string;
  costCategory: "RAW_MATERIAL" | "PROCESSING" | "OVERHEAD";
  processStage?: "EP" | "LOC" | "DONG_PHUY";
  allocationMode: "BATCH" | "PERIOD";
  batchId?: string;
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
  createdBy?: string;
  paymentTermDays?: number;
  dueDate?: string;
};




export type CreateProductionBatchInput = {
  batchCode: string;
  batchDate: string;
  supplierName?: string;
  supplierId?: string;
  rawMaterialKg: number;
  crudeOilKg: number;
  byproductKg?: number;
  rawMaterialCost?: number;
  processingCost?: number;
  overheadCost?: number;
  byproductRecovery?: number;
  status?: "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdBy?: string;
};

export type SalesProductType =
  | "CRUDE_OIL"
  | "FILTERED_OIL"
  | "BYPRODUCT"
  | "MEAL_BROWN"
  | "MEAL_WHITE"
  | "MEAL_WHOLE";

export function getSalesProductName(type: SalesProductType): string {
  switch (type) {
    case "CRUDE_OIL": return "Dầu dừa thô";
    case "FILTERED_OIL": return "Dầu dừa lọc";
    case "MEAL_BROWN": return "Cám dừa nâu";
    case "MEAL_WHITE": return "Cám dừa trắng";
    case "MEAL_WHOLE": return "Cám dừa nguyên";
    case "BYPRODUCT":
    default:
      return "Cám dừa thành phẩm";
  }
}

export type CreateSalesInvoiceInput = {
  docType: "VAT_INVOICE" | "SALES_RECEIPT";
  voucherNo: string;
  voucherDate: string;
  customerName: string;
  customerCode?: string;
  taxCode?: string;
  invoiceSeries?: string;
  invoiceTemplate?: string;
  productType: SalesProductType;
  batchId?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  subtotal: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount: number;
  description?: string;
  createdBy?: string;
  paymentTermDays?: number;
  dueDate?: string;
};

export type CreateCapitalAssetInput = {
  assetCode: string;
  assetName: string;
  category: "MACHINERY" | "INFRASTRUCTURE" | "STORAGE_TANK" | "VEHICLE_SCALE" | "OFFICE_TECH";
  acquisitionDate: string;
  originalCost: number;
  residualValue?: number;
  usefulLifeMonths: number;
  supplierOrBrand?: string;
  notes?: string;
};

export type CreateShareholderInput = {
  shareholderCode: string;
  name: string;
  role: "FOUNDER" | "INVESTOR" | "OPERATOR";
  ownershipPercentage: number;
  committedCapital: number;
  phoneNumber?: string;
  joinDate: string;
  notes?: string;
};

export type CreateCapitalContributionInput = {
  contributionNo: string;
  contributionDate: string;
  shareholderId: string;
  amount: number;
  capitalType: "INITIAL_CAPEX" | "WORKING_CAPITAL" | "EXPANSION_CAPEX";
  paymentMethod: "BANK" | "CASH" | "ASSET";
  bankAccount?: string;
  purpose: string;
};





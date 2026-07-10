import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";
import { Roles } from "../auth/roles.decorator";
import { WorkitService } from "./workit.service";

class CashVoucherLineDto {
  @IsString()
  debitAccount!: string;

  @IsOptional()
  @IsString()
  debitDimension1?: string;

  @IsString()
  creditAccount!: string;

  @IsOptional()
  @IsString()
  creditDimension1?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  description!: string;
}

class CreateCashVoucherDto {
  @IsIn(["PT", "PC", "BN", "BC"])
  voucherType!: "PT" | "PC" | "BN" | "BC";

  @IsIn(["cash", "bank"])
  paymentChannel!: "cash" | "bank";

  @IsString()
  voucherNo!: string;

  @IsDateString()
  voucherDate!: string;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  cashBookCode?: string;

  @IsOptional()
  @IsString()
  bankAccountCode?: string;

  @IsOptional()
  @IsString()
  counterpartyCode?: string;

  @IsOptional()
  @IsString()
  counterpartyName?: string;

  @IsOptional()
  @IsString()
  counterpartyType?: string;

  @IsOptional()
  @IsString()
  referenceInvoiceNo?: string;

  @IsString()
  content!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsIn(["draft", "pending_approval", "approved", "posted", "voided"])
  status!: "draft" | "pending_approval" | "approved" | "posted" | "voided";

  @IsString()
  createdBy!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashVoucherLineDto)
  lines!: CashVoucherLineDto[];
}

class UpdateCashVoucherDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  counterpartyName?: string;

  @IsOptional()
  @IsString()
  referenceInvoiceNo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashVoucherLineDto)
  lines?: CashVoucherLineDto[];
}

class StatementLineDto {
  @IsDateString()
  transactionDate!: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsString()
  description!: string;

  @IsNumber()
  debitAmount!: number;

  @IsNumber()
  creditAmount!: number;

  @IsNumber()
  amount!: number;
}

class ImportBankStatementDto {
  @IsString()
  statementNo!: string;

  @IsString()
  bankAccountCode!: string;

  @IsDateString()
  statementDate!: string;

  @IsNumber()
  openingBalance!: number;

  @IsNumber()
  closingBalance!: number;

  @IsOptional()
  @IsString()
  sourceName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementLineDto)
  lines!: StatementLineDto[];
}

class MatchDto {
  @IsString()
  voucherId!: string;

  @IsString()
  bankStatementLineId!: string;

  @IsNumber()
  @Min(0.01)
  matchedAmount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

class UnmatchDto {
  @IsString()
  matchId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller("cash")
export class CashController {
  constructor(private readonly workit: WorkitService) {}

  @Get("vouchers")
  listVouchers(@Query("q") q?: string, @Query("status") status?: string, @Query("type") type?: "PT" | "PC" | "BN" | "BC") {
    return this.workit.listCashVouchers({ q, status, type });
  }

  @Get("vouchers/:id")
  getVoucher(@Param("id") id: string) {
    return this.workit.getCashVoucher(id);
  }

  @Post("vouchers")
  @Roles("admin", "accountant", "cashier")
  createVoucher(@Body() input: CreateCashVoucherDto) {
    return this.workit.createCashVoucher(input);
  }

  @Patch("vouchers/:id")
  @Roles("admin", "accountant", "cashier")
  updateVoucher(@Param("id") id: string, @Body() input: UpdateCashVoucherDto) {
    return this.workit.updateCashVoucher(id, input);
  }

  @Get("bank-statements")
  listStatements() {
    return this.workit.listBankStatements();
  }

  @Post("bank-statements/import")
  @Roles("admin", "accountant", "cashier")
  importStatement(@Body() input: ImportBankStatementDto) {
    return this.workit.importBankStatement(input);
  }

  @Get("reconciliation")
  getReconciliation() {
    return this.workit.getReconciliation();
  }

  @Post("reconciliation/match")
  @Roles("admin", "accountant")
  match(@Body() input: MatchDto) {
    return this.workit.matchReconciliation(input);
  }

  @Post("reconciliation/unmatch")
  @Roles("admin", "accountant")
  unmatch(@Body() input: UnmatchDto) {
    return this.workit.unmatchReconciliation(input);
  }

  @Get("dashboard")
  getDashboard() {
    return this.workit.getCashDashboard();
  }

  @Get("sync-contract")
  getSyncContract() {
    return this.workit.getCashSyncContract();
  }
}

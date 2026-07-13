import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Roles } from "../auth/roles.decorator";
import { AppRole } from "../auth/roles.constant";
import { WorkitService } from "./workit.service";

class JournalLineDto {
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
  amount!: number;

  @IsString()
  description!: string;
}

class CreateVoucherDto {
  @IsString()
  voucherType!: string;

  @IsString()
  voucherNo!: string;

  @IsDateString()
  voucherDate!: string;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsString()
  counterpartyCode?: string;

  @IsOptional()
  @IsString()
  counterpartyName?: string;

  @IsString()
  content!: string;

  @IsNumber()
  amount!: number;

  @IsIn(["draft", "pending_approval", "approved", "posted", "voided"])
  status!: "draft" | "pending_approval" | "approved" | "posted" | "voided";

  @IsString()
  createdBy!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines!: JournalLineDto[];
}

@Controller("vouchers")
export class VouchersController {
  constructor(private readonly workit: WorkitService) {}

  @Get()
  list(@Query("q") q?: string, @Query("status") status?: string) {
    return this.workit.listVouchers({ q, status });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.workit.getVoucher(id);
  }

  @Post()
  @Roles(AppRole.ChiefAccountant, AppRole.Accountant)
  create(@Body() input: CreateVoucherDto) {
    return this.workit.createVoucher(input);
  }
}

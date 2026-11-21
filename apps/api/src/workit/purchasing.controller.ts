import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Roles } from "../auth/roles.decorator";
import { WorkitService, CreatePurchasingInvoiceInput } from "./workit.service";

class CreatePurchasingInvoiceDto implements CreatePurchasingInvoiceInput {
  @IsIn(["PURCHASE_SLIP", "VAT_INVOICE"])
  docType!: "PURCHASE_SLIP" | "VAT_INVOICE";

  @IsString()
  voucherNo!: string;

  @IsDateString()
  voucherDate!: string;

  @IsString()
  supplierName!: string;

  @IsOptional()
  @IsString()
  supplierCode?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  invoiceSeries?: string;

  @IsOptional()
  @IsString()
  invoiceTemplate?: string;

  @IsIn(["RAW_MATERIAL", "PROCESSING", "OVERHEAD"])
  costCategory!: "RAW_MATERIAL" | "PROCESSING" | "OVERHEAD";

  @IsOptional()
  @IsIn(["EP", "LOC", "DONG_PHUY"])
  processStage?: "EP" | "LOC" | "DONG_PHUY";

  @IsIn(["BATCH", "PERIOD"])
  allocationMode!: "BATCH" | "PERIOD";

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsNumber()
  grossWeightKg?: number;

  @IsOptional()
  @IsNumber()
  tareWeightKg?: number;

  @IsOptional()
  @IsNumber()
  netWeightKg?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  handlingFee?: number;

  @IsNumber()
  subtotal!: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsNumber()
  vatAmount?: number;

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

class CreatePaymentDto {
  @IsIn(["cash", "bank"])
  paymentChannel!: "cash" | "bank";

  @IsOptional()
  @IsString()
  cashBookCode?: string;

  @IsOptional()
  @IsString()
  bankAccountCode?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

@Controller("purchasing")
export class PurchasingController {
  constructor(private readonly workit: WorkitService) {}

  @Get("invoices")
  list(
    @Query("q") q?: string,
    @Query("docType") docType?: string,
    @Query("costCategory") costCategory?: string,
    @Query("allocationMode") allocationMode?: string,
    @Query("paymentStatus") paymentStatus?: string
  ) {
    return this.workit.listPurchasingInvoices({
      q,
      docType,
      costCategory,
      allocationMode,
      paymentStatus
    });
  }

  @Get("check-duplicate")
  checkDuplicate(
    @Query("taxCode") taxCode?: string,
    @Query("series") series?: string,
    @Query("invoiceNo") invoiceNo?: string,
    @Query("docType") docType?: string
  ) {
    return this.workit.checkDuplicateInvoice({
      taxCode,
      series,
      invoiceNo,
      docType
    });
  }

  @Post("invoices")
  @Roles("admin", "accountant", "warehouse")
  create(@Body() input: CreatePurchasingInvoiceDto) {
    return this.workit.createPurchasingInvoice(input);
  }

  @Post("invoices/:id/create-payment")
  @Roles("admin", "accountant")
  createPayment(@Param("id") id: string, @Body() input: CreatePaymentDto) {
    return this.workit.createPaymentForInvoice(id, input);
  }
}

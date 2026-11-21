import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Roles } from "../auth/roles.decorator";
import { CreateSalesInvoiceInput, WorkitService } from "./workit.service";

class CreateSalesInvoiceDto implements CreateSalesInvoiceInput {
  @IsIn(["VAT_INVOICE", "SALES_RECEIPT"])
  docType!: "VAT_INVOICE" | "SALES_RECEIPT";

  @IsString()
  voucherNo!: string;

  @IsDateString()
  voucherDate!: string;

  @IsString()
  customerName!: string;

  @IsOptional()
  @IsString()
  customerCode?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  invoiceSeries?: string;

  @IsOptional()
  @IsString()
  invoiceTemplate?: string;

  @IsIn(["CRUDE_OIL", "BYPRODUCT"])
  productType!: "CRUDE_OIL" | "BYPRODUCT";

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  unitPrice!: number;

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

class CreateSalesPaymentDto {
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
  description?: string;
}

@Controller("sales")
export class SalesController {
  constructor(private readonly workit: WorkitService) {}

  @Get("invoices")
  @Roles("admin", "accountant", "warehouse")
  listInvoices(
    @Query("q") q?: string,
    @Query("status") status?: string,
    @Query("paymentStatus") paymentStatus?: string,
    @Query("productType") productType?: string
  ) {
    return this.workit.listSalesInvoices({ q, status, paymentStatus, productType });
  }

  @Post("invoices")
  @Roles("admin", "accountant")
  createInvoice(@Body() body: CreateSalesInvoiceDto) {
    return this.workit.createSalesInvoice(body);
  }

  @Post("invoices/:id/payment")
  @Roles("admin", "accountant")
  createPayment(@Param("id") id: string, @Body() body: CreateSalesPaymentDto) {
    return this.workit.createPaymentForSalesInvoice(id, body);
  }
}

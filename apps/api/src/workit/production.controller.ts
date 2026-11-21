import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Roles } from "../auth/roles.decorator";
import { WorkitService, CreateProductionBatchInput } from "./workit.service";

class CreateProductionBatchDto implements CreateProductionBatchInput {
  @IsString()
  batchCode!: string;

  @IsDateString()
  batchDate!: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsNumber()
  rawMaterialKg!: number;

  @IsNumber()
  crudeOilKg!: number;

  @IsOptional()
  @IsNumber()
  byproductKg?: number;

  @IsOptional()
  @IsNumber()
  rawMaterialCost?: number;

  @IsOptional()
  @IsNumber()
  processingCost?: number;

  @IsOptional()
  @IsNumber()
  overheadCost?: number;

  @IsOptional()
  @IsNumber()
  byproductRecovery?: number;

  @IsOptional()
  @IsIn(["IN_PROGRESS", "COMPLETED"])
  status?: "IN_PROGRESS" | "COMPLETED";

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

@Controller("production")
export class ProductionController {
  constructor(private readonly workit: WorkitService) {}

  @Get("batches")
  listBatches(@Query("q") q?: string, @Query("status") status?: string) {
    return this.workit.listProductionBatches({ q, status });
  }

  @Post("batches")
  @Roles("admin", "accountant", "warehouse")
  createBatch(@Body() input: CreateProductionBatchDto) {
    return this.workit.createProductionBatch(input);
  }

  @Get("supplier-yields")
  getSupplierYields() {
    return this.workit.getSupplierYieldPerformance();
  }
}

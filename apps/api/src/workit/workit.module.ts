import { Module } from "@nestjs/common";
import { ApprovalsController } from "./approvals.controller";
import { CashController } from "./cash.controller";
import { CostAccountingController } from "./cost-accounting.controller";
import { JobsController } from "./jobs.controller";
import { ModulesController } from "./modules.controller";
import { ProductionController } from "./production.controller";
import { PurchasingController } from "./purchasing.controller";
import { SalesController } from "./sales.controller";
import { SyncController } from "./sync.controller";
import { VouchersController } from "./vouchers.controller";
import { WorkitService } from "./workit.service";

@Module({
  controllers: [
    ModulesController,
    VouchersController,
    PurchasingController,
    ProductionController,
    SalesController,
    CostAccountingController,
    CashController,
    ApprovalsController,
    SyncController,
    JobsController
  ],
  providers: [WorkitService],
  exports: [WorkitService]
})
export class WorkitModule {}

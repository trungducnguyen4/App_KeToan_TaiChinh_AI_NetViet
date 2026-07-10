import { Module } from "@nestjs/common";
import { ApprovalsController } from "./approvals.controller";
import { CashController } from "./cash.controller";
import { JobsController } from "./jobs.controller";
import { ModulesController } from "./modules.controller";
import { SyncController } from "./sync.controller";
import { VouchersController } from "./vouchers.controller";
import { WorkitService } from "./workit.service";

@Module({
  controllers: [ModulesController, VouchersController, CashController, ApprovalsController, SyncController, JobsController],
  providers: [WorkitService],
  exports: [WorkitService]
})
export class WorkitModule {}

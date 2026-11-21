import { Controller, Get, Query } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { WorkitService } from "./workit.service";

@Controller("cost-accounting")
export class CostAccountingController {
  constructor(private readonly workit: WorkitService) {}

  @Get("summary")
  @Roles("admin", "accountant", "warehouse")
  getSummary() {
    return this.workit.getCostAccountingSummary();
  }

  @Get("export-package")
  @Roles("admin", "accountant")
  getExportPackage() {
    return this.workit.exportCostReportPackage();
  }
}

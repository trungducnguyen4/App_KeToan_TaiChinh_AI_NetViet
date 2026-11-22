import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { WorkitService } from "./workit.service";

@Controller("capital")
export class CapitalController {
  constructor(private readonly workit: WorkitService) {}

  @Get("feasibility-summary")
  @Roles("admin", "accountant", "warehouse")
  getFeasibilitySummary() {
    return this.workit.getCapitalFeasibilitySummary();
  }

  @Get("assets")
  @Roles("admin", "accountant", "warehouse")
  listAssets(@Query("category") category?: string) {
    return this.workit.listCapitalAssets(category);
  }

  @Post("assets")
  @Roles("admin", "accountant")
  createAsset(@Body() body: any) {
    return this.workit.createCapitalAsset(body);
  }

  @Get("shareholders")
  @Roles("admin", "accountant")
  listShareholders() {
    return this.workit.listShareholders();
  }

  @Post("shareholders")
  @Roles("admin", "accountant")
  createShareholder(@Body() body: any) {
    return this.workit.createShareholder(body);
  }

  @Get("contributions")
  @Roles("admin", "accountant")
  listContributions() {
    return this.workit.listCapitalContributions();
  }

  @Post("contributions")
  @Roles("admin", "accountant")
  createContribution(@Body() body: any) {
    return this.workit.createCapitalContribution(body);
  }
}

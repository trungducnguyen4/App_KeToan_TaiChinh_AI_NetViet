import { Body, Controller, Get, NotFoundException, Param, Patch, Query } from "@nestjs/common";
import { IsIn } from "class-validator";
import { Public } from "../auth/public.decorator";
import {
  mockAccountingStore,
  MonitoringAlertCategory,
  MonitoringAlertStatus,
} from "./mock-accounting-store";

class UpdateAlertStatusDto {
  @IsIn(["new", "reviewing", "resolved"])
  status!: MonitoringAlertStatus;
}

@Controller("alerts")
@Public()
export class AlertsController {
  @Get()
  list(@Query("category") category?: MonitoringAlertCategory) {
    return mockAccountingStore.getAlertDashboard(category);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    const alert = mockAccountingStore.getAlert(id);
    if (!alert) {
      throw new NotFoundException("Alert not found");
    }
    return alert;
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: UpdateAlertStatusDto) {
    const alert = mockAccountingStore.updateAlertStatus(id, body.status);
    if (!alert) {
      throw new NotFoundException("Alert not found");
    }
    return alert;
  }
}

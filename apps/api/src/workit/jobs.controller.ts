import { Controller, Get } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { AppRole } from "../auth/roles.constant";
import { WorkitService } from "./workit.service";

@Controller("jobs")
export class JobsController {
  constructor(private readonly workit: WorkitService) {}

  @Get("queues")
  @Roles(AppRole.Director, AppRole.ChiefAccountant)
  queues() {
    return this.workit.getJobQueues();
  }
}

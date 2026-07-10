import { Controller, Get } from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { WorkitService } from "./workit.service";

@Controller("jobs")
export class JobsController {
  constructor(private readonly workit: WorkitService) {}

  @Get("queues")
  @Roles("admin")
  queues() {
    return this.workit.getJobQueues();
  }
}

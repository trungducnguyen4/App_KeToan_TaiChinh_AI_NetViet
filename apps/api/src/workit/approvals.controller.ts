import { Controller, Get } from "@nestjs/common";
import { WorkitService } from "./workit.service";

@Controller("approvals")
export class ApprovalsController {
  constructor(private readonly workit: WorkitService) {}

  @Get()
  list() {
    return this.workit.listApprovals();
  }
}

import { Controller, Get } from "@nestjs/common";
import { WorkitService } from "./workit.service";

@Controller("sync")
export class SyncController {
  constructor(private readonly workit: WorkitService) {}

  @Get("status")
  status() {
    return this.workit.getSyncStatus();
  }
}

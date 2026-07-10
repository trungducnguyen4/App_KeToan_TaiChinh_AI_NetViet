import { Controller, Get, Param } from "@nestjs/common";
import type { ModuleKey } from "@domain/types";
import { WorkitService } from "./workit.service";

@Controller("modules")
export class ModulesController {
  constructor(private readonly workit: WorkitService) {}

  @Get()
  listModules() {
    return this.workit.listModules();
  }

  @Get(":moduleKey")
  getModule(@Param("moduleKey") moduleKey: ModuleKey) {
    return this.workit.getModule(moduleKey);
  }
}

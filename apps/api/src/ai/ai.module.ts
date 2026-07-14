import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AiAccountsController } from "./ai-accounts.controller";
import { AiToolsController } from "./ai-tools.controller";

@Module({
  controllers: [AiController, AiAccountsController, AiToolsController],
  providers: [AiService],
})
export class AiModule {}

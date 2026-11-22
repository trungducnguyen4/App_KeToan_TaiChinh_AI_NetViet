import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { RbacGuard } from "./rbac.guard";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RbacGuard
    }
  ]
})
export class AuthModule {}

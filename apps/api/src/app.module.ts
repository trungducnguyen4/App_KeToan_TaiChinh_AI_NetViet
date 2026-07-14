import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AiModule } from "./ai/ai.module";
import { PrismaModule } from "./prisma/prisma.module";
import { WorkitModule } from "./workit/workit.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    PrismaModule,
    AuthModule,
    AiModule,
    WorkitModule,
    UsersModule,
  ],
})
export class AppModule {}

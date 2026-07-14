import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { RbacGuard } from "./rbac.guard";
import { parseDurationSeconds } from "./token-duration";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_ACCESS_SECRET");

        if (!secret) {
          throw new Error("Thiếu JWT_ACCESS_SECRET");
        }

        return {
          secret,
          signOptions: {
            expiresIn: parseDurationSeconds(
              configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
              15 * 60,
            ),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

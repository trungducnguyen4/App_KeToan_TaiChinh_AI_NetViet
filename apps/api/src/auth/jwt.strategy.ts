import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser, JwtPayload } from "./auth-user.interface";
import type { AppRole } from "./roles.constant";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>("JWT_ACCESS_SECRET");

    if (!secret) {
      throw new Error("Thiếu biến môi trường JWT_ACCESS_SECRET");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        organizationId: payload.organizationId,
        status: "active",
        organization: {
          status: "active",
        },
      },
      select: {
        id: true,
        organizationId: true,
        username: true,
        fullName: true,
        roles: {
          select: {
            role: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Tài khoản không tồn tại hoặc đã bị khóa",
      );
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      username: user.username,
      fullName: user.fullName,
      roles: user.roles.map((item) => item.role.code as AppRole),
    };
  }
}

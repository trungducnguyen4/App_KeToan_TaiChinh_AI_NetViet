import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser, JwtPayload } from "./auth-user.interface";
import { BootstrapDto } from "./dto/bootstrap.dto";
import { LoginDto } from "./dto/login.dto";
import { AppRole, SYSTEM_ROLES } from "./roles.constant";
import { parseDurationSeconds } from "./token-duration";

const BCRYPT_SALT_ROUNDS = 12;
const ACCESS_TOKEN_FALLBACK_SECONDS = 15 * 60;
const REFRESH_TOKEN_FALLBACK_SECONDS = 7 * 24 * 60 * 60;

export type SessionMetadata = {
  userAgent?: string;
  ipAddress?: string;
};

type UserWithRoles = User & {
  roles: Array<{
    role: {
      code: string;
    };
  }>;
};

type SessionLoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
  refreshToken: string;
  refreshExpiresIn: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async bootstrap(dto: BootstrapDto, metadata: SessionMetadata = {}) {
    const organizationCode = this.getDefaultOrganizationCode();

    const organizationName =
      this.configService.get<string>("DEFAULT_ORGANIZATION_NAME") ??
      "Công ty NetViet";

    const username = dto.username.trim().toLowerCase();
    const email = dto.email.trim().toLowerCase();

    /*
     * Chỉ cho phép bootstrap khi hệ thống chưa có
     * bất kỳ tài khoản người dùng nào.
     */
    const existingUserCount = await this.prisma.user.count();

    if (existingUserCount > 0) {
      throw new ForbiddenException("Hệ thống đã được khởi tạo");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.upsert({
          where: {
            code: organizationCode,
          },
          update: {
            name: organizationName,
            status: "active",
          },
          create: {
            code: organizationCode,
            name: organizationName,
            baseCurrency: "VND",
            timezone: "Asia/Ho_Chi_Minh",
            status: "active",
            createdAt: new Date(),
          },
        });

        for (const systemRole of SYSTEM_ROLES) {
          await tx.role.upsert({
            where: {
              organizationId_code: {
                organizationId: organization.id,
                code: systemRole.code,
              },
            },
            update: {
              name: systemRole.name,
              isSystem: true,
            },
            create: {
              organizationId: organization.id,
              code: systemRole.code,
              name: systemRole.name,
              isSystem: true,
              createdAt: new Date(),
            },
          });
        }

        const directorRole = await tx.role.findUniqueOrThrow({
          where: {
            organizationId_code: {
              organizationId: organization.id,
              code: AppRole.Director,
            },
          },
        });

        const user = await tx.user.create({
          data: {
            organizationId: organization.id,
            username,
            email,
            fullName: dto.fullName.trim(),
            passwordHash,
            status: "active",
            createdAt: new Date(),
            roles: {
              create: {
                roleId: directorRole.id,
                createdAt: new Date(),
              },
            },
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        return user;
      });

      return this.createSessionResponse(result, metadata);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email hoặc tên đăng nhập đã tồn tại");
      }

      throw error;
    }
  }

  async login(dto: LoginDto, metadata: SessionMetadata = {}) {
    const organizationCode = this.getDefaultOrganizationCode();

    const login = dto.login.trim().toLowerCase();

    const organization = await this.prisma.organization.findUnique({
      where: {
        code: organizationCode,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!organization || organization.status !== "active") {
      throw new UnauthorizedException("Hệ thống chưa được khởi tạo");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        OR: [
          {
            username: login,
          },
          {
            email: login,
          },
        ],
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== "active" || !user.passwordHash) {
      throw new UnauthorizedException("Thông tin đăng nhập không chính xác");
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Thông tin đăng nhập không chính xác");
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return this.createSessionResponse(user, metadata);
  }

  async refresh(refreshToken: string | undefined, metadata: SessionMetadata = {}) {
    if (!refreshToken) {
      throw new UnauthorizedException("Thiếu refresh token");
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            organization: true,
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }

    if (session.revokedAt) {
      await this.prisma.refreshSession.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token đã bị thu hồi");
    }

    const now = new Date();
    if (
      session.expiresAt <= now ||
      session.user.status !== "active" ||
      session.user.organization.status !== "active"
    ) {
      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: now, lastUsedAt: now },
      });
      throw new UnauthorizedException("Phiên đăng nhập đã hết hạn");
    }

    const nextRefreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.getRefreshTokenTtlSeconds();
    const expiresAt = new Date(now.getTime() + refreshExpiresIn * 1000);

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshSession.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: now, lastUsedAt: now },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException("Refresh token đã được sử dụng");
      }

      await tx.refreshSession.create({
        data: {
          organizationId: session.organizationId,
          userId: session.userId,
          tokenHash: this.hashRefreshToken(nextRefreshToken),
          expiresAt,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
        },
      });
    });

    return {
      ...this.createAccessTokenResponse(session.user),
      refreshToken: nextRefreshToken,
      refreshExpiresIn,
    } satisfies SessionLoginResponse;
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      await this.prisma.refreshSession.updateMany({
        where: {
          tokenHash: this.hashRefreshToken(refreshToken),
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
    }

    return { success: true };
  }

  private async createSessionResponse(
    user: UserWithRoles,
    metadata: SessionMetadata,
  ): Promise<SessionLoginResponse> {
    const refreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.getRefreshTokenTtlSeconds();

    await this.prisma.refreshSession.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      },
    });

    return {
      ...this.createAccessTokenResponse(user),
      refreshToken,
      refreshExpiresIn,
    };
  }

  private createAccessTokenResponse(user: UserWithRoles) {
    const authUser = this.toAuthUser(user);

    const payload: JwtPayload = {
      sub: authUser.id,
      organizationId: authUser.organizationId,
      username: authUser.username,
      roles: authUser.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: "Bearer" as const,
      expiresIn: this.getAccessTokenTtlSeconds(),
      user: authUser,
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString("base64url");
  }

  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private getAccessTokenTtlSeconds(): number {
    return parseDurationSeconds(
      this.configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
      ACCESS_TOKEN_FALLBACK_SECONDS,
    );
  }

  private getRefreshTokenTtlSeconds(): number {
    return parseDurationSeconds(
      this.configService.get<string>("REFRESH_TOKEN_EXPIRES_IN"),
      REFRESH_TOKEN_FALLBACK_SECONDS,
    );
  }

  private toAuthUser(user: UserWithRoles): AuthUser {
    return {
      id: user.id,
      organizationId: user.organizationId,
      username: user.username,
      fullName: user.fullName,
      roles: user.roles.map((item) => item.role.code as AppRole),
    };
  }

  private getDefaultOrganizationCode(): string {
    const code = this.configService.get<string>("DEFAULT_ORGANIZATION_CODE");

    if (!code) {
      throw new Error("Thiếu biến môi trường DEFAULT_ORGANIZATION_CODE");
    }

    return code.trim().toUpperCase();
  }
}

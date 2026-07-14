import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import type { AuthUser } from "./auth-user.interface";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { BootstrapDto } from "./dto/bootstrap.dto";
import { LoginDto } from "./dto/login.dto";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

const REFRESH_COOKIE_NAME = "workit_refresh_token";

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return undefined;
}

function getSessionMetadata(request: Request) {
  return {
    userAgent: request.get("user-agent")?.slice(0, 500),
    ipAddress: request.ip?.slice(0, 45),
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("bootstrap")
  async bootstrap(
    @Body() dto: BootstrapDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.bootstrap(dto, getSessionMetadata(request));
    return this.attachRefreshCookie(response, session);
  }

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(dto, getSessionMetadata(request));
    return this.attachRefreshCookie(response, session);
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const session = await this.authService.refresh(
        getCookie(request, REFRESH_COOKIE_NAME),
        getSessionMetadata(request),
      );
      return this.attachRefreshCookie(response, session);
    } catch (error) {
      response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions());
      throw error;
    }
  }

  @Public()
  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(getCookie(request, REFRESH_COOKIE_NAME));
    response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions());
    return { success: true };
  }

  @Get("me")
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  private attachRefreshCookie<T extends {
    refreshToken: string;
    refreshExpiresIn: number;
  }>(response: Response, session: T) {
    const { refreshToken, refreshExpiresIn, ...loginResponse } = session;
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...this.getCookieOptions(),
      maxAge: refreshExpiresIn * 1000,
    });
    return loginResponse;
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/api/auth",
    };
  }
}

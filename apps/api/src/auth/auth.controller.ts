import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "./auth-user.interface";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { BootstrapDto } from "./dto/bootstrap.dto";
import { LoginDto } from "./dto/login.dto";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("bootstrap")
  bootstrap(@Body() dto: BootstrapDto) {
    return this.authService.bootstrap(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}

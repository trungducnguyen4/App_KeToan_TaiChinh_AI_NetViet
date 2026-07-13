import { Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "../auth/auth-user.interface";
import { Roles } from "../auth/roles.decorator";
import { AppRole } from "../auth/roles.constant";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(AppRole.Director, AppRole.ChiefAccountant)
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateUserDto) {
    return this.usersService.create(request.user, dto);
  }
}

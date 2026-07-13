import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import type { AuthUser } from "../auth/auth-user.interface";
import { AppRole } from "../auth/roles.constant";
import type { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "../prisma/prisma.service";

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: AuthUser, dto: CreateUserDto) {
    this.validateRoleAssignment(currentUser, dto.role);

    const username = dto.username.trim().toLowerCase();

    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        organizationId: currentUser.organizationId,
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException("Email hoặc tên đăng nhập đã tồn tại");
    }

    const role = await this.prisma.role.findUnique({
      where: {
        organizationId_code: {
          organizationId: currentUser.organizationId,
          code: dto.role,
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Vai trò không tồn tại");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          organizationId: currentUser.organizationId,
          username,
          email,
          fullName: dto.fullName.trim(),
          passwordHash,
          status: "active",
          createdAt: new Date(),
          roles: {
            create: {
              roleId: role.id,
              createdAt: new Date(),
            },
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          status: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        ...user,
        roles: user.roles.map((item) => item.role),
      };
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

  private validateRoleAssignment(currentUser: AuthUser, targetRole: AppRole) {
    const isDirector = currentUser.roles.includes(AppRole.Director);

    const isChiefAccountant = currentUser.roles.includes(
      AppRole.ChiefAccountant,
    );

    if (targetRole === AppRole.Director) {
      throw new ForbiddenException("Không được tạo thêm tài khoản Giám đốc");
    }

    if (isDirector) {
      return;
    }

    if (isChiefAccountant && targetRole === AppRole.Accountant) {
      return;
    }

    throw new ForbiddenException("Bạn không được phép gán vai trò này");
  }
}

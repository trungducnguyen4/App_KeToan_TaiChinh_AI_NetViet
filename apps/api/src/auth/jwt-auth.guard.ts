import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { isObservable, lastValueFrom, type Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public.decorator";

type GuardResult = boolean | Promise<boolean> | Observable<boolean>;

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      const request = context.switchToHttp().getRequest<Request>();
      if (request.headers.authorization) {
        try {
          return await this.resolveGuardResult(super.canActivate(context));
        } catch {
          return true;
        }
      }

      return true;
    }

    return this.resolveGuardResult(super.canActivate(context));
  }

  private async resolveGuardResult(result: GuardResult) {
    if (isObservable(result)) {
      return lastValueFrom(result);
    }

    return result;
  }
}

import type { AppRole } from "./roles.constant";

export interface AuthUser {
  id: string;
  organizationId: string;
  username: string;
  fullName: string;
  roles: AppRole[];
}

export interface JwtPayload {
  sub: string;
  organizationId: string;
  username: string;
  roles: AppRole[];
}

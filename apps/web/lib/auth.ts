export const ACCESS_TOKEN_KEY = "workit_access_token";
export const AUTH_USER_KEY = "workit_auth_user";

export type AuthUser = {
  id: string;
  organizationId: string;
  username: string;
  fullName: string;
  roles: string[];
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
};

export function saveSession(session: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    return JSON.parse(window.atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}

export function getValidAccessToken(): string | null {
  const token = getAccessToken();

  if (!token || isAccessTokenExpired(token)) {
    clearSession();
    return null;
  }

  return token;
}

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
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

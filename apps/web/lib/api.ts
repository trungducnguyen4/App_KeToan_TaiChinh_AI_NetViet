import { clearSession, getValidAccessToken, LoginResponse, saveSession } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

let refreshPromise: Promise<boolean> | null = null;

function buildAuthHeaders(extra?: HeadersInit, includeJsonContentType = true): Headers {
  const headers = new Headers(extra);
  const token = getValidAccessToken();

  if (includeJsonContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const session = (await response.json()) as LoginResponse;
    if (!session.accessToken) {
      return false;
    }

    saveSession(session);
    return true;
  } catch {
    return false;
  }
}

function getRefreshResult(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function expireSession() {
  clearSession();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message[0] ?? message;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function requestApi<T>(
  path: string,
  init: RequestInit,
  canRefresh = true,
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" &&
    init.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: buildAuthHeaders(init.headers, !isFormData),
  });

  if (response.status === 401 && canRefresh) {
    const refreshed = await getRefreshResult();
    if (refreshed) {
      return requestApi<T>(path, init, false);
    }

    expireSession();
    throw new Error("Phien dang nhap da het han. Vui long dang nhap lai.");
  }

  return parseResponse<T>(response);
}

export function fetchApi<T>(path: string): Promise<T> {
  return requestApi<T>(path, { method: "GET" });
}

export function postApi<T>(path: string, body: unknown): Promise<T> {
  return requestApi<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function postFormApi<T>(path: string, body: FormData): Promise<T> {
  return requestApi<T>(path, {
    method: "POST",
    body,
  });
}

export function patchApi<T>(path: string, body: unknown): Promise<T> {
  return requestApi<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

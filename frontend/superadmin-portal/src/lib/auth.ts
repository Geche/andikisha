import { apiClient } from "./api-client";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/api/v1/auth/super-admin/login",
    { email: payload.email, password: payload.password }
  );
  if (typeof document !== "undefined") {
    // NOTE: HttpOnly cannot be set from client JS. Token is readable by scripts.
    // Mitigation: short-lived JWT, SameSite=Strict, Secure in production.
    // TODO: Move to a server-side route handler that sets HttpOnly via Set-Cookie.
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const maxAge = payload.remember ? 2592000 : data.expiresIn;
    document.cookie = `superadmin_token=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
  }
  return data;
}

export function logout() {
  if (typeof document !== "undefined") {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    document.cookie = `superadmin_token=; path=/; max-age=0; SameSite=Strict${secure}`;
  }
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

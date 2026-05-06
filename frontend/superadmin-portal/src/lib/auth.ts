import { apiClient } from "./api-client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/api/v1/superadmin/auth/login",
    payload
  );
  if (typeof document !== "undefined") {
    document.cookie = `superadmin_token=${data.accessToken}; path=/; max-age=${data.expiresIn}; SameSite=Strict; Secure`;
  }
  return data;
}

export function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "superadmin_token=; path=/; max-age=0; SameSite=Strict; Secure";
  }
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

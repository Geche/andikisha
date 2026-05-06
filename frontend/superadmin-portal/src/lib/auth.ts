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
  document.cookie = `superadmin_token=${data.accessToken}; path=/; max-age=${data.expiresIn}; SameSite=Strict`;
  return data;
}

export function logout() {
  document.cookie = "superadmin_token=; path=/; max-age=0";
  window.location.href = "/login";
}

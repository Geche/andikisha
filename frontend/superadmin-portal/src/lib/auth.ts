import { ApiError } from "./api-error";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResult {
  role: string;
  tenantId: string;
  expiresIn: number;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Login failed", data, res.status);
  }
  return data as LoginResult;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

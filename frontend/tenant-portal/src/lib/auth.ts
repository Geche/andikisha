const COOKIE_NAME = "tenant_token";

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  employeeId: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly data: unknown,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

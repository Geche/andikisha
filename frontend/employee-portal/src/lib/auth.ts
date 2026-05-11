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

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/auth/login";
}

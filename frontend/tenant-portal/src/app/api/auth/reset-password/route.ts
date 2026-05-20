import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json() as { token?: string; newPassword?: string };

  // No X-Tenant-ID needed: auth-service resolves tenant from the reset token stored in Redis.
  // WebMvcConfig excludes /api/v1/auth/reset-password from TenantInterceptor.
  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: body.token, newPassword: body.newPassword }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  return new NextResponse(null, { status: 204 });
}

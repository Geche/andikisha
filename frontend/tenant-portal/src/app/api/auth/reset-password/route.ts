import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const TENANT_ID = process.env.TENANT_ID ?? "";

export async function POST(request: NextRequest) {
  const body = await request.json() as { token?: string; newPassword?: string };

  if (!TENANT_ID) {
    return NextResponse.json({ error: "PORTAL_NOT_CONFIGURED" }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
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

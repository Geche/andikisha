import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get("tenant_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json() as { currentPassword?: string; newPassword?: string };

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  // Clear cookie so the user re-authenticates and gets a fresh JWT without mustChangePassword.
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("tenant_token");
  return response;
}

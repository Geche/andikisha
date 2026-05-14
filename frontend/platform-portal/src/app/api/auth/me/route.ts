import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "platform_token";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (upstream.status === 401 || upstream.status === 403) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "UPSTREAM_ERROR" }, { status: 502 });
  }

  const data = await upstream.json() as {
    id: string;
    email: string;
    role: string;
    roles?: string[];
  };

  if (typeof data.id !== "string" || typeof data.email !== "string") {
    return NextResponse.json({ error: "INVALID_UPSTREAM_RESPONSE" }, { status: 502 });
  }

  // B0/B1 bridge: prefer roles array if present, fall back to single role string.
  const roles: string[] = Array.isArray(data.roles) ? data.roles : [data.role];

  // Defence in depth — middleware already guards this, but BFF should not
  // serve a non-SUPER_ADMIN user object to a platform-portal client component.
  if (!roles.includes("SUPER_ADMIN")) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const currentUser = {
    userId: data.id,
    // tenantId intentionally omitted — SUPER_ADMIN has no tenant
    email: data.email,
    roles,
  };

  return NextResponse.json(currentUser, {
    headers: { "Cache-Control": "no-store" },
  });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

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

  // UserResponse from auth-service: { id, tenantId, email, role, employeeId, ... }
  const data = await upstream.json() as {
    id: string;
    tenantId: string;
    email: string;
    displayName?: string | null;
    role: string;
    roles?: string[];
    employeeId?: string;
    mustChangePassword?: boolean;
  };

  if (typeof data.id !== "string" || typeof data.tenantId !== "string" || typeof data.email !== "string") {
    return NextResponse.json({ error: "INVALID_UPSTREAM_RESPONSE" }, { status: 502 });
  }

  // Normalise to CurrentUser shape.
  const currentUser = {
    userId: data.id,
    tenantId: data.tenantId,
    email: data.email,
    fullName: data.displayName ?? undefined, // AUTH-006: from the linked employee; UI falls back to email
    roles: data.roles ?? [data.role],
    employeeId: data.employeeId ?? undefined,
    mustChangePassword: data.mustChangePassword ?? false,
  };

  return NextResponse.json(currentUser, {
    headers: { "Cache-Control": "no-store" },
  });
}

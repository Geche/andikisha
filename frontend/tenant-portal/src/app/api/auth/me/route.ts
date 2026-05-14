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
    role: string;
    roles?: string[];
    employeeId?: string;
  };

  // Normalise to CurrentUser shape.
  // B1 update: change `[data.role]` to `data.roles ?? [data.role]` when auth-service sends array.
  const currentUser = {
    userId: data.id,
    tenantId: data.tenantId,
    email: data.email,
    fullName: undefined, // auth-service has no name field yet — see user profile prompt
    roles: [data.role],
    employeeId: data.employeeId ?? undefined,
  };

  return NextResponse.json(currentUser);
}

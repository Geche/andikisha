import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "platform_token";

// SUPER_ADMIN identity is derived from the verified platform_token JWT itself,
// NOT from the tenant-scoped gateway /api/v1/auth/me. A SUPER_ADMIN token carries
// `tenantId: "SYSTEM"` and no employee/tenant record, so the tenant identity
// endpoint cannot serve it — which is why the profile menu had no user to render.
// The token already carries sub/email/role and is the same cookie the middleware
// verifies for route access, so decoding it here is consistent with how the rest
// of the portal already trusts this session. (See PLATFORM-BACKLOG-004.)
export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const rawSecret = process.env.JWT_SECRET;
  if (!rawSecret) {
    console.error("[platform-me] JWT_SECRET is not set");
    return NextResponse.json({ error: "SERVER_MISCONFIGURED" }, { status: 500 });
  }
  // Same secret decoding as middleware.ts (URL-safe Base64 → bytes).
  const secret = Uint8Array.from(
    atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );

  try {
    const { payload } = await jwtVerify(token, secret);

    const rawRole = typeof payload.role === "string" ? payload.role : undefined;
    const roles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as unknown[]).filter((r): r is string => typeof r === "string")
      : rawRole
      ? [rawRole]
      : [];

    // Defence in depth — never serve a non-SUPER_ADMIN identity to a platform client.
    if (!roles.includes("SUPER_ADMIN")) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const userId = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!userId) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
    }

    return NextResponse.json(
      {
        userId,
        // tenantId intentionally omitted — SUPER_ADMIN has no tenant
        email,
        roles,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    // Expired or tampered token → treat as unauthenticated (client redirects to /login).
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}

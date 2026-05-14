import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "platform_token";

/**
 * Base64url-decodes the JWT payload and returns all role claims as a Set.
 * Does NOT verify the signature — only used for the WRONG_PORTAL rejection check
 * before any cookie is written. Returns empty Set on parse failure.
 * Handles both B0 (single `role` string) and B1 (`roles` array) claim shapes.
 */
function extractRoles(token: string): Set<string> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return new Set();
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    const rawRole = typeof payload.role === "string" ? payload.role : undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[]).filter((r): r is string => typeof r === "string")
      : rawRole
      ? [rawRole]
      : [];
    return new Set(rawRoles);
  } catch {
    return new Set();
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string; password?: string };

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  const data = await upstream.json() as {
    accessToken?: string;
    expiresIn?: number;
    user?: Record<string, unknown>;
  };

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json({ error: "BAD_UPSTREAM_RESPONSE" }, { status: 502 });
  }

  // Reject non-SUPER_ADMIN at this portal. Cookie is never set.
  // extractRoles returns empty Set on parse failure — empty set never contains SUPER_ADMIN.
  if (!extractRoles(data.accessToken).has("SUPER_ADMIN")) {
    return NextResponse.json(
      {
        error: "WRONG_PORTAL",
        message: "This account uses the AndikishaHR tenant portal, not the platform portal.",
        tenantPortalUrl: process.env.NEXT_PUBLIC_TENANT_PORTAL_URL,
      },
      { status: 403 }
    );
  }

  const expiresIn =
    typeof data.expiresIn === "number" && data.expiresIn > 0
      ? data.expiresIn
      : 3600;

  const isProduction = process.env.NODE_ENV === "production";
  const jar = await cookies();
  jar.set(COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  return NextResponse.json({ user: data.user, expiresIn });
}

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

  // SUPER_ADMIN uses its own login endpoint — response is flat (no nested user object).
  // SuperAdminTokenResponse: { accessToken, refreshToken, expiresIn, role, tenantId }
  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/super-admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  const data = await upstream.json() as {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    role?: string;
    tenantId?: string;
  };

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json({ error: "BAD_UPSTREAM_RESPONSE" }, { status: 502 });
  }

  // Verify SUPER_ADMIN claim in token — defence in depth (the dedicated endpoint
  // already enforces this, but we confirm before setting any cookie).
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
    // COOKIE_SECURE=false relaxes the Secure flag for plain-HTTP test hosts
    // (e.g. sslip.io, which has no TLS so a Secure cookie is never sent back).
    // Unset/anything-else keeps the safe production default. Remove on HTTPS.
    secure: process.env.COOKIE_SECURE === "false" ? false : isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  return NextResponse.json({ expiresIn });
}

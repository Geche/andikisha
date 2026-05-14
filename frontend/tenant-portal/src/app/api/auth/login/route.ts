import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

// Simple in-memory rate limiter (10 attempts per 15 minutes per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

/**
 * Base64url-decodes the JWT payload segment and returns the role claim.
 * Deliberately does NOT verify the signature — this is only for the SUPER_ADMIN rejection
 * check before the cookie is set. The cookie is never set for SUPER_ADMIN, so there is no
 * security risk in reading the unverified claim here.
 *
 * Returns null if the JWT is malformed, so a corrupted token never produces a false 403.
 */
function extractRoleClaim(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as Record<string, unknown>;
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json() as { email?: string; password?: string };

  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    return NextResponse.json(
      { error: "PORTAL_NOT_CONFIGURED", message: "This portal is not linked to a tenant." },
      { status: 503 }
    );
  }

  const upstream = await fetch(`${GATEWAY}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tenant-ID": tenantId },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json({ error: "Bad upstream response" }, { status: 502 });
  }

  // Reject SUPER_ADMIN at this portal — they belong in the platform portal.
  // extractRoleClaim returns null on parse failure; null !== 'SUPER_ADMIN' so no false rejection.
  const decodedRole = extractRoleClaim(data.accessToken);
  if (decodedRole === "SUPER_ADMIN") {
    // Cookie is never set. The JWT is never persisted.
    return NextResponse.json(
      {
        error: "WRONG_PORTAL",
        message: "SUPER_ADMIN accounts use the Andikisha platform portal, not the tenant portal.",
        platformPortalUrl: process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL,
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

  return NextResponse.json({
    user: data.user,
    expiresIn,
  });
}

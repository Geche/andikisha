import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

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

function extractRoles(token: string): Set<string> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return new Set();
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json() as { workspace?: string; email?: string; password?: string };

  if (!body.workspace?.trim()) {
    return NextResponse.json(
      { error: "WORKSPACE_REQUIRED", message: "Workspace identifier is required." },
      { status: 400 }
    );
  }

  // Step 1: Resolve workspace slug → tenantId via the public endpoint (no auth required)
  const slug = body.workspace.trim().toLowerCase();
  let tenantId: string;
  try {
    const resolveRes = await fetch(
      `${GATEWAY}/api/v1/public/tenants/resolve?slug=${encodeURIComponent(slug)}`
    );
    if (resolveRes.status === 404) {
      return NextResponse.json(
        {
          error: "WORKSPACE_NOT_FOUND",
          message: `Workspace "${slug}" not found. Check the spelling or contact your administrator.`,
        },
        { status: 404 }
      );
    }
    if (resolveRes.status === 403) {
      return NextResponse.json(
        {
          error: "WORKSPACE_UNAVAILABLE",
          message: "This workspace is not available. Contact support@andikisha.co.ke.",
        },
        { status: 403 }
      );
    }
    if (!resolveRes.ok) {
      return NextResponse.json(
        { error: "RESOLVE_ERROR", message: "Unable to verify workspace. Please try again." },
        { status: 502 }
      );
    }
    const resolved = await resolveRes.json() as { tenantId?: string };
    if (!resolved.tenantId) {
      return NextResponse.json(
        { error: "RESOLVE_ERROR", message: "Unable to verify workspace. Please try again." },
        { status: 502 }
      );
    }
    tenantId = resolved.tenantId;
  } catch {
    return NextResponse.json(
      { error: "RESOLVE_ERROR", message: "Unable to reach authentication service. Please try again." },
      { status: 503 }
    );
  }

  // Step 2: Log in with the resolved tenantId
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

  // Reject SUPER_ADMIN at the tenant portal — they belong in the platform portal.
  if (extractRoles(data.accessToken).has("SUPER_ADMIN")) {
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

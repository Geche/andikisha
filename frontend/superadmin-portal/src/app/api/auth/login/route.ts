import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "superadmin_token";

// In-memory rate limiter — acceptable for single-instance deployments.
// Use Redis-based rate limiting for multi-instance production deployments.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json();

  const upstream = await fetch(`${GATEWAY_URL}/api/v1/auth/super-admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json(
      { error: "Bad upstream response" },
      { status: 502 }
    );
  }

  const expiresIn =
    typeof data.expiresIn === "number" && data.expiresIn > 0
      ? data.expiresIn
      : 3600; // fallback: 1 hour

  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({
    role: data.role,
    tenantId: data.tenantId,
    expiresIn: data.expiresIn,
  });

  response.cookies.set(COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  return response;
}

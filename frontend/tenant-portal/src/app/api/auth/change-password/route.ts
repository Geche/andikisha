import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json() as { currentPassword?: string; newPassword?: string };

  // Step 1: Change the password via auth-service.
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

  // Step 2: Re-authenticate with the new password to get a fresh JWT (mustChangePassword=false).
  // This lets the client navigate directly to dashboard without a login round-trip.
  const payload = decodeJwtPayload(token);
  const email = typeof payload?.email === "string" ? payload.email : null;
  const tenantId = typeof payload?.tenantId === "string" ? payload.tenantId : null;

  if (email && tenantId && body.newPassword) {
    try {
      const loginRes = await fetch(`${GATEWAY}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-ID": tenantId },
        body: JSON.stringify({ email, password: body.newPassword }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json() as {
          accessToken?: string;
          expiresIn?: number;
          user?: { role?: string; roles?: string[] };
        };

        if (typeof loginData.accessToken === "string") {
          const expiresIn = typeof loginData.expiresIn === "number" && loginData.expiresIn > 0
            ? loginData.expiresIn
            : 3600;
          const isProduction = process.env.NODE_ENV === "production";

          jar.set(COOKIE_NAME, loginData.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: expiresIn,
            path: "/",
          });

          const role = loginData.user?.role;
          const roles = loginData.user?.roles ?? (role ? [role] : []);
          return NextResponse.json({ ok: true, roles });
        }
      }
    } catch {
      // Re-login failed — fall through to cookie-clear path below.
    }
  }

  // Fallback: re-login unavailable. Clear the old cookie and send user to login.
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true, redirectToLogin: true });
}

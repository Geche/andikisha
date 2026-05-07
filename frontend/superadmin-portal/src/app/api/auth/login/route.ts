import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "superadmin_token";

export async function POST(request: NextRequest) {
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

  const maxAge = body.remember ? 2592000 : (data.expiresIn ?? 3600);
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
    maxAge,
    path: "/",
  });

  return response;
}

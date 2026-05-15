import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

const ALLOWED_PATH_PREFIXES = [
  "/api/v1/employees",
  "/api/v1/departments",
  "/api/v1/positions",
  "/api/v1/payroll",
  "/api/v1/leave",
  "/api/v1/time-attendance",
  "/api/v1/compliance",
  "/api/v1/analytics",
  "/api/v1/documents",
  "/api/v1/auth",
  "/api/v1/notifications",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get("tenant_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const forwardedPath = request.nextUrl.pathname.replace("/api/proxy", "");
  const search = request.nextUrl.search;

  if (!isAllowedPath(forwardedPath)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "Path not allowed" }, { status: 403 });
  }

  const url = `${GATEWAY}${forwardedPath}${search}`;
  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType || "text/plain" },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

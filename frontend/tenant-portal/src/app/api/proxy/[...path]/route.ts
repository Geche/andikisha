import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

const ALLOWED_PATH_PREFIXES = [
  "/api/v1/employees",
  "/api/v1/departments",
  "/api/v1/positions",
  "/api/v1/payroll",
  "/api/v1/leave",
  "/api/v1/attendance",
  "/api/v1/compliance",
  "/api/v1/analytics",
  "/api/v1/documents",
  "/api/v1/tenant",
  "/api/v1/auth",
  "/api/v1/notifications",
  "/api/v1/payments",
  "/api/v1/recruitment",
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

  // Forward the request body as raw bytes and preserve its Content-Type, so
  // multipart file uploads (bulk-upload) keep their boundary and binary payload.
  // (Reading it as text + forcing application/json corrupted uploads.)
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;

  const forwardHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
  const reqContentType = request.headers.get("content-type");
  if (hasBody && reqContentType) forwardHeaders["Content-Type"] = reqContentType;

  const upstream = await fetch(url, {
    method: request.method,
    headers: forwardHeaders,
    body,
  });

  // 204/205/304 must not have a body — don't attempt to read one.
  if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
    return new NextResponse(null, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  }

  // Everything else (xlsx/csv/pdf downloads, etc.) is returned as raw bytes so
  // binary content is never mangled by UTF-8 text decoding. Preserve the
  // content type and any download filename.
  const buffer = await upstream.arrayBuffer();
  const responseHeaders: Record<string, string> = {
    "Content-Type": contentType || "application/octet-stream",
  };
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) responseHeaders["Content-Disposition"] = disposition;
  return new NextResponse(buffer, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

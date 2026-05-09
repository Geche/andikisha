import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY_URL = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

const ALLOWED_PATH_PREFIXES = [
  "/api/v1/super-admin/",
  "/api/v1/plans",
  "/api/v1/auth/super-admin/",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(request: NextRequest, method: string): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("superadmin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = request.nextUrl.pathname.replace("/api/proxy", "");
  const search = request.nextUrl.search;

  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "Path not allowed" }, { status: 403 });
  }

  const url = `${GATEWAY_URL}${path}${search}`;

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = method !== "GET" && method !== "HEAD"
    ? await request.text()
    : undefined;

  const upstream = await fetch(url, { method, headers, body });
  const responseBody = await upstream.text();

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(request: NextRequest) { return proxyRequest(request, "GET"); }
export async function POST(request: NextRequest) { return proxyRequest(request, "POST"); }
export async function PUT(request: NextRequest) { return proxyRequest(request, "PUT"); }
export async function PATCH(request: NextRequest) { return proxyRequest(request, "PATCH"); }
export async function DELETE(request: NextRequest) { return proxyRequest(request, "DELETE"); }

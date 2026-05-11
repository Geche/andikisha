import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/auth/login", "/auth/forgot-password"];
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isPublic(pathname) ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("employee_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[middleware] JWT_SECRET not set");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "EMPLOYEE") {
      const res = NextResponse.redirect(new URL("/auth/login", request.url));
      res.cookies.delete("employee_token");
      return res;
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", String(payload.sub ?? ""));
    response.headers.set("x-user-email", String(payload.email ?? ""));
    response.headers.set("x-tenant-id", String(payload.tenantId ?? ""));
    response.headers.set("x-employee-id", String(payload.employeeId ?? ""));
    return response;
  } catch {
    const res = NextResponse.redirect(new URL("/auth/login", request.url));
    res.cookies.delete("employee_token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

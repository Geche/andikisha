import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/access-denied"];
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/"];
const COOKIE_NAME = "platform_token";

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[platform-middleware] JWT_SECRET is not set");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const { payload } = await jwtVerify(token, secret);

    // B0/B1 transition-ready: same set extraction as tenant-portal middleware.
    const rawRole = payload.role as string | undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : rawRole
      ? [rawRole]
      : [];
    const roleSet = new Set<string>(
      rawRoles.filter((r): r is string => typeof r === "string")
    );

    // Only SUPER_ADMIN may enter the platform portal.
    if (!roleSet.has("SUPER_ADMIN")) {
      const tenantPortalUrl = process.env.NEXT_PUBLIC_TENANT_PORTAL_URL ?? "/access-denied";
      console.info("[platform-middleware] non-super-admin redirect", {
        userId: payload.sub,
        roles: [...roleSet],
        redirectTo: tenantPortalUrl,
      });
      return NextResponse.redirect(new URL(tenantPortalUrl, request.url));
    }

    // Forward headers to Server Components via request context.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-user-role", String(rawRole ?? "SUPER_ADMIN"));
    requestHeaders.set("x-user-roles", [...roleSet].join(","));
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

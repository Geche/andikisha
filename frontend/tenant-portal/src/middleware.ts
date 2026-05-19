import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { findCorrectDashboard, ADMIN_ROLES } from "@andikisha/ui/auth";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/preview", "/reset-password/"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sw-my.js")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get("tenant_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[middleware] JWT_SECRET is not set — rejecting request");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const { payload } = await jwtVerify(token, secret);

    // B0/B1 transition-ready role extraction.
    // Today (B0): JWT carries single 'role' claim.
    // Post-B1: JWT carries 'roles' array — same code works.
    const rawRole = payload.role as string | undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : rawRole
      ? [rawRole]
      : [];
    const roleSet = new Set<string>(rawRoles.filter((r): r is string => typeof r === "string"));

    // Build augmented headers early — needed for the change-password early-return path.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-tenant-id", String(payload.tenantId ?? ""));
    requestHeaders.set("x-user-role", String(rawRole ?? ""));
    requestHeaders.set("x-user-roles", [...roleSet].join(","));
    if (payload.employeeId) {
      requestHeaders.set("x-employee-id", String(payload.employeeId));
    }

    // Path evaluation — in priority order.
    // 1. Force change-password redirect for accounts requiring it.
    //    When the user IS on /my/change-password, skip ALL role-routing checks and allow
    //    access regardless of role. Without this, ADMIN users (who lack the EMPLOYEE role)
    //    hit the /my/* role check below and get bounced to /admin/dashboard, which then
    //    redirects back here — causing an infinite loop.
    const mustChangePassword = payload.mustChangePassword === true;
    if (mustChangePassword) {
      if (pathname === "/my/change-password") {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      return NextResponse.redirect(new URL("/my/change-password", request.url));
    }

    // 2. SUPER_ADMIN anywhere → platform portal
    if (roleSet.has("SUPER_ADMIN")) {
      const redirectTo = process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? "/access-denied";
      console.info("[middleware] role-redirect", {
        userId: payload.sub,
        path: pathname,
        redirectTo,
        roles: [...roleSet],
      });
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // 3. /admin/* with no admin role → correct dashboard
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      let hasAdminRole = false;
      for (const r of ADMIN_ROLES) {
        if (roleSet.has(r)) { hasAdminRole = true; break; }
      }
      if (!hasAdminRole) {
        const redirectTo = findCorrectDashboard(roleSet);
        console.info("[middleware] role-redirect", {
          userId: payload.sub,
          path: pathname,
          redirectTo,
          roles: [...roleSet],
        });
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // 4. /my/* without EMPLOYEE role → correct dashboard
    if (pathname === "/my" || pathname.startsWith("/my/")) {
      if (!roleSet.has("EMPLOYEE")) {
        const redirectTo = findCorrectDashboard(roleSet);
        console.info("[middleware] role-redirect", {
          userId: payload.sub,
          path: pathname,
          redirectTo,
          roles: [...roleSet],
        });
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // 5. Allowed — forward augmented headers to Server Components via request context.
    // IMPORTANT: NextResponse.next({ request: { headers } }) is the correct pattern.
    // response.headers.set(...) sets browser-facing headers only — NOT visible to Server
    // Components via await headers(). The request copy is what propagates to the server.
    // (requestHeaders was built at the top of this block, before all redirect checks.)
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("tenant_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

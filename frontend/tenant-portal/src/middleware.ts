import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { findCorrectDashboard, ADMIN_ROLES } from "@andikisha/ui/auth";

// Paths that never require authentication.
const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/api/", "/_next/", "/preview", "/reset-password/"];

function isPublic(pathname: string): boolean {
  // Bare /login — ask-when-missing screen.
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // /{workspace}/login — workspace-specific login page. No token required.
  if (/^\/[^/]+\/login(\/)?$/.test(pathname)) return true;
  return false;
}

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sw-my.js")
  );
}

/**
 * Extracts the workspace segment from a /{workspace}/... path.
 * Returns empty string for paths that don't start with a workspace segment.
 */
function workspaceFromPath(pathname: string): string {
  const parts = pathname.split("/");
  // parts[0] = "" (leading slash), parts[1] = workspace candidate
  const candidate = parts[1] ?? "";
  // Exclude known non-workspace root segments
  if (!candidate || ["login", "api", "_next", "preview", "reset-password", "favicon.ico"].includes(candidate)) {
    return "";
  }
  return candidate;
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

    const rawRole = payload.role as string | undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : rawRole
      ? [rawRole]
      : [];
    const roleSet = new Set<string>(rawRoles.filter((r): r is string => typeof r === "string"));

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-tenant-id", String(payload.tenantId ?? ""));
    requestHeaders.set("x-user-role", String(rawRole ?? ""));
    requestHeaders.set("x-user-roles", [...roleSet].join(","));
    if (payload.employeeId) {
      requestHeaders.set("x-employee-id", String(payload.employeeId));
    }

    const mustChangePassword = payload.mustChangePassword === true;
    const workspace = workspaceFromPath(pathname);
    const setPasswordPath = workspace ? `/${workspace}/set-password` : "/set-password";

    // 1. Forced-password-change gate.
    //    When mustChangePassword=true: all authenticated routes redirect to /{workspace}/set-password.
    //    When mustChangePassword=false: /{workspace}/set-password redirects to correct dashboard.
    if (mustChangePassword) {
      if (pathname === setPasswordPath) {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
      return NextResponse.redirect(new URL(setPasswordPath, request.url));
    }
    if (pathname === setPasswordPath) {
      return NextResponse.redirect(
        new URL(`/${workspace}${findCorrectDashboard(roleSet)}`, request.url)
      );
    }

    // 2. SUPER_ADMIN anywhere → platform portal
    if (roleSet.has("SUPER_ADMIN")) {
      const redirectTo = process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? "/access-denied";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // 3. /{workspace}/admin/* with no admin role → correct workspace dashboard
    const adminPrefix = workspace ? `/${workspace}/admin` : "/admin";
    if (pathname === adminPrefix || pathname.startsWith(adminPrefix + "/")) {
      let hasAdminRole = false;
      for (const r of ADMIN_ROLES) {
        if (roleSet.has(r)) { hasAdminRole = true; break; }
      }
      if (!hasAdminRole) {
        return NextResponse.redirect(
          new URL(`/${workspace}${findCorrectDashboard(roleSet)}`, request.url)
        );
      }
    }

    // 4. /{workspace}/my/* without EMPLOYEE role → correct workspace dashboard
    const myPrefix = workspace ? `/${workspace}/my` : "/my";
    if (pathname === myPrefix || pathname.startsWith(myPrefix + "/")) {
      if (!roleSet.has("EMPLOYEE")) {
        return NextResponse.redirect(
          new URL(`/${workspace}${findCorrectDashboard(roleSet)}`, request.url)
        );
      }
    }

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

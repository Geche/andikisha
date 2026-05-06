import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("superadmin_token")?.value
    ?? request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[middleware] JWT_SECRET is not set — rejecting request");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Auth service base64-decodes the secret (JwtTokenProvider.decodeSecret).
    // Mirror that here so both sides use the same key bytes.
    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "SUPER_ADMIN" || payload.tenantId !== "SYSTEM") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    if (typeof payload.email === "string") {
      response.headers.set("x-user-email", payload.email);
    }
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

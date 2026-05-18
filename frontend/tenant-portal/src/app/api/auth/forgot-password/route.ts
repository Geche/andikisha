import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const TENANT_ID = process.env.TENANT_ID ?? "";

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string };

  if (!TENANT_ID) {
    return NextResponse.json({ error: "PORTAL_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    await fetch(`${GATEWAY}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
      body: JSON.stringify({ email: body.email }),
    });
  } catch {
    // Swallow network errors — we return 204 regardless to prevent user enumeration.
  }

  // Always return 204. Never leak whether the email exists.
  return new NextResponse(null, { status: 204 });
}

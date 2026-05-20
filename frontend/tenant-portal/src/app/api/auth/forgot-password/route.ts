import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string; workspace?: string };

  // Silently resolve workspace → tenantId.
  // Always return 204 to prevent enumeration of both workspaces and email addresses.
  let tenantId: string | null = null;
  if (body.workspace?.trim()) {
    try {
      const slug = body.workspace.trim().toLowerCase();
      const resolveRes = await fetch(
        `${GATEWAY}/api/v1/public/tenants/resolve?slug=${encodeURIComponent(slug)}`
      );
      if (resolveRes.ok) {
        const resolved = await resolveRes.json() as { tenantId?: string };
        tenantId = resolved.tenantId ?? null;
      }
    } catch {
      // Swallow — we return 204 regardless
    }
  }

  if (tenantId) {
    try {
      await fetch(`${GATEWAY}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": tenantId,
        },
        body: JSON.stringify({ email: body.email }),
      });
    } catch {
      // Swallow network errors — we return 204 regardless to prevent user enumeration.
    }
  }

  // Always return 204. Never leak whether the workspace or email exists.
  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const workspace = request.nextUrl.searchParams.get("workspace");
  if (!workspace?.trim()) {
    return NextResponse.json({ error: "WORKSPACE_REQUIRED" }, { status: 400 });
  }

  const slug = workspace.trim().toLowerCase();
  try {
    const res = await fetch(
      `${GATEWAY}/api/v1/public/workspaces/${encodeURIComponent(slug)}/resolve`,
      { cache: "no-store" }
    );
    // Forward 404 and 403 directly — client interprets them for UX messaging.
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function POST() {
  const jar = await cookies();
  const token = jar.get("tenant_token")?.value;

  // Revoke the server-side refresh tokens so the session can't be resumed, then
  // clear the cookie. Best-effort: clearing the cookie below always ends the
  // client session even if the backend call fails, so logout never hangs.
  if (token) {
    try {
      await fetch(`${GATEWAY}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore — cookie deletion still terminates the client session
    }
  }

  jar.delete("tenant_token");
  return NextResponse.json({ ok: true });
}

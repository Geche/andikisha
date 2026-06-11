import { NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

// Aggressive caching: the upstream public rates change only when a Finance Bill
// ships. Next caches the server-side fetch for a day; the browser/CDN caches the
// response for 6h with stale-while-revalidate so a marketing page never hammers
// the Compliance Service.
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY}/api/v1/public/compliance/KE/rates`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "RATES_UNAVAILABLE" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "RATES_UNAVAILABLE" }, { status: 502 });
  }
}

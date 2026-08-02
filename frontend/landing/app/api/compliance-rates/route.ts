import { NextResponse } from "next/server";
import { FALLBACK_RATES_SUMMARY } from "@/lib/fallback-rates";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

// Degrade gracefully: when the Compliance Service is unreachable, serve the
// standard published fallback rates (flagged `provisional`) so the marketing
// calculator keeps working. Short-lived + no-store so live rates resume the
// moment the upstream recovers, and the stale fallback is never cached.
function fallback() {
  return NextResponse.json(FALLBACK_RATES_SUMMARY, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

// Aggressive caching: the upstream public rates change only when a Finance Bill
// ships. Next caches the server-side fetch for a day; the browser/CDN caches the
// response for 6h with stale-while-revalidate so a marketing page never hammers
// the Compliance Service.
export const revalidate = 86400;

export async function GET() {
  // Bound the upstream call so a hung Compliance Service can't pin a route
  // worker indefinitely.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY}/api/v1/public/compliance/KE/rates`, {
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
    if (!res.ok) {
      return fallback();
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400" },
    });
  } catch {
    return fallback();
  } finally {
    clearTimeout(timeout);
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const jar = await cookies();
  jar.delete("tenant_token");
  return NextResponse.json({ ok: true });
}

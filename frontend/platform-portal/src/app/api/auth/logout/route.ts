import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const jar = await cookies();
  jar.delete("platform_token");
  return new NextResponse(null, { status: 204 });
}

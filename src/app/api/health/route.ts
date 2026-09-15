import { NextResponse } from "next/server";
export function GET() {
  // Liveness only. This does not claim that YCLIENTS is available.
  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}

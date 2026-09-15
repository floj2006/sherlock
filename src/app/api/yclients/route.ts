import { NextResponse } from "next/server";
import { business, services } from "@/lib/site-data";
import { getMastersSnapshot } from "@/lib/yclients-reviews";
export async function GET() {
  const snapshot = await getMastersSnapshot();
  return NextResponse.json({ bookingUrl: business.bookingUrl, available: snapshot.status === "ready" ? true : null, status: snapshot.status, services, masters: snapshot.masters },
    { headers: { "Cache-Control": snapshot.status === "ready" ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store" } });
}

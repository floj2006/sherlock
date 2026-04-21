import { NextResponse } from "next/server";
import { business, masters, services } from "@/lib/site-data";
import { getYclientsSnapshot } from "@/lib/yclients";
import { getMastersWithYclientsStats } from "@/lib/yclients-reviews";

export async function GET() {
  const [snapshot, displayMasters] = await Promise.all([
    getYclientsSnapshot(),
    getMastersWithYclientsStats(masters),
  ]);

  return NextResponse.json({
    ...snapshot,
    business: {
      name: business.legalName,
      bookingUrl: business.bookingUrl,
    },
    services,
    masters: displayMasters,
  });
}

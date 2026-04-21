import { NextRequest, NextResponse } from "next/server";
import { getYclientsReviews } from "@/lib/yclients-reviews";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const staffIdParam = request.nextUrl.searchParams.get("staffId");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const staffId = staffIdParam ? Number(staffIdParam) : undefined;
  const limit = limitParam ? Number(limitParam) : 12;

  const reviews = await getYclientsReviews({
    staffId: Number.isFinite(staffId) ? staffId : undefined,
    limit: Number.isFinite(limit) ? limit : 12,
  });

  return NextResponse.json({ reviews });
}

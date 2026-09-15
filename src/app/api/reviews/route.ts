import { NextRequest, NextResponse } from "next/server";
import { getYclientsReviews } from "@/lib/yclients-reviews";
import { getMastersSnapshot } from "@/lib/yclients-reviews";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const rawStaff = query.get("staffId");
  const rawLimit = query.get("limit");
  const staffId = rawStaff === null ? undefined : Number(rawStaff);
  const limit = rawLimit === null ? 12 : Number(rawLimit);
  if (query.getAll("staffId").length > 1 || query.getAll("limit").length > 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 30 ||
      (staffId !== undefined && (!Number.isSafeInteger(staffId) || staffId <= 0 || staffId > 2147483647))) {
    return NextResponse.json({ error: "Некорректные параметры запроса" }, { status: 400 });
  }
  if (staffId !== undefined) {
    const snapshot = await getMastersSnapshot();
    if (!snapshot.masters.some((master) => master.yclientsStaffId === staffId)) return NextResponse.json({ error: "Мастер недоступен" }, { status: snapshot.status === "ready" ? 404 : 503 });
  }
  const reviews = await getYclientsReviews({ staffId, limit });
  return NextResponse.json({ reviews }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}

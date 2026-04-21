import {
  masters as fallbackMasters,
  reviews as fallbackReviews,
  type Master,
  type Review,
} from "@/lib/site-data";

type YclientsResponse<T> = {
  success?: boolean;
  data?: T;
  meta?: {
    message?: string;
  };
};

type YclientsComment = {
  id?: number | string;
  master_id?: number;
  text?: string;
  date?: string;
  rating?: number | string;
  user_name?: string;
  name?: string;
};

type YclientsStaff = {
  id: number;
  name: string;
  rating?: number | string;
  show_rating?: number;
  comments_count?: number | string;
  bookable?: boolean;
  schedule_till?: string;
};

type ReviewsOptions = {
  staffId?: number;
  limit?: number;
  fallback?: Review[];
};

const YCLIENTS_API_BASE =
  process.env.YCLIENTS_API_URL ?? "https://api.yclients.com/api/v1";
const REVIEWS_REVALIDATE_SECONDS = 60 * 60;

function getCompanyId() {
  const companyId = Number(process.env.YCLIENTS_COMPANY_ID);
  return Number.isFinite(companyId) && companyId > 0 ? companyId : null;
}

function getAuthHeader() {
  const token =
    process.env.YCLIENTS_PUBLIC_WIDGET_TOKEN ||
    process.env.YCLIENTS_PARTNER_TOKEN;

  if (!token) {
    return null;
  }

  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function getYclientsUrl(path: string, searchParams?: Record<string, string>) {
  const base = YCLIENTS_API_BASE.replace(/\/+$/, "");
  const url = new URL(`${base}/${path.replace(/^\/+/, "")}`);

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}

async function fetchYclients<T>(
  path: string,
  searchParams?: Record<string, string>,
) {
  const authorization = getAuthHeader();

  if (!authorization) {
    return null;
  }

  try {
    const response = await fetch(getYclientsUrl(path, searchParams), {
      headers: {
        Accept: "application/vnd.yclients.v2+json",
        Authorization: authorization,
      },
      next: {
        revalidate: REVIEWS_REVALIDATE_SECONDS,
        tags: ["yclients-reviews"],
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as YclientsResponse<T>;

    if (payload.success === false) {
      return null;
    }

    return payload.data ?? null;
  } catch {
    return null;
  }
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function toRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isFinite(rating) || rating <= 0) {
    return undefined;
  }

  return Math.min(5, Math.max(1, rating));
}

function toPositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : undefined;
}

function normalizeReview(comment: YclientsComment): Review | null {
  const text = cleanText(comment.text);

  if (!text) {
    return null;
  }

  return {
    externalId: comment.id,
    name: cleanText(comment.user_name || comment.name) || "Гость SHERLOCK",
    source: "YCLIENTS",
    text,
    rating: toRating(comment.rating),
    date: cleanText(comment.date) || undefined,
    staffId: toPositiveInteger(comment.master_id),
  };
}

function byNewestDate(first: Review, second: Review) {
  const firstTime = first.date ? new Date(first.date).getTime() : 0;
  const secondTime = second.date ? new Date(second.date).getTime() : 0;
  return secondTime - firstTime;
}

function sameName(first: string, second: string) {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}

function mergeMasterWithStaff(master: Master, staff: YclientsStaff[]) {
  const yclientsStaff = staff.find((item) =>
    master.yclientsStaffId
      ? item.id === master.yclientsStaffId
      : sameName(item.name, master.name),
  );

  if (!yclientsStaff) {
    return master;
  }

  return {
    ...master,
    rating:
      yclientsStaff.show_rating === 1
        ? toRating(yclientsStaff.rating) ?? master.rating
        : master.rating,
    reviewCount:
      toPositiveInteger(yclientsStaff.comments_count) ?? master.reviewCount,
    bookable:
      typeof yclientsStaff.bookable === "boolean"
        ? yclientsStaff.bookable
        : master.bookable,
    scheduleTill: cleanText(yclientsStaff.schedule_till) || master.scheduleTill,
  };
}

export async function getYclientsReviews(options: ReviewsOptions = {}) {
  const companyId = getCompanyId();
  const limit = options.limit ?? 6;
  const fallback = options.fallback ?? fallbackReviews;

  if (!companyId) {
    return fallback.slice(0, limit);
  }

  const data = await fetchYclients<YclientsComment[]>((`comments/${companyId}`), {
    count: "100000",
    staff_id: String(options.staffId ?? -1),
  });

  const normalized = (data ?? [])
    .map(normalizeReview)
    .filter((review): review is Review => Boolean(review))
    .sort(byNewestDate);

  return (normalized.length ? normalized : fallback).slice(0, limit);
}

export async function getYclientsStaffList() {
  const companyId = getCompanyId();

  if (!companyId) {
    return [];
  }

  return (await fetchYclients<YclientsStaff[]>(`staff/${companyId}`)) ?? [];
}

export async function getMastersWithYclientsStats(masters = fallbackMasters) {
  const staff = await getYclientsStaffList();

  if (!staff.length) {
    return masters;
  }

  return masters.map((master) => mergeMasterWithStaff(master, staff));
}

export async function getYclientsMasterProfile(master: Master, reviewLimit = 4) {
  const [staff, reviews] = await Promise.all([
    getYclientsStaffList(),
    master.yclientsStaffId
      ? getYclientsReviews({
          staffId: master.yclientsStaffId,
          limit: reviewLimit,
          fallback: [],
        })
      : Promise.resolve([]),
  ]);

  return {
    master: staff.length ? mergeMasterWithStaff(master, staff) : master,
    reviews: reviews.length ? reviews : master.reviews,
  };
}

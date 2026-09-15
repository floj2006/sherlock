import { business, getServiceBySlug } from "@/lib/site-data";

export type BookingPayload = {
  serviceSlug?: string;
  serviceSlugs?: string[];
  masterSlug?: string;
  source?: string;
};

function getPrimaryServiceSlug(payload: BookingPayload) {
  if (payload.serviceSlug) {
    return payload.serviceSlug;
  }

  return payload.serviceSlugs?.[0];
}

export function buildBookingUrl(payload: BookingPayload = {}) {
  const url = new URL(business.bookingUrl);
  const params = url.searchParams;
  const primaryServiceSlug = getPrimaryServiceSlug(payload);
  const service = primaryServiceSlug
    ? getServiceBySlug(primaryServiceSlug)
    : undefined;

  if (primaryServiceSlug) {
    params.set("service", primaryServiceSlug);
  }

  if (service?.yclientsServiceId) {
    params.set("o", `s${service.yclientsServiceId}`);
  }

  if (payload.masterSlug) {
    params.set("master", payload.masterSlug);
  }

  if (payload.source) {
    params.set("from", payload.source);
  }

  params.set("utm_source", "sherlock-site");
  params.set("utm_medium", "cta");

  return url.toString();
}

export async function getYclientsSnapshot() {
  return {
    bookingUrl: business.bookingUrl,
    available: null,
    note: "Booking flow uses current YCLIENTS service IDs for preselect via o=s<ID>.",
  };
}

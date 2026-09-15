export type BookingService = {
  id: number;
  slug: string;
  title: string;
  category: string;
  priceMin: number;
  priceMax: number;
  duration: number | null;
};
export type BookingMaster = { id: number; name: string; role: string; image: string };
export type BookingSlot = { time: string; datetime: string; duration: number };
export type BookingSubmission = {
  requestId: string;
  serviceIds: number[];
  staffId: number;
  datetime: string;
  fullname: string;
  phone: string;
  email: string;
  comment: string;
  consent: boolean;
  priceMin: number;
  priceMax: number;
};
export function formatBookingPrice(service: Pick<BookingService, "priceMin" | "priceMax">) {
  const format = (value: number) => value.toLocaleString("ru-RU") + " ₽";
  return service.priceMin === service.priceMax ? format(service.priceMin) : `${format(service.priceMin)} – ${format(service.priceMax)}`;
}

export function bookingTotals(services: BookingService[]) {
  return {
    priceMin: services.reduce((sum, service) => sum + service.priceMin, 0),
    priceMax: services.reduce((sum, service) => sum + service.priceMax, 0),
    duration: services.length && services.every(service => service.duration !== null)
      ? services.reduce((sum, service) => sum + (service.duration ?? 0), 0) : null,
  };
}

export function validServiceIds(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 30
    && value.every(id => Number.isSafeInteger(id) && id > 0)
    && new Set(value).size === value.length;
}

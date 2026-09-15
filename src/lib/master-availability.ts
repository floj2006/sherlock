import type { Master } from "@/lib/site-data";

export function getMasterAvailability(master: Pick<Master, "bookable" | "scheduleTill">) {
  if (typeof master.bookable !== "boolean") {
    return { label: "Посмотреть свободное время", detail: "Актуальное расписание доступно в календаре записи", tone: "unknown" as const };
  }
  if (master.bookable) {
    return { label: "Онлайн-запись открыта", detail: "Выберите дату и проверьте свободное время в календаре", tone: "available" as const };
  }
  return { label: "Онлайн-запись к мастеру недоступна", detail: "Выберите другого мастера или уточните время по телефону", tone: "unavailable" as const };
}

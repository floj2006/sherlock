import type { Master } from "@/lib/site-data";

function formatScheduleDate(date?: string) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export function getMasterAvailability(
  master: Pick<Master, "bookable" | "scheduleTill">,
) {
  if (master.bookable) {
    return {
      label: "Онлайн-запись открыта",
      detail: "Мастера можно выбрать прямо в записи",
      tone: "available" as const,
    };
  }

  const till = formatScheduleDate(master.scheduleTill);

  return {
    label: "Свободных онлайн-слотов нет",
    detail: till
      ? `График обновлён до ${till}`
      : "Проверьте позже или выберите запись без фиксации мастера",
    tone: "unavailable" as const,
  };
}

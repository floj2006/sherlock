"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { DisclosureItem } from "@/components/ui/disclosure";
import { Reveal } from "@/components/ui/reveal";
import { getMasterAvailability } from "@/lib/master-availability";
import {
  business,
  getServiceBySlug,
  masters,
  serviceCategories,
  services,
  type Master,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { buildBookingUrl } from "@/lib/yclients";
import { useBooking } from "./booking-provider";

function SelectionCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-white/[0.03] p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-metal">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl leading-tight text-cream">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function getEmptyServicesSummary() {
  return {
    title: "Любая услуга",
    description:
      "Можно выбрать одно направление или собрать визит из нескольких услуг, если хочется решить всё за один приезд.",
  };
}

export function BookingDrawer() {
  const {
    open,
    closeBooking,
    serviceSlug,
    serviceSlugs,
    masterSlug,
    toggleService,
    clearServices,
    selectMaster,
    source,
  } = useBooking();
  const [displayMasters, setDisplayMasters] = useState<Master[]>(masters);

  const deferredServiceSlug = useDeferredValue(serviceSlug);
  const selectedServices = serviceSlugs.flatMap((slug) => {
    const service = getServiceBySlug(slug);

    return service ? [service] : [];
  });
  const primaryService = selectedServices[0];
  const selectedMaster = displayMasters.find((master) => master.slug === masterSlug);
  const groupedServices = serviceCategories
    .map((category) => ({
      category,
      services: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.services.length);

  const bookingUrl = buildBookingUrl({
    serviceSlug: deferredServiceSlug,
    serviceSlugs,
    masterSlug,
    source,
  });

  useEffect(() => {
    let isMounted = true;

    void fetch("/api/yclients")
      .then((response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ masters?: Master[] }>;
      })
      .then((payload) => {
        if (isMounted && payload?.masters?.length) {
          setDisplayMasters(payload.masters);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBooking();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeBooking, open]);

  const pageParams = new URLSearchParams();

  if (serviceSlugs.length === 1) {
    pageParams.set("service", serviceSlugs[0]);
  }

  if (serviceSlugs.length > 1) {
    pageParams.set("services", serviceSlugs.join(","));
  }

  if (masterSlug) {
    pageParams.set("master", masterSlug);
  }

  const servicesSummary = selectedServices.length
    ? selectedServices.length === 1
      ? {
          title: selectedServices[0].title,
          description: `${selectedServices[0].duration} • ${selectedServices[0].price}`,
        }
      : {
          title: `${selectedServices.length} опции визита`,
          description: `${selectedServices
            .slice(0, 2)
            .map((service) => service.title)
            .join(" • ")}${selectedServices.length > 2 ? " и ещё" : ""}`,
        }
    : getEmptyServicesSummary();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-500",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={closeBooking}
      />

      <aside
        className={cn(
          "book-shadow absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col overflow-y-auto rounded-t-[2rem] border-t border-line bg-noir/98 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-16 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:right-0 sm:inset-x-auto sm:top-0 sm:h-full sm:w-full sm:max-w-[40rem] sm:rounded-none sm:border-l sm:border-t-0 sm:px-7 sm:pb-6 sm:pt-20",
          open
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-x-full sm:translate-y-0",
        )}
      >
        <button
          type="button"
          onClick={closeBooking}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-black/20 text-cream hover:border-line-strong hover:bg-white/5 sm:right-5 sm:top-5"
          aria-label="Закрыть запись"
        >
          <span className="text-lg font-semibold leading-none">X</span>
        </button>

        <div className="space-y-5 border-b border-line/80 pb-5">
          <div
            className={cn(
              "space-y-4 pr-14 transition duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <div className="relative h-14 w-[9rem]">
              <Image
                src={business.wordmarkImage}
                alt={business.name}
                fill
                sizes="9rem"
                className="object-contain object-left"
              />
            </div>
            <div>
              <span className="eyebrow">Запись в 1-2 клика</span>
              <h3 className="mt-4 font-display text-3xl leading-tight text-cream">
                Выберите услугу, при желании соберите несколько опций и сразу
                переходите к удобному времени
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                Если нужен не один сценарий, а сразу несколько задач за визит,
                можно отметить их здесь. В календарь откроем основную услугу, а
                остальное останется в вашей подборке.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Reveal delay={40}>
              <SelectionCard
                label="Услуги"
                title={servicesSummary.title}
                description={servicesSummary.description}
              />
            </Reveal>
            <Reveal delay={120}>
              <SelectionCard
                label="Мастер"
                title={selectedMaster?.name ?? "Подберём мастера"}
                description={
                  selectedMaster?.focus ??
                  "Если важнее быстро попасть в удобное окно, выбор команды можно оставить нам."
                }
              />
            </Reveal>
          </div>

          {selectedServices.length > 1 ? (
            <div className="rounded-[1.35rem] border border-metal/25 bg-metal/10 px-4 py-3 text-sm leading-6 text-cream/82">
              Для перехода в YCLIENTS первой откроется услуга{" "}
              <span className="text-metal-soft">{primaryService?.title}</span>.
              Остальные опции уже сохранены в подборке визита.
            </div>
          ) : null}

          <div
            className={cn(
              "grid grid-cols-3 gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted transition duration-500 delay-100",
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <div className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-center transition duration-300 hover:border-line-strong">
              01 Услуги
            </div>
            <div className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-center transition duration-300 hover:border-line-strong">
              02 Мастер
            </div>
            <div className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-center transition duration-300 hover:border-line-strong">
              03 Время
            </div>
          </div>
        </div>

        <div className="mt-5 pr-1">
          <div className="space-y-4 pb-4">
            <DisclosureItem
              title="Услуги"
              description="Можно выбрать одну услугу или сразу несколько опций визита. Нажатие по карточке добавляет или убирает её из подборки."
              defaultOpen
              openLabel="Выбрать"
              closeLabel="Скрыть"
              meta={
                <button
                  type="button"
                  onClick={clearServices}
                  className="rounded-full border border-line px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted hover:border-line-strong hover:text-cream"
                >
                  Сбросить
                </button>
              }
              className="overflow-hidden rounded-[1.75rem] border border-line bg-white/[0.02]"
              contentClassName="bg-black/10"
            >
              <div className="space-y-4 p-3 sm:p-4">
                {groupedServices.map((group) => (
                  <div
                    key={group.category}
                    className="rounded-[1.5rem] border border-line bg-white/[0.03]"
                  >
                    <div className="border-b border-line px-4 py-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-metal">
                        {group.category}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {group.services.length} услуг в этом направлении
                      </p>
                    </div>
                    <div className="grid gap-3 p-3">
                      {group.services.map((service) => {
                        const isSelected = serviceSlugs.includes(service.slug);
                        const selectionIndex = serviceSlugs.indexOf(service.slug);

                        return (
                          <button
                            key={service.slug}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleService(service.slug)}
                            className={cn(
                              "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                              isSelected
                                ? "border-metal bg-metal/10 shadow-[0_18px_40px_rgba(184,146,82,0.08)]"
                                : "border-line bg-black/10 hover:border-line-strong hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-base font-semibold text-cream">
                                    {service.title}
                                  </p>
                                  {isSelected ? (
                                    <span className="rounded-full border border-metal/35 bg-black/30 px-2 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-metal-soft">
                                      {selectionIndex === 0 ? "Основная" : "Опция"}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                                  {service.description}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                                  {service.duration}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-metal">
                                  {service.price}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DisclosureItem>

            <DisclosureItem
              title="Мастер"
              description="Можно выбрать конкретного мастера или оставить подбор команде, если важнее удобное время."
              defaultOpen={Boolean(serviceSlugs.length)}
              openLabel="Смотреть"
              closeLabel="Скрыть"
              meta={
                <button
                  type="button"
                  onClick={() => selectMaster(undefined)}
                  className="rounded-full border border-line px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted hover:border-line-strong hover:text-cream"
                >
                  Любой
                </button>
              }
              className="overflow-hidden rounded-[1.75rem] border border-line bg-white/[0.02]"
              contentClassName="bg-black/10"
            >
              <div className="grid gap-3 p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => selectMaster(undefined)}
                  className={cn(
                    "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                    !masterSlug
                      ? "border-metal bg-metal/10"
                      : "border-line bg-black/10 hover:border-line-strong hover:bg-white/[0.05]",
                  )}
                >
                  <p className="text-base font-semibold text-cream">
                    Любой доступный мастер
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Хороший вариант, если важнее быстро попасть в удобное окно,
                    а подбор мастера можно доверить клубу.
                  </p>
                </button>

                {displayMasters.map((master) => {
                  const availability = getMasterAvailability(master);

                  return (
                    <button
                      key={master.slug}
                      type="button"
                      onClick={() => selectMaster(master.slug)}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                        master.slug === masterSlug
                          ? "border-metal bg-metal/10"
                          : "border-line bg-black/10 hover:border-line-strong hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line bg-white/[0.03]">
                            <Image
                              src={master.image}
                              alt={master.name}
                              fill
                              sizes="3rem"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-cream">
                              {master.name}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {master.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-cream/60">
                            {master.rating.toFixed(1)} / 5
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {master.focus}
                      </p>
                      <p
                        className={`mt-3 text-[0.62rem] uppercase tracking-[0.18em] ${
                          availability.tone === "available"
                            ? "text-metal"
                            : "text-cream/55"
                        }`}
                      >
                        {availability.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </DisclosureItem>
          </div>
        </div>

        <div className="sticky bottom-0 mt-4 space-y-3 border-t border-line bg-gradient-to-t from-noir via-noir/98 to-noir/92 pt-4">
          <p className="text-sm leading-6 text-muted">
            После выбора вы сразу переходите в календарь. Если услуг несколько,
            в YCLIENTS откроется основная, а остальные опции останутся у вас в
            подборке визита.
          </p>
          <Link
            href={`/book${pageParams.toString() ? `?${pageParams.toString()}` : ""}`}
            onClick={closeBooking}
            className="inline-flex w-full items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream hover:border-line-strong hover:bg-white/8"
            data-analytics-event="book_start"
            data-analytics-label="drawer"
          >
            Открыть страницу записи
          </Link>
          <Link
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeBooking}
            className="interactive-sheen inline-flex w-full items-center justify-center rounded-full border border-metal bg-metal px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink hover:border-metal-soft hover:bg-metal-soft"
            data-analytics-event="book_start"
            data-analytics-label="yclients_direct"
          >
            Перейти в YCLIENTS
          </Link>
        </div>
      </aside>
    </div>
  );
}

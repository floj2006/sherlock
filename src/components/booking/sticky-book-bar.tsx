"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/booking/booking-provider";
import { business } from "@/lib/site-data";

export function StickyBookBar() {
  const pathname = usePathname();
  const { openBooking } = useBooking();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 lg:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-full border border-line bg-noir/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="pr-4">
          <div className="text-[0.65rem] uppercase tracking-[0.24em] text-metal">
            {business.city}
          </div>
          <div className="text-sm font-semibold text-cream">
            Запись без звонка
          </div>
        </div>
        {pathname === "/book" ? (
          <Link
            href={business.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="interactive-sheen inline-flex items-center justify-center rounded-full border border-metal bg-metal px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink"
            data-analytics-event="book_click"
            data-analytics-label="sticky_yclients"
          >
            YCLIENTS
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openBooking({ source: "sticky_mobile" })}
            data-analytics-event="book_click"
            data-analytics-label="sticky_mobile"
            className="interactive-sheen inline-flex items-center justify-center rounded-full border border-metal bg-metal px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Записаться
          </button>
        )}
      </div>
    </div>
  );
}

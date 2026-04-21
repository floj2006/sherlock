"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookButton } from "@/components/booking/book-button";
import { business, navigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("hashchange", closeMenu);

    return () => {
      window.removeEventListener("hashchange", closeMenu);
    };
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled || !isHome ? "pt-3" : "pt-0",
      )}
    >
      <div
        className={cn(
          "section-shell transition-all duration-300",
          scrolled || !isHome
            ? "max-w-[1360px]"
            : "max-w-none px-4 sm:px-6 lg:px-8",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-6 rounded-full border px-4 py-3 transition-all duration-300 sm:px-6",
            scrolled || !isHome
              ? "border-line bg-noir/78 backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-[0.04em] text-cream">
              SHERLOCK
            </span>
            <span className="hidden text-xs uppercase tracking-[0.22em] text-muted md:inline">
              Мужской клуб
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={business.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted hover:text-cream"
              data-analytics-event="telegram_click"
              data-analytics-label="header"
            >
              Telegram
            </Link>
          </nav>

          <div className="hidden sm:block">
            <BookButton source="header">Записаться</BookButton>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-metal hover:border-line-strong hover:text-metal-soft lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Закрыть" : "Меню"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="section-shell mt-3 animate-fade-up lg:hidden"
        >
          <div className="section-frame overflow-hidden bg-noir/95 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="grid divide-y divide-line">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 text-sm font-medium text-cream"
                >
                  <span>{item.label}</span>
                  <span className="text-metal">→</span>
                </Link>
              ))}
            </div>

            <div className="space-y-5 border-t border-line px-5 py-5">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-metal">
                  {business.city}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {business.address}. {business.schedule}.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <BookButton
                  className="w-full"
                  source="mobile_header"
                  onClick={() => setMenuOpen(false)}
                >
                  Записаться
                </BookButton>
                <Link
                  href={business.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream hover:border-line-strong hover:bg-white/8"
                  data-analytics-event="telegram_click"
                  data-analytics-label="mobile_header"
                >
                  Telegram
                </Link>
                <Link
                  href={`tel:${business.phoneHref}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream hover:border-line-strong hover:bg-white/8"
                  data-analytics-event="call_click"
                  data-analytics-label="mobile_header"
                >
                  Позвонить
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

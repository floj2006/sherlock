import Image from "next/image";
import Link from "next/link";
import { business, navigation } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-line bg-black/35">
      <div className="pointer-events-none absolute bottom-[-7rem] right-[-4rem] h-[22rem] w-[18rem] opacity-[0.05]">
        <Image
          src={business.markImage}
          alt=""
          fill
          sizes="18rem"
          className="object-contain"
        />
      </div>
      <div className="section-shell relative flex flex-col gap-10 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-5">
            <div className="relative h-16 w-[10.5rem]">
              <Image
                src={business.wordmarkImage}
                alt={business.name}
                fill
                sizes="10.5rem"
                className="object-contain object-left"
              />
            </div>
            <h2 className="font-display text-3xl text-cream">
              Клуб, в который возвращаются ради спокойного сервиса и точной формы.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted">
              Здесь не нужно подстраиваться под громкий маркетинг. Достаточно
              выбрать услугу, прийти в своё время и получить результат, который
              выглядит уверенно не только в кресле, но и дальше в обычной жизни.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cream">
              Разделы
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-cream">
                  {item.label}
                </Link>
              ))}
              <Link href="/book" className="hover:text-cream">
                Запись
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cream">
              Контакты
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <a
                href={`tel:${business.phoneHref}`}
                className="hover:text-cream"
                data-analytics-event="call_click"
                data-analytics-label="footer"
              >
                {business.phoneDisplay}
              </a>
              <Link
                href={business.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
                data-analytics-event="telegram_click"
                data-analytics-label="footer"
              >
                Telegram
              </Link>
              <Link href="/works" className="hover:text-cream">
                Кейсы клуба
              </Link>
              <Link
                href={business.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
                data-analytics-event="map_click"
                data-analytics-label="footer"
              >
                2GIS / маршрут
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-5 text-xs uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{business.address}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cream">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cream">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

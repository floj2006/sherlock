import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { business } from "@/lib/site-data";

export function ContactsMap() {
  return (
    <section id="contacts" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Контакты"
          title="Осталось выбрать удобное время."
          description="Адрес, маршрут, звонок и онлайн-запись собраны рядом, чтобы путь к визиту был таким же спокойным, как сам сервис."
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="section-frame flex flex-col gap-8 p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-metal">
                Адрес
              </p>
              <h3 className="mt-3 font-display text-4xl text-cream">
                {business.address}
              </h3>
            </div>
            <div className="grid gap-5 border-y border-line py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  График
                </p>
                <p className="mt-2 text-sm leading-7 text-cream">
                  {business.schedule}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Контакты
                </p>
                <div className="mt-2 flex flex-col gap-2 text-sm leading-7 text-cream">
                  <a
                    href={`tel:${business.phoneHref}`}
                    data-analytics-event="call_click"
                    data-analytics-label="contacts"
                    className="hover:text-metal"
                  >
                    {business.phoneDisplay}
                  </a>
                  <Link
                    href={business.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-analytics-event="telegram_click"
                    data-analytics-label="contacts"
                    className="hover:text-metal"
                  >
                    Telegram-канал
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BookButton className="sm:min-w-[12rem]" source="contacts">
                Записаться
              </BookButton>
              <Link
                href={business.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream hover:border-line-strong hover:bg-white/8"
                data-analytics-event="map_click"
                data-analytics-label="contacts"
              >
                Открыть маршрут
              </Link>
            </div>
          </article>
          <div className="section-frame overflow-hidden">
            <iframe
              title="Карта SHERLOCK"
              src="https://maps.google.com/maps?q=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%2017%2C%20%D0%9C%D1%83%D1%80%D0%B8%D0%BD%D0%BE&z=16&output=embed"
              className="h-[28rem] w-full border-0 grayscale-[0.9] contrast-[1.15]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

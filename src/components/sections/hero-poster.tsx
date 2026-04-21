import Image from "next/image";
import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { business } from "@/lib/site-data";

export function HeroPoster() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#070707]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.04),transparent_20%),radial-gradient(circle_at_82%_18%,rgba(184,146,82,0.12),transparent_22%),linear-gradient(180deg,rgba(7,7,7,0.98)_0%,rgba(7,7,7,0.92)_42%,rgba(7,7,7,1)_100%)]" />
      <div className="pointer-events-none absolute bottom-[-4rem] right-[-5rem] top-14 hidden w-[30rem] opacity-[0.12] lg:block">
        <Image
          src={business.markImage}
          alt=""
          fill
          priority
          sizes="30rem"
          className="object-contain object-right"
        />
      </div>
      <Container className="relative flex min-h-[100svh] items-center pb-12 pt-24 sm:pb-16 sm:pt-28">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-4xl space-y-7 lg:-translate-y-12">
            <div className="animate-fade-up space-y-3">
              <div className="relative h-16 w-[13rem] sm:h-20 sm:w-[16rem]">
                <Image
                  src={business.wordmarkImage}
                  alt={business.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 13rem, 16rem"
                  className="object-contain object-left"
                />
              </div>
              <span className="eyebrow block pb-2">Мужской клуб • Murino</span>
              <h1 className="text-balance font-display text-5xl leading-[0.96] text-cream sm:text-6xl lg:text-[6rem]">
                Форма, которая
                <br />
                держит характер.
              </h1>
              <p className="max-w-xl text-base leading-8 text-[#d3cdc3] sm:text-lg">
                SHERLOCK — grooming-клуб в Мурино для мужчин, которые выбирают
                точность без шума. Мы собираем стрижку, бороду и цвет так, чтобы
                образ выглядел дорого в обычной жизни, а не только в кресле.
              </p>
            </div>
            <div className="animate-fade-up flex flex-col gap-3 sm:flex-row">
              <BookButton className="sm:min-w-[12rem]" source="hero">
                Записаться
              </BookButton>
              <Link
                href="/#works"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream hover:border-line-strong hover:bg-white/8"
              >
                Смотреть работы
              </Link>
            </div>
          </div>
          <div className="animate-fade-up self-end lg:justify-self-end">
            <div className="section-frame max-w-md space-y-5 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-metal">
                  Закрытый клуб
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted">
                  1-2 клика до записи
                </span>
              </div>
              <p className="text-sm leading-7 text-muted">
                Запись начинается с одного решения: выбрать услугу, мастера или
                ближайшее удобное окно. Дальше мы спокойно уточним детали и
                соберём форму под ваш ритм.
              </p>
              <div className="golden-divider" />
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4c2a0]">
                {business.trustLine}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

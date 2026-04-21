import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { DisclosureItem, DisclosurePanel } from "@/components/ui/disclosure";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Service } from "@/lib/site-data";
import { serviceCategories, services } from "@/lib/site-data";

const categoryLeads: Record<string, string> = {
  "Акции (первое посещение)":
    "Спокойный вход в клуб: знакомство с мастером, формой и вашим привычным ритмом.",
  "Услуги барберов":
    "База клуба: мужские стрижки, борода и собранные формы на каждый день.",
  "Уход за лицом и волосами":
    "Точечный уход, который поддерживает общий вид без лишней демонстративности.",
  "Окрашивание и форма волос":
    "Цвет, текстура и длина, когда нужен более заметный, но всё ещё носибельный результат.",
};

type ServiceEntryProps = {
  service: Service;
  sourcePrefix: string;
  delay?: number;
};

function ServiceEntry({ service, sourcePrefix, delay = 0 }: ServiceEntryProps) {
  return (
    <Reveal delay={delay}>
      <article className="grid gap-6 px-5 py-6 transition duration-300 hover:bg-white/[0.02] sm:px-8 sm:py-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-3xl text-cream">{service.title}</h3>
              <span className="rounded-full border border-line px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-metal">
                {service.duration}
              </span>
              {service.badge ? (
                <span className="rounded-full border border-metal/40 bg-metal/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-metal">
                  {service.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              {service.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          <div className="min-w-28 text-left lg:text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">
              Стоимость
            </div>
            <div className="mt-2 text-lg font-semibold text-metal">
              {service.price}
            </div>
          </div>
          <BookButton
            source={`${sourcePrefix}_${service.slug}`}
            serviceSlug={service.slug}
            variant="secondary"
          >
            Выбрать
          </BookButton>
          <Link
            href={`/services/${service.slug}`}
            className="text-xs uppercase tracking-[0.2em] text-metal hover:text-metal-soft"
          >
            Подробнее
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export function ServicesList() {
  const groupedServices = serviceCategories
    .map((category) => ({
      category,
      services: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.services.length);

  return (
    <section id="services" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Меню клуба"
          title="Выберите сценарий ухода. Форму соберём на месте."
          description="В SHERLOCK услуга — это не строка в прайсе, а спокойный маршрут к собранному образу: стрижка, борода, цвет, уход и точная запись без лишних шагов."
        />
        <DisclosurePanel
          eyebrow="Услуги"
          title="Открыть меню ухода"
          description="На главной оставили только удобный вход в меню. Полный набор услуг раскрывается по направлениям, чтобы сайт не спорил с содержанием, а запись оставалась ближе любого контента."
          openLabel="Открыть меню"
          closeLabel="Скрыть меню"
          stats={
            <div className="grid gap-3 sm:grid-cols-2 lg:ml-auto lg:w-full lg:max-w-xl">
              <div className="rounded-[1.4rem] border border-line bg-white/[0.03] p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-metal">
                  Услуг
                </p>
                <p className="mt-3 font-display text-4xl text-cream">
                  {services.length}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-line bg-white/[0.03] p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-metal">
                  Направлений
                </p>
                <p className="mt-3 font-display text-4xl text-cream">
                  {groupedServices.length}
                </p>
              </div>
            </div>
          }
          actions={
            <BookButton source="services_panel" variant="secondary">
              Записаться
            </BookButton>
          }
        >
          {groupedServices.map((group, index) => (
            <DisclosureItem
              key={group.category}
              title={group.category}
              description={categoryLeads[group.category]}
              meta={
                <span className="rounded-full border border-line px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/70">
                  {group.services.length} услуг
                </span>
              }
              openLabel="Смотреть"
              closeLabel="Скрыть"
              defaultOpen={index === 0}
            >
                <div className="divide-y divide-line">
                {group.services.map((service, serviceIndex) => (
                  <ServiceEntry
                    key={service.slug}
                    service={service}
                    sourcePrefix="service"
                    delay={serviceIndex * 45}
                  />
                ))}
              </div>
            </DisclosureItem>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <p className="max-w-2xl text-sm leading-7 text-muted">
              Можно раскрыть только нужное направление, выбрать услугу и сразу
              перейти в запись без длинного просмотра всего каталога.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center rounded-full border border-line bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-metal hover:border-line-strong hover:text-metal-soft"
            >
              Полный каталог услуг
            </Link>
          </div>
        </DisclosurePanel>
      </Container>
    </section>
  );
}

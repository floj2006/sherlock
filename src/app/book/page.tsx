import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { business, getMasterBySlug, getServiceBySlug } from "@/lib/site-data";
import { buildBookingUrl } from "@/lib/yclients";

export const metadata = createMetadata({
  title: "Онлайн-запись",
  description:
    "Онлайн-запись в SHERLOCK: выберите услугу, мастера или сразу несколько опций визита без лишней переписки.",
  path: "/book",
});

type BookPageProps = {
  searchParams: Promise<{
    service?: string;
    services?: string;
    master?: string;
  }>;
};

function DetailCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-line bg-white/[0.03] p-5">
      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-metal">
        {label}
      </p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-cream">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

function getRequestedServiceSlugs(params: {
  service?: string;
  services?: string;
}) {
  const selected: string[] = [];

  if (params.service) {
    selected.push(params.service);
  }

  for (const slug of params.services?.split(",") ?? []) {
    if (slug && !selected.includes(slug)) {
      selected.push(slug);
    }
  }

  return selected;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const selectedServiceSlugs = getRequestedServiceSlugs(params);
  const selectedServices = selectedServiceSlugs.flatMap((slug) => {
    const service = getServiceBySlug(slug);

    return service ? [service] : [];
  });
  const master = params.master ? getMasterBySlug(params.master) : undefined;
  const bookingUrl = buildBookingUrl({
    serviceSlugs: selectedServices.map((service) => service.slug),
    masterSlug: master?.slug,
    source: "book_page",
  });

  const visitTitle = selectedServices.length
    ? selectedServices.length === 1
      ? selectedServices[0].title
      : `${selectedServices.length} опции визита`
    : "Свободная запись в клуб";

  const visitDescription = selectedServices.length
    ? selectedServices.length === 1
      ? selectedServices[0].description
      : "Вы собрали несколько задач в один визит. В календарь откроем основную услугу, а остальные останутся ориентиром, чтобы было проще довести запись до нужного сценария."
    : "Если точная услуга пока не выбрана, это нормально. Можно открыть календарь с общей записью, а формат визита спокойно уточнить уже перед началом.";

  return (
    <>
      <PageIntro
        eyebrow="Запись"
        title="Запись должна быть такой же спокойной, как сам визит."
        description="Если вы уже знаете услугу или мастера, просто переходите в календарь. Если задач несколько, их можно собрать в одну подборку и зайти в запись без лишней суеты."
        caption="YCLIENTS / звонок / Telegram"
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="section-frame space-y-5 p-6 sm:p-8">
                <div>
                  <p className="eyebrow">Ваш визит</p>
                  <h2 className="mt-4 font-display text-4xl leading-tight text-cream">
                    {visitTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {visitDescription}
                  </p>
                </div>

                <div className="grid gap-3">
                  <DetailCard
                    label="Услуги"
                    title={
                      selectedServices.length === 1
                        ? selectedServices[0].title
                        : selectedServices.length > 1
                          ? `${selectedServices.length} услуг в подборке`
                          : "Любая услуга"
                    }
                    description={
                      selectedServices.length === 1
                        ? `${selectedServices[0].duration} • ${selectedServices[0].price}`
                        : selectedServices.length > 1
                          ? "Виджет откроется с основной услугой, а остальные опции помогут быстро сориентироваться по нужному сценарию визита."
                          : "Подойдёт, если важнее быстро забронировать удобное время, а детали определить чуть позже."
                    }
                  />
                  <DetailCard
                    label="Мастер"
                    title={master?.name ?? "Подберём мастера"}
                    description={
                      master?.focus ??
                      "Можно не фиксировать мастера заранее, если для вас важнее попасть в ближайшее удобное окно."
                    }
                  />
                </div>

                {selectedServices.length ? (
                  <div className="rounded-[1.6rem] border border-line bg-gradient-to-br from-white/[0.03] to-metal/5 p-5">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-metal">
                      Подборка визита
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedServices.map((service, index) => (
                        <div
                          key={service.slug}
                          className="flex items-start justify-between gap-4 border-b border-line/70 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-cream">
                              {service.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted">
                              {service.duration}
                            </p>
                          </div>
                          <div className="text-right">
                            {index === 0 ? (
                              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-metal">
                                Основная
                              </p>
                            ) : (
                              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-cream/55">
                                Опция
                              </p>
                            )}
                            <p className="mt-1 text-sm font-semibold text-metal">
                              {service.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[1.6rem] border border-line bg-gradient-to-br from-white/[0.03] to-metal/5 p-5">
                  <p className="text-[0.62rem] uppercase tracking-[0.22em] text-metal">
                    Как проходит запись
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-[2.5rem_1fr] gap-3">
                      <span className="font-display text-2xl leading-none text-metal/80">
                        01
                      </span>
                      <p className="text-sm leading-7 text-muted">
                        Вы выбираете услугу, а если нужно, собираете сразу
                        несколько задач в один визит.
                      </p>
                    </div>
                    <div className="grid grid-cols-[2.5rem_1fr] gap-3">
                      <span className="font-display text-2xl leading-none text-metal/80">
                        02
                      </span>
                      <p className="text-sm leading-7 text-muted">
                        Переходите в календарь YCLIENTS и видите живые свободные
                        окна без лишних переходов.
                      </p>
                    </div>
                    <div className="grid grid-cols-[2.5rem_1fr] gap-3">
                      <span className="font-display text-2xl leading-none text-metal/80">
                        03
                      </span>
                      <p className="text-sm leading-7 text-muted">
                        Подтверждаете визит и приходите в понятный, спокойный
                        сценарий обслуживания.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive-sheen inline-flex items-center justify-center rounded-full border border-metal bg-metal px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink"
                    data-analytics-event="book_start"
                    data-analytics-label="book_page_yclients"
                  >
                    Перейти в YCLIENTS
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${business.phoneHref}`}
                      className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream"
                      data-analytics-event="call_click"
                      data-analytics-label="book_page"
                    >
                      Позвонить
                    </a>
                    <Link
                      href={business.telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-line bg-white/4 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream"
                      data-analytics-event="telegram_click"
                      data-analytics-label="book_page"
                    >
                      Telegram
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            <article className="section-frame overflow-hidden">
              <div className="border-b border-line bg-gradient-to-r from-white/[0.03] to-metal/5 px-5 py-5 sm:px-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="eyebrow">Календарь записи</p>
                    <h3 className="mt-3 font-display text-3xl leading-tight text-cream">
                      Встроенное окно YCLIENTS
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                      Календарь открыт прямо на сайте. Если в подборке несколько
                      услуг, виджет стартует с основной позиции, чтобы не терять
                      скорость записи.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.length ? (
                      selectedServices.map((service, index) => (
                        <span
                          key={service.slug}
                          className={
                            index === 0
                              ? "rounded-full border border-metal/35 bg-metal/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-metal"
                              : "rounded-full border border-line bg-white/[0.03] px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/70"
                          }
                        >
                          {service.title}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/70">
                        Любая услуга
                      </span>
                    )}
                    <span className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/70">
                      {master?.name ?? "Любой мастер"}
                    </span>
                  </div>
                </div>
              </div>
              <iframe
                title="YCLIENTS booking"
                src={bookingUrl}
                className="min-h-[38rem] w-full border-0 bg-white sm:min-h-[46rem] lg:min-h-[58rem]"
              />
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}

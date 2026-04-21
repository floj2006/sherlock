import Image from "next/image";
import { notFound } from "next/navigation";
import { BookButton } from "@/components/booking/book-button";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { RatingStars } from "@/components/ui/rating-stars";
import { getMasterAvailability } from "@/lib/master-availability";
import { createBreadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { getMasterBySlug, masters } from "@/lib/site-data";
import { getYclientsMasterProfile } from "@/lib/yclients-reviews";

type MasterPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return masters.map((master) => ({ slug: master.slug }));
}

export async function generateMetadata({ params }: MasterPageProps) {
  const { slug } = await params;
  const master = getMasterBySlug(slug);

  if (!master) {
    return createMetadata({ title: "Мастер" });
  }

  return createMetadata({
    title: master.name,
    description: master.summary,
    path: `/masters/${master.slug}`,
    image: master.image,
  });
}

export default async function MasterDetailPage({ params }: MasterPageProps) {
  const { slug } = await params;
  const master = getMasterBySlug(slug);

  if (!master) {
    notFound();
  }

  const { master: displayMaster, reviews } =
    await getYclientsMasterProfile(master);
  const strengths =
    displayMaster.strengths?.map((strength) => strength.title) ??
    displayMaster.specialties;
  const availability = getMasterAvailability(displayMaster);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            createBreadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Мастера", path: "/masters" },
              { name: displayMaster.name, path: `/masters/${displayMaster.slug}` },
            ]),
          ),
        }}
      />

      <PageIntro
        eyebrow="Мастер"
        title={displayMaster.name}
        description={displayMaster.summary}
        caption={`${displayMaster.role} • ${displayMaster.rating.toFixed(1)} / 5`}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Reveal className="xl:sticky xl:top-28 xl:self-start" delay={80}>
            <article className="section-frame overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={displayMaster.image}
                  alt={`Портрет мастера ${displayMaster.name}`}
                  fill
                  sizes="(min-width: 1280px) 38vw, 100vw"
                  className="h-full w-full object-cover animate-soft-zoom"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/5 to-black/42" />
                <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/95 to-transparent" />
                <div className="absolute inset-x-[14%] bottom-[-10%] h-28 rounded-full bg-metal/10 blur-3xl" />

                <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-metal backdrop-blur-md sm:left-5 sm:top-5">
                  {displayMaster.role}
                </div>
                <div
                  className={`absolute right-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] backdrop-blur-md sm:right-5 sm:top-5 ${
                    availability.tone === "available" ? "text-metal" : "text-cream/75"
                  }`}
                >
                  {availability.label}
                </div>
                <div className="absolute inset-x-5 bottom-5 hidden rounded-[1.5rem] border border-white/10 bg-black/56 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:block">
                  <p className="font-display text-3xl leading-[0.96] text-cream lg:text-4xl">
                    {displayMaster.focus}
                  </p>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-8">
                <p className="font-display text-[2rem] leading-[0.98] text-cream sm:hidden">
                  {displayMaster.focus}
                </p>

                <div className="grid gap-4 border-y border-line/80 py-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-metal">
                      Позиция
                    </p>
                    <p className="mt-2 text-sm leading-7 text-cream/82">
                      {displayMaster.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-metal">
                      Рейтинг YCLIENTS
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <RatingStars
                        rating={displayMaster.rating}
                        className="text-base"
                      />
                      <span className="text-sm text-cream/82">
                        {displayMaster.reviewCount} отзывов
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-line bg-white/[0.03] p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-metal">
                    Статус записи
                  </p>
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      availability.tone === "available"
                        ? "text-metal"
                        : "text-cream/82"
                    }`}
                  >
                    {availability.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {availability.detail}
                  </p>
                </div>

                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.22em] text-metal">
                    Направления
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    {strengths.map((strength) => (
                      <span
                        key={strength}
                        className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-cream/72"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-metal/80" />
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                <BookButton
                  masterSlug={displayMaster.slug}
                  source={`master_page_${displayMaster.slug}`}
                  className="w-full"
                >
                  Записаться к мастеру
                </BookButton>
              </div>
            </article>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={140}>
              <article className="section-frame p-6 sm:p-8">
                <p className="eyebrow">Профиль мастера</p>
                <h2 className="mt-4 font-display text-4xl leading-tight text-cream">
                  Спокойный почерк, понятная форма и реальные отзывы гостей
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                  Работы в портфолио показывают стандарт SHERLOCK в целом. Здесь
                  собран личный профиль мастера: как он держит форму, в каких
                  задачах особенно точен и что гости отмечают после визита.
                </p>
              </article>
            </Reveal>

            {displayMaster.strengths?.length ? (
              <Reveal delay={200}>
                <article className="section-frame p-6 sm:p-8">
                  <div className="max-w-2xl">
                    <p className="eyebrow">Сильные стороны</p>
                    <h3 className="mt-3 font-display text-3xl leading-tight text-cream">
                      Где мастер особенно точен
                    </h3>
                  </div>

                  <div className="mt-8 divide-y divide-line">
                    {displayMaster.strengths.map((strength, index) => (
                      <div
                        key={strength.title}
                        className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[4rem_1fr]"
                      >
                        <span className="font-display text-4xl leading-none text-metal/70">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <section className="max-w-2xl">
                          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-metal">
                            {strength.title}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-muted">
                            {strength.description}
                          </p>
                        </section>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ) : null}

            <Reveal delay={260}>
              <article className="section-frame p-6 sm:p-8">
                <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Отзывы</p>
                    <h3 className="mt-3 font-display text-3xl leading-tight text-cream">
                      Что гости отмечают после визита
                    </h3>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-display text-5xl text-cream">
                      {displayMaster.rating.toFixed(1)}
                    </p>
                    <div className="mt-2 flex items-center gap-3 sm:justify-end">
                      <RatingStars
                        rating={displayMaster.rating}
                        className="text-base"
                      />
                      <span className="text-sm text-muted">
                        {displayMaster.reviewCount} отзывов в YCLIENTS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <figure
                      key={review.externalId ?? `${review.source}-${review.name}`}
                      className="rounded-[1.5rem] border border-line bg-white/[0.03] p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <figcaption className="font-semibold text-cream">
                          {review.name}
                        </figcaption>
                        <span className="text-[0.62rem] uppercase tracking-[0.18em] text-metal">
                          {review.source}
                        </span>
                      </div>
                      {review.rating ? (
                        <RatingStars rating={review.rating} className="mt-4" />
                      ) : null}
                      <blockquote className="mt-4 text-sm leading-7 text-muted">
                        {review.text}
                      </blockquote>
                    </figure>
                  ))}
                </div>

                <div className="mt-6 border-t border-line/80 pt-6">
                  <p className="text-sm leading-7 text-muted">
                    Если вы не уверены, подходит ли мастер под задачу, можно
                    записаться к нему напрямую или открыть общую запись по
                    услуге. На месте спокойно подскажем лучший сценарий без
                    лишнего давления.
                  </p>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

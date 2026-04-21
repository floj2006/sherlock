import { Container } from "@/components/ui/container";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeading } from "@/components/ui/section-heading";
import { getYclientsReviews } from "@/lib/yclients-reviews";

function formatReviewDate(date?: string) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date.replace(" ", "T"));

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export async function ReviewsRail() {
  const reviews = await getYclientsReviews({ limit: 6 });

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Отзывы"
          title="Репутация, которую не нужно усиливать громкими словами."
          description="Мы показываем реальные отзывы клиентов из YCLIENTS: имена, даты, оценки и живые формулировки без переписывания под рекламный тон."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => {
            const reviewDate = formatReviewDate(review.date);

            return (
              <article
                key={review.externalId ?? `${review.source}-${review.name}`}
                className="section-frame flex min-h-[18rem] flex-col p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-semibold text-cream">
                      {review.name}
                    </span>
                    {reviewDate ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                        {reviewDate}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-metal">
                    {review.source}
                  </span>
                </div>
                {review.rating ? (
                  <RatingStars rating={review.rating} className="mt-5" />
                ) : null}
                <p className="mt-5 flex-1 text-sm leading-7 text-muted">
                  {review.text}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/ui/container";
import { getBusinessProfile } from "@/lib/business-profile";
import { BusinessRating } from "./business-rating";
export function ReviewsRail() {
  const business = getBusinessProfile();
  return <section id="reviews" className="editorial-section reviews-section"><Container>
    <div className="reviews-layout"><div>
      <p className="eyebrow">Слово гостям</p><h2 className="editorial-heading">После визита.</h2>
      <p className="section-copy">Отзывы о барбершопе — напрямую с Яндекс Карт.</p>
      <BusinessRating />
      <a href={business.reviewsUrl} target="_blank" rel="noreferrer" className="text-link" data-analytics-event="reviews_external_open" data-analytics-label="yandex">Все отзывы на Яндексе ↗</a>
    </div><div className="yandex-reviews"><iframe title="Отзывы о SHERLOCK на Яндекс Картах" src={business.reviewsEmbedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
      <p><a href={business.reviewsUrl} target="_blank" rel="noreferrer">Открыть отзывы, если виджет недоступен ↗</a></p>
    </div></div>
  </Container></section>;
}

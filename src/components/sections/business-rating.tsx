import { getYandexRating } from "@/lib/yandex-rating";
import { getBusinessProfile } from "@/lib/business-profile";
import { RatingStars } from "@/components/ui/rating-stars";

export async function BusinessRating({ compact = false }: { compact?: boolean }) {
  const business = getBusinessProfile();
  const rating = await getYandexRating();
  if (rating === null) return <div className="business-rating-fallback"><a href={business.reviewsUrl} target="_blank" rel="noreferrer">Посмотреть рейтинг на Яндекс Картах ↗</a></div>;
  return <a className={`business-rating${compact ? " business-rating-compact" : ""}`} href={business.reviewsUrl} target="_blank" rel="noreferrer" aria-label={`Рейтинг SHERLOCK на Яндекс Картах: ${rating.toFixed(1)} из 5`}>
    <strong>{rating.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
    <span className="business-rating-detail"><RatingStars rating={rating} /><span>Яндекс Карты <span aria-hidden="true">↗</span></span>{!compact ? <small>Рейтинг наших гостей</small> : null}</span>
  </a>;
}

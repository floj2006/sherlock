import { RatingStars } from "@/components/ui/rating-stars";
import { hasVerifiedRating, masterRatingCaption } from "@/lib/master-rating";
import type { Master } from "@/lib/site-data";
export function MasterRating({ master }: { master: Master }) {
  if (!hasVerifiedRating(master)) return <p className="rating-pending">Рейтинг пока не опубликован.</p>;
  return <div className="master-score">
    <div className="master-score-line"><strong>{master.rating.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</strong><div><RatingStars rating={master.rating} /><span>{masterRatingCaption(master)}</span></div></div>
  </div>;
}

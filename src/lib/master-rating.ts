import type { Master } from "./site-data";

export function hasVerifiedRating(master: Pick<Master, "statsVerified" | "rating" | "reviewCount" | "voteCount">) {
  return master.statsVerified === true
    && Number.isFinite(master.rating) && master.rating >= 1 && master.rating <= 5;
}

const plurals = new Intl.PluralRules("ru");
export function masterRatingCaption(master: Pick<Master, "voteCount" | "reviewCount">) {
  const votes = master.voteCount;
  const hasVotes = votes !== undefined && Number.isSafeInteger(votes) && votes > 0;
  const count = hasVotes ? votes : master.reviewCount;
  if (!Number.isSafeInteger(count) || count <= 0) return "";
  const forms = hasVotes
    ? { one: "оценка", few: "оценки", many: "оценок", other: "оценок" }
    : { one: "отзыв", few: "отзыва", many: "отзывов", other: "отзывов" };
  const word = forms[plurals.select(count) as keyof typeof forms] ?? forms.other;
  return `${count} ${word}`;
}

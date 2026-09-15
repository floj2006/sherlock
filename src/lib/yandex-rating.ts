import { cache } from "react";
import { getBusinessProfile } from "./business-profile";

// The official badge embeds its rating in an SVG. Never substitute a saved score.
export function parseYandexRating(html: string): number | null {
  if (html.length > 250_000) return null;
  const embedded = html.match(/data:image\/svg\+xml;utf8,([^'"]+)/)?.[1];
  if (!embedded) return null;
  try {
    const svg = decodeURIComponent(embedded);
    const label = svg.match(/<text\b[^>]*>\s*([1-5](?:[.,]\d{1,2})?)\s*<\/text>/)?.[1];
    const value = label ? Number(label.replace(",", ".")) : NaN;
    return Number.isFinite(value) && value >= 1 && value <= 5 ? value : null;
  } catch { return null; }
}

export const getYandexRating = cache(async () => {
  try {
    const response = await fetch(getBusinessProfile().ratingEmbedUrl, {
      next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000), redirect: "error",
    });
    if (!response.ok) return null;
    return parseYandexRating(await response.text());
  } catch { return null; }
});

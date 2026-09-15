import { test, expect } from "@playwright/test";
import { hasVerifiedRating, masterRatingCaption } from "../src/lib/master-rating";
import { normalizeMaster } from "../src/lib/yclients-reviews";
import { parseYandexRating } from "../src/lib/yandex-rating";

test("Yandex badge scores are parsed from the source and invalid responses stay unavailable", () => {
  const badge = (score: string) => `<a style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(`<svg><path fill="url(#gradient)"/><text x="28">${score}</text></svg>`)}')"></a>`;
  expect(parseYandexRating(badge("5,0"))).toBe(5);
  expect(parseYandexRating(badge("4.9"))).toBe(4.9);
  for (const invalid of [badge("0"), badge("5,5"), badge("NaN"), "<h1>Captcha</h1>", "data:image/svg+xml;utf8,%ZZ"]) expect(parseYandexRating(invalid)).toBeNull();
});

test("ratings require verified, valid data", () => {
  expect(hasVerifiedRating({ statsVerified: false, rating: 4.9, reviewCount: 38 })).toBe(false);
  expect(hasVerifiedRating({ rating: 4.9, reviewCount: 38 })).toBe(false);
  for (const rating of [NaN, Infinity, 0, 0.5, 5.1]) {
    expect(hasVerifiedRating({ statsVerified: true, rating, reviewCount: 38 })).toBe(false);
  }
  expect(hasVerifiedRating({ statsVerified: true, rating: 4.9, reviewCount: 0, voteCount: 0 })).toBe(true);
  expect(hasVerifiedRating({ statsVerified: true, rating: 4.9, reviewCount: 38 })).toBe(true);
});

test("YCLIENTS ratings use votes even when there are no written reviews", () => {
  const input = { id: "4817964", name: "Эрдни", rating: "4.8", show_rating: "1", votes_count: "12", comments_count: "0" };
  const master = normalizeMaster(input)!;
  expect(master.voteCount).toBe(12);
  expect(master.reviewCount).toBe(0);
  expect(hasVerifiedRating(master)).toBe(true);
  expect(master.image).toBe("/masters/erdni.jpg");
  expect(master.statsSource).toBe("yclients");
  expect(hasVerifiedRating(normalizeMaster({ ...input, show_rating: 0 })!)).toBe(false);
  expect(hasVerifiedRating(normalizeMaster({ ...input, votes_count: 0, comments_count: 12 })!)).toBe(true);
  expect(normalizeMaster({ ...input, votes_count: true })!.voteCount).toBe(0);
  expect(normalizeMaster({ ...input, fired: 1 })).toBeNull();
  expect(normalizeMaster({ ...input, name: "Ксения", specialization: "Администратор" })).toBeNull();
  expect(normalizeMaster({ ...input, name: "Ксения", position: { title: "Администратор" } })).toBeNull();
});

test("live YCLIENTS ratings remain visible when vote counts are zero", () => {
  const master = normalizeMaster({ id: 4817964, name: "Эрдни", rating: 5, show_rating: 1, votes_count: 0, comments_count: 44 })!;
  expect(hasVerifiedRating(master)).toBe(true);
  expect(masterRatingCaption(master)).toBe("44 отзыва");
  expect(hasVerifiedRating(normalizeMaster({ id: 1, name: "Мастер", rating: 0, show_rating: 1, comments_count: 0 })!)).toBe(false);
});

test("rating captions distinguish votes from written reviews", () => {
  expect(masterRatingCaption({ voteCount: 1, reviewCount: 12 })).toBe("1 оценка");
  expect(masterRatingCaption({ voteCount: 2, reviewCount: 12 })).toBe("2 оценки");
  expect(masterRatingCaption({ voteCount: 12, reviewCount: 0 })).toBe("12 оценок");
  expect(masterRatingCaption({ voteCount: 0, reviewCount: 41 })).toBe("41 отзыв");
  expect(masterRatingCaption({ voteCount: 0, reviewCount: 11 })).toBe("11 отзывов");
  for (const invalid of [undefined, NaN, -1, 0, 1.5]) {
    expect(masterRatingCaption({ voteCount: invalid, reviewCount: 0 })).toBe("");
  }
});

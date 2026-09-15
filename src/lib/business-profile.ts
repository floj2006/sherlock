import { business } from "./site-data";

// Contact details are maintained in site-data and verified against the branch API.
export type BusinessProfile = typeof business & {
  organizationId: string;
  detailsSource: "yandex-widget";
  reviewsUrl: string;
  mapEmbedUrl: string;
  reviewsEmbedUrl: string;
  ratingEmbedUrl: string;
};
export function getBusinessProfile(): BusinessProfile {
  return {
    ...business,
    organizationId: "137556956568",
    detailsSource: "yandex-widget",
    mapUrl: "https://yandex.ru/maps/org/137556956568/",
    reviewsUrl: "https://yandex.ru/maps/org/137556956568/reviews/",
    mapEmbedUrl: "https://yandex.ru/map-widget/v1/?ol=biz&oid=137556956568&z=17",
    reviewsEmbedUrl: "https://yandex.ru/maps-reviews-widget/137556956568?comments",
    ratingEmbedUrl: "https://yandex.ru/sprav/widget/rating-badge/137556956568?type=rating",
  };
}

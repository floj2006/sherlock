import { PageIntro } from "@/components/layout/page-intro";
import { OfferSpotlight } from "@/components/sections/offer-spotlight";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Предложения",
  description:
    "Предложения SHERLOCK: абонементы, знакомство с мастерами и спокойное планирование визитов.",
  path: "/offers",
});

export default function OffersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Предложения"
        title="Когда уход встроен в ритм, он перестаёт быть задачей."
        description="Абонементы, знакомство с мастером и приоритетные окна для тех, кто предпочитает планировать спокойно."
      />
      <OfferSpotlight />
    </>
  );
}

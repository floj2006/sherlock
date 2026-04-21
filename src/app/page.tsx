import { StructuredData } from "@/components/seo/structured-data";
import { ClubStory } from "@/components/sections/club-story";
import { ContactsMap } from "@/components/sections/contacts-map";
import { HeroPoster } from "@/components/sections/hero-poster";
import { MastersRoster } from "@/components/sections/masters-roster";
import { OfferSpotlight } from "@/components/sections/offer-spotlight";
import { ReviewsRail } from "@/components/sections/reviews-rail";
import { ServicesList } from "@/components/sections/services-list";
import { WorksShowcase } from "@/components/sections/works-showcase";
import { createLocalBusinessJsonLd } from "@/lib/seo";
import { business } from "@/lib/site-data";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Как быстро можно записаться в SHERLOCK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Запись доступна за 1-2 клика: через фиксированную кнопку на мобильном, быстрый сценарий на главной или отдельную страницу /book.",
      },
    },
    {
      "@type": "Question",
      name: "Есть ли запись через YCLIENTS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Да. Сайт ведёт в защищённое окно онлайн-записи YCLIENTS: ${business.bookingUrl}`,
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <StructuredData data={createLocalBusinessJsonLd()} />
      <StructuredData data={faqJsonLd} />
      <HeroPoster />
      <ClubStory />
      <ServicesList />
      <WorksShowcase />
      <MastersRoster />
      <OfferSpotlight />
      <ReviewsRail />
      <ContactsMap />
    </>
  );
}

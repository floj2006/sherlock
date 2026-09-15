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
import { faq } from "@/lib/faq";
import { FaqSection } from "@/components/sections/faq-section";

export const revalidate = 300;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
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
      <FaqSection />
      <ContactsMap />
    </>
  );
}

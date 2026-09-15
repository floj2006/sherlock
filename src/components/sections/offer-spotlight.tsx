import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { getServiceBySlug } from "@/lib/site-data";
export function OfferSpotlight() {
  const service = getServiceBySlug("first-mens-cut");
  if (!service) return null;
  return <section id="offers" className="offer-strip"><Container>
    <p className="eyebrow">Знакомство с SHERLOCK</p>
    <div className="offer-row"><h2>Первая стрижка — {service.price}</h2><BookButton serviceSlug={service.slug} source="first_visit">Записаться</BookButton></div>
    <p>Предложение для гостей, которые приходят к нам впервые.</p>
  </Container></section>;
}

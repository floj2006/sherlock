import { Container } from "@/components/ui/container";
import { getBusinessProfile } from "@/lib/business-profile";
import { BookButton } from "@/components/booking/book-button";
import { BusinessHours } from "./business-hours";
export function ContactsMap() {
  const business = getBusinessProfile();
  return <section id="contacts" className="editorial-section contacts-section"><Container>
    <div className="contact-layout">
      <div><p className="eyebrow">Контакты / SHERLOCK</p><h2 className="editorial-heading">Будем рады<br />вас видеть.</h2>
        <address className="contact-details"><a href={business.mapUrl} target="_blank" rel="noreferrer">{business.address}</a><a className="contact-phone" href={"tel:" + business.phoneHref} data-analytics-event="phone_click">{business.phoneDisplay}</a></address>
        <BusinessHours />
        <a href={business.mapUrl} target="_blank" rel="noreferrer" className="text-link" data-analytics-event="map_click" data-analytics-label="contacts">Построить маршрут ↗</a>
        <div className="mt-8"><BookButton source="contacts">Выбрать время</BookButton></div>
      </div>
      <div className="yandex-map"><div className="contact-map-frame"><iframe title="SHERLOCK — Екатерининская улица, 17" src={business.mapEmbedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
        <p>Карта не открылась? <a href={business.mapUrl} target="_blank" rel="noreferrer">Перейти в Яндекс Карты ↗</a></p>
      </div>
    </div>
  </Container></section>;
}

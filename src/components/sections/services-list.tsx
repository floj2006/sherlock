import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { services } from "@/lib/site-data";

export function ServicesList() {
  const featured = services.filter((service) => service.category === "Услуги барберов").slice(0, 5);
  return <section id="services" className="editorial-section services-section"><Container>
    <div className="section-topline"><p className="eyebrow">02 / Услуги</p><Link href="/services" className="text-link">Весь прайс ↗</Link></div>
    <Reveal><div className="services-heading"><h2 className="editorial-heading">Искусство быть собой.</h2><p>От привычной стрижки до нового образа.<br />Выберите, с чего начнём.</p></div></Reveal>
    <div className="price-list">{featured.map((service, index) => <article key={service.slug} className="price-row">
      <span className="price-index" aria-hidden="true">0{index + 1}</span>
      <div className="price-name"><Link href={"/services/" + service.slug}><h3>{service.title}</h3></Link><span>{service.duration}</span></div>
      <p className="price-value">{service.price}</p>
      <BookButton serviceSlug={service.slug} source={"service_" + service.slug} variant="secondary">Выбрать</BookButton>
    </article>)}</div>
    <p className="service-note">Первый раз у нас? <Link href="/offers">Посмотрите предложения для первого визита ↗</Link></p>
  </Container></section>;
}

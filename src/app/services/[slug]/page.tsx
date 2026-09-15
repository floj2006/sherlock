import Link from "next/link";
import { notFound } from "next/navigation";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { WorkCaseCard } from "@/components/sections/work-case-card";
import { StructuredData } from "@/components/seo/structured-data";
import { createBreadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { getServiceBySlug, services, workCases } from "@/lib/site-data";
type Props = { params: Promise<{slug:string}> };
export function generateStaticParams() { return services.map(service => ({slug:service.slug})); }
export async function generateMetadata({params}:Props) {
  const service = getServiceBySlug((await params).slug);
  return createMetadata({title:service?.title ?? "Услуга",description:service?.description,path:service ? "/services/"+service.slug : "/services"});
}
export default async function ServiceDetailPage({params}:Props) {
  const service = getServiceBySlug((await params).slug);
  if (!service) notFound();
  const firstVisit = service.slug.startsWith("first-");
  const examples = workCases.filter(work => work.serviceSlug === service.slug.replace(/^first-/,"")).slice(0,2);
  const related = services.filter(item => item.category === service.category && item.slug !== service.slug).slice(0,3);
  return <div className="service-detail-page"><Container>
    <StructuredData data={createBreadcrumbJsonLd([{name:"Главная",path:"/"},{name:"Услуги",path:"/services"},{name:service.title,path:"/services/"+service.slug}])} />
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>/</span><Link href="/services">Услуги</Link><span>/</span><span aria-current="page">{service.title}</span></nav>
    <div className="service-detail-layout"><div><p className="eyebrow">{service.category}</p><h1>{service.title}</h1><p className="service-detail-description">{service.description}</p>
      <div className="service-detail-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <section className="service-visit"><p className="eyebrow">Перед визитом</p><h2>Обсудим детали.</h2><p>Расскажите мастеру о пожеланиях и покажите референсы, если они есть. Вместе определите форму и подходящий результат.</p><Link href="/masters" className="text-link">Выбрать своего мастера ↗</Link></section>
    </div><aside className="service-reservation"><p className="eyebrow">{firstVisit ? "Первое посещение" : "Стоимость услуги"}</p><p className="service-detail-price">{service.price}</p><p className="service-detail-duration">Продолжительность · {service.duration}</p><div className="golden-divider" />{firstVisit ? <p className="service-first-note">Предложение действует только на первый визит.</p> : null}<BookButton serviceSlug={service.slug} source={"service_page_"+service.slug}>Записаться на услугу</BookButton><p className="service-reservation-note">Мастера, дату и время можно выбрать на следующем шаге.</p></aside></div>
    {examples.length ? <section className="service-examples"><p className="eyebrow">В портфолио SHERLOCK</p><h2 className="section-title">Так это выглядит.</h2><div className="portfolio-grid">{examples.map(work => <WorkCaseCard key={work.slug} work={work} />)}</div></section> : null}
    {related.length ? <section className="related-services"><p className="eyebrow">Также в меню</p><h2 className="section-title">Другие услуги</h2><div>{related.map(item => <Link key={item.slug} href={"/services/"+item.slug}><span>{item.title}</span><strong>{item.price}</strong><span aria-hidden="true">↗</span></Link>)}</div></section> : null}
  </Container></div>;
}

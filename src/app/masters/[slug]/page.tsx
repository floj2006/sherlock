import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookButton } from "@/components/booking/book-button";
import { MasterRating } from "@/components/masters/master-rating";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { getMastersSnapshot, getYclientsMasterBySlug, getYclientsMasterProfile } from "@/lib/yclients-reviews";
import { business } from "@/lib/site-data";
export const revalidate = 300;
type Props = { params: Promise<{ slug:string }> };
export async function generateMetadata({params}:Props) {
  const {slug} = await params;
  const master = await getYclientsMasterBySlug(slug);
  return createMetadata({title:master?.name ?? "Мастер",description:master?.summary || "Мастера SHERLOCK",path:"/masters/"+slug,image:master?.image || undefined,noIndex:!master});
}
export default async function MasterPage({params}:Props) {
  const {slug} = await params;
  const master = await getYclientsMasterBySlug(slug);
  if (!master) notFound();
  const [{reviews},snapshot] = await Promise.all([getYclientsMasterProfile(master),getMastersSnapshot()]);
  const others = snapshot.masters.filter(item => item.slug !== master.slug).slice(0,2);
  const strengths = master.strengths ?? master.specialties.map(title => ({title,description:""}));
  return <div className="master-detail-page"><Container>
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>/</span><Link href="/masters">Мастера</Link><span>/</span><span aria-current="page">{master.name}</span></nav>
    <div className="master-detail-layout"><aside className="master-detail-aside"><div className="master-detail-photo">
      {master.image ? <Image src={master.image} alt={"Портрет мастера " + master.name} fill preload unoptimized={!master.image.startsWith("/")} sizes="(min-width:768px) 340px, 100vw" className="object-cover" /> : <span className="master-initials">{master.initials}</span>}
    </div></aside>
    <div className="master-detail-content"><header><p className="eyebrow">{master.role}</p><h1>{master.name}</h1><MasterRating master={master} /></header>
      <div className="master-detail-info">
      {master.focus ? <p className="master-profile-intro">{master.focus}</p> : null}
      {master.specialties.length ? <ul className="master-expertise" aria-label="Специализация">{master.specialties.map(item => <li key={item}>{item}</li>)}</ul> : null}
      <div className="master-appointment"><BookButton masterSlug={master.slug} source={"master_aside_"+master.slug}>Записаться к мастеру <span aria-hidden="true">↗</span></BookButton></div>
      {master.summary ? <details className="master-notes"><summary>О подходе мастера <span aria-hidden="true">↗</span></summary><p>{master.summary}</p>{strengths.filter(item => item.description).map(item => <div key={item.title}><h2>{item.title}</h2><p>{item.description}</p></div>)}</details> : null}
      {reviews.length ? <section className="master-detail-reviews"><h2>Впечатления гостей</h2><div className="profile-reviews">{reviews.map((review,index) => <figure key={review.externalId ?? index}><blockquote>{review.text}</blockquote><figcaption><span>{review.name}</span><span>{review.rating ? review.rating.toFixed(1)+" ★" : ""}</span></figcaption></figure>)}</div></section> : <a href={business.bookingUrl} target="_blank" rel="noreferrer" className="master-reviews-link">Отзывы в YCLIENTS ↗</a>}
      </div>
    </div></div>
    {others.length ? <section className="other-masters-compact"><div className="other-masters-heading"><h2>Другие мастера</h2><Link href="/masters" className="text-link">Все мастера ↗</Link></div><div className="other-masters-links">{others.map(item => <Link key={item.slug} href={"/masters/" + item.slug}>{item.image ? <Image src={item.image} alt="" width={56} height={64} unoptimized={!item.image.startsWith("/")} /> : null}<span>{item.name}<small>{item.role}</small></span><span aria-hidden="true">↗</span></Link>)}</div></section> : null}
  </Container></div>;
}

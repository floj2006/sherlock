import Link from "next/link";
import Image from "next/image";
import { AnalyticsPreferences } from "@/components/analytics/analytics-preferences";
import { getBusinessProfile } from "@/lib/business-profile";
export function SiteFooter() {
  const business = getBusinessProfile();
  return <footer className="site-footer"><div className="section-shell">
    <div className="footer-top"><Link href="/" className="footer-wordmark"><Image src={business.wordmarkImage} alt="SHERLOCK" width={2363} height={1261} sizes="280px" /></Link><address className="footer-contacts"><a href={business.mapUrl} target="_blank" rel="noreferrer">{business.address}</a><a href={"tel:" + business.phoneHref}>{business.phoneDisplay}</a></address></div>
    <div className="footer-links"><Link href="/services">Услуги</Link><Link href="/masters">Мастера</Link><Link href="/works">Работы</Link><Link href="/book">Запись</Link><a href={business.mapUrl} target="_blank" rel="noreferrer">Яндекс Карты ↗</a></div>
    <div className="footer-bottom"><span>SHERLOCK / Barbershop</span><div><Link href="/privacy">Конфиденциальность</Link><Link href="/terms">Условия записи</Link><AnalyticsPreferences /></div></div>
  </div></footer>;
}

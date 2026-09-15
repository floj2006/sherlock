import Image from "next/image";
import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { business } from "@/lib/site-data";
import { BusinessRating } from "./business-rating";
import { BusinessHours } from "./business-hours";

export function HeroPoster() {
  return <section className="hero-poster">
    <div className="hero-portrait" aria-hidden="true">
      <Image src={business.markImage} alt="" width={1705} height={2186} preload sizes="(max-width: 639px) 250px, (max-width: 1023px) 360px, 510px" />
      <svg className="pipe-smoke" viewBox="0 0 200 480" fill="none" focusable="false">
        <defs>
          <linearGradient id="pipe-smoke-fade" x1="0" y1="480" x2="0" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#ddd9cf" stopOpacity=".65" /><stop offset=".25" stopColor="#d2d6d2" stopOpacity=".4" /><stop offset=".7" stopColor="#bdc8c4" stopOpacity=".2" /><stop offset="1" stopColor="#bdc8c4" stopOpacity="0" /></linearGradient>
          <filter id="pipe-smoke-soft" x="-70%" y="-20%" width="240%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="pipe-smoke-fine" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="1.7" /></filter>
        </defs>
        <g stroke="url(#pipe-smoke-fade)" strokeLinecap="round">
          <path className="smoke-wisp smoke-wisp-wide" d="M100 478 C82 438 128 406 103 366 S54 316 88 270 S142 219 106 168 S58 79 113 6" strokeWidth="18" filter="url(#pipe-smoke-soft)" />
          <path className="smoke-wisp smoke-wisp-fine" d="M100 478 C91 442 119 415 107 380 S75 333 87 294 S133 249 119 203 S70 112 106 5" strokeWidth="4" filter="url(#pipe-smoke-fine)" />
          <path className="smoke-wisp smoke-wisp-curl" d="M100 478 C109 437 90 418 107 380 S148 320 112 283 S63 235 86 187 S146 94 103 8" strokeWidth="9" filter="url(#pipe-smoke-soft)" />
        </g>
      </svg>
    </div>
    <div className="section-shell hero-content">
      <p className="eyebrow hero-eyebrow">Мужской барбершоп · Мурино</p>
      <h1 className="hero-title">Форма, которая<br /><em>держит характер.</em></h1>
      <p className="hero-description">Мужские стрижки, борода и уход.<br />Внимание к вам. Точность в каждой линии.</p>
      <div className="hero-actions"><BookButton source="hero">Записаться на стрижку <span aria-hidden="true">↗</span></BookButton><Link href="/#services" className="text-link">Услуги и цены <span aria-hidden="true">↗</span></Link></div>
      <BusinessRating compact />
    </div>
    <div className="hero-bottom section-shell"><span>МУРИНО <span aria-hidden="true">/</span> ЕКАТЕРИНИНСКАЯ, 17</span><BusinessHours compact /><a href={"tel:" + business.phoneHref}>{business.phoneDisplay}</a></div>
  </section>;
}

import Image from "next/image";
import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Reveal } from "@/components/ui/reveal";
import { MasterRating } from "./master-rating";
import type { Master } from "@/lib/site-data";
export function MasterCard({ master, delay = 0, headingTag = "h3" }: { master: Master; delay?: number; headingTag?: "h2" | "h3" }) {
  const Heading = headingTag;
  return <Reveal delay={delay} className="master-reveal"><article className="artisan-card">
    <Link href={"/masters/" + master.slug} className="artisan-portrait" aria-label={"О мастере " + master.name}>
      {master.image ? <Image src={master.image} alt={"Портрет мастера " + master.name} fill unoptimized={!master.image.startsWith("/")} sizes="(min-width:1280px) 380px, (min-width:768px) 45vw, 140px" className="object-cover" /> : <span className="master-initials">{master.initials}</span>}
    </Link>
    <div className="artisan-body">
      <p className="artisan-position">{master.role}</p>
      <Heading className="artisan-title"><Link href={"/masters/" + master.slug}>{master.name}</Link></Heading>
      <MasterRating master={master} />
      {master.specialties.length ? <p className="artisan-specialty">{master.specialties.slice(0,2).join(" · ")}</p> : null}
      <div className="artisan-actions"><BookButton source={"master_" + master.slug} masterSlug={master.slug}>Записаться</BookButton><Link href={"/masters/" + master.slug} aria-label={"Профиль мастера " + master.name}><span className="artisan-more-label">Профиль</span> ↗</Link></div>
    </div>
  </article></Reveal>;
}

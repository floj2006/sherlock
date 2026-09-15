import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { workCases } from "@/lib/site-data";
import { WorkCaseCard } from "./work-case-card";
export function WorksShowcase({ limit = 3 }: { collapsible?: boolean; limit?: number | null } = {}) {
  const cases = limit === null ? workCases : workCases.slice(0,limit);
  return <section id="works" className="portfolio-section"><Container>
    {limit !== null ? <div className="portfolio-heading"><SectionHeading eyebrow="Кейсы SHERLOCK" title="Почерк, который видно." description="Реальные работы барбершопа: форма, текстура и цвет. Рассмотрите детали и выберите своё направление." /><Link href="/works" className="text-link">Все кейсы ↗</Link></div> : null}
    <div className="portfolio-grid">{cases.map((work,index) => <WorkCaseCard key={work.slug} work={work} featured={index === 0} delay={index * 50} />)}</div>
  </Container></section>;
}

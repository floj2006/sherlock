import { MasterCard } from "@/components/masters/master-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMastersSnapshot } from "@/lib/yclients-reviews";
export async function MastersRoster() {
  const { masters } = await getMastersSnapshot();
  return <section id="masters" className="masters-section py-14 sm:py-20"><Container className="space-y-7">
    <SectionHeading eyebrow="Команда SHERLOCK" title="Ваш мастер." />
    <div className="masters-editorial-grid">{masters.map((master, index) => <MasterCard key={master.slug} master={master} delay={index * 80} />)}</div>
  </Container></section>;
}

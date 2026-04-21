import { MasterCard } from "@/components/masters/master-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { masters } from "@/lib/site-data";
import { getMastersWithYclientsStats } from "@/lib/yclients-reviews";

export async function MastersRoster() {
  const displayMasters = await getMastersWithYclientsStats(masters);

  return (
    <section id="masters" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Мастера"
          title="Мастера, к которым возвращаются не только за стрижкой."
          description="У каждого свой почерк, но общий стандарт один: внимательно услышать запрос, спокойно предложить решение и сделать форму, с которой удобно жить."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayMasters.map((master, index) => (
            <MasterCard
              key={master.slug}
              master={master}
              delay={index * 80}
              headingTag="h3"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

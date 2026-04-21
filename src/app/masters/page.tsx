import { MasterCard } from "@/components/masters/master-card";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { masters } from "@/lib/site-data";
import { getMastersWithYclientsStats } from "@/lib/yclients-reviews";

export const metadata = createMetadata({
  title: "Мастера",
  description:
    "Мастера SHERLOCK в Мурино: реальные рейтинги YCLIENTS, спокойный сервис и аккуратный подход к мужской форме.",
  path: "/masters",
});

export default async function MastersPage() {
  const displayMasters = await getMastersWithYclientsStats(masters);

  return (
    <>
      <PageIntro
        eyebrow="Мастера"
        title="Вы выбираете не только руку. Вы выбираете темп."
        description="У каждого мастера свой почерк, но общий стандарт один: внимательно услышать запрос, спокойно предложить решение и сделать форму, с которой удобно жить."
      />
      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 lg:grid-cols-3">
          {displayMasters.map((master, index) => (
            <MasterCard
              key={master.slug}
              master={master}
              delay={index * 80}
              headingTag="h2"
            />
          ))}
        </Container>
      </section>
    </>
  );
}

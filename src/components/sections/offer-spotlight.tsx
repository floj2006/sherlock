import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { offers } from "@/lib/site-data";

export function OfferSpotlight() {
  const [primary, ...secondary] = offers;

  return (
    <section id="offers" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Спецпредложения"
          title="Ритм ухода, который не приходится держать в голове."
          description="Предложения для тех, кто привык планировать заранее и не хочет ловить свободное окно в последний момент."
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="section-frame noise-overlay relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,146,82,0.16),transparent_35%)]" />
            <div className="relative space-y-6">
              <span className="eyebrow">Главное предложение</span>
              <h3 className="font-display text-4xl text-cream sm:text-5xl">
                {primary.title}
              </h3>
              <p className="max-w-2xl text-base leading-8 text-[#d8d0c5]">
                {primary.subtitle}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted">
                {primary.summary}
              </p>
              <div className="rounded-[1.5rem] border border-metal/40 bg-metal/10 px-5 py-4 text-sm leading-7 text-[#e7d8bd]">
                {primary.highlight}
              </div>
              <Link
                href="/offers"
                className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-metal hover:text-metal-soft"
              >
                Смотреть все предложения
              </Link>
            </div>
          </article>
          <div className="grid gap-6">
            {secondary.map((offer) => (
              <article key={offer.slug} className="section-frame p-6">
                <span className="eyebrow">{offer.subtitle}</span>
                <h3 className="mt-4 font-display text-3xl text-cream">
                  {offer.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {offer.summary}
                </p>
                <p className="mt-5 text-sm leading-7 text-[#d9c7a6]">
                  {offer.highlight}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

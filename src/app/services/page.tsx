import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { createMetadata } from "@/lib/seo";
import { serviceCategories, services } from "@/lib/site-data";

export const metadata = createMetadata({
  title: "Услуги",
  description:
    "Услуги SHERLOCK в Мурино: мужская стрижка, fade, борода, комплексные визиты и текстурные формы без лишней демонстративности.",
  path: "/services",
});

export default function ServicesPage() {
  const groupedServices = serviceCategories
    .map((category) => ({
      category,
      services: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.services.length);

  return (
    <>
      <PageIntro
        eyebrow="Услуги"
        title="Меню ухода без лишних решений."
        description="Вы выбираете направление: стрижка, борода, цвет или уход. Мастер уточняет детали и собирает форму так, чтобы результат выглядел спокойно, дорого и естественно в вашем ритме."
      />
      <section className="py-12 sm:py-16">
        <Container className="space-y-10">
          {groupedServices.map((group) => (
            <div key={group.category} className="space-y-4">
              <p className="eyebrow">{group.category}</p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.services.map((service) => (
                  <article key={service.slug} className="section-frame p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-display text-3xl text-cream">
                        {service.title}
                      </h2>
                      <span className="rounded-full border border-line px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-metal">
                        {service.duration}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted">
                      {service.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                      <span className="text-lg font-semibold text-metal">
                        {service.price}
                      </span>
                      <div className="flex flex-wrap items-center gap-4">
                        <BookButton
                          source={`services_page_${service.slug}`}
                          serviceSlug={service.slug}
                          variant="secondary"
                        >
                          Выбрать
                        </BookButton>
                        <Link
                          href={`/services/${service.slug}`}
                          className="text-xs uppercase tracking-[0.2em] text-metal hover:text-metal-soft"
                        >
                          Открыть
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}

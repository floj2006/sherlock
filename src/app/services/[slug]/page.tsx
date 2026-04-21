import { notFound } from "next/navigation";
import { BookButton } from "@/components/booking/book-button";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { createBreadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { getServiceBySlug, services } from "@/lib/site-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return createMetadata({ title: "Услуга" });
  }

  return createMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            createBreadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Услуги", path: "/services" },
              { name: service.title, path: `/services/${service.slug}` },
            ]),
          ),
        }}
      />
      <PageIntro
        eyebrow={service.category}
        title={service.title}
        description={service.description}
        caption={`${service.duration} • ${service.price}`}
      />
      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="section-frame space-y-6 p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Что важно внутри услуги
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <BookButton serviceSlug={service.slug} source={`service_page_${service.slug}`}>
              Записаться на услугу
            </BookButton>
          </article>
          <article className="section-frame space-y-8 p-6 sm:p-8">
            <div>
              <h2 className="font-display text-4xl text-cream">
                Кому подойдёт
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Эта услуга для тех, кто хочет понятный результат без лишнего
                эксперимента. Перед началом мастер уточнит привычки, длину,
                направление волос и то, как форма должна жить после визита.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-white/[0.03] p-5">
              <p className="text-sm leading-7 text-muted">
                Кейсы в портфолио показывают результат заведения, а не
                привязку к конкретному мастеру. В записи можно выбрать любого
                доступного мастера или доверить подбор команде SHERLOCK.
              </p>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}

import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Container } from "@/components/ui/container";
import { DisclosurePanel } from "@/components/ui/disclosure";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { workCases } from "@/lib/site-data";
import { WorkCaseCard } from "./work-case-card";

type WorksShowcaseProps = {
  collapsible?: boolean;
  limit?: number | null;
};

export function WorksShowcase({
  collapsible = true,
  limit = 6,
}: WorksShowcaseProps = {}) {
  const displayCases = limit === null ? workCases : workCases.slice(0, limit);

  return (
    <section id="works" className="py-20 sm:py-28">
      <Container className="space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Кейсы"
            title="Работы, где видно решение, а не просто стрижку."
            description="Показываем реальные формы: что изменили, почему это подходит человеку и как результат будет выглядеть после выхода из кресла."
          />
          <Link
            href="/works"
            className="text-xs uppercase tracking-[0.2em] text-metal hover:text-metal-soft"
          >
            Все кейсы
          </Link>
        </div>
        {collapsible ? (
          <Reveal>
            <DisclosurePanel
              eyebrow="Работы"
              title="Открыть подборку кейсов"
              description="На главной оставили только выверенную подборку. Она задаёт тон клубу, а полный архив с деталями остаётся на отдельной странице."
              openLabel="Смотреть кейсы"
              closeLabel="Скрыть кейсы"
              actions={
                <BookButton source="works_panel" variant="secondary">
                  Записаться
                </BookButton>
              }
            >
              <div className="space-y-5">
                <div className="grid gap-6 xl:grid-cols-3">
                  {displayCases.map((work, index) => (
                    <WorkCaseCard
                      key={work.slug}
                      work={work}
                      featured={index === 0}
                      delay={index * 65}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="max-w-2xl text-sm leading-7 text-muted">
                    Кейсы показывают не только результат, но и логику работы с
                    формой, длиной, цветом и ритмом повседневной носки.
                  </p>
                  <Link
                    href="/works"
                    className="inline-flex items-center rounded-full border border-line bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-metal hover:border-line-strong hover:text-metal-soft"
                  >
                    Открыть все кейсы
                  </Link>
                </div>
              </div>
            </DisclosurePanel>
          </Reveal>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            {displayCases.map((work, index) => (
              <WorkCaseCard
                key={work.slug}
                work={work}
                featured={index === 0}
                delay={index * 65}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

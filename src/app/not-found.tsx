import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <>
      <PageIntro
        eyebrow="404"
        title="Этой страницы нет."
        description="Похоже, ссылка устарела или раздел переехал. Вернитесь на главную: путь к записи там по-прежнему короткий."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="section-frame p-6 sm:p-8">
            <Link
              href="/"
              className="text-sm uppercase tracking-[0.18em] text-metal transition-colors hover:text-metal-soft"
            >
              На главную
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

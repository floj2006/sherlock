import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { business } from "@/lib/site-data";

export default function ThanksPage() {
  return (
    <>
      <PageIntro
        eyebrow="Спасибо"
        title="До встречи в SHERLOCK."
        description="Если запись уже оформлена, просто приходите к своему времени. Если понадобится что-то уточнить, мы рядом в Telegram."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="section-frame flex flex-col gap-5 p-6 sm:p-8">
            <Link
              href={business.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm uppercase tracking-[0.18em] text-metal hover:text-metal-soft"
            >
              Написать в Telegram
            </Link>
            <Link href="/" className="text-sm uppercase tracking-[0.18em] text-muted hover:text-cream">
              Вернуться на главную
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

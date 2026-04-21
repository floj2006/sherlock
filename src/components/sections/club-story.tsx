import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { business, facts } from "@/lib/site-data";

export function ClubStory() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="section-frame group relative overflow-hidden p-3 sm:p-4">
            <div className="fade-mask relative h-[30rem] overflow-hidden rounded-[1.75rem] sm:h-[34rem]">
              <Image
                src="/about/sherlock-club.jpg"
                alt="Интерьер барбершопа SHERLOCK в Мурино"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover object-center transition duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/80" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(circle_at_50%_100%,rgba(184,146,82,0.18),transparent_70%)]" />
            </div>
            <div className="absolute bottom-10 left-10 right-10">
              <p className="eyebrow">Quiet luxury</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#d5cec3]">
                Премиальность здесь не в громких словах. Она в тишине процесса,
                чистоте рабочего места и результате, который не требует
                объяснений.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="О клубе"
              title="Закрытый по ощущению клуб. Открытый для тех, кто ценит точность."
              description="SHERLOCK держится на спокойном сервисе, уважении ко времени и форме, которая выглядит естественно, собранно и уместно в вашем ритме."
            />
            <div className="section-frame p-6 sm:p-8">
              <div className="grid gap-5">
                {facts.map((fact) => (
                  <div
                    key={fact}
                    className="flex items-start gap-4 border-b border-line pb-5 last:border-b-0 last:pb-0"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-metal" />
                    <p className="text-sm leading-7 text-muted sm:text-base">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted">
                <Link
                  href={business.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-metal hover:text-metal-soft"
                  data-analytics-event="telegram_click"
                  data-analytics-label="about"
                >
                  Telegram-канал
                </Link>
                <Link href="/works" className="hover:text-cream">
                  Работы клуба
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

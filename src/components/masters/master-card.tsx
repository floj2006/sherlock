import Image from "next/image";
import Link from "next/link";
import { BookButton } from "@/components/booking/book-button";
import { Reveal } from "@/components/ui/reveal";
import { RatingStars } from "@/components/ui/rating-stars";
import { getMasterAvailability } from "@/lib/master-availability";
import type { Master } from "@/lib/site-data";

type MasterCardProps = {
  master: Master;
  delay?: number;
  headingTag?: "h2" | "h3";
};

export function MasterCard({
  master,
  delay = 0,
  headingTag = "h3",
}: MasterCardProps) {
  const HeadingTag = headingTag;
  const strengths =
    master.strengths?.map((strength) => strength.title) ?? master.specialties;
  const availability = getMasterAvailability(master);

  return (
    <Reveal delay={delay} className="h-full">
      <article className="section-frame group h-full overflow-hidden bg-gradient-to-b from-white/[0.03] via-panel/85 to-black/95 transition-[border-color,box-shadow,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-line-strong hover:shadow-[0_26px_72px_rgba(0,0,0,0.28)]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={master.image}
            alt={`Портрет мастера ${master.name}`}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/22 via-black/8 to-black/44" />
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/95 to-transparent" />
          <div className="absolute inset-x-[10%] bottom-[-12%] h-32 rounded-full bg-metal/10 blur-3xl" />

          <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-metal backdrop-blur-md sm:left-5 sm:top-5">
            {master.role}
          </div>
          <div className="absolute right-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/88 backdrop-blur-md sm:right-5 sm:top-5">
            {master.rating.toFixed(1)}
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-[1.45rem] border border-white/10 bg-black/58 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
            <HeadingTag className="font-display text-[2.2rem] leading-[0.92] text-cream sm:text-[2.5rem]">
              {master.name}
            </HeadingTag>
            <p className="mt-3 max-w-[28rem] text-sm leading-7 text-cream/78">
              {master.focus}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <RatingStars rating={master.rating} className="text-base" />
            <div className="text-right">
              <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                {master.reviewCount} отзывов
              </span>
              <p
                className={`mt-2 text-[0.62rem] uppercase tracking-[0.18em] ${
                  availability.tone === "available" ? "text-metal" : "text-cream/55"
                }`}
              >
                {availability.label}
              </p>
            </div>
          </div>

          <p className="text-sm leading-7 text-muted">{master.summary}</p>

          <div className="border-t border-line/80 pt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-metal">
              Сильные стороны
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {strengths.map((strength) => (
                <span
                  key={strength}
                  className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-cream/72"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-metal/80" />
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line/80 pt-4">
            <BookButton
              source={`master_${master.slug}`}
              masterSlug={master.slug}
              variant="secondary"
              className="min-w-[10rem]"
            >
              Записаться
            </BookButton>
            <Link
              href={`/masters/${master.slug}`}
              className="text-[0.68rem] uppercase tracking-[0.2em] text-metal hover:text-metal-soft"
            >
              Профиль
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

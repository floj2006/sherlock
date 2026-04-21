import { Container } from "@/components/ui/container";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  caption?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  caption,
}: PageIntroProps) {
  return (
    <section className="pt-28 sm:pt-36">
      <Container>
        <div className="section-frame noise-overlay relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,146,82,0.16),transparent_28%)]" />
          <div className="relative max-w-4xl space-y-5">
            <span className="eyebrow">{eyebrow}</span>
            <div className="golden-divider max-w-24" />
            <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {description}
            </p>
            {caption ? (
              <p className="text-xs uppercase tracking-[0.2em] text-metal">
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

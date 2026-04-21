import Image from "next/image";
import { BookButton } from "@/components/booking/book-button";
import { Reveal } from "@/components/ui/reveal";
import type { WorkCase } from "@/lib/site-data";

type WorkCaseCardProps = {
  work: WorkCase;
  featured?: boolean;
  delay?: number;
};

type ImagePaneProps = {
  src?: string;
  videoSrc?: string;
  alt: string;
  label: string;
  caption: string;
  tone?: "before" | "result";
  featured: boolean;
};

function getVideoMimeType(src: string) {
  const normalizedSrc = src.toLowerCase().split("?")[0];

  if (normalizedSrc.endsWith(".mov")) {
    return "video/quicktime";
  }

  if (normalizedSrc.endsWith(".webm")) {
    return "video/webm";
  }

  return "video/mp4";
}

function ImagePane({
  src,
  videoSrc,
  alt,
  label,
  caption,
  tone = "result",
  featured,
}: ImagePaneProps) {
  const isResult = tone === "result";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] ${
        featured ? "aspect-[3/4] sm:aspect-[4/5]" : "aspect-[3/4]"
      } ${isResult ? "ring-1 ring-metal/35" : "ring-1 ring-white/10"}`}
    >
      {videoSrc ? (
        <video
          aria-label={alt}
          autoPlay
          disablePictureInPicture
          loop
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          className={`pointer-events-none h-full w-full object-cover ${
            isResult
              ? "brightness-[1.02] contrast-[1.03]"
              : "brightness-[0.78] contrast-[0.96] saturate-[0.72]"
          }`}
        >
          <source src={videoSrc} type={getVideoMimeType(videoSrc)} />
        </video>
      ) : (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={
            featured
              ? "(min-width: 1280px) 32vw, 50vw"
              : "(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
          }
          className={`h-full w-full object-cover ${
            isResult
              ? "brightness-[1.02] contrast-[1.03]"
              : "brightness-[0.78] contrast-[0.96] saturate-[0.72]"
          }`}
        />
      )}
      <div
        className={`absolute inset-0 transition duration-500 ${
          isResult
            ? "bg-gradient-to-t from-black/55 via-black/0 to-black/20"
            : "bg-gradient-to-t from-black/70 via-black/10 to-black/30"
        }`}
      />
      <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
        <span
          className={`rounded-full border px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] backdrop-blur-sm ${
            isResult
              ? "border-metal/40 bg-metal/15 text-metal-soft"
              : "border-white/10 bg-black/45 text-cream/70"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
        <p
          className={`text-[0.62rem] uppercase tracking-[0.18em] ${
            isResult ? "text-metal-soft" : "text-cream/55"
          }`}
        >
          {caption}
        </p>
      </div>
    </div>
  );
}

type EditorialGalleryProps = {
  images: NonNullable<WorkCase["galleryImages"]>;
  featured: boolean;
};

function EditorialGallery({ images, featured }: EditorialGalleryProps) {
  const shownImages = images.slice(0, 2);
  const [detailImage, mainImage = detailImage] = shownImages;

  if (!detailImage) {
    return null;
  }

  return (
    <div className="p-2 sm:p-3">
      {featured ? (
        <div className="grid gap-3 lg:grid-cols-[1.28fr_0.72fr] lg:items-stretch">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] ring-1 ring-metal/30 transition duration-500 group-hover:ring-metal/45 sm:aspect-[16/11] lg:aspect-auto lg:min-h-[31rem]">
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              sizes="(min-width: 1280px) 43vw, (min-width: 1024px) 58vw, 100vw"
              className="h-full w-full object-cover brightness-[1.02] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-black/10" />
            <figcaption className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:inset-x-5 sm:bottom-5">
              <span className="w-fit rounded-full border border-metal/40 bg-black/55 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-metal-soft backdrop-blur-sm">
                {mainImage.label}
              </span>
              <span className="max-w-[22rem] text-[0.68rem] uppercase tracking-[0.18em] text-cream/75">
                {mainImage.caption}
              </span>
            </figcaption>
          </figure>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] ring-1 ring-white/10 transition duration-500 group-hover:ring-line-strong sm:aspect-[16/11] lg:aspect-auto lg:min-h-[31rem]">
            <Image
              src={detailImage.src}
              alt={detailImage.alt}
              fill
              sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 34vw, 100vw"
              className="h-full w-full object-cover brightness-[1.02] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
            <figcaption className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:inset-x-5 sm:bottom-5">
              <span className="w-fit rounded-full border border-white/15 bg-black/50 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream/80 backdrop-blur-sm">
                {detailImage.label}
              </span>
              <span className="text-[0.68rem] uppercase tracking-[0.18em] text-cream/60">
                {detailImage.caption}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {shownImages.map((image) => (
            <figure
              key={image.src}
              className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] ring-1 ring-white/10 transition duration-500 group-hover:ring-line-strong"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
                className="h-full w-full object-cover brightness-[1.02] contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
              <figcaption className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:inset-x-4 sm:bottom-4">
                <span className="w-fit rounded-full border border-metal/40 bg-black/55 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-metal-soft backdrop-blur-sm">
                  {image.label}
                </span>
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-cream/70">
                  {image.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkCaseCard({
  work,
  featured = false,
  delay = 0,
}: WorkCaseCardProps) {
  const hasGallery = Boolean(work.galleryImages?.length);
  const hasBefore = Boolean(work.beforeImage || work.beforeVideo);

  return (
    <Reveal
      delay={delay}
      className={featured ? "xl:col-span-2" : undefined}
    >
      <article className="section-frame group overflow-hidden bg-gradient-to-b from-panel/90 to-noir/90 transition duration-500 hover:border-line-strong hover:shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
        {hasGallery ? (
          <EditorialGallery images={work.galleryImages ?? []} featured={featured} />
        ) : hasBefore ? (
          <div className="relative p-2 sm:p-3">
            <div className="pointer-events-none absolute bottom-6 left-1/2 top-6 z-10 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-metal/60 to-transparent sm:block" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-metal/35 bg-black/70 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-metal-soft backdrop-blur-md sm:block">
              →
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <ImagePane
                src={work.beforeImage}
                videoSrc={work.beforeVideo}
                alt={`${work.title}: до работы`}
                label="До"
                caption="Исходная форма"
                tone="before"
                featured={featured}
              />
              <ImagePane
                src={work.coverImage as string}
                alt={`${work.title}: результат работы`}
                label="Результат"
                caption="После работы"
                featured={featured}
              />
            </div>
          </div>
        ) : (
          <div
            className={`relative overflow-hidden ${
              featured ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[4/5]"
            }`}
          >
            {work.coverVideo ? (
              <video
                aria-label={`${work.title}: результат работы`}
                autoPlay
                disablePictureInPicture
                loop
                muted
                playsInline
                preload="metadata"
                tabIndex={-1}
                className="pointer-events-none h-full w-full object-cover brightness-[1.02] contrast-[1.03]"
              >
                <source
                  src={work.coverVideo}
                  type={getVideoMimeType(work.coverVideo)}
                />
              </video>
            ) : (
              <Image
                src={work.coverImage as string}
                alt={`${work.title}: результат работы`}
                fill
                sizes={
                  featured
                    ? "(min-width: 1280px) 66vw, 100vw"
                    : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                }
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent transition duration-500 group-hover:from-black/72" />
            <div className="absolute bottom-5 left-5 rounded-full border border-metal/35 bg-black/55 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-metal backdrop-blur-sm">
              Результат
            </div>
          </div>
        )}

        <div
          className={`grid gap-6 p-5 sm:p-7 ${
            featured ? "lg:grid-cols-[0.85fr_1.15fr]" : ""
          }`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-metal">
                {work.category}
              </p>
              <h3 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
                {work.title}
              </h3>
            </div>
            <p className="text-sm leading-7 text-muted">{work.description}</p>
            <div className="rounded-[1.25rem] border border-line bg-white/[0.03] p-4 transition duration-500 group-hover:border-line-strong group-hover:bg-white/[0.05]">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-metal">
                Итог
              </p>
              <p className="mt-3 text-sm leading-7 text-cream/85">
                {work.result}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="divide-y divide-line">
              {work.details.map((detail, index) => (
                <div
                  key={detail}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="font-display text-2xl leading-none text-metal/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-7 text-muted">{detail}</p>
                </div>
              ))}
            </div>
            {featured ? (
              <BookButton serviceSlug={work.serviceSlug} source={`work_${work.slug}`}>
                {work.ctaLabel ?? "Записаться на услугу"}
              </BookButton>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

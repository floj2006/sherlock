import { BookButton } from "@/components/booking/book-button";
import { Reveal } from "@/components/ui/reveal";
import { CaseMedia, type CaseMediaItem } from "./case-media";
import type { WorkCase } from "@/lib/site-data";

export function WorkCaseCard({ work, featured = false, delay = 0 }: { work: WorkCase; featured?: boolean; delay?: number }) {
  let media: CaseMediaItem[];
  if (work.galleryImages?.length) {
    media = work.galleryImages.slice(0, 2).map(image => ({ src: image.src, alt: image.alt, label: image.label, caption: image.caption }));
  } else if (work.beforeImage || work.beforeVideo) {
    media = [
      { src: work.beforeImage, video: work.beforeVideo, alt: work.title + ": до работы", label: "До", caption: "Исходная форма" },
      { src: work.coverImage, alt: work.title + ": результат", label: "После", caption: "Работа SHERLOCK" },
    ];
  } else {
    media = [{ src: work.coverImage, video: work.coverVideo, alt: work.title, label: "Результат" }];
  }

  return <Reveal delay={delay} className="case-reveal">
    <article className="portfolio-card" aria-labelledby={"case-" + work.slug}>
      <div className={"case-gallery" + (media.length === 1 ? " is-single" : "")}>
        {media.map((item, index) => <CaseMedia key={item.src ?? item.video ?? index} item={item} single={media.length === 1} />)}
      </div>
      <div className="case-content">
        <div className="case-story">
          <p className="eyebrow">{work.category}</p>
          <h3 id={"case-" + work.slug}>{work.title}</h3>
          <p className="case-description">{work.description}</p>
        </div>
        <div className="case-outcome"><p className="eyebrow">Результат</p><p>{work.result}</p></div>
        <details className="case-breakdown">
          <summary>Как работали с формой <span aria-hidden="true">+</span></summary>
          <ol>{work.details.map((detail, index) => <li key={detail}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{detail}</p></li>)}</ol>
        </details>
        <div className="case-actions"><BookButton serviceSlug={work.serviceSlug} source={"work_" + work.slug} variant={featured ? "primary" : "secondary"}>Записаться на услугу <span aria-hidden="true">↗</span></BookButton></div>
      </div>
    </article>
  </Reveal>;
}

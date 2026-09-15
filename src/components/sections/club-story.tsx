import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { business } from "@/lib/site-data";

const rituals = [
  { title: "Сначала — разговор", text: "Обсудим длину, привычки и то, какой результат вы хотите видеть в зеркале." },
  { title: "Затем — точная работа", text: "Подберём форму с учётом роста волос и пропорций лица." },
  { title: "В финале — детали", text: "Доведём контур и покажем, как сохранить укладку дома." },
];

export function ClubStory() {
  return <section id="about" className="editorial-section club-section"><Container>
    <div className="club-layout">
      <Reveal className="club-image-wrap">
        <figure className="club-image">
          <Image src={business.heroImage} alt="Кресла у панорамных окон в барбершопе SHERLOCK" fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
          <figcaption><span>SHERLOCK / МУРИНО</span><span>Место для себя.</span></figcaption>
        </figure>
      </Reveal>
      <Reveal className="club-copy" delay={100}>
        <p className="eyebrow">01 / Атмосфера</p>
        <h2 className="editorial-heading">Ваше время.<br /><em>Ваш характер.</em></h2>
        <p className="club-lead">Оставьте суету за дверью. Здесь можно выдохнуть и доверить свой образ мастеру.</p>
        <ol className="club-rituals">{rituals.map((ritual, index) => <li key={ritual.title}>
          <span aria-hidden="true">0{index + 1}</span><div><h3>{ritual.title}</h3><p>{ritual.text}</p></div>
        </li>)}</ol>
        <Link href={business.telegramUrl} target="_blank" rel="noreferrer" className="text-link" data-analytics-event="telegram_click" data-analytics-label="about">Жизнь барбершопа <span aria-hidden="true">↗</span></Link>
      </Reveal>
    </div>
  </Container></section>;
}

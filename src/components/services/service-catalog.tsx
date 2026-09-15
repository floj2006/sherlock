"use client";
import Link from "next/link";
import { useState } from "react";
import { BookButton } from "@/components/booking/book-button";
import { services, serviceCategories } from "@/lib/site-data";
const labels = ["Первый визит", "Стрижки и борода", "Уход", "Цвет и текстура"];
export function ServiceCatalog() {
  const [active, setActive] = useState("all");
  const groups = serviceCategories.map((category,index) => ({ category, label:labels[index], services:services.filter(service => service.category === category) }));
  return <div className="service-catalog">
    <div className="service-filters" role="group" aria-label="Направление услуг"><button type="button" aria-pressed={active === "all"} onClick={() => setActive("all")}>Все услуги <span>{services.length}</span></button>
      {groups.map(group => <button key={group.category} type="button" aria-pressed={active === group.category} onClick={() => setActive(group.category)}>{group.label}<span>{group.services.length}</span></button>)}
    </div>
    <p className="sr-only" role="status">{active === "all" ? "Все услуги" : active}</p>
    <div className="catalog-layout"><div className="catalog-groups">
      {groups.filter(group => active === "all" || active === group.category).map((group,index) => <section className="catalog-group" key={group.category}>
        <div className="catalog-group-title"><span className="catalog-number">{String(index+1).padStart(2,"0")}</span><div><p className="eyebrow">{group.category === serviceCategories[0] ? "Знакомство с SHERLOCK" : "Меню барбершопа"}</p><h2>{group.label}</h2></div></div>
        {group.category === serviceCategories[0] ? <p className="catalog-offer-note">Специальные цены действуют на первое посещение.</p> : null}
        <div className="catalog-rows">{group.services.map(service => <article className="catalog-row" key={service.slug}>
          <div className="catalog-service"><Link href={"/services/" + service.slug}><h3>{service.title.replace(" (первый визит)","")}</h3></Link><p>{service.duration}<span aria-hidden="true"> · </span>{service.tags.slice(0,2).join(" · ")}</p>
            <details><summary>Об услуге <span aria-hidden="true">+</span></summary><p>{service.description}</p><Link href={"/services/" + service.slug}>Подробнее об услуге ↗</Link></details>
          </div>
          <div className="catalog-price"><strong>{service.price}</strong><BookButton source={"catalog_" + service.slug} serviceSlug={service.slug} variant="secondary">Выбрать</BookButton></div>
        </article>)}</div>
      </section>)}
    </div><aside className="catalog-concierge"><p className="eyebrow">Ваш визит</p><h2>Начнём<br />с вашего образа.</h2><p>Выберите услугу, затем мастера и удобное время. Если сомневаетесь в длине или форме, обсудите пожелания с мастером перед началом.</p><div className="golden-divider" /><BookButton source="catalog_help">Перейти к записи</BookButton><Link href="/masters">Познакомиться с мастерами ↗</Link></aside></div>
  </div>;
}

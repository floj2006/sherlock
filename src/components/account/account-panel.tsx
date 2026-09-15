"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AccountUser, AccountVisit } from "@/lib/account-types";
import { formatBookingPrice } from "@/lib/booking-types";
import { business } from "@/lib/site-data";

export function AccountPanel({ user, visits }: { user: AccountUser; visits: AccountVisit[] }) {
  const router = useRouter();
  const [fullname, setFullname] = useState(user.fullname);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function logout() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Не удалось выйти. Попробуйте ещё раз.");
      router.replace("/account");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Нет связи с сервером."); }
    finally { setBusy(false); }
  }
  return <>
    <header className="account-heading"><div><p className="eyebrow">SHERLOCK / Личный кабинет</p><h1>Здравствуйте,<br />{user.fullname.split(" ")[0]}.</h1></div><button className="text-link" disabled={busy} onClick={logout}>Выйти</button></header>
    <div className="account-workspace">
      <section className="account-visits"><div className="account-section-heading"><h2>Ваши записи</h2><Link href="/book" className="text-link">Выбрать время ↗</Link></div>
        {visits.length ? <><p className="booking-note">Записи, оформленные на сайте из этого аккаунта. Для уточнения, переноса или отмены позвоните нам.</p><ol className="account-visit-list">{visits.map(visit => <li key={visit.recordId}>
          <p className="eyebrow">Запись № {visit.recordId}</p><h3>{new Date(visit.datetime).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" })}<small>МСК</small></h3>
          <p>{visit.services.join(" + ")}</p><p className="booking-note">{visit.master} · {formatBookingPrice(visit)}</p>
          <Link className="text-link" href={"/book?services=" + encodeURIComponent(visit.serviceSlugs.join(","))}>Повторить выбор услуг ↗</Link>
        </li>)}</ol></> : <div className="account-empty"><span aria-hidden="true">01 /</span><h3>Ваш следующий визит<br />начинается здесь.</h3><p>Выберите услуги и мастера. Запись появится в кабинете после подтверждения.</p><Link href="/book" className="book-button book-button-primary">Записаться</Link></div>}
        <a className="account-contact" href={"tel:" + business.phoneHref}>{business.phoneDisplay}</a>
      </section>
      <form className="account-profile" onSubmit={async event => {
        event.preventDefault(); setBusy(true); setMessage("");
        try {
          const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullname, email, phone }) });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error || "Не удалось сохранить профиль.");
          setFullname(body.user.fullname); setEmail(body.user.email); setPhone(body.user.phone);
          setMessage("Данные сохранены."); router.refresh();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Нет связи с сервером."); }
        finally { setBusy(false); }
      }}>
        <p className="eyebrow">Ваш профиль</p><h2>Уже знакомы.</h2><p className="booking-note">Подставим эти контакты при следующей записи.</p>
        <fieldset className="booking-block" disabled={busy}><label htmlFor="profile-name">Имя</label><input id="profile-name" required minLength={2} maxLength={100} autoComplete="name" value={fullname} onChange={event => setFullname(event.target.value)} />
          <label htmlFor="profile-phone">Телефон</label><input id="profile-phone" type="tel" maxLength={25} autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} />
          <label htmlFor="profile-email">Электронная почта</label><input id="profile-email" type="email" maxLength={150} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />
          <button type="submit" className="book-button book-button-secondary">{busy ? "Подождите…" : "Сохранить данные"}</button>
        </fieldset><p role="status" className="account-message">{message}</p><p className="booking-note">Вход через Яндекс ID. Изменение контактов здесь не меняет данные в Яндексе.</p>
      </form>
    </div>
  </>;
}

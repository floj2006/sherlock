"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { business } from "@/lib/site-data";
import { bookingTotals, formatBookingPrice, type BookingService, type BookingMaster, type BookingSlot, type BookingSubmission } from "@/lib/booking-types";
import { trackEvent } from "@/lib/analytics";
import { ServicePicker } from "./service-picker";
import { MasterPicker } from "./master-picker";
import { ServiceFlightEffect, type ServiceFlight } from "./service-flight";
import type { AccountUser } from "@/lib/account-types";

function useBookingData<T>(url: string | null) {
  const [attempt, setAttempt] = useState(0);
  const key = url + ":" + attempt;
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>({ key: "" });
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    let disposed = false;
    void fetch(url, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Не удалось загрузить данные.");
      if (!disposed) setResult({ key, data: body });
    }).catch(error => {
      if (!disposed) setResult({ key, error: error instanceof Error && error.name !== "AbortError" ? error.message : "Загрузка заняла слишком много времени. Попробуйте ещё раз." });
    }).finally(() => window.clearTimeout(timer));
    return () => { disposed = true; controller.abort(); window.clearTimeout(timer); };
  }, [url, key]);
  return { data: url && result.key === key ? result.data : undefined, error: url && result.key === key ? result.error : undefined,
    loading: !!url && (result.key !== key || (!result.data && !result.error)), retry: () => setAttempt(value => value + 1) };
}
type Selection = { services: BookingService[]; master: BookingMaster; dates?: string[]; slots?: BookingSlot[] };
const longDate = (date: string) => new Date(date + "T12:00:00+03:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" });

export function BookingForm({ initialServiceIds = [], initialStaffId, accountUser }: { initialServiceIds?: number[]; initialStaffId?: number; accountUser?: AccountUser | null }) {
  const [serviceIds, setServiceIds] = useState(initialServiceIds);
  const [staffId, setStaffId] = useState(initialStaffId ?? 0);
  const [date, setDate] = useState("");
  const [datetime, setDatetime] = useState("");
  const [fullname, setFullname] = useState(accountUser?.fullname ?? "");
  const [phone, setPhone] = useState(accountUser?.phone ?? "");
  const [email, setEmail] = useState(accountUser?.email ?? "");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "confirmed" | "unknown">("idle");
  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState<number>();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryAnimated, setSummaryAnimated] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);
  const removalAnimation = useRef<Animation | null>(null);
  useEffect(() => () => removalAnimation.current?.cancel(), []);
  const [flight, setFlight] = useState<ServiceFlight | null>(null);
  const finishFlight = useCallback(() => setFlight(null), []);
  const summary = useRef<HTMLElement>(null);
  const summaryToggle = useRef<HTMLButtonElement>(null);
  const submitted = useRef<BookingSubmission | null>(null);
  const status = useRef<HTMLDivElement>(null);
  const catalog = useBookingData<{ services: BookingService[] }>("/api/booking");
  const serviceQuery = [...serviceIds].sort((a, b) => a - b).join(",");
  const roster = useBookingData<{ masters: BookingMaster[] }>(serviceIds.length ? `/api/booking?serviceIds=${serviceQuery}` : null);
  const choiceUrl = serviceIds.length && staffId ? `/api/booking?serviceIds=${serviceQuery}&staffId=${staffId}` : null;
  const selection = useBookingData<Selection>(choiceUrl);
  const calendar = useBookingData<Selection>(choiceUrl && date ? `${choiceUrl}&date=${date}` : null);
  const selectedServices = calendar.data?.services ?? selection.data?.services ?? catalog.data?.services.filter(item => serviceIds.includes(item.id)) ?? [];
  const totals = bookingTotals(selectedServices);
  const master = roster.data?.masters.find(item => item.id === staffId);
  const slot = calendar.data?.slots?.find(item => item.datetime === datetime);
  const busy = state === "sending" || state === "unknown" || removingServiceId !== null;
  const returnQuery = new URLSearchParams();
  if (selectedServices.length) returnQuery.set("services", selectedServices.map(service => service.slug).join(","));
  if (staffId) returnQuery.set("master", String(staffId));
  const accountHref = "/account?next=" + encodeURIComponent("/book" + (returnQuery.size ? "?" + returnQuery : ""));
  const canSubmit = serviceIds.length > 0 && selectedServices.length === serviceIds.length && !!master && !!slot && !!selection.data && !selection.loading && !calendar.loading && consent;

  function showSummary(open: boolean) {
    if (open !== summaryOpen) setSummaryAnimated(true);
    setSummaryOpen(open);
  }

  async function removeService(id: number, element: HTMLElement | null) {
    if (busy) return;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toggleService(id);
      return;
    }
    setRemovingServiceId(id);
    const animation = element.animate([
      { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
      { opacity: .7, filter: "blur(5px)", transform: "translateY(-4px)", offset: .4 },
      { opacity: 0, filter: "blur(18px)", transform: "translateY(-12px)" },
    ], { duration: 320, easing: "ease-in", fill: "forwards" });
    removalAnimation.current = animation;
    try {
      await animation.finished;
      const style = getComputedStyle(element);
      const collapse = element.animate([
        { height: style.height, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, borderBottomWidth: style.borderBottomWidth, overflow: "hidden" },
        { height: "0px", paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px", overflow: "hidden" },
      ], { duration: 300, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
      removalAnimation.current = collapse;
      await collapse.finished;
      toggleService(id);
    }
    catch { /* Unmounting cancels the visual effect. */ }
    finally { removalAnimation.current = null; setRemovingServiceId(null); }
  }

  function toggleService(id: number, origin?: DOMRect) {
    if (!serviceIds.includes(id) && origin) {
      showSummary(false);
      const service = catalog.data?.services.find(item => item.id === id);
      if (service && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFlight({ key: Date.now(), service, from: origin });
    }
    setServiceIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
    setStaffId(serviceIds.length ? 0 : initialStaffId ?? 0);
    setDate(""); setDatetime(""); setMessage("");
  }

  async function send(input: BookingSubmission) {
    setState("sending"); setMessage("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: controller.signal });
      const body = await response.json();
      if (body.state === "confirmed" && Number.isSafeInteger(body.recordId)) {
        setRecordId(body.recordId); setState("confirmed");
        trackEvent({ event: "booking_complete", label: "native_form" });
      } else if (body.state === "rejected") {
        setState("idle"); setMessage(body.error || "Запись не создана. Проверьте данные.");
        if (body.code === "SLOT_TAKEN") { setDatetime(""); calendar.retry(); }
        if (body.code === "PRICE_CHANGED") { setDatetime(""); selection.retry(); calendar.retry(); }
      } else {
        setState("unknown"); setMessage(body.error || "Подтверждение пока не получено. Позвоните нам перед повторной записью.");
      }
    } catch {
      setState("unknown"); setMessage("Связь прервалась после отправки. Проверьте подтверждение или позвоните нам перед повторной записью.");
    } finally {
      window.clearTimeout(timer);
      showSummary(true);
      requestAnimationFrame(() => status.current?.focus());
    }
  }

  if (state === "confirmed") return <div ref={status} tabIndex={-1} role="status" className="booking-confirmed">
    <span className="eyebrow">До встречи в SHERLOCK</span><h2>Вы записаны.</h2><p>{master?.name} · {date && longDate(date)} · {slot?.time}</p><p>{selectedServices.map(service => service.title).join(" + ")}</p><p className="confirmation-number">Запись № {recordId}</p>
    <address>{business.address}<br /><a href={"tel:" + business.phoneHref}>{business.phoneDisplay}</a></address>
    <p className="booking-note">Чтобы перенести или отменить визит, позвоните нам.</p><Link href="/" className="text-link">На главную ↗</Link>
    {accountUser ? <p><Link href="/account" className="text-link">Мои записи ↗</Link></p> : null}
  </div>;

  const resources = [catalog, selection, calendar];
  return <form className="native-booking" onInvalid={() => showSummary(false)} onSubmit={event => {
    event.preventDefault(); if (!canSubmit || busy) return;
    const input: BookingSubmission = { requestId: crypto.randomUUID(), serviceIds, staffId, datetime, fullname, phone, email, comment, consent, priceMin: totals.priceMin, priceMax: totals.priceMax };
    submitted.current = input; void send(input);
  }}>
    <div className="booking-workspace">
      <fieldset disabled={busy} className="booking-block"><legend><span>01</span> Услуги и мастер</legend>
        {catalog.loading ? <p role="status" className="booking-note">Загружаем услуги…</p> : null}
        {catalog.data ? <ServicePicker services={catalog.data.services} selectedIds={serviceIds} onToggle={toggleService} /> : null}
        {catalog.data?.services.length === 0 ? <p className="booking-note">Онлайн-запись на услуги пока недоступна. Позвоните нам.</p> : null}
        {catalog.data && serviceIds.some(id => !catalog.data?.services.some(service => service.id === id)) ? <p className="booking-note">Некоторые услуги из ссылки больше недоступны. <button type="button" className="text-link" onClick={() => { setServiceIds(ids => ids.filter(id => catalog.data?.services.some(service => service.id === id))); setStaffId(0); setDate(""); setDatetime(""); }}>Убрать недоступные услуги</button></p> : null}
        <MasterPicker key={serviceQuery} masters={roster.data?.masters ?? []} value={staffId} disabled={busy || !serviceIds.length || roster.loading || !roster.data?.masters.length}
          placeholder={!serviceIds.length ? "Сначала выберите услуги" : roster.loading ? "Загружаем мастеров…" : roster.error ? "Не удалось загрузить мастеров" : roster.data?.masters.length === 0 ? "Нет доступных мастеров" : "Выберите мастера"}
          onChange={id => { setStaffId(id); setDate(""); setDatetime(""); setMessage(""); }} />
        <p id="booking-master-hint" className="booking-note">{serviceIds.length ? "Показаны мастера для выбранных услуг." : "Список мастеров появится после выбора услуги."}</p>
        {roster.error ? <div className="booking-error" role="alert"><p>{roster.error}</p><button type="button" onClick={roster.retry} disabled={busy}>Загрузить мастеров ещё раз</button></div> : null}
        {roster.data?.masters.length === 0 ? <p className="booking-note">Для выбранных услуг сейчас нет общего мастера. Измените набор услуг или позвоните нам.</p> : null}
      </fieldset>
      <fieldset disabled={busy} className="booking-block"><legend><span>02</span> Дата и время</legend>
        {!serviceIds.length || !staffId ? <p className="booking-note">Сначала выберите услуги и мастера.</p> : selection.loading ? <p role="status" className="booking-note">Проверяем расписание…</p> : null}
        {selection.data?.dates?.length === 0 ? <p className="booking-note">У мастера пока нет свободных дат. Выберите другого мастера или позвоните нам.</p> : null}
        <div className="booking-dates" role="group" aria-label="Свободные даты">{selection.data?.dates?.map(day => <button key={day} type="button" aria-pressed={date === day} onClick={() => { setDate(day); setDatetime(""); setMessage(""); }}><span>{new Date(day + "T12:00:00+03:00").toLocaleDateString("ru-RU", { weekday: "short", timeZone: "Europe/Moscow" })}</span>{longDate(day)}</button>)}</div>
        {calendar.loading ? <p role="status" className="booking-note">Загружаем свободное время…</p> : null}
        {calendar.data?.slots?.length === 0 ? <p className="booking-note">На эту дату свободных мест уже нет. Выберите другой день.</p> : null}
        <div className="booking-times" role="group" aria-label="Свободное время">{calendar.data?.slots?.map(item => <button type="button" key={item.datetime} aria-pressed={datetime === item.datetime} onClick={() => { setDatetime(item.datetime); setMessage(""); }}>{item.time}</button>)}</div>
        {date ? <p className="booking-note">Время местное — Мурино, МСК.</p> : null}
      </fieldset>
      <fieldset disabled={busy} className="booking-block"><legend><span>03</span> Ваши контакты</legend>
        {accountUser ? <p className="booking-note">Контакты из вашего профиля. Можно изменить их для этого визита.</p> : !busy && catalog.data ? <p className="booking-note"><Link href={accountHref} className="text-link">Войти и подставить контакты ↗</Link><br />Вернём вас к выбранным услугам и мастеру. Дату и время нужно будет выбрать заново.</p> : null}
        <div className="booking-fields"><div><label htmlFor="booking-name">Имя</label><input id="booking-name" autoComplete="name" required minLength={2} maxLength={100} value={fullname} onChange={event => setFullname(event.target.value)} /></div>
        <div><label htmlFor="booking-phone">Телефон</label><input id="booking-phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required maxLength={25} value={phone} onChange={event => setPhone(event.target.value)} /></div>
        <div className="booking-field-wide"><label htmlFor="booking-email">Электронная почта</label><input id="booking-email" type="email" autoComplete="email" required maxLength={150} value={email} onChange={event => setEmail(event.target.value)} /></div>
        <div className="booking-field-wide"><label htmlFor="booking-comment">Пожелания к визиту <small>необязательно</small></label><textarea id="booking-comment" rows={3} maxLength={500} value={comment} onChange={event => setComment(event.target.value)} /></div></div>
        <label className="booking-consent"><input type="checkbox" checked={consent} required onChange={event => setConsent(event.target.checked)} /><span>Согласен на обработку персональных данных согласно <Link href="/privacy" target="_blank">политике конфиденциальности</Link>.</span></label>
      </fieldset>
    </div>
    {flight ? <ServiceFlightEffect key={flight.key} flight={flight} onFinish={finishFlight} /> : null}
    <aside ref={summary} className={"visit-summary" + (summaryOpen ? " is-open" : "")} data-motion={summaryAnimated ? summaryOpen ? "opening" : "closing" : undefined} onKeyDown={event => { if (event.key === "Escape") { showSummary(false); summaryToggle.current?.focus(); } }}>
      <span className="visit-summary-smoke" aria-hidden="true" />
      <button ref={summaryToggle} className="mobile-visit-toggle" type="button" aria-expanded={summaryOpen} aria-controls="visit-summary-content" onClick={() => showSummary(!summaryOpen)}>
        <span className="mobile-visit-count" key={serviceIds.length}>{serviceIds.length}</span>
        <span className="mobile-visit-total"><small>Ваш визит{serviceIds.length ? ` · услуг: ${serviceIds.length}` : ""}</small><strong aria-live="polite">{selectedServices.length ? formatBookingPrice(totals) : "Выберите услуги"}</strong></span>
        <span className="mobile-visit-expand">{summaryOpen ? "Свернуть" : "Открыть"}<span aria-hidden="true">{summaryOpen ? "↓" : "↑"}</span></span>
      </button>
      <div className="visit-summary-reveal"><div id="visit-summary-content" className="visit-summary-content"><div className="visit-summary-inner"><p className="eyebrow">Ваша запись</p><h2>Ваш визит</h2>
      {!selectedServices.length ? <p className="booking-note">Выберите услуги — они появятся здесь.</p> : null}
      {selectedServices.length ? <ul className="visit-services">{selectedServices.map(service => <li key={service.id} className={removingServiceId === service.id ? "is-removing" : undefined}><span>{service.title}<small>{formatBookingPrice(service)}</small></span><button type="button" disabled={busy} onClick={event => void removeService(service.id, event.currentTarget.closest("li"))} aria-label={`Убрать: ${service.title}`}>×</button></li>)}</ul> : null}
      <dl><div><dt>Мастер</dt><dd>{master?.name ?? "Пока не выбран"}</dd></div><div><dt>Когда</dt><dd>{date ? longDate(date) : "Выберите дату"}{slot ? ` · ${slot.time}` : ""}</dd></div>
        {slot || totals.duration ? <div><dt>Длительность</dt><dd>{Math.round((slot?.duration ?? totals.duration ?? 0) / 60)} мин</dd></div> : null}</dl>
      {selectedServices.length ? <p className="visit-price" aria-live="polite"><span className="visit-price-label">Итого</span>{formatBookingPrice(totals)}</p> : null}<p className="booking-note">Оплата в барбершопе.</p>
      {resources.map((resource, index) => resource.error ? <div key={index} className="booking-error" role="alert"><p>{resource.error}</p><button type="button" onClick={resource.retry} disabled={busy}>Повторить загрузку</button></div> : null)}
      <div ref={status} tabIndex={-1} aria-live="polite">{message ? <p className="booking-error">{message}</p> : null}</div>
      {state === "unknown" ? <button className="book-button book-button-secondary" type="button" onClick={() => { if (submitted.current) void send(submitted.current); }}>Проверить подтверждение</button> : <button className="book-button book-button-primary" type="submit" disabled={!canSubmit || busy}>{state === "sending" ? "Подтверждаем запись…" : "Подтвердить запись"}</button>}
      <address>{business.address}<a href={"tel:" + business.phoneHref}>{business.phoneDisplay}</a></address>
      </div></div></div>
    </aside>
  </form>;
}

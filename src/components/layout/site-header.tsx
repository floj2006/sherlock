"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookButton } from "@/components/booking/book-button";
import { useBusiness } from "@/components/layout/business-provider";

const navigation = [
  { href: "/#about", label: "Барбершоп" }, { href: "/#services", label: "Услуги" },
  { href: "/#works", label: "Работы" }, { href: "/#masters", label: "Мастера" }, { href: "/#contacts", label: "Контакты" },
];
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const business = useBusiness();

  function closeMenu(href?: string) {
    if (closeTimer.current) return;
    setClosing(true);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setMenuOpen(false); setClosing(false);
      if (href) router.push(href);
    }, duration);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navigation.map(item => document.getElementById(item.href.slice(2))).filter((section): section is HTMLElement => !!section);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
        else setActiveSection(current => current === entry.target.id ? "" : current);
      }
    }, { rootMargin: "-15% 0px -65% 0px" });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const dialog = menuRef.current;
    if (!menuOpen || !dialog) return;
    const trigger = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", onResize);
    return () => {
      if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
      dialog.close();
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", onResize);
      trigger?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  return <header className={"site-header" + (scrolled || pathname !== "/" || menuOpen ? " is-solid" : "")}>
    <div className="section-shell header-row">
      <Link href="/" className="header-brand" aria-label="SHERLOCK — главная"><Image src={business.wordmarkImage} alt="SHERLOCK" width={2363} height={1261} sizes="132px" /></Link>
      <nav aria-label="Основная навигация" className="desktop-nav">
        {navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === "/" && activeSection === item.href.slice(2) ? "location" : undefined}>{item.label}</Link>)}
      </nav>
      <div className="header-book"><BookButton source="header" variant="secondary">Записаться</BookButton></div>
      <Link href="/account" className="header-account" aria-label="Личный кабинет" title="Личный кабинет"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></svg></Link>
      <button ref={toggleRef} id="menu-toggle" type="button" className="menu-toggle" aria-expanded={menuOpen} aria-haspopup="dialog" aria-controls="mobile-navigation" onClick={() => { setClosing(false); setMenuOpen(true); }}>Меню <span className="menu-toggle-icon" aria-hidden="true"><i /><i /></span></button>
    </div>
    <dialog ref={menuRef} id="mobile-navigation" className={"mobile-menu-dialog" + (closing ? " is-closing" : "")} aria-label="Меню SHERLOCK"
      onCancel={event => { event.preventDefault(); closeMenu(); }}
      onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')).filter(element => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
      <div className="section-shell mobile-menu-head"><span>SHERLOCK</span><button type="button" onClick={() => closeMenu()} autoFocus>Закрыть меню <span aria-hidden="true">×</span></button></div>
      <nav aria-label="Мобильная навигация" className="mobile-nav section-shell">
        {navigation.map((item, index) => <Link key={item.href} href={item.href} style={{ "--menu-index": index } as CSSProperties} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); closeMenu(item.href); } }}><span className="menu-link-label">{item.label}</span><span className="menu-link-number" aria-hidden="true">0{index + 1}</span></Link>)}
        <div className="mobile-menu-footer"><Link href="/account" onClick={event => { event.preventDefault(); closeMenu("/account"); }}>Личный кабинет <span aria-hidden="true">↗</span></Link><p>Мужской барбершоп · Мурино</p></div>
        <button type="button" className="book-button book-button-primary" onClick={() => closeMenu("/book?from=mobile_header")}>Записаться <span aria-hidden="true">↗</span></button>
      </nav>
    </dialog>
  </header>;
}

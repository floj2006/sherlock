"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookButton } from "./book-button";
export function StickyBookBar() {
 const pathname=usePathname();
 const [heroState, setHeroState] = useState({ pathname: "", visible: true });
 useEffect(() => {
  if (pathname !== "/") return;
  const hero = document.querySelector(".hero-poster");
  if (!hero) return;
  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 80;
  const observer = new IntersectionObserver(([entry]) => setHeroState({ pathname, visible: entry.isIntersecting }), { rootMargin: `-${headerHeight}px 0px 0px 0px` });
  observer.observe(hero);
  return () => observer.disconnect();
 }, [pathname]);
 const heroVisible = pathname === "/" && (heroState.pathname === pathname ? heroState.visible : true);
 if(pathname==="/book" || pathname==="/account") return null;
 return <div className="sticky-bookbar" data-visible={!heroVisible} aria-hidden={heroVisible} inert={heroVisible}><span>SHERLOCK<small>По записи</small></span><BookButton source="sticky_mobile">Записаться <span aria-hidden="true">↗</span></BookButton></div>;
}

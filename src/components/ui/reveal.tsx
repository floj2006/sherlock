"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || !("IntersectionObserver" in window) || preference.matches) return;
    // Never displace a block that is already visible when hydration finishes.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      animation = node.animate(
        [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 560, delay: Math.max(0, Math.min(delay, 120)), fill: "backwards", easing: "cubic-bezier(0.22,1,0.36,1)" },
      );
      observer.disconnect();
    }, { threshold: 0, rootMargin: "0px 0px 32px 0px" });
    const stopMotion = () => {
      if (preference.matches) { observer.disconnect(); animation?.cancel(); }
    };
    preference.addEventListener("change", stopMotion);
    observer.observe(node);
    return () => { observer.disconnect(); animation?.cancel(); preference.removeEventListener("change", stopMotion); };
  }, [delay]);
  return <div ref={ref} className={cn("reveal-section", className)}>{children}</div>;
}

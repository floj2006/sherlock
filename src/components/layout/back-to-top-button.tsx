"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      setVisible(window.scrollY > 680);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
      className={`fixed right-4 z-40 rounded-full border border-metal/30 bg-noir/88 px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-metal shadow-[0_20px_45px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-300 sm:right-6 lg:bottom-8 lg:right-8 ${
        visible
          ? "pointer-events-auto bottom-[calc(6.25rem+env(safe-area-inset-bottom))] translate-y-0 opacity-100"
          : "pointer-events-none bottom-[calc(5.5rem+env(safe-area-inset-bottom))] translate-y-4 opacity-0"
      }`}
    >
      Наверх
    </button>
  );
}

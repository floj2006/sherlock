"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      setVisible(current => window.scrollY > 720 ? true : window.scrollY < 560 ? false : current);
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
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Наверх"
      data-visible={visible}
      className="back-to-top"
    >
      Наверх
    </button>
  );
}

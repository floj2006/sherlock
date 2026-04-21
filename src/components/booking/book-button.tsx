"use client";

import { useBooking } from "@/components/booking/booking-provider";
import { cn } from "@/lib/utils";

type BookButtonProps = {
  children: React.ReactNode;
  className?: string;
  serviceSlug?: string;
  serviceSlugs?: string[];
  masterSlug?: string;
  source?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

export function BookButton({
  children,
  className,
  serviceSlug,
  serviceSlugs,
  masterSlug,
  source = "site",
  variant = "primary",
  onClick,
}: BookButtonProps) {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      data-analytics-event="book_click"
      data-analytics-label={source}
      onClick={() => {
        openBooking({ serviceSlug, serviceSlugs, masterSlug, source });
        onClick?.();
      }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em]",
        variant === "primary" &&
          "interactive-sheen border-metal bg-metal text-ink hover:border-metal-soft hover:bg-metal-soft",
        variant === "secondary" &&
          "border-line bg-white/3 text-cream hover:border-line-strong hover:bg-white/6",
        className,
      )}
    >
      {children}
    </button>
  );
}

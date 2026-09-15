"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <button
      type="button"
      data-analytics-event="book_click"
      data-analytics-label={source}
      onClick={() => {
        onClick?.();
        const query = new URLSearchParams({ from: source });
        const selectedServices = [...new Set([...(serviceSlug ? [serviceSlug] : []), ...(serviceSlugs ?? [])])];
        if (selectedServices.length === 1) query.set("service", selectedServices[0]);
        else if (selectedServices.length) query.set("services", selectedServices.join(","));
        if (masterSlug) query.set("master", masterSlug);
        router.push("/book?" + query.toString());
      }}
      className={cn(
        "book-button",
        variant === "primary" ? "book-button-primary" : "book-button-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

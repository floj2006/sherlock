"use client";

import { startTransition, useId, useState } from "react";
import { cn } from "@/lib/utils";

type DisclosurePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  openLabel?: string;
  closeLabel?: string;
  className?: string;
  contentClassName?: string;
};

type DisclosureItemProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  meta?: React.ReactNode;
  openLabel?: string;
  closeLabel?: string;
  className?: string;
  contentClassName?: string;
};

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border text-metal transition duration-300",
        open
          ? "border-metal bg-metal text-ink"
          : "border-line bg-white/[0.03] text-metal",
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className={cn("h-4 w-4 transition duration-300", open && "rotate-180")}
      >
        <path
          d="M5 8.25 10 13l5-4.75"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function DisclosurePanel({
  eyebrow,
  title,
  description,
  children,
  defaultOpen = false,
  stats,
  actions,
  openLabel = "Открыть",
  closeLabel = "Свернуть",
  className,
  contentClassName,
}: DisclosurePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("section-frame overflow-hidden", className)}>
      <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">
            {title}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          {stats}
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {actions}
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => {
                startTransition(() => {
                  setOpen((current) => !current);
                });
              }}
              className="inline-flex items-center gap-3 rounded-full border border-line bg-white/[0.03] px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream hover:border-line-strong hover:bg-white/[0.06]"
            >
              <span className="pl-2">{open ? closeLabel : openLabel}</span>
              <ToggleIcon open={open} />
            </button>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div id={panelId} className="overflow-hidden">
          <div
            className={cn(
              "border-t border-line p-3 transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-4",
              open ? "translate-y-0 blur-0" : "translate-y-4 blur-[4px]",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DisclosureItem({
  title,
  description,
  children,
  defaultOpen = false,
  meta,
  openLabel = "Открыть",
  closeLabel = "Свернуть",
  className,
  contentClassName,
}: DisclosureItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("border-b border-line last:border-b-0", className)}>
      <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-metal">
            {title}
          </p>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          {meta}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => {
              startTransition(() => {
                setOpen((current) => !current);
              });
            }}
            className="inline-flex items-center gap-3 rounded-full border border-line bg-white/[0.03] px-3 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-cream hover:border-line-strong hover:bg-white/[0.06]"
          >
            <span className="pl-2">{open ? closeLabel : openLabel}</span>
            <ToggleIcon open={open} />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div id={panelId} className="overflow-hidden">
          <div
            className={cn(
              "border-t border-line transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "translate-y-0 blur-0" : "translate-y-4 blur-[4px]",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

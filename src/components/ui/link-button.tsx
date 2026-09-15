import Link from "next/link";
import { cn } from "@/lib/utils";

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  target?: "_blank" | "_self";
  dataEvent?: string;
  dataLabel?: string;
};

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  target = "_self",
  dataEvent,
  dataLabel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
      data-analytics-event={dataEvent}
      data-analytics-label={dataLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.12em] uppercase",
        variant === "primary" &&
          "interactive-sheen border-metal bg-metal text-ink hover:border-metal-soft hover:bg-metal-soft",
        variant === "secondary" &&
          "border-line bg-white/3 text-cream hover:border-line-strong hover:bg-white/6",
        variant === "ghost" &&
          "border-transparent bg-transparent px-0 py-0 text-metal hover:text-metal-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}

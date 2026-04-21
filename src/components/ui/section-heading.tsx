import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <span className="eyebrow">{eyebrow}</span>
      <div className="golden-divider max-w-28" />
      <h2 className="section-title text-balance">{title}</h2>
      <p className="section-copy">{description}</p>
    </div>
  );
}

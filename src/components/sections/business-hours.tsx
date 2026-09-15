import { business } from "@/lib/site-data";

export function BusinessHours({ compact = false }: { compact?: boolean }) {
  return <div className={"business-hours" + (compact ? " business-hours-compact" : "")}>
    <p className="eyebrow">{compact ? "Ежедневно" : "Часы работы"}</p>
    <p className="business-hours-schedule">{compact ? business.hours : business.schedule}</p>
  </div>;
}

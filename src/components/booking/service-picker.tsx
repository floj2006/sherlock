"use client";

import { useId, useState } from "react";
import { formatBookingPrice, type BookingService } from "@/lib/booking-types";

export function ServicePicker({ services, selectedIds, onToggle }: {
  services: BookingService[];
  selectedIds: number[];
  onToggle: (id: number, origin?: DOMRect) => void;
}) {
  const categories = [...new Set(services.map(service => service.category))];
  const id = useId();
  const [expanded, setExpanded] = useState(() => categories.filter((category, index) =>
    index === 0 || services.some(service => service.category === category && selectedIds.includes(service.id))));

  return <div className="service-picker" role="group" aria-label="Выбор услуг" aria-describedby="service-picker-hint">
    <p id="service-picker-hint" className="booking-note">Можно выбрать несколько услуг за один визит.</p>
    {categories.map((category, index) => {
      const items = services.filter(service => service.category === category);
      const count = items.filter(service => selectedIds.includes(service.id)).length;
      const open = expanded.includes(category);
      return <section className="service-category" key={category} data-open={open}>
        <button type="button" className="service-category-toggle" aria-expanded={open} aria-controls={id + "-" + index}
          onClick={() => setExpanded(current => open ? current.filter(item => item !== category) : [...current, category])}><span>{category}</span><small>{count ? `Выбрано: ${count}` : items.length}</small></button>
        <div className="service-category-panel" id={id + "-" + index} inert={!open} aria-hidden={!open}><div className="service-category-inner">
        <div className="service-options">{items.map((service, itemIndex) => <div key={service.id} className="service-option-slot" style={{ transitionDelay: open && !selectedIds.includes(service.id) ? `${Math.min(itemIndex, 6) * 35}ms` : "0ms" }} data-selected={selectedIds.includes(service.id)} inert={selectedIds.includes(service.id)} aria-hidden={selectedIds.includes(service.id)}><div className="service-option-clip"><label className="service-option" data-selected={selectedIds.includes(service.id)}>
          <input type="checkbox" checked={selectedIds.includes(service.id)} onChange={event => {
            const origin = event.currentTarget.closest("label")?.getBoundingClientRect();
            // Keep keyboard focus in the category when this row leaves the list.
            event.currentTarget.closest("section")?.querySelector("button")?.focus({ preventScroll: true });
            onToggle(service.id, origin);
          }} aria-label={service.title} />
          <span className="service-option-copy"><span>{service.title}</span><small>{formatBookingPrice(service)}{service.duration ? ` · ${Math.round(service.duration / 60)} мин` : ""}</small></span>
          <span className="service-option-mark" aria-hidden="true">✓</span>
        </label></div></div>)}{count === items.length ? <p className="service-category-complete">Все услуги раздела — в вашем визите.</p> : null}</div>
        </div></div>
      </section>;
    })}
    <p className="service-picker-count" role="status">{selectedIds.length ? `В вашем визите: ${selectedIds.length}. Убрать услугу можно в составе записи.` : "Выберите хотя бы одну услугу"}</p>
  </div>;
}

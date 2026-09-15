"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { BookingMaster } from "@/lib/booking-types";

export function MasterPicker({ masters, value, disabled, placeholder, onChange }: {
  masters: BookingMaster[]; value: number; disabled: boolean; placeholder: string;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef({ text: "", time: 0 });
  const id = useId();
  const selected = masters.find(master => master.id === value);
  const expanded = open && !disabled;
  const activeIndex = Math.min(active, masters.length - 1);

  useEffect(() => {
    if (!expanded) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [expanded]);
  useEffect(() => {
    if (expanded) root.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [expanded, activeIndex]);

  function choose(master: BookingMaster) {
    onChange(master.id); setOpen(false); trigger.current?.focus({ preventScroll: true });
  }
  const portrait = (master: BookingMaster) => <span className="master-picker-avatar" aria-hidden="true">{master.image
    ? <Image src={master.image} alt="" width={48} height={48} unoptimized />
    : master.name.slice(0, 1)}</span>;

  return <div className="master-picker" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label id={id + "-label"} htmlFor="booking-master">Мастер</label>
    <button ref={trigger} id="booking-master" className="master-picker-trigger" type="button" role="combobox"
      aria-labelledby={id + "-label"} aria-describedby="booking-master-hint" aria-expanded={expanded} aria-controls={expanded ? id + "-list" : undefined}
      aria-haspopup="listbox" aria-activedescendant={expanded && activeIndex >= 0 ? id + "-option-" + activeIndex : undefined} disabled={disabled}
      onClick={() => { setActive(Math.max(0, masters.findIndex(master => master.id === value))); setOpen(!expanded); }}
      onKeyDown={event => {
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const current = expanded ? activeIndex : Math.max(0, masters.findIndex(master => master.id === value));
          setActive(event.key === "Home" ? 0 : event.key === "End" ? masters.length - 1 : !expanded ? current : (current + (event.key === "ArrowDown" ? 1 : -1) + masters.length) % masters.length);
          setOpen(true);
        } else if ((event.key === "Enter" || event.key === " ") && expanded) {
          event.preventDefault(); if (masters[activeIndex]) choose(masters[activeIndex]);
        } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
        else if (event.key === "Tab") setOpen(false);
        else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const text = (Date.now() - search.current.time < 700 ? search.current.text : "") + event.key.toLocaleLowerCase("ru");
          search.current = { text, time: Date.now() };
          const index = masters.findIndex(master => master.name.toLocaleLowerCase("ru").startsWith(text));
          if (index >= 0) { setActive(index); setOpen(true); }
        }
      }}>
      {selected ? <>{portrait(selected)}<span className="master-picker-copy">{selected.name}<small>{selected.role}</small></span></> : <span className="master-picker-copy">{placeholder}</span>}
      <svg className="master-picker-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m4 7 5 5 5-5" stroke="currentColor" strokeWidth="1.3" /></svg>
    </button>
    {expanded ? <ul id={id + "-list"} className="master-picker-list" role="listbox" aria-labelledby={id + "-label"}>
      {masters.map((master, index) => <li key={master.id} id={id + "-option-" + index} role="option" aria-selected={master.id === value} data-active={index === activeIndex}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(master)}>
        {portrait(master)}<span className="master-picker-copy">{master.name}<small>{master.role}</small></span><span className="master-picker-check" aria-hidden="true">{master.id === value ? "✓" : ""}</span>
      </li>)}
    </ul> : null}
  </div>;
}

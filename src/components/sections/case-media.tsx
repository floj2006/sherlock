"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

export type CaseMediaItem = { src?: string; video?: string; alt: string; label: string; caption?: string };

export function CaseMedia({ item, single = false }: { item: CaseMediaItem; single?: boolean }) {
  const [opened, setOpened] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!opened || !dialog.current) return;
    const modal = dialog.current;
    const button = trigger.current;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (button?.isConnected) button.focus({ preventScroll: true });
    };
  }, [opened]);

  return <figure className="case-media">
    <div className="case-media-stage">
      {item.video ? <video controls playsInline preload="metadata" aria-label={item.alt}><source src={item.video} /></video> : item.src ?
        <button ref={trigger} type="button" className="case-image-button" onClick={() => setOpened(true)} aria-label={"Увеличить: " + item.alt} aria-haspopup="dialog">
          <Image src={item.src} alt={item.alt} fill sizes={single ? "(min-width: 1024px) 52vw, 100vw" : "(min-width: 1024px) 27vw, 50vw"} />
          <span className="case-zoom" aria-hidden="true">↗</span>
        </button> : null}
    </div>
    <figcaption><span>{item.label}</span>{item.caption ? <small>{item.caption}</small> : null}</figcaption>
    {opened && item.src ? <dialog ref={dialog} className="photo-dialog" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); setOpened(false); }}
      onClick={event => { if (event.target === event.currentTarget) setOpened(false); }}
      onKeyDown={event => {
        if (event.key === "Tab") {
          event.preventDefault();
          event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}>
      <div className="photo-dialog-head"><p id={titleId}>{item.alt}</p><button type="button" onClick={() => setOpened(false)} aria-label="Закрыть фотографию" autoFocus>×</button></div>
      <div className="photo-dialog-image"><Image src={item.src} alt={item.alt} fill unoptimized className="object-contain" /></div>
    </dialog> : null}
  </figure>;
}

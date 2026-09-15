"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatBookingPrice, type BookingService } from "@/lib/booking-types";

export type ServiceFlight = { key: number; service: BookingService; from: DOMRect };
export function ServiceFlightEffect({ flight, onFinish }: { flight: ServiceFlight; onFinish: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const animation = ref.current?.animate([
      { opacity: .9, filter: "blur(0px)" },
      { opacity: .6, filter: "blur(6px)", offset: .4 },
      { opacity: 0, filter: "blur(22px)" },
    ], { duration: 650, easing: "ease-out", fill: "forwards" });
    if (animation) void animation.finished.then(onFinish).catch(() => {});
    return () => animation?.cancel();
  }, [flight, onFinish]);
  return createPortal(<div ref={ref} className="service-flight" style={{ width: flight.from.width, transform: `translate(${flight.from.x}px, ${flight.from.y}px)` }} aria-hidden="true">
    <span>{flight.service.title}</span><small>{formatBookingPrice(flight.service)}</small>
  </div>, document.body);
}

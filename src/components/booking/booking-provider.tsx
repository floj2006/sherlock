"use client";

import {
  createContext,
  startTransition,
  useContext,
  useMemo,
  useState,
} from "react";

type BookingState = {
  open: boolean;
  serviceSlugs: string[];
  masterSlug?: string;
  source?: string;
};

type OpenBookingPayload = {
  serviceSlug?: string;
  serviceSlugs?: string[];
  masterSlug?: string;
  source?: string;
};

type BookingContextValue = BookingState & {
  serviceSlug?: string;
  openBooking: (next: OpenBookingPayload) => void;
  closeBooking: () => void;
  toggleService: (serviceSlug: string) => void;
  clearServices: () => void;
  selectMaster: (masterSlug?: string) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function normalizeServiceSlugs(payload: {
  serviceSlug?: string;
  serviceSlugs?: string[];
}) {
  const ordered: string[] = [];

  if (payload.serviceSlug) {
    ordered.push(payload.serviceSlug);
  }

  for (const slug of payload.serviceSlugs ?? []) {
    if (slug && !ordered.includes(slug)) {
      ordered.push(slug);
    }
  }

  return ordered;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>({
    open: false,
    serviceSlugs: [],
  });

  const value = useMemo<BookingContextValue>(
    () => ({
      ...state,
      serviceSlug: state.serviceSlugs[0],
      openBooking(next) {
        startTransition(() => {
          setState({
            open: true,
            serviceSlugs: normalizeServiceSlugs(next),
            masterSlug: next.masterSlug,
            source: next.source,
          });
        });
      },
      closeBooking() {
        startTransition(() => {
          setState((prev) => ({ ...prev, open: false }));
        });
      },
      toggleService(serviceSlug) {
        startTransition(() => {
          setState((prev) => {
            const exists = prev.serviceSlugs.includes(serviceSlug);

            return {
              ...prev,
              serviceSlugs: exists
                ? prev.serviceSlugs.filter((slug) => slug !== serviceSlug)
                : [...prev.serviceSlugs, serviceSlug],
            };
          });
        });
      },
      clearServices() {
        startTransition(() => {
          setState((prev) => ({ ...prev, serviceSlugs: [] }));
        });
      },
      selectMaster(masterSlug) {
        startTransition(() => {
          setState((prev) => ({ ...prev, masterSlug }));
        });
      },
    }),
    [state],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const value = useContext(BookingContext);

  if (!value) {
    throw new Error("useBooking must be used inside BookingProvider");
  }

  return value;
}

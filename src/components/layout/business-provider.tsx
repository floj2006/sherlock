"use client";
import { createContext, useContext } from "react";
import type { BusinessProfile } from "@/lib/business-profile";
const BusinessContext = createContext<BusinessProfile | null>(null);
export function BusinessProvider({ value, children }: { value: BusinessProfile; children: React.ReactNode }) {
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}
export function useBusiness() {
  const value = useContext(BusinessContext);
  if (!value) throw new Error("BusinessProvider is required");
  return value;
}

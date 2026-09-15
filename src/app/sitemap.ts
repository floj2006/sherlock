import type { MetadataRoute } from "next";
import { getMastersWithYclientsStats } from "@/lib/yclients-reviews";
import { services } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const masters = await getMastersWithYclientsStats();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sherlock-murino.ru";
  const staticRoutes = [
    "",
    "/services",
    "/masters",
    "/works",
    "/offers",
    "/contacts",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
    })),
    ...masters.map((master) => ({
      url: `${base}/masters/${master.slug}`,
    })),
  ];
}

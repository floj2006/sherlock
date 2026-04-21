import type { MetadataRoute } from "next";
import { masters, services } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sherlock-murino.ru";
  const staticRoutes = [
    "",
    "/book",
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
      lastModified: new Date(),
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(),
    })),
    ...masters.map((master) => ({
      url: `${base}/masters/${master.slug}`,
      lastModified: new Date(),
    })),
  ];
}

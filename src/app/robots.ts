import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sherlock-murino.ru";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

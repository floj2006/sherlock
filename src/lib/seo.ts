import type { Metadata } from "next";
import { business } from "@/lib/site-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sherlock-murino.ru";

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createMetadata(input: MetadataInput = {}): Metadata {
  const title = input.title
    ? `${input.title} | ${business.name}`
    : `${business.name} | Премиальный барбершоп в Мурино`;
  const description = input.description ?? business.description;
  const path = input.path ?? "/";
  const image = input.image ?? business.heroImage;

  return {
    robots: input.noIndex ? { index: false, follow: true } : undefined,
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: business.legalName,
      locale: "ru_RU",
      type: "website",
      images: [
        {
          url: image,
          alt: business.legalName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function createLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "LocalBusiness"],
    name: business.legalName,
    description: business.description,
    image: new URL(business.heroImage, siteUrl).href,
    url: siteUrl,
    telephone: business.phoneHref,
    address: { "@type": "PostalAddress", streetAddress: "Екатерининская улица, 17", addressLocality: business.city, addressCountry: "RU" },
    sameAs: [business.mapUrl],
  };
}

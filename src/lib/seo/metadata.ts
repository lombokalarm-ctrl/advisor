import type { Metadata } from "next";

import { siteConfig } from "@/data/config/site";
import type { SeoFields } from "@/types/content";

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.domain).toString();
}

export function buildMetadata(input: SeoFields): Metadata {
  const url = absoluteUrl(input.path);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    metadataBase: new URL(siteConfig.domain),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

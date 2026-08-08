import type { Metadata } from "next";

import { siteConfig } from "@/data/config/site";
import type { SeoFields } from "@/types/content";

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.domain).toString();
}

export function buildMetadata(input: SeoFields): Metadata {
  const url = absoluteUrl(input.path);
  const type = input.type || "website";
  const images = input.image
    ? [
        {
          url: input.image,
          alt: input.title,
        },
      ]
    : undefined;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    metadataBase: new URL(siteConfig.domain),
    alternates: {
      canonical: url,
    },
    robots: input.robots,
    openGraph: {
      type,
      url,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

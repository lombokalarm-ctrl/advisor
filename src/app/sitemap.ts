import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/config/site";
import { getArticleSlugs, getDestinationSlugs, getPackageSlugs } from "@/lib/cms/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/paket-wisata-lombok",
    "/paket-honeymoon-lombok",
    "/sewa-mobil-lombok",
  ];

  const [packageSlugs, destinationSlugs, articleSlugs] = await Promise.all([
    getPackageSlugs(),
    getDestinationSlugs(),
    getArticleSlugs(),
  ]);

  const serviceRoutes = packageSlugs.map((slug) => `/${slug}`);
  const destinationRoutes = destinationSlugs.map((slug) => `/wisata/${slug}`);
  const articleRoutes = articleSlugs.map((slug) => `/blog/${slug}`);

  return [...new Set([...staticRoutes, ...serviceRoutes, ...destinationRoutes, ...articleRoutes])].map(
    (path) => ({
      url: `${siteConfig.domain}${path}`,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.8,
    }),
  );
}

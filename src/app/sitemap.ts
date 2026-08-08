import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/config/site";
import { getDestinationSlugs, getPackageSlugs, getPublishedArticles } from "@/lib/cms/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/blog",
    "/paket-wisata-lombok",
    "/paket-honeymoon-lombok",
    "/sewa-mobil-lombok",
  ];

  const [packageSlugs, destinationSlugs, articles] = await Promise.all([
    getPackageSlugs(),
    getDestinationSlugs(),
    getPublishedArticles(),
  ]);

  const serviceRoutes = packageSlugs.map((slug) => `/${slug}`);
  const destinationRoutes = destinationSlugs.map((slug) => `/wisata/${slug}`);
  const articleRoutes = articles.map((article) => ({
    path: `/blog/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt,
  }));

  const staticEntries = [...new Set([...staticRoutes, ...serviceRoutes, ...destinationRoutes])].map((path) => ({
    url: `${siteConfig.domain}${path}`,
    changeFrequency: path === "" ? "daily" : path === "/blog" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.8,
  }));

  const articleEntries = articleRoutes.map((route) => ({
    url: `${siteConfig.domain}${route.path}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    lastModified: route.lastModified ? new Date(route.lastModified) : undefined,
  }));

  return [...staticEntries, ...articleEntries];
}

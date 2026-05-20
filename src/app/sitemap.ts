import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/config/site";
import { articlePages, destinationPages, servicePages } from "@/data/seed/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/paket-wisata-lombok",
    "/paket-honeymoon-lombok",
    "/sewa-mobil-lombok",
  ];

  const serviceRoutes = Object.keys(servicePages).map((slug) => `/${slug}`);
  const destinationRoutes = Object.keys(destinationPages).map((slug) => `/wisata/${slug}`);
  const articleRoutes = Object.keys(articlePages).map((slug) => `/blog/${slug}`);

  return [...new Set([...staticRoutes, ...serviceRoutes, ...destinationRoutes, ...articleRoutes])].map(
    (path) => ({
      url: `${siteConfig.domain}${path}`,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.8,
    }),
  );
}

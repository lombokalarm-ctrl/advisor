import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.domain}/sitemap.xml`,
    host: siteConfig.domain,
  };
}

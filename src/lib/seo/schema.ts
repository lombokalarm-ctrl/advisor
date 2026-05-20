import { siteConfig } from "@/data/config/site";
import type { ArticleItem, DestinationItem, FaqItem, ServiceItem, TestimonialItem } from "@/types/content";

type SchemaNode = Record<string, unknown>;

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.domain).toString();
}

function imageUrls(input?: { url?: string } | Array<{ url?: string }> | null) {
  if (!input) {
    return undefined;
  }

  const items = Array.isArray(input) ? input : [input];
  const urls = items.map((item) => item.url).filter(Boolean);

  return urls.length ? urls : undefined;
}

function buildFaqSchema(faqs?: FaqItem[]) {
  if (!faqs?.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildHomePageSchemas(testimonials: TestimonialItem[] = []) {
  const review = testimonials.map((item) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: item.rating,
      bestRating: 5,
    },
    author: {
      "@type": "Person",
      name: item.customerName,
    },
    reviewBody: item.quote,
    name: item.tripType,
  }));

  const travelAgency: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    url: siteConfig.domain,
    description: siteConfig.description,
    telephone: `+${siteConfig.whatsappNumber}`,
    areaServed: ["Lombok", "Nusa Tenggara Barat", "Indonesia"],
    knowsAbout: ["Paket wisata Lombok", "Paket honeymoon Lombok", "Sewa mobil Lombok", "Destinasi wisata Lombok"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: `+${siteConfig.whatsappNumber}`,
      availableLanguage: ["id", "en"],
    },
  };

  if (review.length) {
    travelAgency.review = review;
  }

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.domain,
      inLanguage: "id-ID",
    },
    travelAgency,
  ];
}

export function buildServicePageSchemas(service: ServiceItem, path: string) {
  const serviceSchema: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.category || service.title,
    description: service.metaDescription || service.summary,
    url: absoluteUrl(path),
    areaServed: ["Lombok", "Nusa Tenggara Barat", "Indonesia"],
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.domain,
      telephone: `+${siteConfig.whatsappNumber}`,
    },
  };

  const images = imageUrls(service.mainImage || service.gallery);
  if (images) {
    serviceSchema.image = images;
  }

  return [
    serviceSchema,
    buildBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: service.title, path },
    ]),
    buildFaqSchema(service.faqs),
  ].filter(Boolean);
}

export function buildDestinationPageSchemas(destination: DestinationItem, path: string) {
  const destinationSchema: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.title || destination.name,
    description: destination.metaDescription || destination.summary,
    url: absoluteUrl(path),
    touristType: destination.category,
  };

  const images = imageUrls(destination.mainImage || destination.gallery);
  if (images) {
    destinationSchema.image = images;
  }

  return [
    destinationSchema,
    buildBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "Destinasi", path: "/wisata/gili-trawangan" },
      { name: destination.title || destination.name, path },
    ]),
    buildFaqSchema(destination.faqs),
  ].filter(Boolean);
}

export function buildArticlePageSchemas(article: ArticleItem, path: string) {
  const articleSchema: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description || article.excerpt,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    articleSection: article.category,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.domain,
    },
  };

  if (article.publishedAt) {
    articleSchema.datePublished = article.publishedAt;
  }

  const images = imageUrls(article.mainImage || article.gallery);
  if (images) {
    articleSchema.image = images;
  }

  return [
    articleSchema,
    buildBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "Blog", path: "/blog/tempat-wisata-di-lombok" },
      { name: article.title, path },
    ]),
    buildFaqSchema(article.faqs),
  ].filter(Boolean);
}

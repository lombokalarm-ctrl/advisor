import { siteConfig } from "@/data/config/site";
import type { ArticleItem, DestinationItem, FaqItem, ServiceItem, TestimonialItem } from "@/types/content";

type SchemaNode = Record<string, unknown>;
const organizationId = `${siteConfig.domain}/#organization`;
const websiteId = `${siteConfig.domain}/#website`;
const contactPointId = `${siteConfig.domain}/#contact`;

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

function buildContactPointSchema() {
  return {
    "@type": "ContactPoint",
    "@id": contactPointId,
    contactType: "customer support",
    url: absoluteUrl("/"),
    telephone: `+${siteConfig.whatsappNumber}`,
    email: siteConfig.email,
    areaServed: siteConfig.areaServed,
    availableLanguage: ["id", "en"],
  };
}

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.domain,
    email: siteConfig.email,
    telephone: `+${siteConfig.whatsappNumber}`,
    description: siteConfig.description,
    areaServed: siteConfig.areaServed,
    knowsAbout: ["Paket wisata Lombok", "Paket honeymoon Lombok", "Sewa mobil Lombok", "Destinasi wisata Lombok"],
    sameAs: [absoluteUrl("/"), siteConfig.domain],
    contactPoint: [buildContactPointSchema()],
  };
}

function buildTravelAgencySchema(testimonials: TestimonialItem[] = []) {
  const travelAgency: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteConfig.domain}/#travel-agency`,
    name: siteConfig.name,
    url: siteConfig.domain,
    description: siteConfig.description,
    telephone: `+${siteConfig.whatsappNumber}`,
    email: siteConfig.email,
    areaServed: siteConfig.areaServed,
    knowsAbout: ["Paket wisata Lombok", "Paket honeymoon Lombok", "Sewa mobil Lombok", "Destinasi wisata Lombok"],
    contactPoint: [buildContactPointSchema()],
    parentOrganization: {
      "@id": organizationId,
    },
  };

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

  if (review.length) {
    travelAgency.review = review;
  }

  return travelAgency;
}

export function buildHomePageSchemas(testimonials: TestimonialItem[] = []) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.domain,
      inLanguage: "id-ID",
      publisher: {
        "@id": organizationId,
      },
    },
    buildOrganizationSchema(),
    buildTravelAgencySchema(testimonials),
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
    areaServed: siteConfig.areaServed,
    provider: {
      "@id": organizationId,
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
    buildOrganizationSchema(),
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
      { name: destination.title || destination.name, path },
    ]),
    buildFaqSchema(destination.faqs),
    buildOrganizationSchema(),
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
      "@id": organizationId,
    },
    publisher: {
      "@id": organizationId,
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
      { name: article.title, path },
    ]),
    buildFaqSchema(article.faqs),
    buildOrganizationSchema(),
  ].filter(Boolean);
}

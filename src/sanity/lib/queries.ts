import { groq } from "next-sanity";

const imageFields = `
  alt,
  caption,
  "url": image.asset->url
`;

export const homePackagesQuery = groq`
  *[_type == "tourPackage"] | order(_createdAt desc)[0...3]{
    title,
    "slug": slug.current,
    "href": "/" + slug.current,
    category,
    "price": coalesce(priceLabel, "Hubungi kami"),
    "summary": summary,
    "bullets": coalesce(highlights, []),
    "mainImage": mainImage{${imageFields}},
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const homeDestinationsQuery = groq`
  *[_type == "destination"] | order(_createdAt desc)[0...4]{
    "name": title,
    title,
    "slug": slug.current,
    category,
    summary,
    highlight,
    "mainImage": mainImage{${imageFields}},
    "recommendations": coalesce(recommendations, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const homeArticlesQuery = groq`
  *[_type == "article"] | order(_createdAt desc)[0...3]{
    title,
    "slug": slug.current,
    category,
    excerpt,
    description,
    publishedAt,
    "mainImage": mainImage{${imageFields}},
    "relatedLinks": coalesce(relatedLinks, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const homeTestimonialsQuery = groq`
  *[_type == "testimonial" && featured == true] | order(_createdAt desc)[0...3]{
    customerName,
    location,
    tripType,
    quote,
    rating,
    featured
  }
`;

export const packageBySlugQuery = groq`
  *[_type == "tourPackage" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    category,
    "price": coalesce(priceLabel, "Hubungi kami"),
    "summary": summary,
    "bullets": coalesce(highlights, []),
    "mainImage": mainImage{${imageFields}},
    "gallery": coalesce(gallery[]{${imageFields}}, []),
    content,
    heroNote,
    "faqs": coalesce(faqs[]{question, answer}, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const destinationBySlugQuery = groq`
  *[_type == "destination" && slug.current == $slug][0]{
    "name": title,
    title,
    "slug": slug.current,
    category,
    summary,
    highlight,
    "mainImage": mainImage{${imageFields}},
    "gallery": coalesce(gallery[]{${imageFields}}, []),
    content,
    "faqs": coalesce(faqs[]{question, answer}, []),
    "recommendations": coalesce(recommendations, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    category,
    excerpt,
    description,
    publishedAt,
    "mainImage": mainImage{${imageFields}},
    "gallery": coalesce(gallery[]{${imageFields}}, []),
    content,
    "faqs": coalesce(faqs[]{question, answer}, []),
    "relatedLinks": coalesce(relatedLinks, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

export const packageSlugsQuery = groq`*[_type == "tourPackage" && defined(slug.current)].slug.current`;
export const destinationSlugsQuery = groq`*[_type == "destination" && defined(slug.current)].slug.current`;
export const articleSlugsQuery = groq`*[_type == "article" && defined(slug.current)].slug.current`;

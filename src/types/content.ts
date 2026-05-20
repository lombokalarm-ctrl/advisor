export type SeoFields = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export type PortableTextNode = {
  _key?: string;
  _type: string;
  [key: string]: unknown;
};

export type GalleryImage = {
  alt?: string;
  caption?: string;
  url?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type TestimonialItem = {
  customerName: string;
  location?: string;
  tripType: string;
  quote: string;
  rating: number;
  featured?: boolean;
};

export type CtaLink = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type ServiceItem = {
  title: string;
  href: string;
  slug?: string;
  category?: string;
  price: string;
  summary: string;
  bullets: string[];
  content?: PortableTextNode[];
  heroNote?: string;
  mainImage?: GalleryImage | null;
  gallery?: GalleryImage[];
  faqs?: FaqItem[];
  ctaMessage?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

export type DestinationItem = {
  title: string;
  name: string;
  slug: string;
  category: string;
  summary: string;
  highlight: string;
  content?: PortableTextNode[];
  mainImage?: GalleryImage | null;
  gallery?: GalleryImage[];
  faqs?: FaqItem[];
  recommendations?: string[];
  ctaMessage?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

export type ArticleItem = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  description?: string;
  content?: PortableTextNode[];
  mainImage?: GalleryImage | null;
  gallery?: GalleryImage[];
  faqs?: FaqItem[];
  publishedAt?: string;
  relatedLinks?: string[];
  ctaMessage?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

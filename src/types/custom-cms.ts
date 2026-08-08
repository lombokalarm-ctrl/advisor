import type { ArticleItem, FaqItem, GalleryImage, PortableTextNode } from "@/types/content";

export type CmsArticleStatus = "draft" | "published";

export type CmsArticleRecord = ArticleItem & {
  id: string;
  status: CmsArticleStatus;
  createdAt: string;
  updatedAt: string;
  legacyId?: string;
};

export type CmsArticleInput = {
  title: string;
  slug?: string;
  status?: CmsArticleStatus;
  category: string;
  excerpt: string;
  description?: string;
  publishedAt?: string;
  content?: PortableTextNode[];
  mainImage?: GalleryImage | null;
  gallery?: GalleryImage[];
  faqs?: FaqItem[];
  relatedLinks?: string[];
  ctaMessage?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

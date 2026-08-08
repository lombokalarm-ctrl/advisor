import type { ArticleItem, GalleryImage, PortableTextNode } from "@/types/content";

import { portableTextToPlainText } from "@/lib/custom-cms/content-utils";

const TITLE_MIN = 45;
const TITLE_MAX = 65;
const META_MIN = 120;
const META_MAX = 160;
const CONTENT_MIN_WORDS = 300;

type ArticleSeoInput = Pick<
  ArticleItem,
  "title" | "seoTitle" | "metaDescription" | "keywords" | "relatedLinks" | "publishedAt" | "mainImage" | "content" | "faqs"
> & {
  status?: string;
};

export type ArticleSeoAudit = {
  effectiveTitle: string;
  titleLength: number;
  metaLength: number;
  wordCount: number;
  readingTimeMinutes: number;
  blockers: string[];
  recommendations: string[];
};

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function hasImageAlt(image?: GalleryImage | null) {
  return Boolean(image?.url && image?.alt?.trim());
}

export function estimateArticleReadingTime(content?: PortableTextNode[]) {
  const plainText = portableTextToPlainText(content);
  const wordCount = countWords(plainText);
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return {
    plainText,
    wordCount,
    readingTimeMinutes,
  };
}

export function buildArticleSeoAudit(input: ArticleSeoInput): ArticleSeoAudit {
  const effectiveTitle = (input.seoTitle || input.title || "").trim();
  const metaDescription = input.metaDescription?.trim() || "";
  const keywords = (input.keywords || []).filter(Boolean);
  const relatedLinks = (input.relatedLinks || []).filter(Boolean);
  const { wordCount, readingTimeMinutes } = estimateArticleReadingTime(input.content);
  const blockers: string[] = [];
  const recommendations: string[] = [];

  if (input.status === "published") {
    if (!effectiveTitle) {
      blockers.push("SEO title wajib ada sebelum artikel dipublish.");
    }

    if (!metaDescription) {
      blockers.push("Meta description wajib diisi sebelum artikel dipublish.");
    }

    if (!input.publishedAt) {
      blockers.push("Tanggal publish wajib diisi untuk artikel published.");
    }

    if (!input.mainImage?.url) {
      blockers.push("Gambar utama wajib diisi untuk artikel published.");
    }

    if (input.mainImage?.url && !hasImageAlt(input.mainImage)) {
      blockers.push("Alt text gambar utama wajib diisi agar image SEO lebih kuat.");
    }

    if (wordCount < CONTENT_MIN_WORDS) {
      blockers.push(`Isi artikel terlalu tipis. Minimal target ${CONTENT_MIN_WORDS} kata untuk artikel published.`);
    }

    if (relatedLinks.length < 2) {
      blockers.push("Tambahkan minimal 2 internal link di related links sebelum publish.");
    }
  }

  if (effectiveTitle.length > 0 && (effectiveTitle.length < TITLE_MIN || effectiveTitle.length > TITLE_MAX)) {
    recommendations.push(`Panjang SEO title idealnya ${TITLE_MIN}-${TITLE_MAX} karakter.`);
  }

  if (metaDescription.length > 0 && (metaDescription.length < META_MIN || metaDescription.length > META_MAX)) {
    recommendations.push(`Meta description idealnya ${META_MIN}-${META_MAX} karakter.`);
  }

  if (keywords.length < 3) {
    recommendations.push("Tambahkan minimal 3 keyword turunan agar cluster artikel lebih jelas.");
  }

  if ((input.faqs || []).length < 2) {
    recommendations.push("Tambahkan minimal 2 FAQ untuk memperkuat intent dan schema FAQ.");
  }

  if (relatedLinks.length < 3) {
    recommendations.push("Tambahkan 3 internal link atau lebih untuk memperkuat crawl path.");
  }

  return {
    effectiveTitle,
    titleLength: effectiveTitle.length,
    metaLength: metaDescription.length,
    wordCount,
    readingTimeMinutes,
    blockers,
    recommendations,
  };
}

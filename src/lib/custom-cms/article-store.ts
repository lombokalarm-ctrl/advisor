import "server-only";

import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import type { ArticleItem, FaqItem, GalleryImage, PortableTextNode } from "@/types/content";
import { plainTextToPortableText, portableTextToPlainText } from "@/lib/custom-cms/content-utils";
import type { CmsArticleInput, CmsArticleRecord } from "@/types/custom-cms";

const STORAGE_DIR = path.join(process.cwd(), "storage", "custom-cms");
const SQLITE_PATH = path.join(STORAGE_DIR, "articles.sqlite");
const LEGACY_JSON_PATH = path.join(STORAGE_DIR, "articles.json");
const BACKUP_PATH = path.join(process.cwd(), "backups", "sanity-articles", "articles-custom-cms.latest.json");

const HOMEPAGE_PRIORITY_ARTICLE_SLUGS = [
  "harga-sewa-mobil-lombok",
  "paket-wisata-lombok-3-hari-2-malam",
  "honeymoon-gili-trawangan",
] as const;

type CmsArticleRow = {
  id: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  legacy_id: string | null;
  title: string;
  category: string;
  excerpt: string;
  description: string | null;
  content_json: string;
  main_image_json: string | null;
  gallery_json: string;
  faqs_json: string;
  related_links_json: string;
  cta_message: string | null;
  seo_title: string | null;
  meta_description: string | null;
  keywords_json: string;
};

let database: DatabaseSync | null = null;
let initialized = false;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function compactStrings(values: Array<string | undefined | null>) {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function normalizeFaqs(items?: FaqItem[]) {
  return (items || [])
    .map((item) => ({
      question: item.question?.trim() || "",
      answer: item.answer?.trim() || "",
    }))
    .filter((item) => item.question && item.answer);
}

function normalizeGallery(items?: GalleryImage[]) {
  return (items || [])
    .map((item) => ({
      url: item.url?.trim(),
      alt: item.alt?.trim(),
      caption: item.caption?.trim(),
    }))
    .filter((item) => item.url);
}

function normalizePortableContent(content?: PortableTextNode[]) {
  return Array.isArray(content) ? content : [];
}

function parseJsonField<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function sortByPublishedDate(items: CmsArticleRecord[]) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.publishedAt || left.updatedAt || left.createdAt).getTime();
    const rightDate = new Date(right.publishedAt || right.updatedAt || right.createdAt).getTime();

    return rightDate - leftDate;
  });
}

function sortHomepageArticles(items: ArticleItem[]) {
  return [...items].sort((left, right) => {
    const leftIndex = HOMEPAGE_PRIORITY_ARTICLE_SLUGS.indexOf(left.slug as (typeof HOMEPAGE_PRIORITY_ARTICLE_SLUGS)[number]);
    const rightIndex = HOMEPAGE_PRIORITY_ARTICLE_SLUGS.indexOf(right.slug as (typeof HOMEPAGE_PRIORITY_ARTICLE_SLUGS)[number]);

    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
}

function toCmsArticleRecord(article: Partial<CmsArticleRecord> & { title: string; slug: string; category: string; excerpt: string }): CmsArticleRecord {
  const now = new Date().toISOString();

  return {
    id: article.id || randomUUID(),
    status: article.status || "published",
    createdAt: article.createdAt || article.publishedAt || now,
    updatedAt: article.updatedAt || now,
    title: article.title.trim(),
    slug: slugify(article.slug),
    category: article.category.trim(),
    excerpt: article.excerpt.trim(),
    description: article.description?.trim() || undefined,
    content: normalizePortableContent(article.content),
    mainImage: article.mainImage?.url
      ? {
          url: article.mainImage.url.trim(),
          alt: article.mainImage.alt?.trim(),
          caption: article.mainImage.caption?.trim(),
        }
      : null,
    gallery: normalizeGallery(article.gallery),
    faqs: normalizeFaqs(article.faqs),
    publishedAt: article.publishedAt || undefined,
    relatedLinks: compactStrings(article.relatedLinks || []),
    ctaMessage: article.ctaMessage?.trim() || undefined,
    seoTitle: article.seoTitle?.trim() || undefined,
    metaDescription: article.metaDescription?.trim() || undefined,
    keywords: compactStrings(article.keywords || []),
    legacyId: article.legacyId,
  };
}

function ensureDatabase() {
  if (database) {
    return database;
  }

  fsSync.mkdirSync(STORAGE_DIR, { recursive: true });

  const db = new DatabaseSync(SQLITE_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cms_articles (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      legacy_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      description TEXT,
      content_json TEXT NOT NULL,
      main_image_json TEXT,
      gallery_json TEXT NOT NULL,
      faqs_json TEXT NOT NULL,
      related_links_json TEXT NOT NULL,
      cta_message TEXT,
      seo_title TEXT,
      meta_description TEXT,
      keywords_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON cms_articles(status);
    CREATE INDEX IF NOT EXISTS idx_cms_articles_published_at ON cms_articles(published_at);
  `);

  database = db;
  return db;
}

function rowToArticleRecord(row: CmsArticleRow): CmsArticleRecord {
  return toCmsArticleRecord({
    id: row.id,
    slug: row.slug,
    status: row.status === "published" ? "published" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || undefined,
    legacyId: row.legacy_id || undefined,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    description: row.description || undefined,
    content: parseJsonField(row.content_json, []),
    mainImage: parseJsonField(row.main_image_json, null),
    gallery: parseJsonField(row.gallery_json, []),
    faqs: parseJsonField(row.faqs_json, []),
    relatedLinks: parseJsonField(row.related_links_json, []),
    ctaMessage: row.cta_message || undefined,
    seoTitle: row.seo_title || undefined,
    metaDescription: row.meta_description || undefined,
    keywords: parseJsonField(row.keywords_json, []),
  });
}

function upsertArticleRecord(db: DatabaseSync, article: CmsArticleRecord) {
  db.prepare(`
    INSERT INTO cms_articles (
      id, slug, status, created_at, updated_at, published_at, legacy_id,
      title, category, excerpt, description, content_json, main_image_json,
      gallery_json, faqs_json, related_links_json, cta_message, seo_title,
      meta_description, keywords_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(slug) DO UPDATE SET
      id = excluded.id,
      status = excluded.status,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      published_at = excluded.published_at,
      legacy_id = excluded.legacy_id,
      title = excluded.title,
      category = excluded.category,
      excerpt = excluded.excerpt,
      description = excluded.description,
      content_json = excluded.content_json,
      main_image_json = excluded.main_image_json,
      gallery_json = excluded.gallery_json,
      faqs_json = excluded.faqs_json,
      related_links_json = excluded.related_links_json,
      cta_message = excluded.cta_message,
      seo_title = excluded.seo_title,
      meta_description = excluded.meta_description,
      keywords_json = excluded.keywords_json
  `).run(
    article.id,
    article.slug,
    article.status,
    article.createdAt,
    article.updatedAt,
    article.publishedAt || null,
    article.legacyId || null,
    article.title,
    article.category,
    article.excerpt,
    article.description || null,
    JSON.stringify(article.content || []),
    article.mainImage ? JSON.stringify(article.mainImage) : null,
    JSON.stringify(article.gallery || []),
    JSON.stringify(article.faqs || []),
    JSON.stringify(article.relatedLinks || []),
    article.ctaMessage || null,
    article.seoTitle || null,
    article.metaDescription || null,
    JSON.stringify(article.keywords || []),
  );
}

function runInTransaction(db: DatabaseSync, callback: () => void) {
  db.exec("BEGIN");

  try {
    callback();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function initializeArticleStore() {
  if (initialized) {
    return readStoreFromDatabase();
  }

  const db = ensureDatabase();
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM cms_articles").get() as { count: number };

  if (countRow.count === 0) {
    const legacyJson = await readJsonFile<CmsArticleRecord[]>(LEGACY_JSON_PATH);
    const backup = legacyJson?.length
      ? legacyJson
      : await readJsonFile<Array<ArticleItem & { legacyId?: string; createdAt?: string; updatedAt?: string }>>(BACKUP_PATH);

    const imported = (backup || []).map((item) =>
      toCmsArticleRecord({
        id: "id" in item && item.id ? item.id : item.legacyId || randomUUID(),
        status: "status" in item && item.status === "draft" ? "draft" : "published",
        createdAt: "createdAt" in item ? item.createdAt : undefined,
        updatedAt: "updatedAt" in item ? item.updatedAt : undefined,
        legacyId: "legacyId" in item ? item.legacyId : undefined,
        title: item.title,
        slug: item.slug,
        category: item.category,
        excerpt: item.excerpt,
        description: item.description,
        content: item.content,
        mainImage: item.mainImage || null,
        gallery: item.gallery || [],
        faqs: item.faqs || [],
        publishedAt: item.publishedAt,
        relatedLinks: item.relatedLinks || [],
        ctaMessage: item.ctaMessage,
        seoTitle: item.seoTitle,
        metaDescription: item.metaDescription,
        keywords: item.keywords || [],
      }),
    );

    runInTransaction(db, () => {
      for (const record of sortByPublishedDate(imported)) {
        upsertArticleRecord(db, record);
      }
    });
  }

  initialized = true;
  return readStoreFromDatabase();
}

function readStoreFromDatabase() {
  const db = ensureDatabase();
  const rows = db.prepare(`
    SELECT
      id, slug, status, created_at, updated_at, published_at, legacy_id,
      title, category, excerpt, description, content_json, main_image_json,
      gallery_json, faqs_json, related_links_json, cta_message, seo_title,
      meta_description, keywords_json
    FROM cms_articles
    ORDER BY COALESCE(published_at, updated_at, created_at) DESC
  `).all() as CmsArticleRow[];

  return rows.map(rowToArticleRecord);
}

async function readStore() {
  await initializeArticleStore();
  return readStoreFromDatabase();
}

export async function getAllCmsArticles() {
  return sortByPublishedDate(await readStore());
}

export async function getPublishedCmsArticles() {
  return sortByPublishedDate((await readStore()).filter((item) => item.status === "published"));
}

export async function getHomepageCmsArticles() {
  const published = await getPublishedCmsArticles();
  const prioritized = sortHomepageArticles(published);
  return prioritized.slice(0, 3);
}

export async function getCmsArticleBySlug(slug: string, options?: { includeDraft?: boolean }) {
  const normalizedSlug = slugify(slug);
  const items = await readStore();

  return (
    items.find((item) => item.slug === normalizedSlug && (options?.includeDraft ? true : item.status === "published")) || null
  );
}

export async function getCmsArticleSlugs() {
  const items = await getPublishedCmsArticles();
  return items.map((item) => item.slug);
}

export async function saveCmsArticle(input: CmsArticleInput & { currentSlug?: string }) {
  const items = await readStore();
  const db = ensureDatabase();
  const resolvedSlug = slugify(input.slug || input.title);
  const lookupSlug = input.currentSlug ? slugify(input.currentSlug) : resolvedSlug;
  const existing = items.find((item) => item.slug === lookupSlug);
  const hasConflictingSlug = items.some((item) => item.slug === resolvedSlug && item.slug !== lookupSlug);

  if (hasConflictingSlug) {
    throw new Error("Slug artikel sudah digunakan.");
  }

  const record = toCmsArticleRecord({
    ...existing,
    title: input.title,
    slug: resolvedSlug,
    category: input.category,
    excerpt: input.excerpt,
    description: input.description,
    content: input.content,
    mainImage: input.mainImage,
    gallery: input.gallery,
    faqs: input.faqs,
    publishedAt: input.publishedAt,
    relatedLinks: input.relatedLinks,
    ctaMessage: input.ctaMessage,
    seoTitle: input.seoTitle,
    metaDescription: input.metaDescription,
    keywords: input.keywords,
    status: input.status || existing?.status || "draft",
    createdAt: existing?.createdAt,
    updatedAt: new Date().toISOString(),
    legacyId: existing?.legacyId,
  });

  if (existing && existing.slug !== resolvedSlug) {
    db.prepare("DELETE FROM cms_articles WHERE slug = ?").run(existing.slug);
  }

  upsertArticleRecord(db, record);

  return record;
}

export async function deleteCmsArticle(slug: string) {
  const normalizedSlug = slugify(slug);
  await initializeArticleStore();
  const db = ensureDatabase();
  const result = db.prepare("DELETE FROM cms_articles WHERE slug = ?").run(normalizedSlug);
  return result.changes > 0;
}

export { plainTextToPortableText, portableTextToPlainText };

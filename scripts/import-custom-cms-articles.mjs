import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const sourcePath = path.join(process.cwd(), "backups", "sanity-articles", "articles-custom-cms.latest.json");
const targetDir = path.join(process.cwd(), "storage", "custom-cms");
const targetPath = path.join(targetDir, "articles.sqlite");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function compactStrings(values) {
  return (Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean);
}

function toRecord(item) {
  const now = new Date().toISOString();

  return {
    id: item.legacyId || randomUUID(),
    legacyId: item.legacyId || undefined,
    status: "published",
    createdAt: item.createdAt || item.publishedAt || now,
    updatedAt: item.updatedAt || now,
    title: String(item.title || "").trim(),
    slug: slugify(item.slug || item.title),
    category: String(item.category || "Artikel").trim(),
    excerpt: String(item.excerpt || "").trim(),
    description: item.description?.trim() || undefined,
    publishedAt: item.publishedAt || undefined,
    content: Array.isArray(item.content) ? item.content : [],
    mainImage: item.mainImage?.url
      ? {
          url: String(item.mainImage.url).trim(),
          alt: item.mainImage.alt?.trim() || undefined,
          caption: item.mainImage.caption?.trim() || undefined,
        }
      : null,
    gallery: (Array.isArray(item.gallery) ? item.gallery : [])
      .map((galleryItem) => ({
        url: galleryItem.url?.trim(),
        alt: galleryItem.alt?.trim() || undefined,
        caption: galleryItem.caption?.trim() || undefined,
      }))
      .filter((galleryItem) => galleryItem.url),
    faqs: (Array.isArray(item.faqs) ? item.faqs : [])
      .map((faq) => ({
        question: String(faq.question || "").trim(),
        answer: String(faq.answer || "").trim(),
      }))
      .filter((faq) => faq.question && faq.answer),
    relatedLinks: compactStrings(item.relatedLinks),
    ctaMessage: item.ctaMessage?.trim() || undefined,
    seoTitle: item.seoTitle?.trim() || undefined,
    metaDescription: item.metaDescription?.trim() || undefined,
    keywords: compactStrings(item.keywords),
  };
}

function ensureDatabase() {
  fs.mkdirSync(targetDir, { recursive: true });

  const db = new DatabaseSync(targetPath);
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
  `);

  return db;
}

function writeRecord(db, article) {
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

function runInTransaction(db, callback) {
  db.exec("BEGIN");

  try {
    callback();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function run() {
  const sourceRaw = await fsp.readFile(sourcePath, "utf8");
  const source = JSON.parse(sourceRaw);

  if (!Array.isArray(source) || !source.length) {
    throw new Error("Backup artikel Sanity kosong atau tidak valid.");
  }

  const records = source.map(toRecord);
  const db = ensureDatabase();

  runInTransaction(db, () => {
    db.exec("DELETE FROM cms_articles;");
    for (const item of records) {
      writeRecord(db, item);
    }
  });

  console.log(`Import CMS custom selesai: ${records.length} artikel.`);
  console.log(`- Target: ${path.relative(process.cwd(), targetPath)}`);
}

run().catch((error) => {
  console.error("Import CMS custom gagal.");
  console.error(error);
  process.exit(1);
});

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const envFiles = [".env.local", ".env"];

if (typeof process.loadEnvFile === "function") {
  for (const envFile of envFiles) {
    try {
      process.loadEnvFile(envFile);
    } catch {
      // Abaikan jika file env tidak ada.
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "994q6d0j";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-19";

const outputDir = path.join(process.cwd(), "backups", "sanity-articles");
const rawOutputPath = path.join(outputDir, "articles-raw.latest.json");
const normalizedOutputPath = path.join(outputDir, "articles-custom-cms.latest.json");
const manifestPath = path.join(outputDir, "manifest.latest.json");

function createTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    "-",
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
    pad(now.getUTCSeconds()),
  ].join("");
}

async function fetchQuery(query) {
  const params = new URLSearchParams({ query });
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gagal fetch Sanity (${response.status}): ${body}`);
  }

  const payload = await response.json();
  return payload.result || [];
}

const rawQuery = `
  *[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    slug,
    category,
    excerpt,
    description,
    publishedAt,
    mainImage,
    gallery,
    content,
    faqs,
    relatedLinks,
    ctaMessage,
    seoTitle,
    metaDescription,
    keywords
  }
`;

const normalizedQuery = `
  *[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) {
    "legacyId": _id,
    "legacyType": _type,
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
    title,
    "slug": slug.current,
    category,
    excerpt,
    description,
    publishedAt,
    "mainImage": select(
      defined(mainImage.image.asset) => {
        alt,
        caption,
        "assetId": mainImage.image.asset->_id,
        "url": mainImage.image.asset->url
      },
      null
    ),
    "gallery": coalesce(
      gallery[]{
        alt,
        caption,
        "assetId": image.asset->_id,
        "url": image.asset->url
      },
      []
    ),
    "content": coalesce(
      content[]{
        ...,
        markDefs[]{
          ...,
          href
        },
        children[]{
          ...,
          text,
          marks
        },
        "assetId": select(_type == "image" => asset->_id, null),
        "url": select(_type == "image" => asset->url, null)
      },
      []
    ),
    "faqs": coalesce(
      faqs[]{
        question,
        answer
      },
      []
    ),
    "relatedLinks": coalesce(relatedLinks, []),
    ctaMessage,
    seoTitle,
    metaDescription,
    "keywords": coalesce(keywords, [])
  }
`;

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function run() {
  await fs.mkdir(outputDir, { recursive: true });

  const [rawArticles, normalizedArticles] = await Promise.all([
    fetchQuery(rawQuery),
    fetchQuery(normalizedQuery),
  ]);

  const timestamp = createTimestamp();
  const rawArchivePath = path.join(outputDir, `articles-raw.${timestamp}.json`);
  const normalizedArchivePath = path.join(outputDir, `articles-custom-cms.${timestamp}.json`);
  const manifest = {
    exportedAt: new Date().toISOString(),
    source: {
      provider: "sanity",
      projectId,
      dataset,
      apiVersion,
      accessMode: "public-read",
    },
    counts: {
      rawArticles: rawArticles.length,
      normalizedArticles: normalizedArticles.length,
    },
    files: {
      rawLatest: path.relative(process.cwd(), rawOutputPath),
      rawArchive: path.relative(process.cwd(), rawArchivePath),
      normalizedLatest: path.relative(process.cwd(), normalizedOutputPath),
      normalizedArchive: path.relative(process.cwd(), normalizedArchivePath),
    },
    notes: [
      "articles-raw menyimpan snapshot struktur Sanity untuk rollback atau referensi migrasi.",
      "articles-custom-cms menyimpan field yang sudah dinormalisasi agar mudah diimpor ke backend CMS custom.",
      "content tetap dipertahankan sebagai Portable Text agar migrasi bisa dilakukan bertahap tanpa kehilangan body artikel.",
    ],
  };

  await Promise.all([
    writeJson(rawOutputPath, rawArticles),
    writeJson(rawArchivePath, rawArticles),
    writeJson(normalizedOutputPath, normalizedArticles),
    writeJson(normalizedArchivePath, normalizedArticles),
    writeJson(manifestPath, manifest),
  ]);

  console.log(`Export artikel Sanity selesai: ${normalizedArticles.length} artikel.`);
  console.log(`- Raw latest: ${path.relative(process.cwd(), rawOutputPath)}`);
  console.log(`- Normalized latest: ${path.relative(process.cwd(), normalizedOutputPath)}`);
  console.log(`- Manifest: ${path.relative(process.cwd(), manifestPath)}`);
}

run().catch((error) => {
  console.error("Export artikel Sanity gagal.");
  console.error(error);
  process.exit(1);
});

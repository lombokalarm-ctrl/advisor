import { Buffer } from "node:buffer";
import process from "node:process";

import { createClient } from "@sanity/client";

const envFiles = [".env.local", ".env"];

if (typeof process.loadEnvFile === "function") {
  for (const envFile of envFiles) {
    try {
      process.loadEnvFile(envFile);
    } catch {
      // Ignore missing env files. The script validates required variables below.
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-19";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    [
      "Seed Sanity dibatalkan karena env belum lengkap.",
      "Pastikan file .env.local berisi:",
      "- NEXT_PUBLIC_SANITY_PROJECT_ID",
      "- NEXT_PUBLIC_SANITY_DATASET",
      "- SANITY_API_WRITE_TOKEN",
    ].join("\n"),
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const assetCache = new Map();
const MIN_AI_IMAGE_BYTES = 60_000;
const MAX_AI_IMAGE_ATTEMPTS = 8;
const AI_IMAGE_RETRY_DELAY_MS = 8_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toKey(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createTextBlock(text, { key, style = "normal", listItem, level } = {}) {
  return {
    _key: key,
    _type: "block",
    style,
    ...(listItem ? { listItem } : {}),
    ...(level ? { level } : {}),
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function createLinkedTextBlock(segments, { key, style = "normal", listItem, level } = {}) {
  const markDefs = [];
  const children = segments.map((segment, index) => {
    const markKey = segment.href ? `${key}-mark-${index}` : undefined;

    if (segment.href && markKey) {
      markDefs.push({
        _key: markKey,
        _type: "link",
        href: segment.href,
      });
    }

    return {
      _key: `${key}-span-${index}`,
      _type: "span",
      marks: markKey ? [markKey] : [],
      text: segment.text,
    };
  });

  return {
    _key: key,
    _type: "block",
    style,
    ...(listItem ? { listItem } : {}),
    ...(level ? { level } : {}),
    markDefs,
    children,
  };
}

function normalBlock(text, key) {
  return createTextBlock(text, { key, style: "normal" });
}

function linkedNormalBlock(segments, key) {
  return createLinkedTextBlock(segments, { key, style: "normal" });
}

function headingBlock(text, style, key) {
  return createTextBlock(text, { key, style });
}

function bulletBlock(text, key) {
  return createTextBlock(text, { key, listItem: "bullet", level: 1 });
}

function quoteBlock(text, key) {
  return createTextBlock(text, { key, style: "blockquote" });
}

function imageBlock(assetId, alt, key) {
  return {
    _key: key,
    _type: "image",
    alt,
    asset: {
      _type: "reference",
      _ref: assetId,
    },
  };
}

function faq(question, answer) {
  return {
    _key: `faq-${toKey(question)}`,
    _type: "faqItem",
    question,
    answer,
  };
}

function galleryImageFromAsset(assetId, alt, caption) {
  return {
    _type: "galleryImage",
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetId,
      },
    },
    alt,
    caption,
  };
}

const seedVisuals = {
  "tour-package-paket-wisata-lombok": {
    accent: "#11b6a3",
    background: "#062f3c",
    detail: "Island hopping and private trip",
  },
  "tour-package-paket-honeymoon-lombok": {
    accent: "#ff8fab",
    background: "#3f1f39",
    detail: "Romantic escape and villa stay",
  },
  "tour-package-sewa-mobil-lombok": {
    accent: "#f4b400",
    background: "#1f2937",
    detail: "Airport transfer and driver service",
  },
  "destination-gili-trawangan": {
    accent: "#4cc9f0",
    background: "#0c3b5e",
    detail: "Snorkeling, sunset, and island life",
  },
  "destination-kuta-mandalika": {
    accent: "#ffb703",
    background: "#4f2d16",
    detail: "South coast and lifestyle escape",
  },
  "destination-senggigi": {
    accent: "#b8de6f",
    background: "#244b3c",
    detail: "Classic sunset and hotel basecamp",
  },
  "article-tempat-wisata-di-lombok": {
    accent: "#8ecae6",
    background: "#1d3557",
    detail: "Evergreen guide for first timers",
  },
  "article-harga-sewa-mobil-lombok": {
    accent: "#ffd166",
    background: "#2b2d42",
    detail: "Pricing guide and fleet tips",
  },
  "article-itinerary-lombok-3-hari": {
    accent: "#90be6d",
    background: "#264653",
    detail: "Efficient route for 3D2N trips",
  },
  "article-paket-wisata-lombok-murah": {
    accent: "#f4b400",
    background: "#3a2f1c",
    detail: "Value package for practical trips",
  },
  "article-tour-lombok-3-hari-2-malam": {
    accent: "#43aa8b",
    background: "#173f35",
    detail: "Popular 3D2N commercial route",
  },
  "article-trip-gili-trawangan": {
    accent: "#4cc9f0",
    background: "#0b3551",
    detail: "Access, snorkeling, and island tips",
  },
  "article-paket-wisata-lombok-dari-jakarta": {
    accent: "#ffb703",
    background: "#4d2d10",
    detail: "Local intent for Jakarta travelers",
  },
  "article-rental-mobil-lombok-murah": {
    accent: "#ffd166",
    background: "#252b42",
    detail: "Budget-friendly transport planning",
  },
  "article-tempat-wisata-di-lombok-selain-gili": {
    accent: "#8ecae6",
    background: "#1e3a5f",
    detail: "Alternative destinations beyond Gili",
  },
  "article-paket-honeymoon-lombok-murah": {
    accent: "#ff8fab",
    background: "#4a2238",
    detail: "Affordable romantic Lombok getaway",
  },
  "article-sewa-mobil-lombok-plus-driver": {
    accent: "#ffd166",
    background: "#223047",
    detail: "Private driver and flexible transport",
  },
  "article-paket-wisata-lombok-4-hari-3-malam": {
    accent: "#43aa8b",
    background: "#163a36",
    detail: "Longer 4D3N Lombok itinerary",
  },
  "article-wisata-kuta-lombok": {
    accent: "#ffb703",
    background: "#4b2a14",
    detail: "South coast beaches and sunset views",
  },
  "article-paket-wisata-lombok-dari-surabaya": {
    accent: "#90be6d",
    background: "#244238",
    detail: "Local intent for Surabaya travelers",
  },
  "article-tour-gili-trawangan-dari-lombok": {
    accent: "#4cc9f0",
    background: "#123b58",
    detail: "Gili tour access and island activity",
  },
  "article-paket-wisata-lombok-3-hari-2-malam": {
    accent: "#43aa8b",
    background: "#193b39",
    detail: "Efficient 3D2N commercial package",
  },
  "article-paket-wisata-lombok-2-hari-1-malam": {
    accent: "#90be6d",
    background: "#274032",
    detail: "Short escape and practical itinerary",
  },
  "article-sewa-mobil-bandara-lombok": {
    accent: "#ffd166",
    background: "#22354a",
    detail: "Airport pickup and direct transfer",
  },
  "article-honeymoon-gili-trawangan": {
    accent: "#ff8fab",
    background: "#4a2742",
    detail: "Romantic island stay and sunset",
  },
  "article-wisata-senggigi-lombok": {
    accent: "#b8de6f",
    background: "#244b3c",
    detail: "Sunset coast and hotel basecamp",
  },
  "article-wisata-pink-beach-lombok": {
    accent: "#8ecae6",
    background: "#3d2848",
    detail: "East coast hidden gem experience",
  },
  "article-rental-hiace-lombok": {
    accent: "#ffd166",
    background: "#24364a",
    detail: "Large group transport and airport transfer",
  },
  "article-sewa-mobil-lombok-dengan-driver": {
    accent: "#ffd166",
    background: "#24354a",
    detail: "Driver service and practical island travel",
  },
  "article-harga-paket-wisata-lombok-3-hari-2-malam": {
    accent: "#43aa8b",
    background: "#183a37",
    detail: "3D2N pricing guide and itinerary overview",
  },
  "article-sewa-alphard-lombok": {
    accent: "#f4b400",
    background: "#2e2b38",
    detail: "Premium comfort and VIP transport",
  },
  "article-paket-wisata-lombok-dari-bandung": {
    accent: "#90be6d",
    background: "#284037",
    detail: "Local intent for Bandung travelers",
  },
  "article-tour-lombok-dari-bali": {
    accent: "#43aa8b",
    background: "#183a3c",
    detail: "Cross-island practical Lombok trip",
  },
  "article-wisata-bukit-merese-lombok": {
    accent: "#ffb703",
    background: "#4a3017",
    detail: "Sunset hill and south coast panorama",
  },
  "article-wisata-rinjani-lombok": {
    accent: "#8ecae6",
    background: "#20394a",
    detail: "Mountain view and nature adventure",
  },
  "article-sewa-fortuner-lombok": {
    accent: "#ffd166",
    background: "#2c3344",
    detail: "Premium SUV trip and flexible comfort",
  },
  "article-sewa-avanza-lombok": {
    accent: "#f4e285",
    background: "#243342",
    detail: "Practical family transport and city tour",
  },
  "article-paket-tour-lombok-murah": {
    accent: "#90be6d",
    background: "#234235",
    detail: "Value package with realistic itinerary",
  },
  "article-open-trip-lombok": {
    accent: "#43aa8b",
    background: "#173c37",
    detail: "Shared trip and efficient budget travel",
  },
  "article-wisata-desa-sade-lombok": {
    accent: "#ffb703",
    background: "#4a2e16",
    detail: "Sasak culture and local village visit",
  },
  "article-wisata-tanjung-aan-lombok": {
    accent: "#4cc9f0",
    background: "#153950",
    detail: "South coast beach and relaxed short escape",
  },
};

const aiSeedImages = {
  "article-harga-sewa-mobil-lombok": {
    hero: {
      imageSize: "landscape_16_9",
      prompt:
        "realistic premium travel editorial photo, modern silver family car parked at a scenic Lombok coastal road overlook, turquoise sea and green hills in background, bright tropical daylight, clean composition with luxury travel mood, no text, no watermark, high detail",
    },
    "gallery-1": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel photo of airport pickup in Lombok, professional driver standing beside a clean white car near a tropical arrival area, warm daylight, premium service feeling, elegant composition, no text, no watermark",
    },
    "gallery-2": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel lifestyle photo, couple and family enjoying a private Lombok road trip with a comfortable rental car near scenic beach cliffs, tropical blue sky, premium tourism atmosphere, no text, no watermark",
    },
  },
  "article-sewa-mobil-lombok-dengan-driver": {
    hero: {
      imageSize: "landscape_16_9",
      prompt:
        "realistic premium transport photo in Lombok, friendly local driver opening the door of a clean black SUV for travelers, tropical resort entrance, bright daylight, luxury service atmosphere, no text, no watermark",
    },
    "gallery-1": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel photo, comfortable private car with driver on a Lombok coastal route, passengers relaxing inside during sightseeing, cinematic daylight, premium tourism style, no text, no watermark",
    },
    "gallery-2": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic family trip photo in Lombok, spacious rental car with driver near a beach viewpoint, luggage neatly arranged, clean tropical setting, natural colors, no text, no watermark",
    },
  },
  "article-paket-wisata-lombok-3-hari-2-malam": {
    hero: {
      imageSize: "landscape_16_9",
      prompt:
        "realistic premium travel editorial image of a 3 day 2 night Lombok vacation, travelers enjoying turquoise beach and dramatic hills at Kuta Lombok, bright tropical weather, elegant tourism atmosphere, no text, no watermark",
    },
    "gallery-1": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel photo of island hopping in Lombok, visitors arriving at a beautiful Gili pier with crystal clear water and small boats, premium holiday mood, no text, no watermark",
    },
    "gallery-2": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel image, couple and family watching sunset from a scenic Lombok hill during a curated vacation itinerary, warm golden hour, premium tourism feel, no text, no watermark",
    },
  },
  "article-harga-paket-wisata-lombok-3-hari-2-malam": {
    hero: {
      imageSize: "landscape_16_9",
      prompt:
        "realistic editorial travel image for Lombok package pricing guide, travelers enjoying a balanced itinerary with beach, hills and comfortable transport in Lombok, premium vacation look, tropical daylight, no text, no watermark",
    },
    "gallery-1": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic travel planning scene in Lombok, happy tourists checking itinerary while looking at ocean view from a stylish resort terrace, premium tour planning atmosphere, no text, no watermark",
    },
    "gallery-2": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic tourism photo in Lombok, guided day trip with comfortable car near iconic beach and hill scenery, polished travel brand style, tropical sunlight, no text, no watermark",
    },
  },
  "article-honeymoon-gili-trawangan": {
    hero: {
      imageSize: "landscape_16_9",
      prompt:
        "realistic luxury honeymoon photo on Gili Trawangan, romantic couple walking on white sand beach at sunset with turquoise sea and elegant island resort mood, premium travel editorial style, no text, no watermark",
    },
    "gallery-1": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic romantic island dinner on Gili Trawangan beach, couple table setup with lanterns and sunset sky, premium honeymoon atmosphere, tasteful travel photography, no text, no watermark",
    },
    "gallery-2": {
      imageSize: "landscape_16_9",
      prompt:
        "realistic honeymoon travel photo, couple cycling along tropical beach path on Gili Trawangan with soft morning light, premium island getaway mood, no text, no watermark",
    },
  },
};

function createAiImageUrl(prompt, imageSize) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

function isLikelyGeneratingPlaceholder(contentType, imageBuffer) {
  if (!contentType || !contentType.startsWith("image/")) {
    return true;
  }

  return imageBuffer.length < MIN_AI_IMAGE_BYTES;
}

async function fetchAiImageBuffer(prompt, imageSize, filename) {
  for (let attempt = 1; attempt <= MAX_AI_IMAGE_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${createAiImageUrl(prompt, imageSize)}&attempt=${attempt}`);

    if (!response.ok) {
      throw new Error(`Gagal generate image AI ${filename}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    if (!isLikelyGeneratingPlaceholder(contentType, imageBuffer)) {
      return { contentType, imageBuffer };
    }

    if (attempt < MAX_AI_IMAGE_ATTEMPTS) {
      console.warn(
        `Gambar AI ${filename} masih placeholder (${imageBuffer.length} bytes). Retry ${attempt}/${MAX_AI_IMAGE_ATTEMPTS} dalam ${AI_IMAGE_RETRY_DELAY_MS / 1000} detik...`,
      );
      await sleep(AI_IMAGE_RETRY_DELAY_MS);
      continue;
    }
  }

  throw new Error(`Gambar AI ${filename} belum siap setelah ${MAX_AI_IMAGE_ATTEMPTS} percobaan.`);
}

function createSeedSvg({ title, subtitle, accent, background, detail, variant }) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeDetail = escapeXml(detail);
  const xOffset = variant === "gallery-2" ? 980 : 900;
  const circleOpacity = variant === "hero" ? "0.26" : "0.18";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
      <rect width="1600" height="900" fill="${background}" />
      <rect x="74" y="74" width="1452" height="752" rx="46" fill="url(#panel)" stroke="rgba(255,255,255,0.15)" />
      <circle cx="${xOffset}" cy="214" r="210" fill="${accent}" fill-opacity="${circleOpacity}" />
      <circle cx="1270" cy="650" r="250" fill="${accent}" fill-opacity="0.12" />
      <path d="M180 640 C340 520 560 760 760 620 C930 500 1070 540 1230 640" stroke="${accent}" stroke-width="10" stroke-linecap="round" />
      <rect x="170" y="180" width="250" height="52" rx="26" fill="${accent}" fill-opacity="0.16" />
      <text x="200" y="214" fill="#F8FAFC" font-size="26" font-family="Arial, sans-serif" letter-spacing="4">LOMBOKADVISOR</text>
      <text x="170" y="340" fill="#FFFFFF" font-size="66" font-weight="700" font-family="Arial, sans-serif">${safeTitle}</text>
      <text x="170" y="410" fill="#D7E3F4" font-size="30" font-family="Arial, sans-serif">${safeSubtitle}</text>
      <text x="170" y="490" fill="#B7C8D9" font-size="28" font-family="Arial, sans-serif">${safeDetail}</text>
      <rect x="170" y="560" width="340" height="72" rx="36" fill="${accent}" />
      <text x="226" y="606" fill="#05212B" font-size="28" font-weight="700" font-family="Arial, sans-serif">${escapeXml(variant.toUpperCase())}</text>
      <defs>
        <linearGradient id="panel" x1="120" y1="120" x2="1460" y2="820" gradientUnits="userSpaceOnUse">
          <stop stop-color="rgba(255,255,255,0.09)" />
          <stop offset="1" stop-color="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
    </svg>
  `.trim();
}

async function ensureSeedAsset(docId, variant, title, subtitle) {
  const cacheKey = `${docId}-${variant}`;
  const cached = assetCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const visual = seedVisuals[docId] || {
    accent: "#56ccf2",
    background: "#0f172a",
    detail: "Lombok travel content",
  };
  const aiImageConfig = aiSeedImages[docId]?.[variant];
  const filename = aiImageConfig ? `${cacheKey}-ai-v2.png` : `${cacheKey}.svg`;
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`, {
    filename,
  });

  if (existing?._id) {
    assetCache.set(cacheKey, existing);
    return existing;
  }

  let asset;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      if (aiImageConfig) {
        const { contentType, imageBuffer } = await fetchAiImageBuffer(
          aiImageConfig.prompt,
          aiImageConfig.imageSize,
          filename,
        );

        asset = await client.assets.upload("image", imageBuffer, {
          filename,
          contentType,
        });
      } else {
        const svg = createSeedSvg({
          title,
          subtitle,
          accent: visual.accent,
          background: visual.background,
          detail: visual.detail,
          variant,
        });

        asset = await client.assets.upload("image", Buffer.from(svg), {
          filename,
          contentType: "image/svg+xml",
        });
      }
      break;
    } catch (error) {
      const retryAfterSeconds = Number(error?.response?.headers?.["retry-after"] || 1);

      if (error?.statusCode !== 429 || attempt === 4) {
        throw error;
      }

      console.warn(`Rate limit saat upload ${filename}. Retry dalam ${retryAfterSeconds} detik...`);
      await sleep(retryAfterSeconds * 1000);
    }
  }

  assetCache.set(cacheKey, asset);
  return asset;
}

function pickListItems(doc) {
  if (Array.isArray(doc.highlights) && doc.highlights.length) {
    return doc.highlights;
  }

  if (Array.isArray(doc.recommendations) && doc.recommendations.length) {
    return doc.recommendations;
  }

  if (Array.isArray(doc.faqs) && doc.faqs.length) {
    return doc.faqs.map((item) => item.question);
  }

  if (Array.isArray(doc.relatedLinks) && doc.relatedLinks.length) {
    return doc.relatedLinks.map((href) => `Internal link: ${href}`);
  }

  return [];
}

function buildRichSeedContent(doc, detailImageId) {
  const title = doc.title || doc.customerName || "LombokAdvisor";
  const intro =
    doc.summary ||
    doc.description ||
    doc.excerpt ||
    doc.quote ||
    "Dokumen ini menyiapkan struktur konten yang kaya untuk LombokAdvisor.";
  const support =
    doc.heroNote ||
    doc.highlight ||
    doc.description ||
    doc.metaDescription ||
    "Konten ini membantu tamu memahami pilihan perjalanan, suasana trip, dan langkah konsultasi yang paling mudah.";
  const listItems = pickListItems(doc).slice(0, 3);
  const blocks = [
    headingBlock("Overview", "h2", "overview"),
    normalBlock(intro, "intro"),
    headingBlock("Kenapa section ini penting", "h3", "why-it-matters"),
    normalBlock(support, "support-copy"),
  ];

  if (listItems.length) {
    blocks.push(headingBlock("Poin utama", "h3", "main-points"));
    blocks.push(...listItems.map((item, index) => bulletBlock(item, `point-${index + 1}`)));
  }

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, `${title} visual detail`, "content-image"));
  }

  blocks.push(
    quoteBlock(
      doc.quote ||
        doc.ctaMessage ||
        `Konsultasi ${title} bersama tim LombokAdvisor untuk itinerary yang lebih presisi.`,
      "closing-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok yang fleksibel untuk berbagai gaya perjalanan", "h2", "paket-overview"),
    normalBlock(
      "Paket wisata Lombok cocok untuk wisatawan yang ingin menikmati liburan lebih praktis tanpa repot menyusun itinerary dari nol. Mulai dari one day tour, 2 hari 1 malam, 3 hari 2 malam, hingga 4 hari 3 malam, setiap paket dapat disesuaikan dengan jumlah peserta, preferensi destinasi, dan gaya perjalanan.",
      "paket-overview-body-1",
    ),
    normalBlock(
      "Melalui LombokAdvisor, perjalanan bisa diarahkan ke Gili Trawangan, Kuta Lombok, pantai-pantai populer, bukit sunset, air terjun, hingga wisata alam dan budaya di Lombok. Paket ini cocok untuk keluarga, pasangan, rombongan, maupun wisatawan first timer dari Jakarta, Surabaya, kota besar lain di Indonesia, serta tamu dari Malaysia, Singapura, Australia, dan Eropa.",
      "paket-overview-body-2",
    ),
    headingBlock("Kenapa memilih paket wisata Lombok kami", "h2", "why-choose"),
    bulletBlock("Itinerary fleksibel untuk one day tour, 2D1N, 3D2N, 4D3N, hingga custom trip.", "why-1"),
    bulletBlock("Cocok untuk private trip, family trip, honeymoon, dan group tour.", "why-2"),
    bulletBlock("Destinasi bisa mencakup Gili Trawangan, Kuta Lombok, pantai, bukit, gunung, air terjun, dan wisata budaya.", "why-3"),
    bulletBlock("Paket dapat mencakup hotel, transport, dan makan sesuai kebutuhan perjalanan.", "why-4"),
    bulletBlock("Lebih praktis untuk tamu dari luar kota maupun luar negeri yang ingin perjalanan nyaman.", "why-5"),
    headingBlock("Pilihan paket wisata Lombok berdasarkan durasi", "h2", "durasi-heading"),
    headingBlock("One Day Tour Lombok", "h3", "durasi-1"),
    normalBlock(
      "Pilihan ini cocok untuk tamu yang memiliki waktu singkat dan ingin fokus ke area tertentu seperti Kuta Lombok, Bukit Merese, atau city tour ringan dengan ritme perjalanan yang lebih praktis.",
      "durasi-1-body",
    ),
    headingBlock("Paket 2 Hari 1 Malam", "h3", "durasi-2"),
    normalBlock(
      "Ideal untuk short escape dengan kombinasi wisata pantai, sunset, kuliner, dan menginap satu malam di area strategis. Paket ini cocok untuk tamu yang ingin trip singkat namun tetap nyaman.",
      "durasi-2-body",
    ),
    headingBlock("Paket 3 Hari 2 Malam", "h3", "durasi-3"),
    normalBlock(
      "Ini adalah pilihan paling populer untuk first timer karena memberi waktu yang cukup untuk menjelajahi Gili, kawasan selatan Lombok, dan beberapa spot ikonik tanpa itinerary terasa terlalu padat.",
      "durasi-3-body",
    ),
    headingBlock("Paket 4 Hari 3 Malam", "h3", "durasi-4"),
    normalBlock(
      "Direkomendasikan untuk tamu yang ingin pengalaman lebih lengkap dan lebih santai, termasuk opsi menambah wisata alam, air terjun, atau kombinasi area Lombok barat dan selatan.",
      "durasi-4-body",
    ),
    headingBlock("Custom Trip dan Honeymoon Package", "h3", "durasi-5"),
    normalBlock(
      "Selain paket reguler, itinerary juga dapat diarahkan ke kebutuhan yang lebih personal seperti honeymoon, private trip keluarga, atau group trip yang membutuhkan pengaturan lebih fleksibel.",
      "durasi-5-body",
    ),
    headingBlock("Destinasi favorit yang biasa masuk itinerary", "h2", "destinasi-heading"),
    bulletBlock("Gili Trawangan untuk island hopping, snorkeling, dan sunset.", "destinasi-1"),
    bulletBlock("Kuta Lombok dan Mandalika untuk pantai selatan, beach hopping, dan resort area.", "destinasi-2"),
    bulletBlock("Pantai-pantai populer untuk menikmati view, berenang, dan foto perjalanan.", "destinasi-3"),
    bulletBlock("Bukit sunset dan viewpoint untuk panorama Lombok yang lebih dramatis.", "destinasi-4"),
    bulletBlock("Air terjun dan wisata alam untuk tamu yang ingin pengalaman berbeda dari area pantai.", "destinasi-5"),
    bulletBlock("Gunung, perbukitan, dan wisata budaya untuk itinerary yang lebih beragam.", "destinasi-6"),
    headingBlock("Fasilitas yang bisa Anda dapatkan", "h2", "fasilitas-heading"),
    bulletBlock("Hotel sesuai pilihan paket dan budget perjalanan.", "fasilitas-1"),
    bulletBlock("Transportasi selama perjalanan sesuai itinerary.", "fasilitas-2"),
    bulletBlock("Makan sesuai program paket yang dipilih.", "fasilitas-3"),
    bulletBlock("Driver atau tim perjalanan yang membantu ritme trip tetap efisien.", "fasilitas-4"),
    bulletBlock("Penyesuaian itinerary berdasarkan durasi, peserta, dan preferensi wisata.", "fasilitas-5"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok", "paket-detail-image"));
  }

  blocks.push(
    headingBlock("Harga paket wisata Lombok mulai Rp1 juta per orang", "h2", "harga-heading"),
    normalBlock(
      "Harga dapat menyesuaikan dengan durasi perjalanan, jumlah peserta, pilihan hotel, area destinasi, musim liburan, dan kebutuhan tambahan seperti private trip atau honeymoon setup. Dengan konsultasi awal, itinerary dapat disusun agar lebih sesuai dengan budget dan tipe liburan yang diinginkan.",
      "harga-body",
    ),
    headingBlock("Cara booking paket wisata Lombok", "h2", "booking-heading"),
    normalBlock(
      "Cukup kirim tanggal perjalanan, jumlah peserta, kota asal, dan gambaran trip yang diinginkan melalui WhatsApp. Tim LombokAdvisor akan membantu menyusun rekomendasi paket wisata Lombok yang paling sesuai, termasuk pilihan durasi, destinasi, dan fasilitas.",
      "booking-body",
    ),
    linkedNormalBlock(
      [
        { text: "Jika Anda ingin melihat opsi yang lebih spesifik, baca juga " },
        { text: "paket wisata Lombok 3 hari 2 malam", href: "/blog/paket-wisata-lombok-3-hari-2-malam" },
        { text: ", contoh " },
        { text: "itinerary Lombok 3 hari", href: "/blog/itinerary-lombok-3-hari" },
        { text: ", inspirasi " },
        { text: "trip ke Gili Trawangan", href: "/wisata/gili-trawangan" },
        { text: ", atau opsi " },
        { text: "transport selama liburan di Lombok", href: "/sewa-mobil-lombok" },
        { text: " jika Anda ingin ritme perjalanan yang lebih fleksibel." },
      ],
      "paket-internal-links",
    ),
    quoteBlock(
      "Jika Anda mencari paket wisata Lombok yang fleksibel, nyaman, dan mudah dikonsultasikan, tim LombokAdvisor siap membantu dari tahap perencanaan sampai trip berjalan.",
      "paket-closing-quote",
    ),
  );

  return blocks;
}

function buildPaketHoneymoonLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Paket honeymoon Lombok untuk perjalanan romantis yang terasa lebih nyaman", "h2", "honeymoon-overview"),
    normalBlock(
      "Paket honeymoon Lombok cocok untuk pasangan yang ingin menikmati waktu berdua dengan suasana yang lebih tenang, nyaman, dan terasa spesial sejak awal perjalanan. Dibanding liburan biasa yang sering padat dan terburu-buru, honeymoon lebih ideal jika disusun dengan ritme yang santai, pilihan destinasi yang indah, dan momen yang benar-benar bisa dinikmati bersama.",
      "honeymoon-overview-body-1",
    ),
    normalBlock(
      "Lombok menjadi pilihan yang menarik untuk honeymoon karena menawarkan kombinasi yang lengkap. Anda bisa menikmati pantai cantik, suasana pulau yang tenang, sunset yang memukau, perjalanan laut yang menyenangkan, hingga area menginap yang nyaman untuk beristirahat dengan lebih leluasa.",
      "honeymoon-overview-body-2",
    ),
    headingBlock("Kenapa honeymoon di Lombok banyak dipilih pasangan", "h2", "honeymoon-why"),
    normalBlock(
      "Banyak pasangan memilih Lombok karena suasananya terasa lebih tenang dan tidak terlalu ramai. Pulau ini memberi ruang bagi pasangan untuk menikmati perjalanan dengan ritme yang lebih nyaman, mulai dari jalan santai di tepi pantai, menikmati makan malam dengan suasana yang hangat, hingga menikmati pemandangan laut dan bukit tanpa harus terburu-buru berpindah tempat.",
      "honeymoon-why-body-1",
    ),
    normalBlock(
      "Selain itu, pilihan destinasinya juga sangat cocok untuk pasangan. Ada area Gili yang identik dengan laut jernih dan suasana pulau, ada Kuta Mandalika dengan garis pantai yang cantik, serta ada berbagai bukit dan spot sunset yang membuat perjalanan terasa lebih berkesan.",
      "honeymoon-why-body-2",
    ),
    headingBlock("Pilihan durasi paket honeymoon Lombok", "h2", "honeymoon-duration"),
    headingBlock("3 Hari 2 Malam", "h3", "honeymoon-duration-1"),
    normalBlock(
      "Durasi ini paling banyak dipilih pasangan yang ingin short escape namun tetap punya waktu untuk menikmati area pantai, sunset, dan satu highlight utama seperti Gili Trawangan atau private beach trip dengan ritme yang tetap santai.",
      "honeymoon-duration-1-body",
    ),
    headingBlock("4 Hari 3 Malam", "h3", "honeymoon-duration-2"),
    normalBlock(
      "Pilihan ini cocok untuk pasangan yang ingin perjalanan lebih santai, tidak terlalu padat, dan punya waktu lebih banyak untuk menikmati suasana menginap, perjalanan laut, serta momen berdua tanpa terburu-buru.",
      "honeymoon-duration-2-body",
    ),
    headingBlock("Custom duration", "h3", "honeymoon-duration-3"),
    normalBlock(
      "Jika dibutuhkan, itinerary juga bisa dibuat lebih fleksibel sesuai jam kedatangan, gaya perjalanan, dan preferensi destinasi. Ada pasangan yang ingin fokus pada area pantai dan sunset, ada juga yang lebih suka kombinasi island trip, beach escape, dan waktu santai di penginapan.",
      "honeymoon-duration-3-body",
    ),
    headingBlock("Destinasi romantis yang sering masuk itinerary", "h2", "honeymoon-destinasi"),
    normalBlock(
      "Salah satu destinasi yang paling sering dipilih adalah Gili Trawangan, terutama untuk pasangan yang ingin merasakan suasana laut yang lebih santai, pemandangan sunset yang indah, dan pengalaman pulau yang terasa berbeda dari area daratan.",
      "honeymoon-destinasi-body-1",
    ),
    bulletBlock("Gili Trawangan untuk island vibes, sunset, dan quality time berdua.", "honeymoon-destinasi-1"),
    bulletBlock("Kuta Mandalika untuk pantai, bukit, dan suasana resort area yang lebih tenang.", "honeymoon-destinasi-2"),
    bulletBlock("Spot sunset dan hidden beach untuk pengalaman yang lebih intimate.", "honeymoon-destinasi-3"),
    bulletBlock("Kombinasi beach trip dan island trip bagi pasangan yang ingin pengalaman lebih lengkap.", "honeymoon-destinasi-4"),
    headingBlock("Fasilitas yang umumnya dicari pasangan", "h2", "honeymoon-fasilitas"),
    normalBlock(
      "Pasangan yang memilih paket honeymoon biasanya mencari perjalanan yang terasa praktis sejak awal. Fasilitas seperti transport, penginapan yang nyaman, pengaturan rute, dan susunan itinerary yang rapi menjadi hal yang paling banyak dicari agar waktu di Lombok lebih banyak dipakai untuk menikmati momen bersama.",
      "honeymoon-fasilitas-body-1",
    ),
    bulletBlock("Pilihan hotel atau villa sesuai suasana honeymoon yang diinginkan.", "honeymoon-fasilitas-1"),
    bulletBlock("Transport dan driver yang membuat perjalanan lebih ringan.", "honeymoon-fasilitas-2"),
    bulletBlock("Susunan makan dan agenda perjalanan yang lebih nyaman untuk pasangan.", "honeymoon-fasilitas-3"),
    bulletBlock("Opsional dinner romantis, dekorasi, atau private experience tertentu.", "honeymoon-fasilitas-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual honeymoon Lombok", "honeymoon-detail-image"));
  }

  blocks.push(
    headingBlock("Contoh alur honeymoon Lombok yang nyaman", "h2", "honeymoon-flow"),
    normalBlock(
      "Hari pertama dapat dimulai dengan penjemputan dari bandara, lalu perjalanan menuju area selatan Lombok. Anda bisa menikmati suasana Kuta Mandalika, pantai cantik di sekitarnya, lalu menutup hari dengan sunset di bukit yang tenang. Setelah itu, malam bisa dihabiskan dengan makan malam santai dan istirahat di penginapan.",
      "honeymoon-flow-body-1",
    ),
    normalBlock(
      "Hari kedua biasanya menjadi hari yang paling dinanti karena bisa diisi dengan trip ke Gili, waktu santai di tepi pantai, atau perjalanan laut yang memberi pengalaman berbeda untuk berdua. Hari ketiga dapat dibuat lebih ringan, misalnya dengan sarapan santai, singgah ke tempat oleh-oleh, lalu lanjut kembali ke bandara.",
      "honeymoon-flow-body-2",
    ),
    linkedNormalBlock(
      [
        { text: "Banyak pasangan juga menambahkan " },
        { text: "honeymoon Gili Trawangan", href: "/blog/honeymoon-gili-trawangan" },
        { text: " ke itinerary agar suasana pulau terasa lebih kuat. Jika Anda ingin mengenal areanya lebih dulu, lihat panduan " },
        { text: "wisata Gili Trawangan", href: "/wisata/gili-trawangan" },
        { text: " sebelum menentukan susunan trip yang paling pas untuk berdua." },
      ],
      "honeymoon-internal-links",
    ),
    headingBlock("Siapa yang cocok memilih paket ini", "h2", "honeymoon-fit"),
    normalBlock(
      "Paket honeymoon Lombok cocok untuk pasangan baru menikah, pasangan yang merayakan anniversary, maupun pasangan yang ingin quality time berdua tanpa harus menyusun perjalanan dari nol. Jika Anda ingin perjalanan yang terasa lebih privat, ritmenya santai, dan suasananya nyaman dari awal sampai akhir, paket honeymoon biasanya menjadi pilihan yang paling pas.",
      "honeymoon-fit-body",
    ),
    quoteBlock(
      "Honeymoon yang baik bukan hanya soal pergi ke tempat yang indah, tetapi tentang bagaimana seluruh perjalanan terasa nyaman, ringan, dan menyenangkan untuk dikenang bersama.",
      "honeymoon-closing-quote",
    ),
  );

  return blocks;
}

function buildSewaMobilLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa mobil Lombok yang fleksibel untuk airport transfer, city tour, dan overland trip", "h2", "car-overview"),
    normalBlock(
      "Sewa mobil Lombok cocok untuk wisatawan yang ingin perjalanan lebih fleksibel tanpa harus ikut paket tour penuh. Layanan ini dapat dipakai untuk jemput bandara, transfer hotel, city tour, perjalanan antar area wisata, hingga trip harian dengan driver yang memahami rute Lombok.",
      "car-overview-body-1",
    ),
    normalBlock(
      "Layanan ini ideal untuk tamu domestik dari Jakarta, Surabaya, dan kota besar lain di Indonesia, serta wisatawan dari Malaysia, Singapura, Australia, dan Eropa yang membutuhkan transportasi yang praktis selama berada di Lombok.",
      "car-overview-body-2",
    ),
    headingBlock("Kenapa memilih sewa mobil Lombok dengan driver", "h2", "car-why"),
    bulletBlock("Lebih fleksibel untuk itinerary sendiri maupun kebutuhan transport selama liburan.", "car-why-1"),
    bulletBlock("Tersedia untuk jemput bandara, antar hotel, city tour, dan full day trip.", "car-why-2"),
    bulletBlock("Driver lokal memahami area wisata, rute, dan ritme perjalanan yang efisien.", "car-why-3"),
    bulletBlock("Bisa diarahkan untuk family trip, pasangan, rombongan kecil, maupun kebutuhan bisnis.", "car-why-4"),
    bulletBlock("Mudah dikembangkan ke pilihan armada sesuai jumlah peserta dan kebutuhan kenyamanan.", "car-why-5"),
    headingBlock("Kebutuhan sewa mobil yang paling sering dicari", "h2", "car-needs"),
    headingBlock("Jemput Bandara Lombok", "h3", "car-needs-1"),
    normalBlock(
      "Cocok untuk tamu yang ingin langsung dijemput dari bandara menuju hotel, area Mandalika, Senggigi, atau titik keberangkatan wisata lainnya.",
      "car-needs-1-body",
    ),
    headingBlock("City Tour dan Full Day Trip", "h3", "car-needs-2"),
    normalBlock(
      "Layanan ini cocok untuk tamu yang ingin mengunjungi beberapa destinasi dalam satu hari dengan ritme perjalanan yang lebih bebas dan nyaman.",
      "car-needs-2-body",
    ),
    headingBlock("Multi Day Transport", "h3", "car-needs-3"),
    normalBlock(
      "Bisa dipakai untuk tamu yang membutuhkan kendaraan selama beberapa hari agar pergerakan hotel, destinasi, dan jadwal perjalanan lebih efisien.",
      "car-needs-3-body",
    ),
    headingBlock("Area layanan dan penggunaan", "h2", "car-area"),
    bulletBlock("Bandara Lombok dan area hotel utama.", "car-area-1"),
    bulletBlock("Kuta Lombok, Senggigi, Gili transfer point, dan area wisata populer lainnya.", "car-area-2"),
    bulletBlock("Cocok untuk wisata keluarga, perjalanan pasangan, hingga kebutuhan group kecil.", "car-area-3"),
    headingBlock("Keunggulan layanan", "h2", "car-benefits"),
    bulletBlock("Armada bersih dan siap dipakai untuk tamu harian maupun multi day.", "car-benefits-1"),
    bulletBlock("Driver lokal profesional dan memahami rute wisata Lombok.", "car-benefits-2"),
    bulletBlock("Lebih mudah menyesuaikan itinerary tanpa terikat trip grup.", "car-benefits-3"),
    bulletBlock("Dapat dikombinasikan dengan paket wisata, hotel, atau kebutuhan trip lain.", "car-benefits-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil Lombok", "car-detail-image"));
  }

  blocks.push(
    headingBlock("Harga sewa mobil Lombok", "h2", "car-price"),
    normalBlock(
      "Harga sewa mobil Lombok mulai dari kebutuhan harian dan dapat menyesuaikan dengan jenis armada, durasi penggunaan, area penjemputan, serta apakah layanan dipakai untuk transfer singkat, city tour, atau perjalanan beberapa hari.",
      "car-price-body",
    ),
    linkedNormalBlock(
      [
        { text: "Untuk membandingkan kebutuhan dengan lebih cepat, Anda bisa lihat panduan " },
        { text: "harga sewa mobil Lombok", href: "/blog/harga-sewa-mobil-lombok" },
        { text: ", kebutuhan " },
        { text: "sewa mobil bandara Lombok", href: "/blog/sewa-mobil-bandara-lombok" },
        { text: ", atau opsi " },
        { text: "rental Hiace Lombok", href: "/blog/rental-hiace-lombok" },
        { text: " untuk rombongan. Jika trip Anda sekalian butuh itinerary, halaman " },
        { text: "paket wisata Lombok", href: "/paket-wisata-lombok" },
        { text: " juga bisa jadi acuan." },
      ],
      "car-internal-links",
    ),
    headingBlock("Cara booking mobil", "h2", "car-booking"),
    normalBlock(
      "Kirim tanggal penggunaan, area jemput, tujuan perjalanan, dan jumlah peserta melalui WhatsApp. Tim LombokAdvisor akan membantu merekomendasikan layanan transport dan armada yang paling sesuai.",
      "car-booking-body",
    ),
    quoteBlock(
      "Sewa mobil Lombok dengan driver adalah pilihan yang tepat untuk tamu yang ingin perjalanan lebih fleksibel, efisien, dan nyaman selama di Lombok.",
      "car-closing-quote",
    ),
  );

  return blocks;
}

function buildGiliTrawanganContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Gili Trawangan untuk island escape, snorkeling, dan sunset", "h2", "gili-overview"),
    normalBlock(
      "Gili Trawangan adalah salah satu destinasi paling populer di Lombok untuk wisatawan yang ingin menikmati suasana pulau kecil dengan kombinasi laut jernih, snorkeling, beach club, jalur sepeda, dan sunset yang ikonik. Destinasi ini cocok untuk first timer, pasangan, hingga wisatawan yang ingin menambah island hopping ke itinerary Lombok.",
      "gili-overview-body-1",
    ),
    normalBlock(
      "Banyak tamu memilih Gili Trawangan karena atmosfernya santai namun tetap hidup, terutama untuk liburan singkat, honeymoon, atau kombinasi private trip. Selain aktivitas laut, area ini juga cocok untuk quality time, foto perjalanan, dan menikmati ritme liburan yang lebih ringan dibanding destinasi daratan yang berpindah-pindah.",
      "gili-overview-body-2",
    ),
    headingBlock("Aktivitas yang paling sering dicari di Gili Trawangan", "h2", "gili-activities"),
    bulletBlock("Snorkeling dan island hopping ke spot laut populer di sekitar Gili.", "gili-activity-1"),
    bulletBlock("Menikmati sunset di tepi pantai atau beach club area.", "gili-activity-2"),
    bulletBlock("Bersepeda keliling pulau untuk mengejar view dan suasana santai.", "gili-activity-3"),
    bulletBlock("Staycation romantis untuk honeymoon atau private trip pasangan.", "gili-activity-4"),
    bulletBlock("Kombinasi trip laut dan waktu santai tanpa itinerary terlalu padat.", "gili-activity-5"),
    headingBlock("Cara menuju Gili Trawangan", "h2", "gili-access"),
    normalBlock(
      "Perjalanan ke Gili Trawangan biasanya dimulai dari area bandara atau hotel di Lombok, lalu dilanjutkan ke pelabuhan penyeberangan sebelum naik speedboat menuju pulau. Karena alurnya melibatkan transport darat dan laut, banyak tamu memilih paket wisata atau layanan transport yang sudah tersusun agar lebih praktis.",
      "gili-access-body",
    ),
    headingBlock("Cocok untuk siapa", "h2", "gili-fit"),
    bulletBlock("Pasangan yang ingin honeymoon atau sunset trip yang lebih santai.", "gili-fit-1"),
    bulletBlock("First timer yang ingin melihat sisi paling populer dari Lombok.", "gili-fit-2"),
    bulletBlock("Wisatawan yang menyukai snorkeling, laut, dan island vibes.", "gili-fit-3"),
    bulletBlock("Tamu yang ingin menggabungkan trip darat di Lombok dengan pengalaman pulau.", "gili-fit-4"),
    headingBlock("Tips merencanakan trip ke Gili Trawangan", "h2", "gili-tips"),
    bulletBlock("Atur waktu berangkat lebih awal jika ingin ritme trip lebih nyaman.", "gili-tip-1"),
    bulletBlock("Pertimbangkan menginap jika ingin menikmati sunset dan malam di pulau.", "gili-tip-2"),
    bulletBlock("Kombinasikan dengan itinerary Lombok daratan agar perjalanan lebih efisien.", "gili-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Gili Trawangan", "gili-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Gili Trawangan adalah pilihan tepat untuk tamu yang ingin pengalaman pulau yang santai, visual yang kuat, dan tetap mudah dikombinasikan dengan itinerary Lombok.",
      "gili-closing-quote",
    ),
  );

  return blocks;
}

function buildKutaMandalikaContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Kuta Mandalika untuk pantai selatan, sunset, dan short escape Lombok", "h2", "kuta-overview"),
    normalBlock(
      "Kuta Mandalika menjadi salah satu area favorit di Lombok selatan karena aksesnya relatif mudah dari bandara, pilihan pantainya beragam, dan suasananya cocok untuk wisatawan yang ingin liburan santai namun tetap stylish. Area ini sering dipilih untuk short escape, family trip, pasangan, hingga tamu yang baru pertama kali datang ke Lombok.",
      "kuta-overview-body-1",
    ),
    normalBlock(
      "Daya tarik utama Kuta Mandalika ada pada kombinasi pantai-pantai cantik, bukit sunset, area resort, kafe, dan ritme perjalanan yang cukup fleksibel. Karena banyak spot berdekatan, kawasan ini sangat ideal untuk itinerary satu sampai dua hari atau sebagai bagian dari paket wisata Lombok yang lebih panjang.",
      "kuta-overview-body-2",
    ),
    headingBlock("Aktivitas yang biasa dilakukan di Kuta Mandalika", "h2", "kuta-activities"),
    bulletBlock("Beach hopping ke area pantai selatan yang paling populer.", "kuta-activity-1"),
    bulletBlock("Menikmati sunset dari bukit dan viewpoint ikonik.", "kuta-activity-2"),
    bulletBlock("Kuliner santai dan coffee stop di sekitar area Kuta.", "kuta-activity-3"),
    bulletBlock("Trip keluarga atau pasangan dengan ritme yang tidak terlalu berat.", "kuta-activity-4"),
    bulletBlock("Kombinasi destinasi darat yang mudah diatur untuk one day trip maupun 2D1N.", "kuta-activity-5"),
    headingBlock("Akses menuju Kuta Mandalika", "h2", "kuta-access"),
    normalBlock(
      "Kuta Mandalika termasuk area yang relatif dekat dari bandara Lombok, sehingga sangat cocok untuk tamu yang menginginkan perjalanan praktis. Banyak wisatawan menjadikan kawasan ini sebagai tujuan pertama atau area menginap karena aksesnya nyaman dan mudah dikombinasikan dengan destinasi selatan lainnya.",
      "kuta-access-body",
    ),
    headingBlock("Cocok untuk siapa", "h2", "kuta-fit"),
    bulletBlock("Wisatawan first timer yang ingin eksplor pantai selatan Lombok.", "kuta-fit-1"),
    bulletBlock("Pasangan yang mencari kombinasi pantai, sunset, dan resort area.", "kuta-fit-2"),
    bulletBlock("Keluarga yang ingin destinasi mudah dijangkau dan tidak terlalu kompleks.", "kuta-fit-3"),
    bulletBlock("Tamu dengan waktu singkat yang butuh area wisata yang efisien.", "kuta-fit-4"),
    headingBlock("Tips menikmati Kuta Mandalika", "h2", "kuta-tips"),
    bulletBlock("Datang lebih awal jika ingin mengunjungi beberapa pantai sekaligus.", "kuta-tip-1"),
    bulletBlock("Sisakan waktu sore untuk sunset di bukit atau area pantai.", "kuta-tip-2"),
    bulletBlock("Kombinasikan dengan transport atau paket wisata agar rute lebih efisien.", "kuta-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Kuta Mandalika", "kuta-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Kuta Mandalika adalah area yang pas untuk tamu yang ingin suasana pantai selatan Lombok yang mudah diakses, visual, dan nyaman untuk berbagai jenis trip.",
      "kuta-closing-quote",
    ),
  );

  return blocks;
}

function buildSenggigiContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Senggigi untuk sunset, hotel, kuliner, dan basecamp perjalanan", "h2", "senggigi-overview"),
    normalBlock(
      "Senggigi dikenal sebagai salah satu kawasan wisata klasik di Lombok barat yang masih sangat relevan untuk wisatawan yang ingin area menginap strategis, dekat ke banyak fasilitas, dan nyaman untuk memulai perjalanan ke berbagai destinasi di Lombok. Kawasan ini cocok untuk keluarga, pasangan, maupun tamu yang ingin ritme liburan lebih tenang.",
      "senggigi-overview-body-1",
    ),
    normalBlock(
      "Keunggulan Senggigi ada pada kombinasi hotel, restoran, akses transport, pantai untuk sunset, dan posisinya yang cukup strategis ke Lombok barat maupun titik keberangkatan ke area Gili. Karena itu, Senggigi sering dipilih sebagai basecamp untuk perjalanan beberapa hari di Lombok.",
      "senggigi-overview-body-2",
    ),
    headingBlock("Hal yang membuat Senggigi tetap menarik", "h2", "senggigi-activities"),
    bulletBlock("Sunset yang mudah dinikmati dari area pantai dan hotel sekitar.", "senggigi-activity-1"),
    bulletBlock("Pilihan hotel dan restoran yang cukup lengkap untuk wisatawan.", "senggigi-activity-2"),
    bulletBlock("Cocok sebagai titik menginap sebelum lanjut ke Gili atau Lombok utara.", "senggigi-activity-3"),
    bulletBlock("Nyaman untuk keluarga yang membutuhkan akses lebih praktis.", "senggigi-activity-4"),
    bulletBlock("Mudah dikombinasikan dengan layanan sewa mobil atau paket wisata Lombok barat.", "senggigi-activity-5"),
    headingBlock("Akses dan posisi Senggigi dalam itinerary", "h2", "senggigi-access"),
    normalBlock(
      "Senggigi sering dipakai sebagai area menginap yang aman untuk itinerary beberapa hari karena lokasinya strategis. Dari sini, tamu bisa merencanakan perjalanan ke area Lombok barat, pelabuhan menuju Gili, maupun destinasi lain dengan waktu tempuh yang relatif nyaman.",
      "senggigi-access-body",
    ),
    headingBlock("Cocok untuk siapa", "h2", "senggigi-fit"),
    bulletBlock("Keluarga yang ingin hotel dan fasilitas sekitar lebih lengkap.", "senggigi-fit-1"),
    bulletBlock("Wisatawan yang ingin basecamp strategis untuk beberapa hari.", "senggigi-fit-2"),
    bulletBlock("Tamu yang mencari sunset dan area menginap yang nyaman.", "senggigi-fit-3"),
    bulletBlock("Wisatawan yang ingin menggabungkan transport fleksibel dengan itinerary Lombok barat.", "senggigi-fit-4"),
    headingBlock("Tips memilih Senggigi sebagai basecamp", "h2", "senggigi-tips"),
    bulletBlock("Gunakan Senggigi jika ingin ritme menginap yang lebih stabil selama beberapa hari.", "senggigi-tip-1"),
    bulletBlock("Kombinasikan dengan trip ke Gili atau Lombok barat untuk rute yang lebih efisien.", "senggigi-tip-2"),
    bulletBlock("Pilih area hotel yang dekat akses utama jika Anda membawa keluarga.", "senggigi-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Senggigi", "senggigi-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Senggigi cocok untuk wisatawan yang mencari area menginap yang strategis, sunset yang mudah dinikmati, dan akses perjalanan yang lebih praktis di Lombok barat.",
      "senggigi-closing-quote",
    ),
  );

  return blocks;
}

function buildTempatWisataLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Tempat wisata di Lombok yang paling sering masuk itinerary first timer", "h2", "places-overview"),
    normalBlock(
      "Lombok punya kombinasi destinasi yang sangat lengkap, mulai dari pantai, gili, bukit sunset, air terjun, hingga wisata budaya. Untuk wisatawan yang baru pertama kali datang, tantangan utamanya bukan mencari tempat wisata, melainkan memilih destinasi yang paling cocok digabungkan agar itinerary tetap realistis dan nyaman.",
      "places-overview-body-1",
    ),
    normalBlock(
      "Karena area wisata di Lombok tersebar, penting untuk memahami karakter tiap destinasi sebelum menyusun rute. Artikel ini membantu Anda mengenali tempat wisata di Lombok yang paling populer sekaligus memberi gambaran destinasi mana yang cocok untuk family trip, honeymoon, short escape, atau private trip.",
      "places-overview-body-2",
    ),
    headingBlock("1. Gili Trawangan", "h2", "place-1"),
    normalBlock(
      "Gili Trawangan cocok untuk wisatawan yang mencari pengalaman pulau dengan snorkeling, sunset, suasana santai, dan opsi honeymoon. Destinasi ini sering menjadi highlight utama untuk first timer yang ingin melihat sisi paling ikonik dari Lombok.",
      "place-1-body",
    ),
    headingBlock("2. Kuta Mandalika", "h2", "place-2"),
    normalBlock(
      "Kuta Mandalika dikenal dengan pantai selatan, area resort, dan akses yang relatif mudah dari bandara. Cocok untuk short escape, pasangan, maupun keluarga yang ingin ritme perjalanan lebih ringan.",
      "place-2-body",
    ),
    headingBlock("3. Senggigi", "h2", "place-3"),
    normalBlock(
      "Senggigi sering dipilih sebagai area menginap yang strategis karena sunset, pilihan hotel, dan aksesnya nyaman ke Lombok barat maupun titik keberangkatan ke Gili.",
      "place-3-body",
    ),
    headingBlock("4. Bukit Merese dan area pantai selatan", "h2", "place-4"),
    normalBlock(
      "Area ini cocok untuk wisatawan yang ingin pemandangan dramatis, pantai, dan golden hour. Biasanya digabungkan dengan Kuta Lombok dalam itinerary satu hari atau setengah hari.",
      "place-4-body",
    ),
    headingBlock("5. Air terjun Lombok", "h2", "place-5"),
    normalBlock(
      "Untuk wisatawan yang ingin suasana lebih sejuk dan alami, air terjun menjadi pilihan menarik. Destinasi ini memberi pengalaman yang berbeda dibanding trip pantai dan bisa jadi variasi untuk itinerary yang lebih lengkap.",
      "place-5-body",
    ),
    headingBlock("Cara memilih destinasi yang tepat", "h2", "places-guide"),
    bulletBlock("Fokus pada 1-2 area wisata utama agar rute tidak terlalu padat.", "places-guide-1"),
    bulletBlock("Sesuaikan pilihan destinasi dengan durasi trip, misalnya 3D2N atau 4D3N.", "places-guide-2"),
    bulletBlock("Gabungkan destinasi laut, pantai, dan area darat secara seimbang.", "places-guide-3"),
    bulletBlock("Gunakan paket wisata atau transport dengan driver agar perpindahan lebih efisien.", "places-guide-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual tempat wisata di Lombok", "places-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Tempat wisata terbaik di Lombok bukan berarti harus dikunjungi sekaligus. Yang paling penting adalah menyusun kombinasi destinasi yang pas dengan durasi, gaya liburan, dan energi perjalanan Anda.",
      "places-closing-quote",
    ),
  );

  return blocks;
}

function buildHargaSewaMobilLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Harga sewa mobil Lombok dan cara memilih yang paling pas", "h2", "carprice-overview"),
    normalBlock(
      "Mencari informasi harga sewa mobil Lombok sebelum berangkat adalah langkah yang wajar, terutama jika Anda ingin menyusun budget perjalanan dengan lebih nyaman. Dengan mengetahui kisaran harga dari awal, Anda bisa lebih mudah menentukan jenis armada yang cocok, memilih pola perjalanan yang paling praktis, dan menyesuaikan layanan dengan jumlah peserta.",
      "carprice-overview-body-1",
    ),
    normalBlock(
      "Di Lombok, kebutuhan sewa mobil cukup beragam. Ada tamu yang membutuhkan kendaraan untuk jemput bandara, ada yang ingin mobil untuk perjalanan keluarga, ada juga yang mencari kendaraan untuk rombongan, city tour, atau perjalanan beberapa hari. Karena itu, harga sewa mobil tidak hanya dipengaruhi oleh jenis armadanya, tetapi juga oleh cara kendaraan akan dipakai selama perjalanan.",
      "carprice-overview-body-2",
    ),
    headingBlock("Apa saja yang memengaruhi harga rental mobil", "h2", "carprice-factors"),
    bulletBlock("Jenis armada yang dipilih, mulai dari mobil keluarga hingga kendaraan rombongan.", "carprice-factor-1"),
    bulletBlock("Durasi penggunaan, apakah untuk transfer singkat, full day, atau beberapa hari.", "carprice-factor-2"),
    bulletBlock("Area jemput seperti bandara, hotel, atau titik tertentu di Lombok.", "carprice-factor-3"),
    bulletBlock("Jumlah peserta, banyaknya bagasi, dan kebutuhan perjalanan di lapangan.", "carprice-factor-4"),
    bulletBlock("Apakah layanan dipakai dengan driver atau pola perjalanan yang lebih fleksibel.", "carprice-factor-5"),
    headingBlock("Pilihan armada sesuai kebutuhan", "h2", "carprice-fleet"),
    normalBlock(
      "Untuk pasangan atau keluarga kecil, kendaraan keluarga biasanya sudah cukup nyaman digunakan selama perjalanan di Lombok. Jika peserta lebih banyak atau membawa bagasi lebih banyak, armada yang lebih besar tentu akan membuat perjalanan terasa lebih lega.",
      "carprice-fleet-body-1",
    ),
    normalBlock(
      "Bagi tamu yang ingin kesan perjalanan lebih premium, kendaraan seperti Fortuner atau Alphard juga sering dipilih untuk kenyamanan ekstra. Pilihan ini biasanya dipertimbangkan ketika tamu mengutamakan suasana perjalanan yang lebih eksklusif atau ingin armada yang terasa lebih representatif.",
      "carprice-fleet-body-2",
    ),
    headingBlock("Lebih cocok lepas kunci atau dengan driver", "h2", "carprice-comparison"),
    normalBlock(
      "Untuk tamu yang baru pertama kali ke Lombok, datang bersama keluarga, atau ingin perjalanan lebih santai, mobil dengan driver biasanya terasa lebih nyaman. Anda tidak perlu memikirkan rute, parkir, kondisi jalan, atau area wisata yang belum familiar sehingga energi bisa lebih fokus untuk menikmati perjalanan.",
      "carprice-comparison-body-1",
    ),
    normalBlock(
      "Sebaliknya, bagi tamu yang sudah familiar dengan rute dan ingin fleksibilitas lebih tinggi, lepas kunci bisa menjadi pilihan. Yang paling penting adalah menyesuaikan jenis layanan dengan gaya perjalanan Anda, bukan sekadar memilih yang terlihat paling murah di awal.",
      "carprice-comparison-body-2",
    ),
    headingBlock("Tips booking agar pilihan lebih tepat", "h2", "carprice-tips"),
    bulletBlock("Siapkan tanggal perjalanan, jumlah peserta, dan area jemput sebelum bertanya harga.", "carprice-tip-1"),
    bulletBlock("Jelaskan apakah kendaraan dipakai untuk transfer, city tour, atau perjalanan beberapa hari.", "carprice-tip-2"),
    bulletBlock("Sesuaikan armada dengan bagasi dan kenyamanan perjalanan, bukan hanya jumlah kursi.", "carprice-tip-3"),
    bulletBlock("Booking lebih awal saat high season agar pilihan armada masih lengkap.", "carprice-tip-4"),
    linkedNormalBlock(
      [
        { text: "Jika Anda ingin langsung membandingkan layanan, buka halaman " },
        { text: "sewa mobil Lombok", href: "/sewa-mobil-lombok" },
        { text: ", cek kebutuhan " },
        { text: "jemput bandara Lombok", href: "/blog/sewa-mobil-bandara-lombok" },
        { text: ", atau lihat opsi " },
        { text: "rental Hiace untuk rombongan", href: "/blog/rental-hiace-lombok" },
        { text: " agar pilihan armada lebih cepat mengerucut." },
      ],
      "carprice-internal-links",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual harga sewa mobil Lombok", "carprice-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Harga sewa mobil Lombok yang tepat bukan sekadar yang termurah, tetapi yang paling pas dengan rute, jumlah peserta, dan kenyamanan perjalanan Anda.",
      "carprice-closing-quote",
    ),
  );

  return blocks;
}

function buildItineraryLombok3HariContent(detailImageId) {
  const blocks = [
    headingBlock("Itinerary Lombok 3 hari yang efisien untuk first timer, pasangan, dan keluarga", "h2", "itinerary-overview"),
    normalBlock(
      "Itinerary Lombok 3 hari adalah salah satu format perjalanan yang paling banyak dicari karena pas untuk libur singkat, long weekend, maupun tamu yang ingin memaksimalkan waktu tanpa harus mengambil cuti terlalu panjang. Dalam durasi 3 hari 2 malam, Anda sudah bisa menikmati kombinasi pantai, bukit, budaya lokal, hingga island trip jika susunan rutenya dibuat dengan tepat.",
      "itinerary-overview-body-1",
    ),
    normalBlock(
      "Masalahnya, banyak itinerary yang terlihat menarik di atas kertas tetapi terasa terlalu padat saat dijalani. Karena itu, itinerary yang baik seharusnya tidak hanya berisi daftar destinasi, tetapi juga mempertimbangkan kenyamanan, jarak tempuh, ritme perjalanan, dan waktu istirahat agar liburan tetap terasa menyenangkan.",
      "itinerary-overview-body-2",
    ),
    headingBlock("Apakah 3 hari cukup untuk liburan di Lombok", "h2", "itinerary-enough"),
    normalBlock(
      "Tiga hari cukup untuk menikmati beberapa area utama di Lombok, terutama bagi first timer yang ingin mengenal suasana pulau ini tanpa harus mengejar terlalu banyak tempat. Dengan rute yang efisien, Anda bisa memilih kombinasi destinasi paling populer dan tetap punya waktu untuk menikmati perjalanan dengan lebih santai.",
      "itinerary-enough-body-1",
    ),
    normalBlock(
      "Yang paling penting adalah menentukan fokus perjalanan. Jika ingin suasana laut dan pulau, itinerary bisa diarahkan ke Gili. Jika ingin pantai dan bukit, area Mandalika dan sekitarnya bisa menjadi fokus utama. Jika ingin perjalanan yang seimbang, kombinasi keduanya juga tetap memungkinkan selama ritmenya tidak dibuat terlalu padat.",
      "itinerary-enough-body-2",
    ),
    headingBlock("Contoh itinerary untuk first timer", "h2", "itinerary-day-1"),
    normalBlock(
      "Hari pertama bisa digunakan untuk penjemputan bandara, lalu lanjut ke Kuta Mandalika, Tanjung Aan, dan Bukit Merese. Jalur ini cukup efisien, pemandangannya indah, dan memberi kesan pertama yang kuat tentang Lombok tanpa membuat perjalanan terasa berat setelah tiba.",
      "itinerary-day-1-body",
    ),
    headingBlock("Hari kedua sebagai highlight utama", "h2", "itinerary-day-2"),
    normalBlock(
      "Hari kedua bisa diisi dengan perjalanan ke Gili Trawangan atau island trip sesuai preferensi. Hari ini biasanya menjadi highlight utama karena memberi pengalaman laut, suasana pulau, dan waktu santai yang terasa berbeda dari area daratan.",
      "itinerary-day-2-body",
    ),
    headingBlock("Hari ketiga yang lebih ringan", "h2", "itinerary-day-3"),
    normalBlock(
      "Hari ketiga dapat diisi dengan agenda yang lebih ringan seperti sarapan santai, belanja oleh-oleh, atau menikmati satu spot yang dekat dengan area kembali sebelum lanjut ke bandara. Pola seperti ini membuat perjalanan terasa lebih seimbang dan tidak terlalu menguras tenaga di akhir trip.",
      "itinerary-day-3-body",
    ),
    headingBlock("Opsi itinerary untuk pasangan dan keluarga", "h2", "itinerary-variants"),
    normalBlock(
      "Untuk pasangan, itinerary sebaiknya dibuat lebih lembut ritmenya dengan kombinasi pantai, sunset, dan waktu istirahat yang cukup. Untuk keluarga, fokus utama sebaiknya pada akses yang mudah, destinasi yang nyaman, dan susunan rute yang tidak terlalu padat dalam satu hari.",
      "itinerary-variants-body",
    ),
    headingBlock("Tips agar itinerary 3D2N tetap nyaman", "h2", "itinerary-tips"),
    bulletBlock("Pilih area yang saling berdekatan agar waktu tidak habis di jalan.", "itinerary-tip-1"),
    bulletBlock("Jangan memaksakan terlalu banyak spot dalam satu hari.", "itinerary-tip-2"),
    bulletBlock("Sesuaikan area menginap dengan fokus rute utama perjalanan.", "itinerary-tip-3"),
    bulletBlock("Gunakan transport dengan driver atau paket yang rapi agar waktu lebih efisien.", "itinerary-tip-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual itinerary Lombok 3 hari", "itinerary-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Itinerary Lombok 3 hari yang baik bukan yang paling penuh, tetapi yang paling realistis, nyaman, dan tetap memberi pengalaman terbaik sesuai gaya perjalanan Anda.",
      "itinerary-closing-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombokMurahContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok murah bukan berarti itinerary seadanya", "h2", "cheap-package-overview"),
    normalBlock(
      "Banyak wisatawan mencari paket wisata Lombok murah karena ingin tetap menikmati destinasi populer tanpa harus menyusun trip sendiri dari nol. Paket yang lebih hemat tetap bisa terasa nyaman selama rute, durasi, dan fasilitasnya dirancang dengan realistis.",
      "cheap-package-overview-body-1",
    ),
    normalBlock(
      "Kunci dari paket wisata Lombok yang terjangkau adalah memilih kombinasi destinasi yang tepat, durasi yang sesuai budget, serta layanan yang benar-benar dibutuhkan. Dengan struktur itinerary yang efisien, biaya bisa ditekan tanpa membuat pengalaman trip terasa terburu-buru.",
      "cheap-package-overview-body-2",
    ),
    headingBlock("Apa yang membuat paket bisa lebih hemat", "h2", "cheap-package-factors"),
    bulletBlock("Durasi perjalanan yang sesuai dengan jumlah destinasi.", "cheap-package-factor-1"),
    bulletBlock("Rute wisata yang tidak terlalu menyebar ke banyak area.", "cheap-package-factor-2"),
    bulletBlock("Jumlah peserta yang membuat biaya lebih efisien per orang.", "cheap-package-factor-3"),
    bulletBlock("Pilihan hotel, transport, dan makan yang disesuaikan dengan prioritas tamu.", "cheap-package-factor-4"),
    headingBlock("Cocok untuk siapa", "h2", "cheap-package-fit"),
    bulletBlock("Wisatawan first timer yang ingin liburan praktis dengan budget lebih terukur.", "cheap-package-fit-1"),
    bulletBlock("Keluarga kecil atau rombongan yang ingin biaya per orang lebih ringan.", "cheap-package-fit-2"),
    bulletBlock("Tamu dari Jakarta, Surabaya, dan kota besar lain yang ingin konsultasi cepat sebelum berangkat.", "cheap-package-fit-3"),
    headingBlock("Tips memilih paket wisata Lombok murah", "h2", "cheap-package-tips"),
    bulletBlock("Fokus pada value, bukan hanya angka harga paling rendah.", "cheap-package-tip-1"),
    bulletBlock("Pastikan itinerary tetap realistis dan tidak terlalu padat.", "cheap-package-tip-2"),
    bulletBlock("Tanyakan detail fasilitas seperti hotel, makan, dan transport sejak awal.", "cheap-package-tip-3"),
    bulletBlock("Bandingkan paket berdasarkan kenyamanan dan efisiensi rute, bukan hanya biaya awal.", "cheap-package-tip-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok murah", "cheap-package-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket wisata Lombok murah yang baik adalah yang tetap nyaman, realistis, dan sesuai dengan gaya liburan Anda.",
      "cheap-package-quote",
    ),
  );

  return blocks;
}

function buildTourLombok3Hari2MalamContent(detailImageId) {
  const blocks = [
    headingBlock("Kenapa tour Lombok 3 hari 2 malam paling sering dipilih", "h2", "tour-3d2n-overview"),
    normalBlock(
      "Tour Lombok 3 hari 2 malam adalah durasi yang paling sering dipilih karena cukup untuk menikmati highlight utama Lombok tanpa mengambil cuti terlalu panjang. Paket ini cocok untuk first timer, pasangan, keluarga, maupun tamu dari luar kota yang ingin perjalanan praktis.",
      "tour-3d2n-overview-body-1",
    ),
    normalBlock(
      "Dalam durasi ini, itinerary biasanya dapat mencakup area pantai selatan, sunset spot, dan satu highlight utama seperti Gili Trawangan atau kombinasi destinasi daratan. Kuncinya adalah memilih rute yang efisien agar pengalaman tetap nyaman.",
      "tour-3d2n-overview-body-2",
    ),
    headingBlock("Susunan trip yang umum dipakai", "h2", "tour-3d2n-structure"),
    bulletBlock("Hari pertama untuk area yang dekat dari bandara dan sunset.", "tour-3d2n-structure-1"),
    bulletBlock("Hari kedua untuk highlight utama seperti Gili atau kombinasi pantai populer.", "tour-3d2n-structure-2"),
    bulletBlock("Hari ketiga untuk penutup yang lebih ringan sebelum kembali.", "tour-3d2n-structure-3"),
    headingBlock("Kelebihan durasi 3D2N", "h2", "tour-3d2n-benefits"),
    bulletBlock("Cukup efisien untuk first timer yang ingin itinerary ringkas.", "tour-3d2n-benefit-1"),
    bulletBlock("Lebih mudah dikombinasikan dengan budget dan jadwal liburan singkat.", "tour-3d2n-benefit-2"),
    bulletBlock("Cocok untuk private trip, keluarga, maupun honeymoon ringan.", "tour-3d2n-benefit-3"),
    headingBlock("Tips memilih tour 3 hari 2 malam", "h2", "tour-3d2n-tips"),
    bulletBlock("Tentukan fokus area utama sejak awal.", "tour-3d2n-tip-1"),
    bulletBlock("Jangan memaksakan terlalu banyak destinasi dalam satu hari.", "tour-3d2n-tip-2"),
    bulletBlock("Gunakan operator yang bisa menyesuaikan itinerary dengan profil peserta.", "tour-3d2n-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual tour Lombok 3 hari 2 malam", "tour-3d2n-image"));
  }

  blocks.push(
    quoteBlock(
      "Tour Lombok 3 hari 2 malam adalah opsi paling aman untuk wisatawan yang ingin melihat highlight Lombok tanpa ritme perjalanan yang terlalu berat.",
      "tour-3d2n-quote",
    ),
  );

  return blocks;
}

function buildTripGiliTrawanganContent(detailImageId) {
  const blocks = [
    headingBlock("Trip Gili Trawangan dari Lombok untuk day trip atau menginap", "h2", "trip-gili-overview"),
    normalBlock(
      "Trip Gili Trawangan menjadi salah satu agenda paling populer bagi wisatawan yang datang ke Lombok. Banyak tamu memilih destinasi ini karena ingin merasakan snorkeling, island vibes, sunset, dan pengalaman pulau yang ikonik tanpa harus mengambil liburan terlalu panjang.",
      "trip-gili-overview-body-1",
    ),
    normalBlock(
      "Perjalanan ke Gili Trawangan dapat diatur sebagai day trip maupun trip dengan menginap. Pilihan terbaik biasanya bergantung pada durasi liburan, titik keberangkatan, dan apakah wisatawan ingin fokus ke laut atau menggabungkan Gili dengan destinasi daratan Lombok.",
      "trip-gili-overview-body-2",
    ),
    headingBlock("Aktivitas yang paling dicari", "h2", "trip-gili-activities"),
    bulletBlock("Snorkeling dan island hopping.", "trip-gili-activity-1"),
    bulletBlock("Sunset dan suasana pulau yang lebih santai.", "trip-gili-activity-2"),
    bulletBlock("Sepeda keliling pulau dan quality time untuk pasangan.", "trip-gili-activity-3"),
    headingBlock("Day trip vs menginap", "h2", "trip-gili-options"),
    bulletBlock("Day trip cocok untuk tamu yang punya waktu terbatas.", "trip-gili-option-1"),
    bulletBlock("Menginap cocok untuk tamu yang ingin menikmati sunset dan suasana malam di pulau.", "trip-gili-option-2"),
    bulletBlock("Keduanya bisa dikombinasikan dengan paket wisata Lombok yang lebih panjang.", "trip-gili-option-3"),
    headingBlock("Tips merencanakan trip", "h2", "trip-gili-tips"),
    bulletBlock("Atur transport menuju pelabuhan sejak awal.", "trip-gili-tip-1"),
    bulletBlock("Pilih ritme trip sesuai durasi dan preferensi aktivitas laut.", "trip-gili-tip-2"),
    bulletBlock("Gunakan paket atau driver jika ingin perjalanan lebih praktis dari hotel atau bandara.", "trip-gili-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual trip Gili Trawangan", "trip-gili-image"));
  }

  blocks.push(
    quoteBlock(
      "Trip Gili Trawangan paling nyaman ketika alur darat dan lautnya sudah direncanakan dengan baik sejak awal.",
      "trip-gili-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombokDariJakartaContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok dari Jakarta untuk perjalanan yang lebih praktis", "h2", "jakarta-package-overview"),
    normalBlock(
      "Wisatawan dari Jakarta sering mencari paket wisata Lombok yang praktis karena ingin semuanya lebih mudah dikonsultasikan sebelum keberangkatan. Mulai dari durasi, destinasi, hotel, sampai transport, semuanya biasanya ingin sudah punya gambaran jelas sejak awal.",
      "jakarta-package-overview-body-1",
    ),
    normalBlock(
      "Paket wisata Lombok dari Jakarta cocok untuk pasangan, keluarga, maupun grup kecil yang ingin liburan tanpa repot menyusun itinerary sendiri. Karena ritme keberangkatan dari kota besar cenderung padat, layanan yang responsif dan itinerary yang efisien menjadi nilai penting.",
      "jakarta-package-overview-body-2",
    ),
    headingBlock("Kenapa artikel ini relevan untuk wisatawan Jakarta", "h2", "jakarta-package-why"),
    bulletBlock("Membantu memilih durasi yang paling realistis untuk cuti singkat.", "jakarta-package-why-1"),
    bulletBlock("Memudahkan konsultasi paket sejak sebelum berangkat.", "jakarta-package-why-2"),
    bulletBlock("Cocok untuk tamu yang ingin perjalanan lebih terstruktur begitu tiba di Lombok.", "jakarta-package-why-3"),
    headingBlock("Pilihan paket yang paling sering dicari", "h2", "jakarta-package-options"),
    bulletBlock("One day tour untuk extension trip atau kunjungan singkat.", "jakarta-package-option-1"),
    bulletBlock("3 hari 2 malam untuk first timer yang ingin itinerary seimbang.", "jakarta-package-option-2"),
    bulletBlock("4 hari 3 malam untuk tamu yang ingin ritme lebih santai.", "jakarta-package-option-3"),
    headingBlock("Tips sebelum booking", "h2", "jakarta-package-tips"),
    bulletBlock("Tentukan tanggal keberangkatan dan jumlah peserta lebih awal.", "jakarta-package-tip-1"),
    bulletBlock("Pilih fokus trip: pantai selatan, Gili, atau kombinasi keduanya.", "jakarta-package-tip-2"),
    bulletBlock("Pastikan detail hotel, transport, dan kebutuhan khusus sudah dibicarakan sejak awal.", "jakarta-package-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok dari Jakarta", "jakarta-package-image"));
  }

  blocks.push(
    quoteBlock(
      "Untuk wisatawan dari Jakarta, paket wisata Lombok yang paling ideal adalah yang responsif, jelas sejak awal, dan mudah disesuaikan dengan gaya liburan Anda.",
      "jakarta-package-quote",
    ),
  );

  return blocks;
}

function buildRentalMobilLombokMurahContent(detailImageId) {
  const blocks = [
    headingBlock("Rental mobil Lombok murah untuk trip yang tetap nyaman", "h2", "cheap-rental-overview"),
    normalBlock(
      "Rental mobil Lombok murah banyak dicari oleh wisatawan yang ingin transport fleksibel tanpa harus ikut tour penuh. Namun, layanan yang terjangkau tetap perlu dilihat dari kenyamanan armada, kejelasan rute, dan profesionalitas driver jika digunakan selama liburan.",
      "cheap-rental-overview-body-1",
    ),
    normalBlock(
      "Biaya rental yang lebih hemat biasanya dipengaruhi oleh jenis armada, durasi penggunaan, area penjemputan, dan kebutuhan perjalanan. Dengan pemilihan layanan yang tepat, wisatawan tetap bisa mendapatkan transport yang efisien tanpa mengorbankan kenyamanan dasar perjalanan.",
      "cheap-rental-overview-body-2",
    ),
    headingBlock("Kapan rental murah paling cocok dipilih", "h2", "cheap-rental-fit"),
    bulletBlock("Untuk city tour dan transfer singkat di area utama Lombok.", "cheap-rental-fit-1"),
    bulletBlock("Untuk pasangan atau keluarga kecil dengan rute yang sudah jelas.", "cheap-rental-fit-2"),
    bulletBlock("Untuk wisatawan yang ingin fleksibel tetapi tetap mengontrol biaya transport.", "cheap-rental-fit-3"),
    headingBlock("Cara memilih rental yang tepat", "h2", "cheap-rental-tips"),
    bulletBlock("Pastikan armada sesuai jumlah peserta dan barang bawaan.", "cheap-rental-tip-1"),
    bulletBlock("Perjelas area jemput dan tujuan agar estimasi biaya lebih akurat.", "cheap-rental-tip-2"),
    bulletBlock("Utamakan layanan yang komunikatif dan mudah dikonsultasikan.", "cheap-rental-tip-3"),
    bulletBlock("Bandingkan layanan berdasarkan value, bukan hanya harga terendah.", "cheap-rental-tip-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual rental mobil Lombok murah", "cheap-rental-image"));
  }

  blocks.push(
    quoteBlock(
      "Rental mobil Lombok murah tetap bisa nyaman jika armada, driver, dan rutenya dipilih dengan tepat.",
      "cheap-rental-quote",
    ),
  );

  return blocks;
}

function buildTempatWisataLombokSelainGiliContent(detailImageId) {
  const blocks = [
    headingBlock("Pilihan tempat wisata di Lombok selain Gili", "h2", "non-gili-overview"),
    normalBlock(
      "Meski Gili Trawangan sangat populer, Lombok punya banyak destinasi menarik lain yang layak masuk itinerary. Pantai selatan, bukit sunset, area resort, air terjun, hingga kawasan menginap strategis seperti Senggigi bisa menjadi alternatif yang sangat menarik untuk wisatawan yang ingin pengalaman Lombok yang lebih beragam.",
      "non-gili-overview-body-1",
    ),
    normalBlock(
      "Artikel ini cocok untuk wisatawan yang ingin menjelajahi Lombok daratan, menghindari trip laut penuh, atau sekadar mencari kombinasi destinasi selain Gili agar itinerary terasa lebih seimbang.",
      "non-gili-overview-body-2",
    ),
    headingBlock("Alternatif destinasi yang layak dipertimbangkan", "h2", "non-gili-options"),
    bulletBlock("Kuta Mandalika dan pantai selatan untuk beach hopping dan sunset.", "non-gili-option-1"),
    bulletBlock("Bukit Merese dan viewpoint lain untuk panorama alam dan golden hour.", "non-gili-option-2"),
    bulletBlock("Senggigi untuk hotel, kuliner, dan basecamp Lombok barat.", "non-gili-option-3"),
    bulletBlock("Air terjun untuk wisata alam yang lebih sejuk dan berbeda dari area pantai.", "non-gili-option-4"),
    headingBlock("Siapa yang cocok dengan itinerary selain Gili", "h2", "non-gili-fit"),
    bulletBlock("Wisatawan yang ingin fokus pada trip daratan.", "non-gili-fit-1"),
    bulletBlock("Keluarga yang ingin rute lebih sederhana dan stabil.", "non-gili-fit-2"),
    bulletBlock("Tamu yang ingin kombinasi pantai, budaya, dan pemandangan alam.", "non-gili-fit-3"),
    headingBlock("Tips menyusun itinerary", "h2", "non-gili-tips"),
    bulletBlock("Kelompokkan destinasi berdasarkan area agar waktu tempuh tetap efisien.", "non-gili-tip-1"),
    bulletBlock("Pilih 1-2 highlight utama per hari agar trip tidak terlalu padat.", "non-gili-tip-2"),
    bulletBlock("Gunakan paket wisata atau driver lokal agar rute lebih nyaman.", "non-gili-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual tempat wisata di Lombok selain Gili", "non-gili-image"));
  }

  blocks.push(
    quoteBlock(
      "Lombok tetap sangat menarik meski tanpa fokus utama ke Gili, selama Anda memilih kombinasi destinasi daratan yang tepat.",
      "non-gili-quote",
    ),
  );

  return blocks;
}

function buildPaketHoneymoonLombokMurahContent(detailImageId) {
  const blocks = [
    headingBlock("Paket honeymoon Lombok murah tetap bisa romantis dan nyaman", "h2", "cheap-honeymoon-overview"),
    normalBlock(
      "Paket honeymoon Lombok murah banyak dicari pasangan yang ingin menikmati liburan romantis tanpa mengambil budget terlalu tinggi. Meski lebih hemat, honeymoon tetap bisa terasa berkesan selama itinerary, pilihan hotel, dan ritme perjalanan disusun dengan realistis.",
      "cheap-honeymoon-overview-body-1",
    ),
    normalBlock(
      "Fokus utama paket honeymoon yang lebih terjangkau adalah value, bukan sekadar harga murah. Pasangan tetap bisa menikmati sunset, pantai, quality time, dan pengalaman private dengan pengaturan trip yang lebih efisien.",
      "cheap-honeymoon-overview-body-2",
    ),
    headingBlock("Apa yang membuat honeymoon bisa lebih hemat", "h2", "cheap-honeymoon-factors"),
    bulletBlock("Memilih durasi 2D1N atau 3D2N yang lebih efisien.", "cheap-honeymoon-factor-1"),
    bulletBlock("Menentukan destinasi romantis yang aksesnya mudah dan tidak terlalu menyebar.", "cheap-honeymoon-factor-2"),
    bulletBlock("Menyesuaikan hotel, transport, dan tambahan experience dengan prioritas pasangan.", "cheap-honeymoon-factor-3"),
    headingBlock("Tips memilih paket honeymoon Lombok murah", "h2", "cheap-honeymoon-tips"),
    bulletBlock("Utamakan kenyamanan dan suasana trip, bukan harga terendah saja.", "cheap-honeymoon-tip-1"),
    bulletBlock("Pilih itinerary yang santai agar pasangan tetap menikmati momen berdua.", "cheap-honeymoon-tip-2"),
    bulletBlock("Pastikan hotel, transport, dan fasilitas utama dijelaskan sejak awal.", "cheap-honeymoon-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket honeymoon Lombok murah", "cheap-honeymoon-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket honeymoon Lombok murah yang baik bukan yang paling murah, tetapi yang paling pas dengan suasana romantis dan budget pasangan.",
      "cheap-honeymoon-quote",
    ),
  );

  return blocks;
}

function buildSewaMobilLombokPlusDriverContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa mobil Lombok plus driver untuk perjalanan yang lebih praktis", "h2", "driver-rental-overview"),
    normalBlock(
      "Sewa mobil Lombok plus driver menjadi pilihan yang sangat praktis bagi wisatawan yang ingin menikmati perjalanan tanpa harus repot menyetir sendiri. Bagi tamu yang baru pertama kali ke Lombok, datang bersama keluarga, atau ingin perjalanan terasa lebih ringan, layanan ini sering menjadi opsi yang paling nyaman.",
      "driver-rental-overview-body-1",
    ),
    normalBlock(
      "Dengan driver, Anda tidak perlu sibuk memikirkan rute, parkir, kondisi jalan, atau susunan perjalanan selama di lapangan. Fokus utama Anda cukup menikmati perjalanan, beristirahat dengan lebih tenang, dan menjalani itinerary dengan ritme yang lebih nyaman.",
      "driver-rental-overview-body-2",
    ),
    headingBlock("Keuntungan sewa mobil dengan driver di Lombok", "h2", "driver-rental-benefits"),
    normalBlock(
      "Keuntungan terbesar dari layanan ini adalah kenyamanan. Saat berada di daerah yang belum terlalu familiar, menyetir sendiri sering justru membuat energi lebih banyak habis untuk hal teknis. Dengan driver, perjalanan terasa lebih praktis karena Anda tinggal mengikuti rencana perjalanan yang sudah disesuaikan.",
      "driver-rental-benefit-body-1",
    ),
    bulletBlock("Tidak perlu repot menyetir dan mencari rute sendiri.", "driver-rental-benefit-1"),
    bulletBlock("Cocok untuk airport transfer, city tour, dan perjalanan harian.", "driver-rental-benefit-2"),
    bulletBlock("Membantu ritme perjalanan terasa lebih santai bagi first timer dan keluarga.", "driver-rental-benefit-3"),
    headingBlock("Cocok untuk siapa layanan ini", "h2", "driver-rental-fit"),
    normalBlock(
      "Layanan mobil plus driver cocok untuk pasangan, keluarga, group kecil, tamu luar kota, dan wisatawan yang ingin perjalanan lebih nyaman dari awal. Ini juga ideal untuk tamu yang datang dengan jadwal singkat dan ingin memanfaatkan waktu seefisien mungkin.",
      "driver-rental-fit-body-1",
    ),
    bulletBlock("First timer yang belum familiar dengan rute Lombok.", "driver-rental-fit-1"),
    bulletBlock("Keluarga dan pasangan yang ingin perjalanan lebih santai.", "driver-rental-fit-2"),
    bulletBlock("Tamu yang ingin airport transfer, city tour, atau trip beberapa hari.", "driver-rental-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil Lombok plus driver", "driver-rental-image"));
  }

  blocks.push(
    headingBlock("Rute perjalanan yang umum dipilih", "h2", "driver-rental-routes"),
    normalBlock(
      "Banyak tamu menggunakan layanan ini untuk penjemputan bandara, perjalanan ke Kuta Lombok, Mandalika, Senggigi, Mataram, serta kombinasi beberapa destinasi dalam satu hari. Beberapa tamu juga memilih kendaraan plus driver untuk perjalanan beberapa hari agar susunan perjalanan lebih rapi dan nyaman.",
      "driver-rental-routes-body",
    ),
    headingBlock("Tips booking mobil plus driver", "h2", "driver-rental-tips"),
    bulletBlock("Sampaikan jumlah peserta, area jemput, dan area tujuan sejak awal.", "driver-rental-tip-1"),
    bulletBlock("Jelaskan apakah kendaraan dipakai untuk transfer singkat atau trip harian penuh.", "driver-rental-tip-2"),
    bulletBlock("Booking lebih awal saat high season atau jika membutuhkan kendaraan beberapa hari.", "driver-rental-tip-3"),
    quoteBlock(
      "Sewa mobil Lombok plus driver adalah solusi praktis bagi tamu yang ingin fokus menikmati trip tanpa repot mengatur detail perjalanan di lapangan.",
      "driver-rental-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombok4Hari3MalamContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok 4 hari 3 malam untuk liburan yang lebih lengkap", "h2", "package-4d3n-overview"),
    normalBlock(
      "Paket wisata Lombok 4 hari 3 malam cocok untuk wisatawan yang ingin melihat Lombok dengan ritme lebih santai dan pilihan destinasi yang lebih lengkap. Durasi ini memberi ruang untuk menggabungkan area pantai selatan, Gili, sunset spot, dan beberapa destinasi daratan tanpa terburu-buru.",
      "package-4d3n-overview-body-1",
    ),
    normalBlock(
      "Pilihan 4D3N biasanya dicari oleh keluarga, pasangan, dan wisatawan dari luar kota yang ingin liburan lebih maksimal. Dibanding itinerary yang lebih pendek, durasi ini memberi fleksibilitas yang lebih baik dalam menyusun rute.",
      "package-4d3n-overview-body-2",
    ),
    headingBlock("Kenapa durasi 4D3N banyak dipilih", "h2", "package-4d3n-benefits"),
    bulletBlock("Lebih leluasa untuk menikmati kombinasi destinasi laut dan darat.", "package-4d3n-benefit-1"),
    bulletBlock("Ritme perjalanan bisa dibuat lebih santai dan nyaman.", "package-4d3n-benefit-2"),
    bulletBlock("Cocok untuk first timer yang ingin pengalaman Lombok lebih lengkap.", "package-4d3n-benefit-3"),
    headingBlock("Gambaran trip 4 hari 3 malam", "h2", "package-4d3n-structure"),
    bulletBlock("Hari pertama untuk kedatangan dan area yang mudah dijangkau.", "package-4d3n-structure-1"),
    bulletBlock("Hari kedua dan ketiga untuk highlight utama seperti Gili atau pantai selatan.", "package-4d3n-structure-2"),
    bulletBlock("Hari keempat untuk penutup yang lebih ringan sebelum pulang.", "package-4d3n-structure-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok 4 hari 3 malam", "package-4d3n-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket wisata Lombok 4 hari 3 malam cocok untuk tamu yang ingin menikmati Lombok dengan pengalaman yang lebih lengkap namun tetap nyaman.",
      "package-4d3n-quote",
    ),
  );

  return blocks;
}

function buildWisataKutaLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Kuta Lombok untuk pantai selatan dan sunset terbaik", "h2", "kuta-lombok-overview"),
    normalBlock(
      "Wisata Kuta Lombok menjadi salah satu pilihan utama untuk wisatawan yang ingin menikmati pantai selatan, sunset, dan suasana liburan yang santai namun tetap visual. Area ini populer untuk pasangan, keluarga, maupun wisatawan yang baru pertama kali datang ke Lombok.",
      "kuta-lombok-overview-body-1",
    ),
    normalBlock(
      "Karena aksesnya relatif mudah dari bandara, Kuta Lombok sering menjadi destinasi pertama atau area menginap yang nyaman untuk memulai trip. Kawasan ini juga mudah dikombinasikan dengan pantai selatan lain dan viewpoint ikonik.",
      "kuta-lombok-overview-body-2",
    ),
    headingBlock("Aktivitas yang banyak dicari di Kuta Lombok", "h2", "kuta-lombok-activities"),
    bulletBlock("Beach hopping ke pantai selatan Lombok.", "kuta-lombok-activity-1"),
    bulletBlock("Menikmati sunset di bukit dan viewpoint populer.", "kuta-lombok-activity-2"),
    bulletBlock("Short escape yang ringan untuk pasangan, keluarga, atau first timer.", "kuta-lombok-activity-3"),
    headingBlock("Kenapa Kuta Lombok cocok untuk first timer", "h2", "kuta-lombok-fit"),
    bulletBlock("Dekat dari bandara dan mudah diakses.", "kuta-lombok-fit-1"),
    bulletBlock("Banyak pilihan pantai dan spot sunset dalam area yang cukup dekat.", "kuta-lombok-fit-2"),
    bulletBlock("Ritme trip bisa dibuat santai tanpa harus terlalu banyak pindah area.", "kuta-lombok-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Kuta Lombok", "kuta-lombok-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Kuta Lombok cocok untuk tamu yang ingin pantai selatan, sunset, dan short escape yang mudah diakses sejak hari pertama tiba.",
      "kuta-lombok-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombokDariSurabayaContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok dari Surabaya untuk trip yang lebih praktis", "h2", "surabaya-package-overview"),
    normalBlock(
      "Paket wisata Lombok dari Surabaya banyak dicari wisatawan yang ingin semua detail perjalanan lebih jelas sejak sebelum keberangkatan. Mulai dari durasi, destinasi, hotel, hingga transport, semuanya biasanya ingin sudah dipahami lebih awal agar proses booking lebih cepat.",
      "surabaya-package-overview-body-1",
    ),
    normalBlock(
      "Paket seperti ini cocok untuk pasangan, keluarga, maupun grup kecil dari Surabaya yang ingin konsultasi cepat dan itinerary yang efisien. Dengan perencanaan awal yang rapi, trip ke Lombok bisa terasa jauh lebih praktis.",
      "surabaya-package-overview-body-2",
    ),
    headingBlock("Kenapa artikel ini relevan untuk wisatawan Surabaya", "h2", "surabaya-package-why"),
    bulletBlock("Membantu memilih durasi yang paling realistis untuk liburan ke Lombok.", "surabaya-package-why-1"),
    bulletBlock("Memudahkan konsultasi hotel, transport, dan fokus destinasi sejak awal.", "surabaya-package-why-2"),
    bulletBlock("Cocok untuk tamu yang ingin perjalanan lebih terstruktur begitu tiba di Lombok.", "surabaya-package-why-3"),
    headingBlock("Tips sebelum booking", "h2", "surabaya-package-tips"),
    bulletBlock("Tentukan tanggal perjalanan dan jumlah peserta lebih awal.", "surabaya-package-tip-1"),
    bulletBlock("Pilih fokus trip: Gili, pantai selatan, atau kombinasi keduanya.", "surabaya-package-tip-2"),
    bulletBlock("Pastikan hotel dan transport dibicarakan sejak awal agar itinerary lebih jelas.", "surabaya-package-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok dari Surabaya", "surabaya-package-image"));
  }

  blocks.push(
    quoteBlock(
      "Untuk wisatawan dari Surabaya, paket wisata Lombok yang paling ideal adalah yang jelas sejak awal, mudah dikonsultasikan, dan efisien saat dijalankan.",
      "surabaya-package-quote",
    ),
  );

  return blocks;
}

function buildTourGiliTrawanganDariLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Tour Gili Trawangan dari Lombok untuk day trip atau menginap", "h2", "gili-tour-overview"),
    normalBlock(
      "Tour Gili Trawangan dari Lombok cocok untuk wisatawan yang ingin menikmati snorkeling, sunset, dan suasana pulau yang paling populer di kawasan Gili. Banyak tamu memilih tour ini karena ingin pengalaman laut yang ikonik tanpa harus menyusun alur perjalanan sendiri.",
      "gili-tour-overview-body-1",
    ),
    normalBlock(
      "Pilihan tour bisa diarahkan sebagai day trip maupun trip dengan menginap. Yang paling penting adalah memastikan transport darat ke pelabuhan dan penyeberangan laut sudah diatur dengan baik agar perjalanan tetap nyaman.",
      "gili-tour-overview-body-2",
    ),
    headingBlock("Pilihan tour yang paling umum", "h2", "gili-tour-options"),
    bulletBlock("Day trip untuk wisatawan yang punya waktu terbatas.", "gili-tour-option-1"),
    bulletBlock("Menginap untuk menikmati sunset dan suasana malam di pulau.", "gili-tour-option-2"),
    bulletBlock("Kombinasi dengan paket wisata Lombok agar itinerary lebih lengkap.", "gili-tour-option-3"),
    headingBlock("Tips merencanakan tour Gili Trawangan", "h2", "gili-tour-tips"),
    bulletBlock("Atur keberangkatan lebih awal agar ritme perjalanan lebih nyaman.", "gili-tour-tip-1"),
    bulletBlock("Pilih day trip atau menginap sesuai durasi liburan Anda.", "gili-tour-tip-2"),
    bulletBlock("Gunakan operator atau driver yang memahami alur transport ke pelabuhan.", "gili-tour-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual tour Gili Trawangan dari Lombok", "gili-tour-image"));
  }

  blocks.push(
    quoteBlock(
      "Tour Gili Trawangan dari Lombok paling nyaman ketika alur darat dan lautnya sudah dipersiapkan sejak awal.",
      "gili-tour-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombok3Hari2MalamContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok 3 hari 2 malam untuk liburan yang efisien", "h2", "package-3d2n-overview"),
    normalBlock(
      "Paket wisata Lombok 3 hari 2 malam menjadi salah satu pilihan paling populer untuk first timer karena durasinya cukup ideal. Wisatawan bisa menikmati highlight utama Lombok tanpa harus membuat perjalanan terasa terlalu padat atau mengambil waktu liburan yang terlalu panjang.",
      "package-3d2n-overview-body-1",
    ),
    normalBlock(
      "Dengan penyusunan itinerary yang tepat, paket 3D2N dapat mencakup area selatan, sunset spot, area menginap strategis, dan satu highlight utama seperti Gili Trawangan atau kombinasi destinasi daratan yang lebih efisien.",
      "package-3d2n-overview-body-2",
    ),
    headingBlock("Kenapa paket 3D2N paling sering dipilih", "h2", "package-3d2n-benefits"),
    bulletBlock("Durasi ideal untuk first timer dan wisatawan dengan waktu terbatas.", "package-3d2n-benefit-1"),
    bulletBlock("Cukup efisien untuk melihat highlight Lombok tanpa ritme trip terlalu berat.", "package-3d2n-benefit-2"),
    bulletBlock("Cocok untuk pasangan, keluarga, dan private trip singkat.", "package-3d2n-benefit-3"),
    headingBlock("Gambaran itinerary 3 hari 2 malam", "h2", "package-3d2n-structure"),
    bulletBlock("Hari pertama untuk area yang dekat dari bandara dan sunset.", "package-3d2n-structure-1"),
    bulletBlock("Hari kedua untuk highlight utama seperti Gili atau kombinasi pantai selatan.", "package-3d2n-structure-2"),
    bulletBlock("Hari ketiga untuk penutup yang lebih ringan sebelum kembali.", "package-3d2n-structure-3"),
    linkedNormalBlock(
      [
        { text: "Untuk melihat pilihan durasi yang lebih luas, Anda bisa mulai dari halaman " },
        { text: "paket wisata Lombok", href: "/paket-wisata-lombok" },
        { text: ". Jika ingin membandingkan susunan rute, cek juga " },
        { text: "itinerary Lombok 3 hari", href: "/blog/itinerary-lombok-3-hari" },
        { text: " dan ide " },
        { text: "wisata Gili Trawangan", href: "/wisata/gili-trawangan" },
        { text: " yang sering menjadi highlight hari kedua." },
      ],
      "package-3d2n-internal-links",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok 3 hari 2 malam", "package-3d2n-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket wisata Lombok 3 hari 2 malam adalah pilihan yang paling aman untuk first timer yang ingin pengalaman seimbang, efisien, dan tetap nyaman.",
      "package-3d2n-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombok2Hari1MalamContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok 2 hari 1 malam untuk short escape yang praktis", "h2", "package-2d1n-overview"),
    normalBlock(
      "Paket wisata Lombok 2 hari 1 malam cocok untuk wisatawan yang ingin short escape dengan itinerary yang ringkas namun tetap terarah. Durasi ini sering dipilih pasangan, keluarga kecil, atau tamu yang hanya punya waktu singkat di Lombok.",
      "package-2d1n-overview-body-1",
    ),
    normalBlock(
      "Kunci trip 2D1N adalah memilih area wisata yang tidak terlalu berjauhan agar waktu perjalanan tidak habis di jalan. Dengan fokus rute yang tepat, liburan singkat tetap bisa terasa worth it dan nyaman.",
      "package-2d1n-overview-body-2",
    ),
    headingBlock("Kapan paket 2D1N paling cocok dipilih", "h2", "package-2d1n-fit"),
    bulletBlock("Saat hanya punya waktu singkat untuk liburan ke Lombok.", "package-2d1n-fit-1"),
    bulletBlock("Untuk pasangan atau keluarga kecil yang ingin trip praktis.", "package-2d1n-fit-2"),
    bulletBlock("Untuk extension trip yang tetap ingin punya itinerary jelas.", "package-2d1n-fit-3"),
    headingBlock("Tips agar trip 2D1N tetap nyaman", "h2", "package-2d1n-tips"),
    bulletBlock("Fokus ke satu area utama seperti Kuta Lombok atau Lombok barat.", "package-2d1n-tip-1"),
    bulletBlock("Hindari terlalu banyak destinasi dalam waktu singkat.", "package-2d1n-tip-2"),
    bulletBlock("Gunakan transport dan itinerary yang sudah tersusun lebih awal.", "package-2d1n-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok 2 hari 1 malam", "package-2d1n-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket wisata Lombok 2 hari 1 malam tetap menarik selama fokus area dan ritme perjalanannya dibuat realistis sejak awal.",
      "package-2d1n-quote",
    ),
  );

  return blocks;
}

function buildSewaMobilBandaraLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa mobil bandara Lombok untuk perjalanan yang lebih praktis sejak mendarat", "h2", "airport-rental-overview"),
    normalBlock(
      "Sewa mobil bandara Lombok menjadi salah satu kebutuhan paling penting bagi tamu yang ingin perjalanan terasa lebih praktis sejak pertama kali mendarat. Setelah penerbangan, banyak orang tentu ingin langsung melanjutkan perjalanan dengan nyaman tanpa harus repot mencari kendaraan atau menunggu terlalu lama.",
      "airport-rental-overview-body-1",
    ),
    normalBlock(
      "Layanan jemput bandara sangat membantu untuk pasangan, keluarga, maupun rombongan yang ingin tiba dengan lebih tenang. Selain untuk transfer ke hotel, kendaraan dari bandara juga sering dipakai untuk langsung lanjut ke area wisata, menuju pelabuhan, atau berpindah ke kota lain di Lombok pada hari kedatangan.",
      "airport-rental-overview-body-2",
    ),
    headingBlock("Kenapa banyak tamu memilih jemput bandara di Lombok", "h2", "airport-rental-why"),
    normalBlock(
      "Setelah tiba di bandara, tamu biasanya ingin semuanya terasa lebih mudah. Itulah sebabnya layanan jemput bandara banyak dipilih. Kendaraan yang sudah siap sejak awal memberi rasa nyaman, terutama bagi tamu yang datang malam hari, membawa koper cukup banyak, atau baru pertama kali berkunjung ke Lombok.",
      "airport-rental-why-body",
    ),
    headingBlock("Area tujuan populer dari bandara Lombok", "h2", "airport-rental-destinations"),
    bulletBlock("Kuta Lombok dan Mandalika untuk tamu yang ingin langsung menikmati area selatan.", "airport-rental-destination-1"),
    bulletBlock("Senggigi dan Mataram untuk area hotel, kuliner, dan basecamp trip.", "airport-rental-destination-2"),
    bulletBlock("Pelabuhan dan titik transfer menuju Gili atau perjalanan lanjutan lainnya.", "airport-rental-destination-3"),
    headingBlock("Pilihan armada untuk jemput bandara", "h2", "airport-rental-fleet"),
    normalBlock(
      "Untuk pasangan atau keluarga kecil, kendaraan keluarga biasanya sudah nyaman digunakan. Untuk rombongan, kendaraan berkapasitas lebih besar seperti Hiace bisa menjadi pilihan yang lebih praktis agar seluruh peserta tetap dalam satu kendaraan dan bagasi tetap tertata.",
      "airport-rental-fleet-body",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil bandara Lombok", "airport-rental-image"));
  }

  blocks.push(
    headingBlock("Tips booking jemput bandara Lombok", "h2", "airport-rental-tips"),
    bulletBlock("Siapkan jam landing, jumlah peserta, dan banyaknya bagasi.", "airport-rental-tip-1"),
    bulletBlock("Sampaikan tujuan akhir dan apakah ingin langsung lanjut wisata.", "airport-rental-tip-2"),
    bulletBlock("Booking lebih awal saat musim ramai agar pilihan armada lebih leluasa.", "airport-rental-tip-3"),
    quoteBlock(
      "Sewa mobil bandara Lombok adalah pilihan praktis bagi tamu yang ingin perjalanan terasa rapi sejak mendarat hingga tiba di tujuan pertama.",
      "airport-rental-quote",
    ),
  );

  return blocks;
}

function buildHoneymoonGiliTrawanganContent(detailImageId) {
  const blocks = [
    headingBlock("Honeymoon Gili Trawangan untuk liburan romantis di pulau favorit", "h2", "honeymoon-gili-overview"),
    normalBlock(
      "Honeymoon Gili Trawangan cocok untuk pasangan yang ingin suasana pulau yang santai, sunset yang kuat, dan pengalaman berdua yang terasa lebih private. Banyak pasangan memilih Gili Trawangan karena island vibes-nya sangat mendukung trip romantis.",
      "honeymoon-gili-overview-body-1",
    ),
    normalBlock(
      "Dengan kombinasi sunset, sepeda keliling pulau, suasana tepi pantai, dan opsi menginap yang romantis, Gili Trawangan menjadi salah satu destinasi honeymoon paling favorit di Lombok. Trip ini juga bisa menjadi bagian dari paket honeymoon Lombok yang lebih panjang.",
      "honeymoon-gili-overview-body-2",
    ),
    headingBlock("Kenapa Gili Trawangan cocok untuk honeymoon", "h2", "honeymoon-gili-benefits"),
    bulletBlock("Suasana pulau terasa lebih santai dan intimate untuk pasangan.", "honeymoon-gili-benefit-1"),
    bulletBlock("Sunset dan island vibes sangat kuat untuk momen romantis.", "honeymoon-gili-benefit-2"),
    bulletBlock("Bisa digabungkan dengan paket honeymoon Lombok yang lebih lengkap.", "honeymoon-gili-benefit-3"),
    headingBlock("Tips merencanakan honeymoon ke Gili", "h2", "honeymoon-gili-tips"),
    bulletBlock("Pertimbangkan menginap agar pengalaman lebih santai.", "honeymoon-gili-tip-1"),
    bulletBlock("Atur transport darat dan laut sejak awal agar perjalanan lebih nyaman.", "honeymoon-gili-tip-2"),
    bulletBlock("Pilih ritme itinerary yang fokus pada quality time, bukan terlalu banyak pindah spot.", "honeymoon-gili-tip-3"),
    linkedNormalBlock(
      [
        { text: "Artikel ini paling ideal dibaca bersama halaman " },
        { text: "paket honeymoon Lombok", href: "/paket-honeymoon-lombok" },
        { text: " agar Anda bisa melihat gambaran trip berdua secara utuh. Jika ingin mengenal pulaunya lebih dulu, lihat juga " },
        { text: "wisata Gili Trawangan", href: "/wisata/gili-trawangan" },
        { text: " untuk aktivitas, akses, dan suasana yang paling sering dicari pasangan." },
      ],
      "honeymoon-gili-internal-links",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual honeymoon Gili Trawangan", "honeymoon-gili-image"));
  }

  blocks.push(
    quoteBlock(
      "Honeymoon Gili Trawangan paling cocok untuk pasangan yang ingin island vibes, sunset romantis, dan pengalaman yang terasa lebih private.",
      "honeymoon-gili-quote",
    ),
  );

  return blocks;
}

function buildWisataSenggigiLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Senggigi Lombok untuk sunset, hotel, dan basecamp trip", "h2", "senggigi-lombok-overview"),
    normalBlock(
      "Wisata Senggigi Lombok cocok untuk wisatawan yang mencari area menginap strategis, sunset yang mudah dinikmati, dan akses yang nyaman ke banyak titik perjalanan di Lombok barat. Area ini sering dipilih keluarga, pasangan, dan tamu yang ingin basecamp lebih stabil.",
      "senggigi-lombok-overview-body-1",
    ),
    normalBlock(
      "Senggigi tetap menarik karena kombinasi hotel, restoran, pantai, dan posisinya yang cukup nyaman untuk menuju area lain seperti Gili atau destinasi Lombok barat. Karena itu, Senggigi cocok untuk perjalanan yang lebih santai dan terstruktur.",
      "senggigi-lombok-overview-body-2",
    ),
    headingBlock("Hal yang paling sering dicari wisatawan", "h2", "senggigi-lombok-points"),
    bulletBlock("Sunset dan area pantai yang mudah diakses.", "senggigi-lombok-point-1"),
    bulletBlock("Pilihan hotel dan restoran yang nyaman untuk beberapa hari.", "senggigi-lombok-point-2"),
    bulletBlock("Posisi strategis untuk basecamp sebelum lanjut ke Gili atau Lombok barat.", "senggigi-lombok-point-3"),
    headingBlock("Kenapa Senggigi cocok untuk basecamp", "h2", "senggigi-lombok-basecamp"),
    bulletBlock("Aksesnya nyaman ke banyak titik perjalanan di Lombok barat.", "senggigi-lombok-basecamp-1"),
    bulletBlock("Cocok untuk keluarga dan tamu yang ingin ritme lebih tenang.", "senggigi-lombok-basecamp-2"),
    bulletBlock("Mudah dikombinasikan dengan layanan sewa mobil dan paket wisata.", "senggigi-lombok-basecamp-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Senggigi Lombok", "senggigi-lombok-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Senggigi Lombok paling cocok untuk tamu yang ingin basecamp stabil, sunset yang mudah dinikmati, dan perjalanan yang lebih praktis di Lombok barat.",
      "senggigi-lombok-quote",
    ),
  );

  return blocks;
}

function buildWisataPinkBeachLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Pink Beach Lombok untuk trip pantai timur yang berbeda", "h2", "pink-beach-overview"),
    normalBlock(
      "Wisata Pink Beach Lombok cocok untuk wisatawan yang ingin pengalaman pantai yang berbeda dari area selatan atau Gili. Daya tarik utamanya ada pada visual pantai yang unik, suasana yang lebih tenang, dan pengalaman trip timur Lombok yang terasa spesial.",
      "pink-beach-overview-body-1",
    ),
    normalBlock(
      "Pink Beach sering dipilih untuk day trip, island experience ringan, atau variasi itinerary bagi tamu yang ingin melihat sisi Lombok yang lebih hidden gem. Destinasi ini juga kuat untuk wisatawan yang menyukai dokumentasi visual dan suasana pantai yang tidak terlalu ramai.",
      "pink-beach-overview-body-2",
    ),
    headingBlock("Kenapa Pink Beach layak masuk itinerary", "h2", "pink-beach-benefits"),
    bulletBlock("Visual pantainya unik dan kuat untuk dokumentasi perjalanan.", "pink-beach-benefit-1"),
    bulletBlock("Memberi variasi destinasi selain area selatan atau Gili.", "pink-beach-benefit-2"),
    bulletBlock("Cocok sebagai day trip dengan ritme yang lebih private.", "pink-beach-benefit-3"),
    headingBlock("Tips merencanakan trip ke Pink Beach", "h2", "pink-beach-tips"),
    bulletBlock("Sisihkan satu hari khusus agar perjalanan lebih nyaman.", "pink-beach-tip-1"),
    bulletBlock("Kombinasikan dengan layanan transport yang sudah terjadwal.", "pink-beach-tip-2"),
    bulletBlock("Cocok untuk tamu yang ingin pengalaman hidden gem yang berbeda.", "pink-beach-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Pink Beach Lombok", "pink-beach-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Pink Beach Lombok paling pas untuk tamu yang ingin pengalaman pantai yang berbeda, lebih tenang, dan kuat secara visual.",
      "pink-beach-quote",
    ),
  );

  return blocks;
}

function buildRentalHiaceLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Rental Hiace Lombok untuk perjalanan rombongan yang lebih nyaman", "h2", "hiace-overview"),
    normalBlock(
      "Rental Hiace Lombok menjadi pilihan yang sangat tepat untuk rombongan yang ingin melakukan perjalanan dengan lebih praktis dan nyaman. Dibanding menggunakan beberapa mobil kecil sekaligus, Hiace membuat seluruh peserta dapat bergerak bersama dalam satu kendaraan yang lebih lapang, sehingga suasana perjalanan terasa lebih rapi dan efisien.",
      "hiace-overview-body-1",
    ),
    normalBlock(
      "Layanan ini sangat cocok untuk keluarga besar, group wisata, outing kantor, komunitas, maupun tamu yang datang dalam jumlah peserta lebih banyak. Selain memudahkan koordinasi, kendaraan berkapasitas lebih besar juga membantu perjalanan terasa lebih lega, terutama jika peserta membawa koper atau perlengkapan tambahan.",
      "hiace-overview-body-2",
    ),
    headingBlock("Kapan sebaiknya memilih Hiace di Lombok", "h2", "hiace-fit"),
    normalBlock(
      "Hiace sebaiknya dipilih ketika jumlah peserta sudah melebihi kapasitas nyaman mobil keluarga biasa. Selain itu, Hiace juga sangat cocok ketika perjalanan mencakup airport transfer grup, perjalanan wisata beberapa hari, atau rombongan yang ingin tetap berada dalam satu kendaraan dari awal sampai akhir.",
      "hiace-fit-body",
    ),
    bulletBlock("Untuk rombongan keluarga atau group trip dengan peserta lebih banyak.", "hiace-fit-1"),
    bulletBlock("Untuk airport transfer grup agar perjalanan lebih praktis sejak awal.", "hiace-fit-2"),
    bulletBlock("Untuk trip wisata beberapa hari yang membutuhkan kendaraan lebih lega.", "hiace-fit-3"),
    headingBlock("Keunggulan Hiace untuk wisata Lombok", "h2", "hiace-benefits"),
    bulletBlock("Kapasitas lebih besar dan nyaman untuk perjalanan grup.", "hiace-benefit-1"),
    bulletBlock("Membuat rombongan tetap kompak tanpa harus terpecah ke banyak kendaraan.", "hiace-benefit-2"),
    bulletBlock("Cocok untuk airport transfer, city tour, dan multi day trip.", "hiace-benefit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual rental Hiace Lombok", "hiace-image"));
  }

  blocks.push(
    headingBlock("Rute dan kebutuhan perjalanan yang sering dipilih", "h2", "hiace-routes"),
    normalBlock(
      "Hiace sering digunakan untuk airport transfer, perjalanan ke area Mandalika, Kuta Lombok, Senggigi, pelabuhan ke Gili, hingga perjalanan beberapa hari keliling Lombok. Untuk itinerary rombongan, kendaraan seperti ini terasa sangat membantu karena seluruh peserta bisa tetap berada dalam satu ritme perjalanan.",
      "hiace-routes-body",
    ),
    headingBlock("Tips booking Hiace Lombok", "h2", "hiace-tips"),
    bulletBlock("Booking lebih awal, terutama saat high season atau long weekend.", "hiace-tip-1"),
    bulletBlock("Sampaikan jumlah peserta dan jumlah koper agar armada benar-benar sesuai.", "hiace-tip-2"),
    bulletBlock("Jelaskan area jemput dan pola perjalanan agar ritme trip bisa disiapkan lebih rapi.", "hiace-tip-3"),
    quoteBlock(
      "Rental Hiace Lombok paling cocok untuk tamu yang ingin perjalanan rombongan tetap nyaman, efisien, dan rapi sejak awal keberangkatan.",
      "hiace-quote",
    ),
  );

  return blocks;
}

function buildSewaMobilLombokDenganDriverContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa mobil Lombok dengan driver untuk perjalanan yang lebih santai", "h2", "driver-overview"),
    normalBlock(
      "Sewa mobil Lombok dengan driver menjadi pilihan yang sangat relevan untuk tamu yang ingin perjalanan terasa lebih praktis sejak hari pertama tiba. Banyak wisatawan datang ke Lombok dengan agenda liburan yang cukup padat, sehingga menggunakan mobil sekaligus driver membantu perjalanan terasa lebih ringan tanpa harus repot memikirkan rute, area parkir, atau kondisi jalan yang belum familiar.",
      "driver-overview-body-1",
    ),
    normalBlock(
      "Layanan seperti ini cocok untuk pasangan, keluarga, tamu first timer, sampai rombongan kecil yang ingin fokus menikmati perjalanan. Driver lokal biasanya lebih memahami ritme perjalanan di Lombok, jalur menuju destinasi populer, serta pola waktu yang lebih realistis untuk perjalanan harian.",
      "driver-overview-body-2",
    ),
    headingBlock("Kapan layanan dengan driver paling terasa manfaatnya", "h2", "driver-fit"),
    bulletBlock("Saat membutuhkan jemput bandara dan langsung lanjut ke hotel atau area wisata.", "driver-fit-1"),
    bulletBlock("Saat tamu baru pertama kali ke Lombok dan ingin perjalanan lebih tenang.", "driver-fit-2"),
    bulletBlock("Saat family trip membutuhkan ritme yang santai dan tidak ingin bergantian menyetir.", "driver-fit-3"),
    bulletBlock("Saat perjalanan mencakup beberapa tujuan dalam satu hari agar waktu lebih efisien.", "driver-fit-4"),
    headingBlock("Keuntungan dibanding lepas kunci", "h2", "driver-benefits"),
    normalBlock(
      "Bagi banyak tamu, perbedaannya bukan hanya soal siapa yang menyetir, tetapi soal pengalaman perjalanan secara keseluruhan. Dengan driver, tamu bisa lebih santai menikmati pemandangan, berdiskusi soal rencana hari itu, dan menjaga energi selama liburan. Ini sangat membantu terutama untuk tamu dari luar daerah yang ingin fokus pada pengalaman, bukan detail teknis perjalanan.",
      "driver-benefits-body-1",
    ),
    normalBlock(
      "Perjalanan juga biasanya terasa lebih efisien karena rute bisa dibantu lebih praktis. Untuk trip singkat, airport transfer, dan perjalanan wisata harian di Lombok, layanan mobil dengan driver menjadi salah satu opsi paling aman dan nyaman.",
      "driver-benefits-body-2",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil Lombok dengan driver", "driver-image"));
  }

  blocks.push(
    headingBlock("Jenis perjalanan yang paling sering memakai driver", "h2", "driver-routes"),
    bulletBlock("Airport transfer dari dan ke Bandara Lombok.", "driver-routes-1"),
    bulletBlock("Trip harian ke Kuta Lombok, Senggigi, atau kombinasi pantai dan bukit.", "driver-routes-2"),
    bulletBlock("Perjalanan ke pelabuhan untuk lanjut ke Gili.", "driver-routes-3"),
    bulletBlock("Family trip dan perjalanan tamu dengan koper atau bagasi lebih banyak.", "driver-routes-4"),
    headingBlock("Armada yang cocok untuk pasangan, keluarga, dan rombongan", "h2", "driver-fleet"),
    normalBlock(
      "Pemilihan armada sebaiknya disesuaikan dengan jumlah tamu, jumlah koper, dan area tujuan. Untuk pasangan atau perjalanan ringan, mobil keluarga biasanya sudah cukup nyaman. Untuk keluarga besar atau rombongan yang membutuhkan ruang lebih lega, kendaraan seperti Hiace lebih cocok agar perjalanan tetap nyaman sejak awal.",
      "driver-fleet-body",
    ),
    linkedNormalBlock(
      [
        { text: "Jika Anda ingin melihat layanan utamanya, baca juga halaman " },
        { text: "sewa mobil Lombok", href: "/sewa-mobil-lombok" },
        { text: ", panduan " },
        { text: "harga sewa mobil Lombok", href: "/blog/harga-sewa-mobil-lombok" },
        { text: ", dan opsi " },
        { text: "sewa mobil bandara Lombok", href: "/blog/sewa-mobil-bandara-lombok" },
        { text: " untuk perjalanan sejak pertama tiba." },
      ],
      "driver-links",
    ),
    headingBlock("Hal yang memengaruhi harga layanan dengan driver", "h2", "driver-pricing"),
    normalBlock(
      "Biaya layanan biasanya menyesuaikan jenis armada, durasi pemakaian, area jemput, rute perjalanan, serta kebutuhan khusus selama trip. Karena itu, penawaran yang paling akurat biasanya diberikan setelah tanggal perjalanan, jumlah tamu, dan pola rute dijelaskan sejak awal.",
      "driver-pricing-body",
    ),
    headingBlock("Tips booking sebelum datang ke Lombok", "h2", "driver-tips"),
    bulletBlock("Kirim tanggal kedatangan dan jam jemput.", "driver-tip-1"),
    bulletBlock("Jelaskan jumlah tamu dan jumlah koper agar armada sesuai.", "driver-tip-2"),
    bulletBlock("Sebutkan tujuan utama seperti Kuta, Senggigi, atau pelabuhan.", "driver-tip-3"),
    bulletBlock("Tanyakan apakah layanan dipakai transfer saja atau full day trip.", "driver-tip-4"),
    quoteBlock(
      "Sewa mobil Lombok dengan driver paling cocok untuk tamu yang ingin perjalanan lebih praktis, nyaman, dan efisien tanpa repot menyusun detail teknis di jalan.",
      "driver-quote",
    ),
  );

  return blocks;
}

function buildHargaPaketWisataLombok3Hari2MalamContent(detailImageId) {
  const blocks = [
    headingBlock("Harga paket wisata Lombok 3 hari 2 malam banyak dicari karena paling seimbang", "h2", "price-3d2n-overview"),
    normalBlock(
      "Harga paket wisata Lombok 3 hari 2 malam menjadi salah satu informasi yang paling sering dicari calon tamu sebelum booking. Durasi 3D2N terasa pas untuk wisatawan yang ingin menikmati destinasi utama tanpa itinerary terlalu padat, sehingga cocok untuk first timer, pasangan, keluarga, maupun rombongan kecil yang datang dengan waktu liburan terbatas.",
      "price-3d2n-overview-body-1",
    ),
    normalBlock(
      "Bagi banyak tamu, yang dicari bukan hanya nominal akhir, tetapi gambaran paket secara menyeluruh. Mereka ingin tahu fasilitas apa saja yang umumnya sudah termasuk, destinasi seperti apa yang biasa masuk itinerary, dan seperti apa ritme perjalanan selama tiga hari dua malam di Lombok.",
      "price-3d2n-overview-body-2",
    ),
    headingBlock("Faktor yang paling memengaruhi harga", "h2", "price-3d2n-factors"),
    bulletBlock("Jumlah peserta dalam satu trip.", "price-3d2n-factor-1"),
    bulletBlock("Pilihan hotel atau penginapan yang digunakan.", "price-3d2n-factor-2"),
    bulletBlock("Jenis kendaraan dan pola transport selama trip.", "price-3d2n-factor-3"),
    bulletBlock("Destinasi yang ingin dimasukkan ke itinerary.", "price-3d2n-factor-4"),
    bulletBlock("Format perjalanan private atau penyesuaian khusus lainnya.", "price-3d2n-factor-5"),
    headingBlock("Kenapa paket 3D2N paling sering dipilih", "h2", "price-3d2n-why"),
    normalBlock(
      "Format 3 hari 2 malam cukup fleksibel untuk menampung perjalanan kedatangan, satu hari utama untuk eksplor destinasi, dan satu hari penutup yang tetap nyaman sebelum pulang. Bagi tamu yang baru pertama kali ke Lombok, durasi ini sering dianggap paling ideal karena tidak terlalu singkat, tetapi juga tidak terlalu berat.",
      "price-3d2n-why-body-1",
    ),
    normalBlock(
      "Paket seperti ini juga mudah diarahkan sesuai gaya liburan tamu. Ada yang ingin fokus ke pantai dan bukit di selatan, ada yang ingin memasukkan Gili Trawangan, ada juga yang lebih suka ritme santai dengan kombinasi wisata, kuliner, dan spot sunset.",
      "price-3d2n-why-body-2",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual harga paket wisata Lombok 3 hari 2 malam", "price-3d2n-image"));
  }

  blocks.push(
    headingBlock("Gambaran itinerary 3 hari 2 malam", "h2", "price-3d2n-itinerary"),
    normalBlock(
      "Hari pertama biasanya dipakai untuk kedatangan, check-in, dan agenda ringan agar perjalanan tetap nyaman. Hari kedua menjadi inti trip dengan fokus ke destinasi utama. Hari ketiga biasanya diisi agenda singkat sebelum kembali. Susunan seperti ini terasa efisien untuk tamu yang ingin menikmati Lombok tanpa ritme terlalu padat.",
      "price-3d2n-itinerary-body-1",
    ),
    bulletBlock("Hari pertama: kedatangan, penyesuaian, dan agenda ringan.", "price-3d2n-itinerary-1"),
    bulletBlock("Hari kedua: fokus ke destinasi utama dan highlight perjalanan.", "price-3d2n-itinerary-2"),
    bulletBlock("Hari ketiga: agenda singkat sebelum kembali atau lanjut perjalanan.", "price-3d2n-itinerary-3"),
    headingBlock("Destinasi yang sering masuk paket 3D2N", "h2", "price-3d2n-destinations"),
    bulletBlock("Gili Trawangan untuk island trip dan suasana liburan yang kuat.", "price-3d2n-destinations-1"),
    bulletBlock("Kuta Lombok, pantai selatan, dan bukit populer.", "price-3d2n-destinations-2"),
    bulletBlock("Spot sunset, kuliner, dan area yang cocok untuk first timer.", "price-3d2n-destinations-3"),
    linkedNormalBlock(
      [
        { text: "Untuk melihat gambaran paket utamanya, Anda bisa membaca halaman " },
        { text: "paket wisata Lombok", href: "/paket-wisata-lombok" },
        { text: ", panduan " },
        { text: "paket wisata Lombok 3 hari 2 malam", href: "/blog/paket-wisata-lombok-3-hari-2-malam" },
        { text: ", ide " },
        { text: "itinerary Lombok 3 hari", href: "/blog/itinerary-lombok-3-hari" },
        { text: ", dan referensi " },
        { text: "wisata Gili Trawangan", href: "/wisata/gili-trawangan" },
        { text: " bila ingin memasukkan island trip ke dalam rencana perjalanan." },
      ],
      "price-3d2n-links",
    ),
    headingBlock("Fasilitas yang umumnya sudah termasuk", "h2", "price-3d2n-inclusions"),
    normalBlock(
      "Paket wisata Lombok 3 hari 2 malam umumnya sudah mencakup kebutuhan dasar perjalanan seperti hotel, transport, dan makan sesuai format paket yang dipilih. Detailnya bisa berbeda tergantung jumlah peserta, tipe hotel, serta fokus destinasi yang diambil.",
      "price-3d2n-inclusions-body",
    ),
    headingBlock("Cocok untuk siapa", "h2", "price-3d2n-fit"),
    bulletBlock("First timer yang ingin liburan lebih terarah.", "price-3d2n-fit-1"),
    bulletBlock("Pasangan yang ingin durasi cukup tanpa trip terlalu panjang.", "price-3d2n-fit-2"),
    bulletBlock("Keluarga kecil yang ingin itinerary efisien.", "price-3d2n-fit-3"),
    bulletBlock("Tamu dari kota besar yang datang dengan waktu terbatas.", "price-3d2n-fit-4"),
    headingBlock("Tips sebelum booking paket 3D2N", "h2", "price-3d2n-tips"),
    bulletBlock("Tentukan tanggal kedatangan dan kepulangan lebih dulu.", "price-3d2n-tip-1"),
    bulletBlock("Sampaikan jumlah peserta sejak awal agar hitungan paket lebih akurat.", "price-3d2n-tip-2"),
    bulletBlock("Jelaskan apakah ingin trip santai atau lebih padat.", "price-3d2n-tip-3"),
    bulletBlock("Pastikan destinasi utama yang ingin diprioritaskan.", "price-3d2n-tip-4"),
    quoteBlock(
      "Harga paket wisata Lombok 3 hari 2 malam paling tepat dilihat dari keseimbangan antara itinerary, fasilitas, kenyamanan, dan ritme perjalanan yang sesuai kebutuhan tamu.",
      "price-3d2n-quote",
    ),
  );

  return blocks;
}

function buildSewaAlphardLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa Alphard Lombok untuk trip premium yang lebih nyaman", "h2", "alphard-overview"),
    normalBlock(
      "Sewa Alphard Lombok cocok untuk tamu yang mencari kenyamanan lebih tinggi selama perjalanan di Lombok. Layanan ini banyak dipilih oleh tamu VIP, pasangan honeymoon, perjalanan bisnis, dan airport service premium yang membutuhkan kendaraan lebih representatif.",
      "alphard-overview-body-1",
    ),
    normalBlock(
      "Dengan kenyamanan kabin yang lebih eksklusif dan kesan perjalanan yang lebih premium, Alphard menjadi pilihan tepat untuk tamu yang memprioritaskan pengalaman perjalanan yang lebih tenang dan elegan.",
      "alphard-overview-body-2",
    ),
    headingBlock("Kapan Alphard paling relevan dipilih", "h2", "alphard-fit"),
    bulletBlock("Untuk tamu VIP atau perjalanan bisnis yang membutuhkan kendaraan representatif.", "alphard-fit-1"),
    bulletBlock("Untuk honeymoon atau private trip yang mengutamakan kenyamanan premium.", "alphard-fit-2"),
    bulletBlock("Untuk airport service dengan pengalaman jemput yang lebih eksklusif.", "alphard-fit-3"),
    headingBlock("Nilai tambah layanan Alphard", "h2", "alphard-benefits"),
    bulletBlock("Memberi kenyamanan kabin yang lebih tenang untuk perjalanan jarak menengah.", "alphard-benefit-1"),
    bulletBlock("Cocok untuk tamu yang ingin kesan premium sejak penjemputan.", "alphard-benefit-2"),
    bulletBlock("Bisa dipakai untuk private trip, city tour, hingga layanan VIP transfer.", "alphard-benefit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa Alphard Lombok", "alphard-image"));
  }

  blocks.push(
    quoteBlock(
      "Sewa Alphard Lombok adalah pilihan yang tepat untuk tamu yang ingin kombinasi kenyamanan premium, privasi, dan kesan perjalanan yang lebih eksklusif.",
      "alphard-quote",
    ),
  );

  return blocks;
}

function buildPaketWisataLombokDariBandungContent(detailImageId) {
  const blocks = [
    headingBlock("Paket wisata Lombok dari Bandung untuk trip yang lebih praktis", "h2", "bandung-overview"),
    normalBlock(
      "Paket wisata Lombok dari Bandung cocok untuk wisatawan yang ingin semua detail perjalanan lebih jelas sejak sebelum keberangkatan. Biasanya tamu membutuhkan gambaran durasi, hotel, transport, dan fokus destinasi agar proses konsultasi dan booking lebih cepat.",
      "bandung-overview-body-1",
    ),
    normalBlock(
      "Layanan seperti ini relevan untuk pasangan, keluarga, dan grup kecil dari Bandung yang ingin itinerary Lombok yang mudah dikonsultasikan, efisien, dan siap dijalankan tanpa banyak perubahan mendadak.",
      "bandung-overview-body-2",
    ),
    headingBlock("Kenapa artikel ini relevan untuk wisatawan Bandung", "h2", "bandung-why"),
    bulletBlock("Membantu memilih durasi yang paling realistis untuk trip ke Lombok.", "bandung-why-1"),
    bulletBlock("Memudahkan konsultasi hotel, transport, dan fokus destinasi sejak awal.", "bandung-why-2"),
    bulletBlock("Cocok untuk pasangan, keluarga, maupun private trip yang butuh alur jelas.", "bandung-why-3"),
    headingBlock("Tips sebelum booking", "h2", "bandung-tips"),
    bulletBlock("Tentukan tanggal perjalanan dan jumlah peserta lebih awal.", "bandung-tip-1"),
    bulletBlock("Pilih fokus trip apakah ke Gili, pantai selatan, atau kombinasi keduanya.", "bandung-tip-2"),
    bulletBlock("Pastikan detail hotel dan transport sudah dibahas saat konsultasi awal.", "bandung-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket wisata Lombok dari Bandung", "bandung-image"));
  }

  blocks.push(
    quoteBlock(
      "Untuk wisatawan dari Bandung, paket wisata Lombok yang paling ideal adalah yang jelas sejak awal, mudah dikonsultasikan, dan efisien saat dijalankan.",
      "bandung-quote",
    ),
  );

  return blocks;
}

function buildTourLombokDariBaliContent(detailImageId) {
  const blocks = [
    headingBlock("Tour Lombok dari Bali untuk liburan yang praktis dan terarah", "h2", "bali-tour-overview"),
    normalBlock(
      "Tour Lombok dari Bali banyak dicari wisatawan yang ingin menjadikan Lombok sebagai kelanjutan perjalanan dari Bali. Kebutuhan utamanya biasanya adalah itinerary yang jelas, durasi yang realistis, dan alur trip yang mudah dipahami sejak awal.",
      "bali-tour-overview-body-1",
    ),
    normalBlock(
      "Karena pola perjalanan dari Bali ke Lombok sering membutuhkan penyesuaian waktu dan akses, layanan yang responsif sangat penting agar trip tetap efisien dan tidak terasa merepotkan. Hal ini membuat paket yang terstruktur menjadi lebih relevan.",
      "bali-tour-overview-body-2",
    ),
    headingBlock("Kenapa artikel ini relevan untuk tamu dari Bali", "h2", "bali-tour-why"),
    bulletBlock("Membantu memilih durasi trip yang realistis setelah perjalanan dari Bali.", "bali-tour-why-1"),
    bulletBlock("Memudahkan konsultasi transport, hotel, dan fokus destinasi sejak awal.", "bali-tour-why-2"),
    bulletBlock("Cocok untuk short escape maupun kelanjutan trip yang lebih panjang.", "bali-tour-why-3"),
    headingBlock("Tips menyusun tour dari Bali ke Lombok", "h2", "bali-tour-tips"),
    bulletBlock("Tentukan durasi trip yang paling realistis untuk energi perjalanan Anda.", "bali-tour-tip-1"),
    bulletBlock("Pilih fokus area utama agar itinerary tidak terlalu padat.", "bali-tour-tip-2"),
    bulletBlock("Pastikan alur transport, hotel, dan itinerary dibahas sejak konsultasi awal.", "bali-tour-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual tour Lombok dari Bali", "bali-tour-image"));
  }

  blocks.push(
    quoteBlock(
      "Tour Lombok dari Bali paling nyaman ketika alur perjalanan, durasi, dan fokus destinasi sudah dirancang dengan realistis sejak awal.",
      "bali-tour-quote",
    ),
  );

  return blocks;
}

function buildWisataBukitMereseLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Bukit Merese Lombok untuk sunset dan view pantai selatan", "h2", "merese-overview"),
    normalBlock(
      "Wisata Bukit Merese Lombok menjadi salah satu destinasi paling populer di area selatan karena view bukitnya sangat kuat untuk menikmati sunset, panorama garis pantai, dan suasana short escape yang ringan namun visual. Tempat ini sangat sering masuk itinerary first timer.",
      "merese-overview-body-1",
    ),
    normalBlock(
      "Bukit Merese biasanya digabungkan dengan Kuta Lombok dan pantai selatan lainnya dalam satu alur perjalanan karena aksesnya relatif nyaman. Destinasi ini cocok untuk pasangan, keluarga, maupun wisatawan yang mencari spot sunset paling mudah dijangkau di Lombok selatan.",
      "merese-overview-body-2",
    ),
    headingBlock("Kenapa Bukit Merese sering masuk itinerary", "h2", "merese-why"),
    bulletBlock("Sunset dan viewpoint-nya sangat kuat untuk pengalaman visual.", "merese-why-1"),
    bulletBlock("Mudah dikombinasikan dengan Kuta Lombok dan pantai sekitar.", "merese-why-2"),
    bulletBlock("Cocok untuk short escape, pasangan, dan wisatawan first timer.", "merese-why-3"),
    headingBlock("Tips menikmati Bukit Merese", "h2", "merese-tips"),
    bulletBlock("Datang menjelang sore agar bisa menikmati golden hour dan sunset.", "merese-tip-1"),
    bulletBlock("Gabungkan dengan itinerary pantai selatan agar rute lebih efisien.", "merese-tip-2"),
    bulletBlock("Cocok dijadikan penutup hari untuk short escape di area selatan.", "merese-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Bukit Merese Lombok", "merese-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Bukit Merese Lombok paling pas untuk tamu yang ingin sunset kuat, view pantai selatan, dan highlight visual yang mudah dijangkau.",
      "merese-quote",
    ),
  );

  return blocks;
}

function buildWisataRinjaniLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Rinjani Lombok untuk trip alam dan view pegunungan ikonik", "h2", "rinjani-overview"),
    normalBlock(
      "Wisata Rinjani Lombok cocok untuk tamu yang ingin melihat sisi Lombok yang berbeda dari pantai dan Gili. Nama Rinjani sangat kuat untuk wisata alam, view pegunungan, udara sejuk, dan pengalaman perjalanan yang lebih adventure.",
      "rinjani-overview-body-1",
    ),
    normalBlock(
      "Tidak semua wisatawan datang untuk trekking penuh, tetapi banyak yang tetap tertarik pada citra Rinjani sebagai bagian penting dari pengalaman Lombok yang lebih natural dan berbeda. Karena itu, Rinjani tetap relevan untuk wisatawan yang ingin melihat sisi lain Lombok.",
      "rinjani-overview-body-2",
    ),
    headingBlock("Kenapa Rinjani menarik untuk wisata Lombok", "h2", "rinjani-why"),
    bulletBlock("Mewakili sisi alam dan pegunungan Lombok yang sangat kuat.", "rinjani-why-1"),
    bulletBlock("Cocok untuk wisatawan yang mencari variasi selain pantai.", "rinjani-why-2"),
    bulletBlock("Bisa diarahkan ke trip alam, adventure, dan eksplorasi Lombok yang lebih beragam.", "rinjani-why-3"),
    headingBlock("Siapa yang cocok tertarik dengan Rinjani", "h2", "rinjani-fit"),
    bulletBlock("Wisatawan yang menyukai alam, udara sejuk, dan view pegunungan.", "rinjani-fit-1"),
    bulletBlock("Tamu yang ingin pengalaman Lombok yang berbeda dari trip pantai.", "rinjani-fit-2"),
    bulletBlock("Wisatawan yang tertarik pada sisi adventure dan nature trip di Lombok.", "rinjani-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Rinjani Lombok", "rinjani-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Rinjani Lombok paling relevan untuk tamu yang ingin mengenal sisi alam dan pegunungan Lombok yang ikonik, bukan hanya pantai dan Gili.",
      "rinjani-quote",
    ),
  );

  return blocks;
}

function buildSewaFortunerLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa Fortuner Lombok untuk trip premium yang lebih tangguh", "h2", "fortuner-overview"),
    normalBlock(
      "Sewa Fortuner Lombok cocok untuk tamu yang menginginkan kendaraan nyaman dengan kesan premium selama perjalanan di Lombok. Armada ini relevan untuk private trip, tamu VIP, perjalanan keluarga, dan wisatawan yang ingin mobilitas lebih leluasa selama eksplorasi.",
      "fortuner-overview-body-1",
    ),
    normalBlock(
      "Fortuner sering dipilih karena memberi perpaduan antara kenyamanan, kabin yang lega, dan tampilan kendaraan yang lebih kuat untuk perjalanan wisata, airport transfer, maupun aktivitas bisnis di Lombok.",
      "fortuner-overview-body-2",
    ),
    headingBlock("Kapan Fortuner paling cocok dipilih", "h2", "fortuner-fit"),
    bulletBlock("Untuk private trip yang ingin kenyamanan dan kesan premium.", "fortuner-fit-1"),
    bulletBlock("Untuk tamu keluarga atau bisnis yang butuh kendaraan lega dan representatif.", "fortuner-fit-2"),
    bulletBlock("Untuk perjalanan bandara, city tour, dan trip beberapa hari di Lombok.", "fortuner-fit-3"),
    headingBlock("Nilai tambah Fortuner untuk perjalanan di Lombok", "h2", "fortuner-benefits"),
    bulletBlock("Kabin nyaman untuk perjalanan harian maupun trip beberapa hari.", "fortuner-benefit-1"),
    bulletBlock("Memberi kesan kendaraan premium tanpa mengurangi fleksibilitas trip.", "fortuner-benefit-2"),
    bulletBlock("Cocok untuk tamu yang mengutamakan kenyamanan dan tampilan representatif.", "fortuner-benefit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa Fortuner Lombok", "fortuner-image"));
  }

  blocks.push(
    quoteBlock(
      "Sewa Fortuner Lombok paling pas untuk tamu yang ingin perjalanan lebih nyaman, fleksibel, dan tetap terasa premium selama berada di Lombok.",
      "fortuner-quote",
    ),
  );

  return blocks;
}

function buildSewaAvanzaLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Sewa Avanza Lombok untuk liburan praktis dan nyaman", "h2", "avanza-overview"),
    normalBlock(
      "Sewa Avanza Lombok menjadi pilihan populer untuk pasangan, keluarga kecil, dan wisatawan yang ingin kendaraan praktis selama liburan. Armada ini cocok untuk city tour, jemput bandara, perjalanan hotel, dan eksplorasi Lombok dengan ritme santai.",
      "avanza-overview-body-1",
    ),
    normalBlock(
      "Karena irit, nyaman, dan fleksibel dipakai di banyak kebutuhan perjalanan, Avanza sering menjadi opsi sewa mobil yang aman untuk tamu yang ingin perjalanan efisien tanpa harus mengambil kendaraan yang terlalu besar.",
      "avanza-overview-body-2",
    ),
    headingBlock("Kenapa Avanza sering dipilih wisatawan", "h2", "avanza-why"),
    bulletBlock("Cocok untuk pasangan, keluarga kecil, dan city tour harian.", "avanza-why-1"),
    bulletBlock("Nyaman untuk jemput bandara, hotel transfer, dan perjalanan wisata ringan.", "avanza-why-2"),
    bulletBlock("Memberi solusi transport yang praktis dan lebih fleksibel untuk banyak kebutuhan.", "avanza-why-3"),
    headingBlock("Kapan Avanza jadi pilihan paling aman", "h2", "avanza-fit"),
    bulletBlock("Saat tamu ingin kendaraan nyaman tanpa ukuran terlalu besar.", "avanza-fit-1"),
    bulletBlock("Saat itinerary fokus pada area kota, hotel, dan pantai utama.", "avanza-fit-2"),
    bulletBlock("Saat kebutuhan perjalanan lebih sederhana namun tetap rapi dan nyaman.", "avanza-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa Avanza Lombok", "avanza-image"));
  }

  blocks.push(
    quoteBlock(
      "Sewa Avanza Lombok paling cocok untuk tamu yang ingin liburan praktis, nyaman, dan tetap fleksibel untuk banyak kebutuhan perjalanan.",
      "avanza-quote",
    ),
  );

  return blocks;
}

function buildPaketTourLombokMurahContent(detailImageId) {
  const blocks = [
    headingBlock("Paket tour Lombok murah yang tetap nyaman untuk liburan", "h2", "cheap-tour-overview"),
    normalBlock(
      "Paket tour Lombok murah banyak dicari wisatawan yang ingin perjalanan tetap nyaman dengan biaya yang lebih terjangkau. Fokus utamanya biasanya pada itinerary yang realistis, fasilitas penting yang tetap aman, dan pengalaman wisata yang tetap menyenangkan.",
      "cheap-tour-overview-body-1",
    ),
    normalBlock(
      "Paket murah yang baik bukan berarti asal menekan harga, tetapi menyusun rute, durasi, transport, dan kebutuhan dasar tamu agar tetap efisien tanpa membuat liburan terasa terburu-buru atau melelahkan.",
      "cheap-tour-overview-body-2",
    ),
    headingBlock("Yang perlu diperhatikan saat memilih paket murah", "h2", "cheap-tour-check"),
    bulletBlock("Pastikan itinerary tetap realistis dan tidak terlalu padat.", "cheap-tour-check-1"),
    bulletBlock("Periksa fasilitas utama seperti transport, hotel, dan makan.", "cheap-tour-check-2"),
    bulletBlock("Utamakan value perjalanan, bukan hanya harga paling rendah.", "cheap-tour-check-3"),
    headingBlock("Siapa yang cocok memilih paket ini", "h2", "cheap-tour-fit"),
    bulletBlock("First timer yang ingin mengenal Lombok dengan budget lebih hemat.", "cheap-tour-fit-1"),
    bulletBlock("Pasangan atau keluarga kecil yang ingin paket sederhana namun rapi.", "cheap-tour-fit-2"),
    bulletBlock("Wisatawan yang ingin fokus pada pengalaman, bukan kemewahan berlebihan.", "cheap-tour-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual paket tour Lombok murah", "cheap-tour-image"));
  }

  blocks.push(
    quoteBlock(
      "Paket tour Lombok murah yang baik tetap harus memberi rasa nyaman, ritme perjalanan yang enak, dan fasilitas yang jelas sejak awal.",
      "cheap-tour-quote",
    ),
  );

  return blocks;
}

function buildOpenTripLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Open trip Lombok untuk liburan praktis dan lebih hemat", "h2", "open-trip-overview"),
    normalBlock(
      "Open trip Lombok cocok untuk wisatawan yang ingin liburan lebih hemat tanpa harus menyiapkan rombongan sendiri. Model perjalanan ini biasanya menarik untuk solo traveler, pasangan, atau tamu yang ingin itinerary populer dengan biaya yang lebih efisien.",
      "open-trip-overview-body-1",
    ),
    normalBlock(
      "Dengan format sharing trip, tamu tetap bisa menikmati destinasi utama Lombok sambil mendapatkan ritme perjalanan yang sudah disusun lebih praktis oleh tim perjalanan.",
      "open-trip-overview-body-2",
    ),
    headingBlock("Kenapa open trip sering dipilih", "h2", "open-trip-why"),
    bulletBlock("Lebih hemat untuk tamu yang tidak membawa rombongan sendiri.", "open-trip-why-1"),
    bulletBlock("Cocok untuk solo traveler, pasangan, atau tamu yang ingin gabung trip.", "open-trip-why-2"),
    bulletBlock("Itinerary populer sudah disusun lebih praktis dan mudah diikuti.", "open-trip-why-3"),
    headingBlock("Yang perlu dipastikan sebelum ikut", "h2", "open-trip-check"),
    bulletBlock("Pastikan jadwal dan titik temu sudah jelas sejak awal.", "open-trip-check-1"),
    bulletBlock("Pahami ritme sharing trip agar ekspektasi perjalanan tetap nyaman.", "open-trip-check-2"),
    bulletBlock("Tanyakan fokus destinasi dan fasilitas utama yang sudah termasuk.", "open-trip-check-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual open trip Lombok", "open-trip-image"));
  }

  blocks.push(
    quoteBlock(
      "Open trip Lombok paling pas untuk tamu yang ingin liburan hemat, praktis, dan tetap bisa menikmati destinasi populer tanpa repot menyiapkan rombongan sendiri.",
      "open-trip-quote",
    ),
  );

  return blocks;
}

function buildWisataDesaSadeLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Desa Sade Lombok untuk pengalaman budaya Sasak", "h2", "sade-overview"),
    normalBlock(
      "Wisata Desa Sade Lombok menjadi pilihan menarik bagi tamu yang ingin melihat sisi budaya lokal selama liburan di Lombok. Desa ini dikenal sebagai salah satu spot yang sering masuk itinerary area selatan karena memberi pengalaman yang berbeda dari pantai dan bukit.",
      "sade-overview-body-1",
    ),
    normalBlock(
      "Bagi banyak wisatawan, Desa Sade memberi kesempatan untuk mengenal suasana kampung tradisional Sasak, melihat elemen budaya lokal, dan menambah variasi perjalanan agar trip terasa lebih lengkap.",
      "sade-overview-body-2",
    ),
    headingBlock("Kenapa Desa Sade layak masuk itinerary", "h2", "sade-why"),
    bulletBlock("Memberi pengalaman budaya lokal yang berbeda dari pantai dan Gili.", "sade-why-1"),
    bulletBlock("Mudah dikombinasikan dengan Kuta Lombok dan area selatan lainnya.", "sade-why-2"),
    bulletBlock("Cocok untuk wisatawan yang ingin trip lebih lengkap dan beragam.", "sade-why-3"),
    headingBlock("Siapa yang paling cocok berkunjung", "h2", "sade-fit"),
    bulletBlock("First timer yang ingin mengenal sisi budaya Lombok.", "sade-fit-1"),
    bulletBlock("Keluarga yang ingin perjalanan lebih variatif dan edukatif.", "sade-fit-2"),
    bulletBlock("Wisatawan yang ingin kombinasi alam dan budaya dalam satu trip.", "sade-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Desa Sade Lombok", "sade-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Desa Sade Lombok memberi warna berbeda dalam perjalanan karena tamu tidak hanya melihat pantai, tetapi juga merasakan sisi budaya lokal yang khas.",
      "sade-quote",
    ),
  );

  return blocks;
}

function buildWisataTanjungAanLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Wisata Tanjung Aan Lombok untuk pantai cantik dan short escape", "h2", "aan-overview"),
    normalBlock(
      "Wisata Tanjung Aan Lombok selalu menjadi salah satu favorit untuk area selatan karena pantainya luas, pasirnya menarik, dan suasananya cocok untuk short escape. Destinasi ini sering dipilih first timer yang ingin menikmati pantai cantik dengan akses yang relatif mudah.",
      "aan-overview-body-1",
    ),
    normalBlock(
      "Tanjung Aan juga mudah digabungkan dengan Bukit Merese dan area Kuta Lombok, sehingga sangat relevan sebagai bagian dari itinerary satu hari atau setengah hari yang santai.",
      "aan-overview-body-2",
    ),
    headingBlock("Alasan Tanjung Aan disukai wisatawan", "h2", "aan-why"),
    bulletBlock("Pantainya cantik, nyaman, dan cocok untuk menikmati suasana santai.", "aan-why-1"),
    bulletBlock("Mudah digabungkan dengan Bukit Merese dan Kuta Lombok.", "aan-why-2"),
    bulletBlock("Cocok untuk first timer, pasangan, dan keluarga yang ingin short escape.", "aan-why-3"),
    headingBlock("Waktu terbaik menikmati area ini", "h2", "aan-tips"),
    bulletBlock("Datang saat cuaca cerah agar pantai terlihat lebih maksimal.", "aan-tip-1"),
    bulletBlock("Gabungkan dengan itinerary selatan untuk perjalanan yang efisien.", "aan-tip-2"),
    bulletBlock("Ideal untuk setengah hari santai sebelum lanjut ke spot sunset.", "aan-tip-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual wisata Tanjung Aan Lombok", "aan-image"));
  }

  blocks.push(
    quoteBlock(
      "Wisata Tanjung Aan Lombok paling cocok untuk tamu yang ingin suasana pantai selatan yang cantik, santai, dan mudah dimasukkan ke itinerary harian.",
      "aan-quote",
    ),
  );

  return blocks;
}

async function enrichDocWithMedia(doc) {
  if (doc._type === "testimonial") {
    return doc;
  }

  const title = doc.title || doc.slug?.current || "LombokAdvisor";
  const heroAsset = await ensureSeedAsset(doc._id, "hero", title, "Main image");
  await sleep(250);
  const galleryAssetOne = await ensureSeedAsset(doc._id, "gallery-1", title, "Gallery image 1");
  await sleep(250);
  const galleryAssetTwo = await ensureSeedAsset(doc._id, "gallery-2", title, "Gallery image 2");
  await sleep(250);

  return {
    ...doc,
    mainImage: galleryImageFromAsset(
      heroAsset._id,
      `${title} main image`,
      `Visual utama untuk ${title}`,
    ),
    gallery: [
      galleryImageFromAsset(
        galleryAssetOne._id,
        `${title} gallery image 1`,
        `Dokumentasi visual 1 untuk ${title}`,
      ),
      galleryImageFromAsset(
        galleryAssetTwo._id,
        `${title} gallery image 2`,
        `Dokumentasi visual 2 untuk ${title}`,
      ),
    ],
    content:
      Array.isArray(doc.content) && doc.content.length
        ? doc.content
        : buildRichSeedContent(doc, galleryAssetOne._id),
  };
}

const packageDocs = [
  {
    _id: "tour-package-paket-wisata-lombok",
    _type: "tourPackage",
    title: "Paket Wisata Lombok",
    slug: { _type: "slug", current: "paket-wisata-lombok" },
    category: "tour",
    priceLabel: "Mulai Rp1 juta / orang",
    duration: "One Day Tour hingga 4D3N",
    summary:
      "Paket wisata Lombok untuk one day tour, 2D1N, 3D2N, dan 4D3N dengan itinerary fleksibel ke Gili Trawangan, Kuta Lombok, pantai, bukit, air terjun, dan destinasi populer lainnya di Lombok.",
    highlights: [
      "Durasi tersedia mulai one day tour, 2D1N, 3D2N, hingga 4D3N",
      "Harga mulai Rp1 juta per orang dengan opsi hotel, transport, dan makan",
      "Cocok untuk private trip, keluarga, honeymoon, dan wisatawan first timer",
    ],
    heroNote:
      "Paket ini dirancang untuk wisatawan domestik dari Jakarta, Surabaya, dan kota besar lain di Indonesia, serta tamu dari Malaysia, Singapura, Australia, dan Eropa yang ingin itinerary Lombok lebih praktis dan fleksibel.",
    content: buildPaketWisataLombokContent(),
    faqs: [
      faq(
        "Apakah itinerary bisa disesuaikan?",
        "Bisa. Itinerary paket wisata Lombok dapat disesuaikan dengan durasi, jumlah peserta, titik jemput, dan preferensi destinasi.",
      ),
      faq(
        "Berapa harga paket wisata Lombok per orang?",
        "Harga mulai dari Rp1 juta per orang dan dapat menyesuaikan dengan durasi, hotel, jumlah peserta, dan rute wisata yang dipilih.",
      ),
      faq(
        "Apakah paket sudah termasuk hotel, transport, dan makan?",
        "Bisa. Paket dapat mencakup hotel, transportasi, dan makan sesuai kebutuhan perjalanan dan jenis paket yang dipilih.",
      ),
      faq(
        "Apakah bisa sekalian ke Gili Trawangan?",
        "Bisa. Itinerary dapat diarahkan untuk mencakup Gili Trawangan, Kuta Lombok, pantai, bukit, air terjun, dan destinasi populer lain di Lombok.",
      ),
      faq(
        "Apakah paket ini cocok untuk keluarga dan honeymoon?",
        "Ya. Paket dapat disesuaikan untuk family trip yang lebih nyaman maupun honeymoon trip yang lebih private dan romantis.",
      ),
      faq(
        "Apakah tersedia paket wisata Lombok 3 hari 2 malam?",
        "Tersedia. Paket 3D2N menjadi salah satu pilihan paling populer untuk first timer karena cukup efisien untuk menikmati highlight utama Lombok.",
      ),
      faq(
        "Apakah wisatawan luar negeri bisa booking juga?",
        "Bisa. Paket ini juga cocok untuk tamu dari Malaysia, Singapura, Australia, Eropa, dan negara lainnya yang ingin perjalanan lebih praktis di Lombok.",
      ),
      faq(
        "Bagaimana cara booking paket wisata Lombok?",
        "Cukup hubungi kami melalui WhatsApp lalu kirim tanggal perjalanan, jumlah peserta, dan gambaran trip yang Anda inginkan.",
      ),
    ],
    ctaMessage: "Halo, saya ingin konsultasi paket wisata Lombok untuk 3D2N, 4D3N, atau custom trip yang paling sesuai dengan tanggal perjalanan saya.",
    seoTitle: "Paket Wisata Lombok 3D2N, 4D3N & One Day Tour | Harga Mulai Rp1 Juta",
    metaDescription:
      "Cari paket wisata Lombok? Tersedia pilihan one day tour, 2D1N, 3D2N, dan 4D3N mulai Rp1 juta per orang, lengkap dengan itinerary fleksibel, hotel, transport, dan makan.",
    keywords: [
      "paket wisata lombok",
      "paket tour lombok",
      "paket wisata lombok 3 hari 2 malam",
      "paket wisata lombok murah",
      "private trip lombok",
      "travel lombok",
    ],
  },
  {
    _id: "tour-package-paket-honeymoon-lombok",
    _type: "tourPackage",
    title: "Paket Honeymoon Lombok",
    slug: { _type: "slug", current: "paket-honeymoon-lombok" },
    category: "honeymoon",
    priceLabel: "Mulai Rp2,7 juta / orang",
    duration: "3D2N, 4D3N, dan custom trip",
    summary:
      "Paket honeymoon Lombok untuk pasangan yang ingin menikmati liburan romantis dengan itinerary yang lebih santai, pilihan destinasi indah, dan perjalanan yang terasa nyaman sejak hari pertama.",
    highlights: [
      "Cocok untuk pasangan baru menikah, anniversary, atau private trip berdua",
      "Bisa disesuaikan dengan hotel atau villa, transport, makan, dan ritme perjalanan",
      "Dapat diarahkan ke Gili Trawangan, Kuta Mandalika, beach trip, dan sunset spot romantis",
    ],
    heroNote:
      "Paket honeymoon ini cocok untuk pasangan yang ingin perjalanan berdua terasa lebih tenang, nyaman, dan tidak terlalu padat sejak hari pertama tiba di Lombok.",
    content: buildPaketHoneymoonLombokContent(),
    faqs: [
      faq(
        "Paket honeymoon Lombok biasanya berapa hari?",
        "Umumnya pasangan memilih 3 hari 2 malam atau 4 hari 3 malam, tergantung waktu liburan dan destinasi yang ingin dinikmati dengan lebih santai.",
      ),
      faq(
        "Apakah bisa request private trip?",
        "Bisa. Honeymoon justru paling ideal dibuat lebih private agar perjalanan terasa lebih nyaman, fleksibel, dan fokus pada pengalaman berdua.",
      ),
      faq(
        "Apakah bisa termasuk hotel atau villa?",
        "Bisa. Paket dapat disesuaikan dengan hotel atau villa pilihan sesuai budget dan suasana honeymoon yang diinginkan.",
      ),
      faq(
        "Destinasi apa yang paling cocok untuk honeymoon di Lombok?",
        "Gili Trawangan, Kuta Mandalika, pantai selatan, dan spot sunset menjadi kombinasi yang paling sering dipilih pasangan.",
      ),
      faq(
        "Apakah honeymoon Lombok bisa digabung dengan Gili Trawangan?",
        "Bisa. Banyak pasangan memilih kombinasi daratan Lombok dan Gili Trawangan agar perjalanan terasa lebih lengkap, romantis, dan santai.",
      ),
    ],
    ctaMessage: "Ceritakan tanggal perjalanan, suasana trip yang Anda cari, dan pilihan hotel atau villa, lalu kami bantu siapkan paket honeymoon Lombok yang paling pas untuk berdua.",
    seoTitle: "Paket Honeymoon Lombok 3D2N, 4D3N & Bulan Madu Romantis",
    metaDescription:
      "Cari paket honeymoon Lombok yang romantis dan nyaman? Tersedia pilihan 3D2N, 4D3N, private trip, hotel atau villa, transport, dan itinerary fleksibel untuk pasangan.",
    keywords: [
      "paket honeymoon lombok",
      "honeymoon lombok",
      "bulan madu lombok",
      "paket honeymoon gili trawangan",
      "private trip lombok",
    ],
  },
  {
    _id: "tour-package-sewa-mobil-lombok",
    _type: "tourPackage",
    title: "Sewa Mobil Lombok",
    slug: { _type: "slug", current: "sewa-mobil-lombok" },
    category: "transport",
    priceLabel: "Mulai Rp350 ribu / hari",
    duration: "Airport Transfer, Full Day, dan Multi Day",
    summary:
      "Sewa mobil Lombok dengan driver untuk jemput bandara, city tour, full day trip, dan perjalanan multi day dengan armada yang fleksibel sesuai kebutuhan tamu.",
    highlights: [
      "Cocok untuk airport transfer, city tour, dan transport selama liburan",
      "Driver lokal profesional yang memahami rute wisata Lombok",
      "Bisa dikembangkan ke pilihan armada sesuai jumlah peserta dan kebutuhan trip",
    ],
    heroNote:
      "Layanan ini cocok untuk wisatawan domestik maupun internasional yang membutuhkan transport fleksibel, nyaman, dan mudah dikonsultasikan selama berada di Lombok.",
    content: buildSewaMobilLombokContent(),
    faqs: [
      faq(
        "Apakah tersedia jemput bandara?",
        "Tersedia. Layanan sewa mobil dapat disesuaikan untuk jemput bandara, transfer hotel, atau full day trip.",
      ),
      faq(
        "Apakah bisa pilih jenis mobil?",
        "Bisa. Halaman ini siap diturunkan ke variasi armada seperti Avanza, Hiace, Fortuner, atau Alphard.",
      ),
      faq(
        "Apakah sewa mobil cocok untuk city tour?",
        "Ya. Sewa mobil dengan driver sangat cocok untuk city tour, beach hopping, dan perjalanan antar destinasi di Lombok.",
      ),
      faq(
        "Apakah bisa dipakai beberapa hari?",
        "Bisa. Layanan tersedia untuk kebutuhan harian maupun multi day sesuai itinerary tamu.",
      ),
      faq(
        "Apakah tersedia mobil untuk rombongan atau keluarga besar?",
        "Tersedia. Untuk peserta lebih banyak, armada seperti Hiace atau kendaraan berkapasitas besar dapat disiapkan sesuai kebutuhan trip.",
      ),
    ],
    ctaMessage: "Halo, saya ingin sewa mobil Lombok dengan driver untuk jemput bandara, city tour, atau perjalanan harian.",
    seoTitle: "Sewa Mobil Lombok dengan Driver | Jemput Bandara, City Tour & Harian",
    metaDescription:
      "Cari sewa mobil Lombok dengan driver? Tersedia layanan jemput bandara, city tour, full day trip, dan perjalanan harian atau multi day dengan armada yang fleksibel.",
    keywords: ["sewa mobil lombok", "rental mobil lombok", "sewa mobil bandara lombok", "driver lombok"],
  },
];

const destinationDocs = [
  {
    _id: "destination-gili-trawangan",
    _type: "destination",
    title: "Wisata Gili Trawangan",
    slug: { _type: "slug", current: "gili-trawangan" },
    category: "Island Escape",
    summary:
      "Wisata Gili Trawangan cocok untuk snorkeling, sunset, honeymoon, dan island escape dengan suasana santai yang paling populer di kawasan Gili.",
    highlight: "Pilihan paling dicari untuk first timer, pasangan, dan tamu yang ingin kombinasi laut serta island vibes.",
    content: buildGiliTrawanganContent(),
    faqs: [
      faq(
        "Kapan waktu terbaik ke Gili Trawangan?",
        "Musim kemarau umumnya paling nyaman untuk snorkeling, island hopping, dan aktivitas laut, tetapi itinerary ke Gili Trawangan masih bisa disesuaikan sepanjang tahun.",
      ),
      faq(
        "Apakah destinasi ini cocok untuk honeymoon?",
        "Ya. Gili Trawangan sangat cocok untuk pasangan karena banyak pilihan sunset spot dan private trip.",
      ),
      faq(
        "Apakah lebih baik day trip atau menginap?",
        "Keduanya bisa. Day trip cocok untuk itinerary singkat, sedangkan menginap memberi waktu lebih leluasa menikmati sunset dan suasana malam di pulau.",
      ),
      faq(
        "Apakah Gili Trawangan cocok untuk first timer ke Lombok?",
        "Sangat cocok, terutama untuk wisatawan yang ingin pengalaman pulau yang ikonik dan mudah dikombinasikan dengan paket wisata Lombok.",
      ),
    ],
    recommendations: [
      "Gili Trawangan cocok digabungkan dengan paket 3D2N atau 4D3N agar ritme perjalanan terasa lebih lengkap.",
      "Pilihan ini juga menarik untuk pasangan yang ingin suasana lebih romantis dan private.",
      "Transport atau sewa mobil menuju pelabuhan bisa membantu perjalanan terasa lebih praktis sejak awal.",
    ],
    ctaMessage: "Halo, saya ingin trip ke Gili Trawangan.",
    seoTitle: "Wisata Gili Trawangan | Snorkeling, Sunset, Honeymoon, dan Island Escape",
    metaDescription:
      "Panduan wisata Gili Trawangan untuk snorkeling, sunset, honeymoon, cara akses, dan rekomendasi trip dari Lombok.",
    keywords: ["gili trawangan", "wisata gili trawangan", "trip gili trawangan", "honeymoon gili trawangan"],
  },
  {
    _id: "destination-kuta-mandalika",
    _type: "destination",
    title: "Wisata Kuta Mandalika",
    slug: { _type: "slug", current: "kuta-mandalika" },
    category: "Beach & Lifestyle",
    summary:
      "Wisata Kuta Mandalika cocok untuk pantai selatan Lombok, beach hopping, sunset, short escape, dan itinerary yang mudah diakses dari bandara.",
    highlight: "Area favorit untuk short escape, first timer, pasangan, dan keluarga yang ingin pantai selatan Lombok.",
    content: buildKutaMandalikaContent(),
    faqs: [
      faq(
        "Apakah Mandalika dekat dari bandara?",
        "Ya. Mandalika termasuk area yang relatif dekat dari bandara sehingga cocok untuk short escape.",
      ),
      faq(
        "Aktivitas apa yang paling sering dipilih?",
        "Pantai hopping, sunset, kuliner, dan kombinasi dengan Bukit Merese atau Tanjung Aan.",
      ),
      faq(
        "Apakah Kuta Mandalika cocok untuk keluarga?",
        "Cocok. Area ini relatif mudah diakses dan punya banyak pilihan spot yang nyaman untuk family trip.",
      ),
      faq(
        "Berapa lama waktu ideal untuk menjelajahi Kuta Mandalika?",
        "Satu hari sudah cukup untuk short escape, tetapi 2D1N akan memberi waktu lebih santai untuk menikmati pantai dan sunset.",
      ),
    ],
    recommendations: [
      "Kuta Mandalika cocok dipilih jika Anda ingin menjelajahi pantai selatan Lombok dalam satu perjalanan.",
      "Sewa mobil bisa menjadi pilihan nyaman untuk tamu yang ingin beach hopping lebih fleksibel.",
      "Area ini juga cocok dimasukkan ke itinerary honeymoon karena punya sunset spot dan resort area yang menarik.",
    ],
    ctaMessage: "Halo, saya ingin trip ke Kuta Mandalika.",
    seoTitle: "Wisata Kuta Mandalika | Pantai Selatan, Sunset, dan Short Escape Lombok",
    metaDescription:
      "Panduan wisata Kuta Mandalika untuk pantai selatan, sunset, akses dari bandara, dan itinerary short escape di Lombok.",
    keywords: ["wisata mandalika", "kuta mandalika", "pantai selatan lombok", "wisata kuta lombok"],
  },
  {
    _id: "destination-senggigi",
    _type: "destination",
    title: "Wisata Senggigi",
    slug: { _type: "slug", current: "senggigi" },
    category: "Classic Coastal",
    summary:
      "Wisata Senggigi cocok untuk sunset, hotel, kuliner, dan area menginap strategis di Lombok barat yang nyaman untuk berbagai tipe wisatawan.",
    highlight: "Pilihan basecamp paling aman untuk wisatawan yang ingin area strategis, hotel lengkap, dan akses nyaman.",
    content: buildSenggigiContent(),
    faqs: [
      faq(
        "Apa keunggulan utama Senggigi?",
        "Keunggulan utama Senggigi adalah lokasi strategis, banyak hotel, dan akses mudah ke Lombok barat serta Gili.",
      ),
      faq(
        "Apakah cocok untuk menginap keluarga?",
        "Cocok. Senggigi punya banyak opsi hotel, restoran, dan akses transport yang nyaman.",
      ),
      faq(
        "Apakah Senggigi cocok dijadikan basecamp beberapa hari?",
        "Ya. Senggigi termasuk area yang nyaman untuk basecamp karena aksesnya relatif mudah ke banyak titik perjalanan.",
      ),
      faq(
        "Apakah dari Senggigi mudah lanjut ke Gili atau Lombok barat?",
        "Mudah. Banyak wisatawan memilih Senggigi karena posisinya nyaman untuk perjalanan lanjutan ke Gili maupun destinasi Lombok barat.",
      ),
    ],
    recommendations: [
      "Senggigi nyaman dijadikan area menginap untuk itinerary beberapa hari yang lebih santai.",
      "Sewa mobil bisa membantu perjalanan Anda lebih fleksibel saat menjelajahi Lombok barat.",
      "Destinasi ini juga cocok digabungkan dengan trip ke Gili Trawangan untuk pengalaman laut dan sunset sekaligus.",
    ],
    ctaMessage: "Halo, saya ingin trip ke Senggigi.",
    seoTitle: "Wisata Senggigi | Sunset, Hotel, Kuliner, dan Basecamp Lombok Barat",
    metaDescription:
      "Panduan wisata Senggigi untuk sunset, hotel, kuliner, area menginap, dan itinerary Lombok barat.",
    keywords: ["wisata senggigi", "senggigi lombok", "hotel senggigi", "sunset senggigi"],
  },
];

const articleDocs = [
  {
    _id: "article-tempat-wisata-di-lombok",
    _type: "article",
    title: "10 Tempat Wisata di Lombok yang Wajib Masuk Itinerary Pertama",
    slug: { _type: "slug", current: "tempat-wisata-di-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan destinasi inti untuk first-timer yang ingin menggabungkan pantai, budaya, dan spot sunset di Lombok.",
    description:
      "Panduan tempat wisata di Lombok untuk first timer, mulai dari Gili Trawangan, Kuta Mandalika, Senggigi, pantai, bukit, hingga air terjun yang paling sering masuk itinerary.",
    publishedAt: "2026-05-19T06:00:00.000Z",
    content: buildTempatWisataLombokContent(),
    faqs: [
      faq(
        "Berapa lama ideal liburan pertama ke Lombok?",
        "Durasi ideal untuk first timer biasanya 3 hari 2 malam sampai 4 hari 3 malam.",
      ),
      faq(
        "Apakah semua destinasi bisa digabung dalam satu trip?",
        "Tidak selalu. Pilihan destinasi sebaiknya dibagi berdasarkan area agar itinerary tetap realistis.",
      ),
      faq(
        "Destinasi mana yang paling cocok untuk first timer?",
        "Biasanya wisatawan first timer memilih kombinasi Gili Trawangan, Kuta Mandalika, Senggigi, dan beberapa spot sunset atau pantai selatan yang mudah diakses.",
      ),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/sewa-mobil-lombok", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin itinerary wisata Lombok.",
    seoTitle: "10 Tempat Wisata di Lombok | Panduan Destinasi Terbaik",
    metaDescription:
      "Daftar tempat wisata di Lombok untuk first timer, lengkap dengan rekomendasi itinerary, tips, dan paket trip terkait.",
    keywords: ["tempat wisata di lombok", "wisata lombok", "destinasi lombok"],
  },
  {
    _id: "article-harga-sewa-mobil-lombok",
    _type: "article",
    title: "Harga Sewa Mobil Lombok Terbaru dan Tips Memilih Armada",
    slug: { _type: "slug", current: "harga-sewa-mobil-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan harga sewa mobil Lombok untuk berbagai jenis armada, kebutuhan perjalanan, dan tips memilih layanan yang paling sesuai.",
    description:
      "Cari tahu kisaran harga sewa mobil Lombok untuk trip keluarga, airport transfer, dan perjalanan wisata harian agar lebih mudah menyesuaikan armada dengan kebutuhan.",
    publishedAt: "2026-05-19T06:10:00.000Z",
    content: buildHargaSewaMobilLombokContent(),
    faqs: [
      faq(
        "Berapa harga sewa mobil Lombok per hari?",
        "Kisaran harga berbeda tergantung jenis armada, durasi pemakaian, area jemput, dan kebutuhan perjalanan.",
      ),
      faq(
        "Apakah tersedia mobil dengan driver?",
        "Ya, banyak tamu memilih mobil dengan driver untuk airport transfer, family trip, dan perjalanan wisata harian.",
      ),
      faq(
        "Apakah bisa jemput bandara?",
        "Bisa. Jemput bandara termasuk kebutuhan yang paling sering diminta oleh tamu yang baru tiba di Lombok.",
      ),
      faq(
        "Mobil apa yang cocok untuk rombongan?",
        "Untuk rombongan, Hiace biasanya menjadi pilihan yang lebih nyaman dan praktis karena kapasitasnya lebih besar.",
      ),
      faq(
        "Apakah harga sewa mobil Lombok sudah termasuk driver?",
        "Tergantung jenis layanan yang dipilih. Banyak tamu memilih mobil dengan driver karena lebih praktis untuk airport transfer, city tour, dan perjalanan wisata harian.",
      ),
    ],
    relatedLinks: [
      "/sewa-mobil-lombok",
      "/blog/sewa-mobil-bandara-lombok",
      "/blog/sewa-mobil-lombok-plus-driver",
      "/blog/rental-hiace-lombok",
      "/paket-wisata-lombok",
    ],
    ctaMessage: "Kirim tanggal perjalanan, jumlah peserta, dan area jemput agar kami bantu cek kisaran harga sewa mobil Lombok per hari yang paling sesuai.",
    seoTitle: "Harga Sewa Mobil Lombok per Hari Terbaru | Avanza, Hiace, Alphard",
    metaDescription:
      "Lihat harga sewa mobil Lombok per hari untuk Avanza, Hiace, Alphard, Fortuner, dan armada lainnya. Cocok untuk liburan, airport transfer, keluarga, dan rombongan.",
    keywords: [
      "harga sewa mobil lombok",
      "rental mobil lombok murah",
      "sewa mobil lombok",
      "rental mobil lombok",
      "sewa hiace lombok",
    ],
  },
  {
    _id: "article-itinerary-lombok-3-hari",
    _type: "article",
    title: "Itinerary Lombok 3 Hari yang Efisien dan Nyaman",
    slug: { _type: "slug", current: "itinerary-lombok-3-hari" },
    category: "Itinerary",
    excerpt:
      "Contoh itinerary Lombok 3 hari yang efisien untuk first timer, pasangan, dan keluarga yang ingin menikmati trip singkat tanpa terlalu padat.",
    description:
      "Simak contoh itinerary Lombok 3 hari 2 malam yang bisa disesuaikan untuk first timer, pasangan, atau keluarga dengan rute yang praktis dan nyaman.",
    publishedAt: "2026-05-19T06:20:00.000Z",
    content: buildItineraryLombok3HariContent(),
    faqs: [
      faq(
        "Tiga hari di Lombok enaknya ke mana saja?",
        "Kombinasi area Mandalika dan satu trip ke Gili biasanya menjadi susunan yang paling seimbang untuk durasi tiga hari.",
      ),
      faq(
        "Perlu menginap di area mana?",
        "Tergantung rute, tetapi area Kuta Lombok atau Senggigi sering dipilih karena cukup praktis untuk beberapa jalur perjalanan.",
      ),
      faq(
        "Apakah itinerary ini cocok untuk keluarga?",
        "Cocok, selama ritme perjalanan dibuat lebih santai dan tidak terlalu banyak perpindahan dalam satu hari.",
      ),
      faq(
        "Bisakah itinerary disesuaikan dengan jam pesawat?",
        "Bisa, dan justru sebaiknya memang disesuaikan agar perjalanan terasa lebih nyaman.",
      ),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"],
    ctaMessage: "Jika Anda ingin itinerary yang siap jalan tanpa repot atur sendiri, kirim tanggal trip dan kami bantu sesuaikan rutenya.",
    seoTitle: "Itinerary Lombok 3 Hari 2 Malam untuk First Timer, Couple & Family",
    metaDescription:
      "Bingung menyusun itinerary Lombok 3 hari? Simak contoh rute 3D2N yang efisien untuk first timer, pasangan, dan keluarga, lengkap dengan destinasi populer.",
    keywords: ["itinerary lombok 3 hari", "tour lombok 3 hari 2 malam", "trip lombok 3d2n", "itinerary lombok 3 hari 2 malam"],
  },
  {
    _id: "article-paket-wisata-lombok-murah",
    _type: "article",
    title: "Paket Wisata Lombok Murah yang Tetap Nyaman untuk Liburan",
    slug: { _type: "slug", current: "paket-wisata-lombok-murah" },
    category: "Paket Wisata",
    excerpt:
      "Panduan memilih paket wisata Lombok murah dengan itinerary tetap realistis, nyaman, dan cocok untuk first timer.",
    description:
      "Panduan paket wisata Lombok murah untuk wisatawan yang ingin trip hemat namun tetap nyaman, dengan tips memilih itinerary, fasilitas, dan value paket.",
    publishedAt: "2026-05-20T07:00:00.000Z",
    content: buildPaketWisataLombokMurahContent(),
    faqs: [
      faq("Apakah paket wisata Lombok murah tetap bisa nyaman?", "Bisa, selama itinerary disusun realistis dan fasilitas utama seperti transport serta ritme perjalanan tetap diperhatikan."),
      faq("Apa yang membuat paket bisa lebih hemat?", "Biasanya dipengaruhi oleh durasi, jumlah peserta, pilihan hotel, dan rute destinasi yang dipilih."),
      faq("Apakah paket murah cocok untuk first timer?", "Cocok, terutama jika wisatawan ingin perjalanan praktis dengan budget yang lebih terkontrol."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin tanya paket wisata Lombok murah.",
    seoTitle: "Paket Wisata Lombok Murah yang Tetap Nyaman untuk Liburan",
    metaDescription:
      "Cari paket wisata Lombok murah? Simak tips memilih paket yang tetap nyaman, itinerary realistis, dan cocok untuk first timer maupun keluarga.",
    keywords: ["paket wisata lombok murah", "tour lombok murah", "paket tour lombok murah", "travel lombok murah"],
  },
  {
    _id: "article-tour-lombok-3-hari-2-malam",
    _type: "article",
    title: "Tour Lombok 3 Hari 2 Malam untuk Liburan yang Efisien",
    slug: { _type: "slug", current: "tour-lombok-3-hari-2-malam" },
    category: "Tour Lombok",
    excerpt:
      "Pilihan tour Lombok 3 hari 2 malam untuk first timer yang ingin itinerary efisien dan tetap nyaman.",
    description:
      "Panduan tour Lombok 3 hari 2 malam dengan gambaran itinerary, kelebihan durasi 3D2N, dan tips memilih paket yang paling cocok.",
    publishedAt: "2026-05-20T07:10:00.000Z",
    content: buildTourLombok3Hari2MalamContent(),
    faqs: [
      faq("Apakah 3 hari 2 malam cukup untuk tour Lombok?", "Cukup untuk first timer selama fokus area wisata dan ritme perjalanan diatur dengan baik."),
      faq("Destinasi apa yang biasanya masuk tour 3D2N?", "Umumnya kombinasi area selatan Lombok, sunset spot, dan satu highlight utama seperti Gili Trawangan atau pantai populer."),
      faq("Siapa yang cocok memilih durasi ini?", "Durasi ini cocok untuk pasangan, keluarga, dan tamu dari luar kota yang ingin liburan singkat namun tetap lengkap."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/itinerary-lombok-3-hari", "/wisata/gili-trawangan"],
    ctaMessage: "Halo, saya ingin tour Lombok 3 hari 2 malam.",
    seoTitle: "Tour Lombok 3 Hari 2 Malam untuk Liburan yang Efisien",
    metaDescription:
      "Panduan tour Lombok 3 hari 2 malam untuk first timer, lengkap dengan gambaran itinerary, highlight trip, dan tips memilih paket.",
    keywords: ["tour lombok 3 hari 2 malam", "paket wisata lombok 3 hari 2 malam", "trip lombok 3d2n"],
  },
  {
    _id: "article-trip-gili-trawangan",
    _type: "article",
    title: "Trip Gili Trawangan dari Lombok: Panduan Akses, Aktivitas, dan Tips",
    slug: { _type: "slug", current: "trip-gili-trawangan" },
    category: "Trip Gili",
    excerpt:
      "Panduan trip Gili Trawangan dari Lombok untuk day trip atau menginap, lengkap dengan akses dan tips.",
    description:
      "Informasi trip Gili Trawangan dari Lombok, mulai dari akses, pilihan aktivitas, day trip vs menginap, dan cara merencanakan perjalanan yang lebih praktis.",
    publishedAt: "2026-05-20T07:20:00.000Z",
    content: buildTripGiliTrawanganContent(),
    faqs: [
      faq("Apakah trip Gili Trawangan lebih baik day trip atau menginap?", "Tergantung durasi liburan. Day trip cocok untuk waktu singkat, sementara menginap memberi waktu lebih leluasa menikmati sunset dan suasana pulau."),
      faq("Aktivitas apa yang paling sering dicari di Gili Trawangan?", "Snorkeling, island hopping, sunset, bersepeda keliling pulau, dan honeymoon trip."),
      faq("Apakah trip Gili Trawangan cocok untuk first timer?", "Sangat cocok, terutama untuk wisatawan yang ingin pengalaman pulau yang paling ikonik di Lombok."),
    ],
    relatedLinks: ["/wisata/gili-trawangan", "/paket-wisata-lombok", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Gili Trawangan.",
    seoTitle: "Trip Gili Trawangan dari Lombok: Panduan Akses, Aktivitas, dan Tips",
    metaDescription:
      "Panduan trip Gili Trawangan dari Lombok, lengkap dengan akses, aktivitas, pilihan day trip atau menginap, dan tips perjalanan.",
    keywords: ["trip gili trawangan", "wisata gili trawangan", "day trip gili trawangan", "honeymoon gili trawangan"],
  },
  {
    _id: "article-paket-wisata-lombok-dari-jakarta",
    _type: "article",
    title: "Paket Wisata Lombok dari Jakarta untuk Trip yang Lebih Praktis",
    slug: { _type: "slug", current: "paket-wisata-lombok-dari-jakarta" },
    category: "Paket Wisata",
    excerpt:
      "Panduan untuk wisatawan Jakarta yang ingin paket wisata Lombok yang mudah dikonsultasikan dan efisien.",
    description:
      "Informasi paket wisata Lombok dari Jakarta untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sejak sebelum keberangkatan.",
    publishedAt: "2026-05-20T07:30:00.000Z",
    content: buildPaketWisataLombokDariJakartaContent(),
    faqs: [
      faq("Kenapa paket wisata Lombok dari Jakarta banyak dicari?", "Karena wisatawan dari Jakarta biasanya ingin semua detail perjalanan lebih jelas sejak sebelum keberangkatan."),
      faq("Durasi apa yang paling cocok untuk tamu dari Jakarta?", "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang antara waktu dan pengalaman trip."),
      faq("Apakah paket bisa disesuaikan untuk keluarga atau pasangan?", "Bisa, itinerary dapat diarahkan untuk family trip, private trip, maupun honeymoon."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok dari Jakarta.",
    seoTitle: "Paket Wisata Lombok dari Jakarta untuk Trip yang Lebih Praktis",
    metaDescription:
      "Cari paket wisata Lombok dari Jakarta? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis untuk liburan Anda.",
    keywords: ["paket wisata lombok dari jakarta", "tour lombok dari jakarta", "travel lombok dari jakarta"],
  },
  {
    _id: "article-rental-mobil-lombok-murah",
    _type: "article",
    title: "Rental Mobil Lombok Murah dengan Driver untuk Trip yang Fleksibel",
    slug: { _type: "slug", current: "rental-mobil-lombok-murah" },
    category: "Rental Mobil",
    excerpt:
      "Panduan rental mobil Lombok murah untuk city tour, transfer, dan perjalanan fleksibel dengan driver.",
    description:
      "Informasi rental mobil Lombok murah dengan driver, termasuk tips memilih armada, area jemput, dan cara mendapat layanan yang tetap nyaman.",
    publishedAt: "2026-05-20T07:40:00.000Z",
    content: buildRentalMobilLombokMurahContent(),
    faqs: [
      faq("Apakah rental mobil Lombok murah tetap bisa nyaman?", "Bisa, selama armada sesuai kebutuhan dan layanan driver atau rute perjalanan dijelaskan sejak awal."),
      faq("Kapan rental murah paling cocok dipakai?", "Biasanya untuk city tour, transfer bandara, perjalanan pasangan, dan keluarga kecil dengan rute yang jelas."),
      faq("Apa yang perlu dicek sebelum booking?", "Pastikan jenis armada, area jemput, durasi penggunaan, dan detail layanan sudah sesuai kebutuhan perjalanan Anda."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin rental mobil Lombok murah.",
    seoTitle: "Rental Mobil Lombok Murah dengan Driver untuk Trip yang Fleksibel",
    metaDescription:
      "Cari rental mobil Lombok murah? Simak tips memilih armada, driver, dan layanan transport yang tetap nyaman untuk liburan Anda.",
    keywords: ["rental mobil lombok murah", "sewa mobil lombok murah", "rental mobil lombok", "driver lombok"],
  },
  {
    _id: "article-tempat-wisata-di-lombok-selain-gili",
    _type: "article",
    title: "Tempat Wisata di Lombok Selain Gili yang Layak Masuk Itinerary",
    slug: { _type: "slug", current: "tempat-wisata-di-lombok-selain-gili" },
    category: "Wisata Lombok",
    excerpt:
      "Alternatif tempat wisata di Lombok selain Gili untuk wisatawan yang ingin fokus ke pantai, bukit, Senggigi, dan daratan Lombok.",
    description:
      "Panduan tempat wisata di Lombok selain Gili, termasuk pantai selatan, bukit sunset, Senggigi, dan destinasi daratan lain yang cocok untuk itinerary yang lebih seimbang.",
    publishedAt: "2026-05-20T07:50:00.000Z",
    content: buildTempatWisataLombokSelainGiliContent(),
    faqs: [
      faq("Apakah Lombok tetap menarik tanpa fokus ke Gili?", "Tetap sangat menarik karena Lombok punya banyak destinasi daratan seperti pantai selatan, bukit, Senggigi, dan air terjun."),
      faq("Siapa yang cocok dengan itinerary selain Gili?", "Cocok untuk keluarga, wisatawan yang ingin fokus ke daratan, atau tamu yang ingin rute lebih sederhana."),
      faq("Destinasi apa yang paling sering dipilih selain Gili?", "Biasanya Kuta Mandalika, Bukit Merese, Senggigi, dan beberapa spot pantai selatan atau wisata alam lainnya."),
    ],
    relatedLinks: ["/wisata/kuta-mandalika", "/wisata/senggigi", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin itinerary Lombok selain Gili.",
    seoTitle: "Tempat Wisata di Lombok Selain Gili yang Layak Masuk Itinerary",
    metaDescription:
      "Cari tempat wisata di Lombok selain Gili? Simak rekomendasi pantai selatan, bukit, Senggigi, dan destinasi daratan lain yang layak masuk itinerary.",
    keywords: ["tempat wisata di lombok selain gili", "wisata lombok selain gili", "destinasi lombok selain gili"],
  },
  {
    _id: "article-paket-honeymoon-lombok-murah",
    _type: "article",
    title: "Paket Honeymoon Lombok Murah yang Tetap Nyaman untuk Pasangan",
    slug: { _type: "slug", current: "paket-honeymoon-lombok-murah" },
    category: "Honeymoon",
    excerpt:
      "Panduan memilih paket honeymoon Lombok murah yang tetap romantis, nyaman, dan cocok untuk pasangan.",
    description:
      "Panduan paket honeymoon Lombok murah untuk pasangan yang ingin liburan romantis dengan itinerary nyaman, hotel yang sesuai, dan budget yang lebih terkontrol.",
    publishedAt: "2026-05-20T08:00:00.000Z",
    content: buildPaketHoneymoonLombokMurahContent(),
    faqs: [
      faq("Apakah paket honeymoon Lombok murah tetap bisa romantis?", "Bisa, selama fokus trip, hotel, dan ritme perjalanan disusun dengan tepat sesuai kebutuhan pasangan."),
      faq("Durasi apa yang paling cocok untuk honeymoon hemat?", "Biasanya 2D1N atau 3D2N paling banyak dipilih karena tetap nyaman namun budget lebih mudah dikontrol."),
      faq("Apakah paket bisa termasuk hotel dan transport?", "Bisa, paket honeymoon dapat disesuaikan dengan hotel, transport, dan kebutuhan perjalanan pasangan."),
    ],
    relatedLinks: ["/paket-honeymoon-lombok", "/blog/paket-wisata-lombok-4-hari-3-malam", "/wisata/gili-trawangan"],
    ctaMessage: "Halo, saya ingin tanya paket honeymoon Lombok murah.",
    seoTitle: "Paket Honeymoon Lombok Murah yang Tetap Nyaman untuk Pasangan",
    metaDescription:
      "Cari paket honeymoon Lombok murah? Simak tips memilih trip romantis yang tetap nyaman, realistis, dan sesuai budget pasangan.",
    keywords: ["paket honeymoon lombok murah", "honeymoon lombok murah", "paket bulan madu lombok murah", "honeymoon lombok"],
  },
  {
    _id: "article-sewa-mobil-lombok-plus-driver",
    _type: "article",
    title: "Sewa Mobil Lombok Plus Driver untuk Perjalanan yang Lebih Praktis",
    slug: { _type: "slug", current: "sewa-mobil-lombok-plus-driver" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa mobil Lombok plus driver untuk wisatawan yang ingin perjalanan lebih praktis, nyaman, dan tidak repot mengatur rute sendiri.",
    description:
      "Simak manfaat sewa mobil Lombok plus driver untuk airport transfer, family trip, dan perjalanan harian yang lebih nyaman di berbagai area wisata.",
    publishedAt: "2026-05-20T08:10:00.000Z",
    content: buildSewaMobilLombokPlusDriverContent(),
    faqs: [
      faq("Apakah driver sudah paham rute wisata Lombok?", "Layanan driver dipilih justru agar perjalanan lebih praktis dan rute lebih mudah diarahkan sesuai kebutuhan tamu."),
      faq("Apakah bisa dipakai untuk full day trip?", "Bisa. Banyak tamu menggunakan mobil plus driver untuk perjalanan harian maupun trip beberapa hari."),
      faq("Apakah tersedia untuk airport transfer?", "Ya, layanan ini juga sangat cocok untuk jemput bandara dan langsung lanjut ke hotel atau destinasi lain."),
      faq("Mobil apa yang cocok untuk 5 sampai 7 orang?", "Untuk jumlah peserta seperti itu, armada keluarga yang lebih lega atau kendaraan lebih besar biasanya lebih nyaman."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/blog/harga-sewa-mobil-lombok"],
    ctaMessage: "Ceritakan rute dan jumlah peserta Anda, lalu kami bantu siapkan mobil plus driver yang paling sesuai.",
    seoTitle: "Sewa Mobil Lombok Plus Driver untuk Liburan yang Lebih Nyaman",
    metaDescription:
      "Cari sewa mobil Lombok plus driver? Cocok untuk first timer, keluarga, airport transfer, dan perjalanan harian dengan rute yang lebih praktis.",
    keywords: ["sewa mobil lombok plus driver", "rental mobil lombok dengan driver", "driver lombok", "sewa mobil lombok"],
  },
  {
    _id: "article-paket-wisata-lombok-4-hari-3-malam",
    _type: "article",
    title: "Paket Wisata Lombok 4 Hari 3 Malam untuk Liburan yang Lebih Lengkap",
    slug: { _type: "slug", current: "paket-wisata-lombok-4-hari-3-malam" },
    category: "Paket Wisata",
    excerpt:
      "Panduan paket wisata Lombok 4 hari 3 malam untuk trip yang lebih lengkap, santai, dan tetap efisien.",
    description:
      "Panduan paket wisata Lombok 4 hari 3 malam dengan gambaran itinerary, kelebihan durasi 4D3N, dan pilihan trip yang lebih lengkap untuk first timer.",
    publishedAt: "2026-05-20T08:20:00.000Z",
    content: buildPaketWisataLombok4Hari3MalamContent(),
    faqs: [
      faq("Apa kelebihan paket wisata 4 hari 3 malam?", "Durasi 4D3N memberi waktu lebih leluasa untuk menikmati destinasi Lombok dengan ritme yang lebih santai dan lengkap."),
      faq("Apakah paket 4D3N cocok untuk first timer?", "Cocok, terutama untuk wisatawan yang ingin pengalaman Lombok lebih lengkap tanpa itinerary terlalu padat."),
      faq("Destinasi apa saja yang biasanya bisa masuk?", "Umumnya dapat mencakup kombinasi Gili, pantai selatan, sunset spot, dan beberapa destinasi daratan lain sesuai fokus trip."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/wisata/gili-trawangan"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok 4 hari 3 malam.",
    seoTitle: "Paket Wisata Lombok 4 Hari 3 Malam untuk Liburan yang Lebih Lengkap",
    metaDescription:
      "Cari paket wisata Lombok 4 hari 3 malam? Simak gambaran itinerary, kelebihan durasi 4D3N, dan tips memilih trip yang lebih lengkap.",
    keywords: ["paket wisata lombok 4 hari 3 malam", "paket tour lombok 4d3n", "trip lombok 4 hari 3 malam"],
  },
  {
    _id: "article-wisata-kuta-lombok",
    _type: "article",
    title: "Wisata Kuta Lombok untuk Pantai Selatan dan Sunset Terbaik",
    slug: { _type: "slug", current: "wisata-kuta-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Kuta Lombok untuk menikmati pantai selatan, sunset, dan short escape yang mudah diakses.",
    description:
      "Informasi wisata Kuta Lombok untuk pantai selatan, sunset, akses dari bandara, dan itinerary short escape yang nyaman.",
    publishedAt: "2026-05-20T08:30:00.000Z",
    content: buildWisataKutaLombokContent(),
    faqs: [
      faq("Apakah Kuta Lombok dekat dari bandara?", "Ya, Kuta Lombok termasuk area yang relatif dekat dari bandara sehingga cocok untuk short escape."),
      faq("Apa aktivitas paling populer di Kuta Lombok?", "Pantai selatan, beach hopping, sunset, dan liburan santai di area resort atau viewpoint."),
      faq("Apakah Kuta Lombok cocok untuk keluarga?", "Cocok, karena banyak spot yang mudah diakses dan ritme perjalanannya bisa dibuat lebih ringan."),
    ],
    relatedLinks: ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Kuta Lombok.",
    seoTitle: "Wisata Kuta Lombok untuk Pantai Selatan dan Sunset Terbaik",
    metaDescription:
      "Cari wisata Kuta Lombok? Simak panduan pantai selatan, sunset, akses bandara, dan itinerary short escape yang nyaman.",
    keywords: ["wisata kuta lombok", "kuta lombok", "pantai selatan lombok", "wisata mandalika"],
  },
  {
    _id: "article-paket-wisata-lombok-dari-surabaya",
    _type: "article",
    title: "Paket Wisata Lombok dari Surabaya untuk Trip yang Praktis",
    slug: { _type: "slug", current: "paket-wisata-lombok-dari-surabaya" },
    category: "Paket Wisata",
    excerpt:
      "Panduan untuk wisatawan Surabaya yang ingin paket wisata Lombok yang praktis dan mudah dikonsultasikan.",
    description:
      "Informasi paket wisata Lombok dari Surabaya untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sebelum keberangkatan.",
    publishedAt: "2026-05-20T08:40:00.000Z",
    content: buildPaketWisataLombokDariSurabayaContent(),
    faqs: [
      faq("Kenapa paket wisata Lombok dari Surabaya banyak dicari?", "Karena wisatawan dari Surabaya biasanya ingin itinerary, hotel, dan transport lebih jelas sejak sebelum keberangkatan."),
      faq("Durasi apa yang paling sering dipilih?", "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang untuk liburan ke Lombok."),
      faq("Apakah paket bisa disesuaikan untuk keluarga atau pasangan?", "Bisa, itinerary dapat diarahkan sesuai kebutuhan family trip, private trip, maupun honeymoon."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-4-hari-3-malam", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok dari Surabaya.",
    seoTitle: "Paket Wisata Lombok dari Surabaya untuk Trip yang Praktis",
    metaDescription:
      "Cari paket wisata Lombok dari Surabaya? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis.",
    keywords: ["paket wisata lombok dari surabaya", "tour lombok dari surabaya", "travel lombok dari surabaya"],
  },
  {
    _id: "article-tour-gili-trawangan-dari-lombok",
    _type: "article",
    title: "Tour Gili Trawangan dari Lombok untuk Day Trip atau Menginap",
    slug: { _type: "slug", current: "tour-gili-trawangan-dari-lombok" },
    category: "Trip Gili",
    excerpt:
      "Panduan tour Gili Trawangan dari Lombok untuk day trip atau menginap, lengkap dengan tips perjalanan.",
    description:
      "Informasi tour Gili Trawangan dari Lombok, mulai dari akses, aktivitas, pilihan day trip atau menginap, dan cara merencanakan perjalanan yang lebih nyaman.",
    publishedAt: "2026-05-20T08:50:00.000Z",
    content: buildTourGiliTrawanganDariLombokContent(),
    faqs: [
      faq("Apakah tour Gili Trawangan lebih baik day trip atau menginap?", "Tergantung durasi liburan. Day trip cocok untuk waktu singkat, sedangkan menginap memberi pengalaman yang lebih santai."),
      faq("Aktivitas apa yang paling sering dicari di Gili Trawangan?", "Snorkeling, island hopping, sunset, bersepeda keliling pulau, dan honeymoon trip."),
      faq("Apakah tour Gili Trawangan cocok untuk first timer?", "Sangat cocok, terutama untuk wisatawan yang ingin pengalaman pulau yang ikonik dan mudah dikombinasikan dengan itinerary Lombok."),
    ],
    relatedLinks: ["/wisata/gili-trawangan", "/paket-wisata-lombok", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin tour Gili Trawangan dari Lombok.",
    seoTitle: "Tour Gili Trawangan dari Lombok untuk Day Trip atau Menginap",
    metaDescription:
      "Panduan tour Gili Trawangan dari Lombok, lengkap dengan akses, aktivitas, pilihan day trip atau menginap, dan tips perjalanan.",
    keywords: ["tour gili trawangan dari lombok", "trip gili trawangan dari lombok", "day trip gili trawangan"],
  },
  {
    _id: "article-paket-wisata-lombok-3-hari-2-malam",
    _type: "article",
    title: "Paket Wisata Lombok 3 Hari 2 Malam untuk Liburan yang Efisien",
    slug: { _type: "slug", current: "paket-wisata-lombok-3-hari-2-malam" },
    category: "Paket Wisata",
    excerpt:
      "Panduan paket wisata Lombok 3 hari 2 malam untuk first timer, pasangan, dan keluarga yang ingin trip 3D2N lebih efisien.",
    description:
      "Cari paket wisata Lombok 3 hari 2 malam? Simak gambaran itinerary 3D2N, highlight destinasi, dan alasan kenapa durasi ini paling sering dipilih first timer.",
    publishedAt: "2026-05-20T09:00:00.000Z",
    content: buildPaketWisataLombok3Hari2MalamContent(),
    faqs: [
      faq("Apakah paket wisata Lombok 3 hari 2 malam cocok untuk first timer?", "Cocok, karena durasi 3D2N cukup ideal untuk menikmati highlight Lombok tanpa itinerary terlalu padat."),
      faq("Destinasi apa yang biasanya masuk paket 3D2N?", "Biasanya mencakup kombinasi area selatan, sunset spot, dan satu highlight utama seperti Gili atau destinasi daratan populer."),
      faq("Siapa yang paling cocok memilih paket ini?", "Paket ini cocok untuk pasangan, keluarga, dan wisatawan dari luar kota yang ingin liburan efisien."),
      faq("Berapa harga paket wisata Lombok 3 hari 2 malam?", "Harga menyesuaikan jumlah peserta, hotel, area destinasi, dan fasilitas yang diambil, tetapi format 3D2N sering menjadi pilihan paling seimbang untuk first timer."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/itinerary-lombok-3-hari", "/wisata/gili-trawangan", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok 3 hari 2 malam dengan itinerary yang efisien untuk tanggal perjalanan saya.",
    seoTitle: "Paket Wisata Lombok 3 Hari 2 Malam | Itinerary 3D2N untuk First Timer",
    metaDescription:
      "Cari paket wisata Lombok 3 hari 2 malam? Lihat gambaran itinerary 3D2N, highlight destinasi, dan alasan kenapa durasi ini cocok untuk first timer, pasangan, dan keluarga.",
    keywords: ["paket wisata lombok 3 hari 2 malam", "paket tour lombok 3 hari 2 malam", "trip lombok 3d2n"],
  },
  {
    _id: "article-paket-wisata-lombok-2-hari-1-malam",
    _type: "article",
    title: "Paket Wisata Lombok 2 Hari 1 Malam untuk Short Escape yang Praktis",
    slug: { _type: "slug", current: "paket-wisata-lombok-2-hari-1-malam" },
    category: "Paket Wisata",
    excerpt:
      "Panduan paket wisata Lombok 2 hari 1 malam untuk short escape yang ringkas, praktis, dan tetap nyaman.",
    description:
      "Panduan paket wisata Lombok 2 hari 1 malam untuk wisatawan yang ingin short escape praktis dengan itinerary ringkas dan tetap nyaman.",
    publishedAt: "2026-05-20T09:10:00.000Z",
    content: buildPaketWisataLombok2Hari1MalamContent(),
    faqs: [
      faq("Apakah paket wisata Lombok 2 hari 1 malam tetap worth it?", "Tetap worth it, selama itinerary difokuskan ke area yang realistis dan tidak terlalu banyak berpindah destinasi."),
      faq("Trip 2D1N cocok untuk siapa?", "Cocok untuk short escape pasangan, keluarga kecil, atau wisatawan yang memiliki waktu sangat terbatas."),
      faq("Area mana yang paling cocok untuk trip singkat ini?", "Biasanya area seperti Kuta Lombok atau Lombok barat lebih ideal karena aksesnya lebih efisien."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/wisata/kuta-mandalika", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok 2 hari 1 malam.",
    seoTitle: "Paket Wisata Lombok 2 Hari 1 Malam untuk Short Escape yang Praktis",
    metaDescription:
      "Cari paket wisata Lombok 2 hari 1 malam? Simak tips memilih short escape yang tetap nyaman, ringkas, dan realistis.",
    keywords: ["paket wisata lombok 2 hari 1 malam", "paket tour lombok 2d1n", "trip lombok 2 hari 1 malam"],
  },
  {
    _id: "article-sewa-mobil-bandara-lombok",
    _type: "article",
    title: "Sewa Mobil Bandara Lombok untuk Perjalanan yang Lebih Praktis",
    slug: { _type: "slug", current: "sewa-mobil-bandara-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Layanan sewa mobil dari Bandara Lombok untuk jemput hotel, antar bandara, dan lanjut trip ke berbagai area di Lombok.",
    description:
      "Butuh sewa mobil dari Bandara Lombok? Simak panduan layanan jemput bandara, pilihan armada, dan area tujuan populer untuk perjalanan yang lebih praktis.",
    publishedAt: "2026-05-20T09:20:00.000Z",
    content: buildSewaMobilBandaraLombokContent(),
    faqs: [
      faq("Apakah bisa jemput malam hari?", "Bisa, selama jam kedatangan disampaikan lebih awal agar penjemputan bisa disiapkan sesuai jadwal."),
      faq("Apakah bisa langsung lanjut wisata?", "Bisa. Banyak tamu memilih langsung ke area wisata atau pelabuhan setelah mendarat."),
      faq("Apakah tersedia untuk keluarga atau rombongan?", "Ya, tersedia armada untuk pasangan, keluarga kecil, sampai rombongan dengan kebutuhan bagasi berbeda."),
      faq("Bagaimana cara booking jemput bandara?", "Cukup kirim tanggal, jam landing, jumlah peserta, dan tujuan akhir agar kendaraan bisa disiapkan."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/rental-hiace-lombok", "/blog/sewa-mobil-lombok-plus-driver"],
    ctaMessage: "Kirim jam landing, jumlah peserta, dan tujuan Anda untuk cek armada jemput bandara yang paling sesuai.",
    seoTitle: "Sewa Mobil Bandara Lombok untuk Jemput Hotel, Trip & Antar Jemput",
    metaDescription:
      "Butuh sewa mobil dari Bandara Lombok? Tersedia layanan jemput bandara, antar hotel, dan transport lanjut ke Kuta, Senggigi, Mataram, atau pelabuhan.",
    keywords: ["sewa mobil bandara lombok", "rental mobil bandara lombok", "jemput bandara lombok", "antar jemput bandara lombok"],
  },
  {
    _id: "article-honeymoon-gili-trawangan",
    _type: "article",
    title: "Honeymoon Gili Trawangan untuk Liburan Romantis di Pulau Favorit",
    slug: { _type: "slug", current: "honeymoon-gili-trawangan" },
    category: "Honeymoon",
    excerpt:
      "Panduan honeymoon Gili Trawangan untuk pasangan yang mencari sunset, island vibes, dan liburan romantis yang lebih private.",
    description:
      "Cari honeymoon Gili Trawangan? Simak ide bulan madu romantis dengan sunset, island stay, dan kombinasi trip yang nyaman untuk pasangan.",
    publishedAt: "2026-05-20T09:30:00.000Z",
    content: buildHoneymoonGiliTrawanganContent(),
    faqs: [
      faq("Apakah Gili Trawangan cocok untuk honeymoon?", "Sangat cocok karena punya suasana pulau yang santai, sunset yang kuat, dan pengalaman yang terasa lebih private untuk pasangan."),
      faq("Lebih baik honeymoon day trip atau menginap di Gili?", "Menginap biasanya lebih ideal untuk honeymoon karena pasangan bisa menikmati sunset dan suasana malam di pulau dengan lebih santai."),
      faq("Apakah honeymoon Gili bisa digabung dengan paket Lombok lain?", "Bisa, honeymoon Gili Trawangan sangat cocok dikombinasikan dengan paket honeymoon Lombok yang lebih panjang."),
      faq("Apa yang paling sering dicari pasangan saat honeymoon ke Gili Trawangan?", "Biasanya pasangan mencari sunset spot, penginapan yang nyaman, island vibes yang tenang, dan susunan trip yang tidak terlalu padat."),
    ],
    relatedLinks: ["/paket-honeymoon-lombok", "/wisata/gili-trawangan", "/blog/tour-gili-trawangan-dari-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin honeymoon ke Gili Trawangan atau paket honeymoon Lombok yang bisa disesuaikan untuk berdua.",
    seoTitle: "Honeymoon Gili Trawangan | Ide Bulan Madu Romantis di Lombok",
    metaDescription:
      "Cari honeymoon Gili Trawangan? Simak ide bulan madu romantis dengan sunset, island vibes, island stay, dan suasana private yang cocok untuk pasangan.",
    keywords: ["honeymoon gili trawangan", "bulan madu gili trawangan", "paket honeymoon gili", "trip romantis gili trawangan"],
  },
  {
    _id: "article-wisata-senggigi-lombok",
    _type: "article",
    title: "Wisata Senggigi Lombok untuk Sunset, Hotel, dan Basecamp Trip",
    slug: { _type: "slug", current: "wisata-senggigi-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Senggigi Lombok untuk sunset, hotel, dan area menginap strategis di Lombok barat.",
    description:
      "Informasi wisata Senggigi Lombok untuk sunset, hotel, kuliner, area menginap, dan basecamp trip yang nyaman di Lombok barat.",
    publishedAt: "2026-05-20T09:40:00.000Z",
    content: buildWisataSenggigiLombokContent(),
    faqs: [
      faq("Apa daya tarik utama wisata Senggigi Lombok?", "Daya tarik utamanya adalah sunset, hotel yang nyaman, kuliner, dan posisinya yang strategis untuk basecamp Lombok barat."),
      faq("Apakah Senggigi cocok untuk keluarga?", "Cocok, karena fasilitas hotel dan akses area cukup nyaman untuk keluarga maupun tamu yang ingin ritme liburan lebih tenang."),
      faq("Apakah Senggigi cocok untuk menginap beberapa hari?", "Ya, banyak wisatawan memilih Senggigi sebagai basecamp karena aksesnya nyaman ke banyak titik perjalanan."),
    ],
    relatedLinks: ["/wisata/senggigi", "/sewa-mobil-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Senggigi Lombok.",
    seoTitle: "Wisata Senggigi Lombok untuk Sunset, Hotel, dan Basecamp Trip",
    metaDescription:
      "Cari wisata Senggigi Lombok? Simak panduan sunset, hotel, kuliner, dan basecamp trip yang nyaman di Lombok barat.",
    keywords: ["wisata senggigi lombok", "senggigi lombok", "hotel senggigi", "sunset senggigi"],
  },
  {
    _id: "article-wisata-pink-beach-lombok",
    _type: "article",
    title: "Wisata Pink Beach Lombok untuk Trip Pantai Timur yang Berbeda",
    slug: { _type: "slug", current: "wisata-pink-beach-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Pink Beach Lombok untuk trip pantai timur yang unik, tenang, dan cocok jadi variasi itinerary.",
    description:
      "Informasi wisata Pink Beach Lombok untuk pantai timur, visual unik, day trip, dan pengalaman hidden gem yang berbeda dari destinasi utama lainnya.",
    publishedAt: "2026-05-20T09:50:00.000Z",
    content: buildWisataPinkBeachLombokContent(),
    faqs: [
      faq("Apa yang membuat Pink Beach Lombok berbeda?", "Pink Beach punya karakter visual yang unik dan memberi pengalaman trip pantai timur yang berbeda dari area wisata Lombok lainnya."),
      faq("Apakah Pink Beach cocok untuk day trip?", "Cocok, Pink Beach sering dipilih sebagai day trip untuk wisatawan yang ingin variasi itinerary dan pengalaman hidden gem."),
      faq("Siapa yang cocok ke Pink Beach Lombok?", "Cocok untuk wisatawan yang ingin eksplor sisi Lombok yang lebih berbeda, tenang, dan kuat secara visual."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/wisata/kuta-mandalika", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Pink Beach Lombok.",
    seoTitle: "Wisata Pink Beach Lombok untuk Trip Pantai Timur yang Berbeda",
    metaDescription:
      "Cari wisata Pink Beach Lombok? Simak panduan trip pantai timur, visual unik, dan pengalaman hidden gem yang berbeda.",
    keywords: ["wisata pink beach lombok", "pink beach lombok", "trip pink beach lombok", "pantai pink lombok"],
  },
  {
    _id: "article-rental-hiace-lombok",
    _type: "article",
    title: "Rental Hiace Lombok untuk Perjalanan Rombongan yang Nyaman",
    slug: { _type: "slug", current: "rental-hiace-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Rental Hiace Lombok cocok untuk rombongan keluarga, outing kantor, airport transfer grup, dan perjalanan wisata dengan peserta lebih banyak.",
    description:
      "Cari rental Hiace Lombok untuk rombongan? Simak kapan sebaiknya memilih Hiace, kebutuhan trip yang paling cocok, dan tips booking untuk group travel.",
    publishedAt: "2026-05-20T10:00:00.000Z",
    content: buildRentalHiaceLombokContent(),
    faqs: [
      faq("Berapa kapasitas Hiace untuk rombongan?", "Hiace cocok untuk rombongan dengan jumlah peserta yang lebih banyak dibanding mobil keluarga biasa, sehingga perjalanan terasa lebih lega dan praktis."),
      faq("Apakah cocok untuk trip beberapa hari?", "Sangat cocok, terutama untuk rombongan yang ingin tetap bersama dalam satu kendaraan selama perjalanan di Lombok."),
      faq("Apakah bisa jemput bandara?", "Bisa. Hiace sering dipilih untuk airport transfer grup karena memudahkan peserta dan bagasi berada dalam satu kendaraan."),
      faq("Apakah sudah termasuk driver?", "Umumnya layanan Hiace digunakan bersama driver agar perjalanan rombongan lebih nyaman dan rute lebih mudah diatur."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok"],
    ctaMessage: "Kirim jumlah peserta, tanggal, dan rencana trip Anda untuk cek ketersediaan Hiace yang paling sesuai.",
    seoTitle: "Rental Hiace Lombok untuk Rombongan, Family Trip & Antar Jemput",
    metaDescription:
      "Butuh rental Hiace Lombok untuk rombongan? Cocok untuk family trip, outing kantor, airport transfer, dan perjalanan wisata dengan kapasitas peserta lebih besar.",
    keywords: ["rental hiace lombok", "sewa hiace lombok", "hiace lombok", "hiace untuk rombongan lombok"],
  },
  {
    _id: "article-sewa-mobil-lombok-dengan-driver",
    _type: "article",
    title: "Sewa Mobil Lombok Dengan Driver untuk Liburan yang Lebih Nyaman",
    slug: { _type: "slug", current: "sewa-mobil-lombok-dengan-driver" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa mobil Lombok dengan driver untuk tamu yang ingin perjalanan lebih praktis, nyaman, dan efisien sejak tiba hingga selesai liburan.",
    description:
      "Cari tahu keuntungan sewa mobil Lombok dengan driver, jenis perjalanan yang paling cocok, pilihan armada, dan hal-hal yang memengaruhi biaya agar perjalanan terasa lebih mudah.",
    publishedAt: "2026-05-21T08:00:00.000Z",
    content: buildSewaMobilLombokDenganDriverContent(),
    faqs: [
      faq("Apakah tersedia sewa mobil Lombok dengan driver?", "Ya, layanan mobil dengan driver tersedia untuk berbagai kebutuhan seperti jemput bandara, perjalanan wisata harian, family trip, dan transfer ke area tujuan populer di Lombok."),
      faq("Berapa harga sewa mobil dengan driver di Lombok?", "Kisaran harga tergantung jenis armada, durasi pemakaian, area jemput, dan rute perjalanan. Penawaran paling akurat biasanya diberikan setelah kebutuhan perjalanan dijelaskan."),
      faq("Apakah bisa dipakai untuk jemput bandara?", "Bisa. Banyak tamu memakai layanan ini untuk jemput bandara agar perjalanan sejak hari pertama terasa lebih praktis dan nyaman."),
      faq("Mobil apa yang cocok untuk keluarga atau rombongan?", "Untuk pasangan atau keluarga kecil, mobil keluarga biasanya sudah cukup. Untuk rombongan yang membutuhkan ruang lebih lega, kendaraan seperti Hiace lebih cocok."),
      faq("Apakah driver bisa membantu itinerary harian?", "Ya, driver biasanya membantu perjalanan lebih efisien karena sudah memahami jalur umum dan ritme perjalanan ke destinasi populer di Lombok."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/blog/rental-hiace-lombok"],
    ctaMessage:
      "Kirim tanggal perjalanan, jumlah tamu, dan rute tujuan agar kami bantu rekomendasikan mobil dengan driver yang paling sesuai.",
    seoTitle: "Sewa Mobil Lombok Dengan Driver untuk Trip, Bandara, dan Wisata",
    metaDescription:
      "Cari layanan sewa mobil Lombok dengan driver untuk bandara, liburan keluarga, dan perjalanan harian. Pilih armada yang sesuai dan atur trip lebih praktis.",
    keywords: [
      "sewa mobil lombok dengan driver",
      "rental mobil lombok dengan supir",
      "sewa mobil lombok plus driver",
      "mobil dengan driver di lombok",
      "driver wisata lombok",
    ],
  },
  {
    _id: "article-harga-paket-wisata-lombok-3-hari-2-malam",
    _type: "article",
    title: "Harga Paket Wisata Lombok 3 Hari 2 Malam dan Gambaran Itinerary",
    slug: { _type: "slug", current: "harga-paket-wisata-lombok-3-hari-2-malam" },
    category: "Paket Wisata",
    excerpt:
      "Panduan harga paket wisata Lombok 3 hari 2 malam untuk tamu yang ingin memahami kisaran biaya, fasilitas, dan gambaran itinerary sebelum booking.",
    description:
      "Lihat gambaran harga paket wisata Lombok 3 hari 2 malam, faktor yang memengaruhi biaya, destinasi populer, fasilitas yang termasuk, dan tips memilih paket yang sesuai.",
    publishedAt: "2026-05-21T08:10:00.000Z",
    content: buildHargaPaketWisataLombok3Hari2MalamContent(),
    faqs: [
      faq("Berapa harga paket wisata Lombok 3 hari 2 malam?", "Kisaran harga tergantung jumlah peserta, pilihan hotel, transport, dan destinasi yang dimasukkan ke itinerary. Harga terbaik biasanya dihitung setelah kebutuhan perjalanan dijelaskan."),
      faq("Apa saja yang biasanya sudah termasuk dalam paket 3D2N?", "Umumnya paket sudah mencakup komponen dasar seperti hotel, transport, dan makan sesuai format trip yang dipilih. Detailnya bisa berbeda tergantung kebutuhan tamu."),
      faq("Destinasi apa yang umum masuk itinerary 3 hari 2 malam?", "Destinasi yang umum dipilih antara lain Gili Trawangan, Kuta Lombok, pantai, bukit, dan spot populer lain yang cocok untuk first timer."),
      faq("Apakah paket ini cocok untuk first timer?", "Ya, justru paket 3 hari 2 malam sering dipilih oleh tamu yang baru pertama kali ke Lombok karena perjalanannya lebih terarah dan efisien."),
      faq("Bisakah itinerary disesuaikan dengan kebutuhan tamu?", "Bisa. Itinerary biasanya dapat disesuaikan dengan jumlah peserta, gaya perjalanan, fokus destinasi, dan ritme liburan yang diinginkan."),
    ],
    relatedLinks: [
      "/paket-wisata-lombok",
      "/blog/paket-wisata-lombok-3-hari-2-malam",
      "/blog/itinerary-lombok-3-hari",
      "/wisata/gili-trawangan",
    ],
    ctaMessage:
      "Kirim tanggal trip dan jumlah peserta, lalu kami bantu hitungkan gambaran paket wisata Lombok 3 hari 2 malam yang paling sesuai.",
    seoTitle: "Harga Paket Wisata Lombok 3 Hari 2 Malam, Fasilitas dan Itinerary",
    metaDescription:
      "Lihat gambaran harga paket wisata Lombok 3 hari 2 malam, destinasi populer, fasilitas yang termasuk, dan tips memilih paket yang cocok untuk liburan Anda.",
    keywords: [
      "harga paket wisata lombok 3 hari 2 malam",
      "paket wisata lombok 3 hari 2 malam harga",
      "biaya tour lombok 3d2n",
      "paket tour lombok 3 hari 2 malam",
      "trip lombok 3 hari 2 malam",
    ],
  },
  {
    _id: "article-sewa-alphard-lombok",
    _type: "article",
    title: "Sewa Alphard Lombok untuk Trip Premium yang Lebih Nyaman",
    slug: { _type: "slug", current: "sewa-alphard-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa Alphard Lombok untuk tamu premium, honeymoon, dan perjalanan yang lebih eksklusif.",
    description:
      "Informasi sewa Alphard Lombok untuk tamu VIP, honeymoon, airport service premium, dan perjalanan yang mengutamakan kenyamanan.",
    publishedAt: "2026-05-20T10:10:00.000Z",
    content: buildSewaAlphardLombokContent(),
    faqs: [
      faq("Siapa yang paling cocok memilih sewa Alphard Lombok?", "Layanan ini cocok untuk tamu VIP, honeymoon, perjalanan bisnis, dan wisatawan yang ingin kenyamanan premium."),
      faq("Apakah Alphard cocok untuk airport service?", "Ya, Alphard sangat cocok untuk airport service premium dengan pengalaman jemput yang lebih eksklusif."),
      faq("Apakah sewa Alphard bisa untuk trip wisata juga?", "Bisa, Alphard dapat dipakai untuk private trip, city tour, hingga layanan VIP transfer."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/paket-honeymoon-lombok", "/blog/sewa-mobil-bandara-lombok"],
    ctaMessage: "Halo, saya ingin sewa Alphard Lombok.",
    seoTitle: "Sewa Alphard Lombok untuk Trip Premium yang Lebih Nyaman",
    metaDescription:
      "Cari sewa Alphard Lombok? Simak layanan premium untuk tamu VIP, honeymoon, airport service, dan perjalanan yang lebih eksklusif.",
    keywords: ["sewa alphard lombok", "rental alphard lombok", "alphard lombok", "alphard premium lombok"],
  },
  {
    _id: "article-paket-wisata-lombok-dari-bandung",
    _type: "article",
    title: "Paket Wisata Lombok dari Bandung untuk Trip yang Lebih Praktis",
    slug: { _type: "slug", current: "paket-wisata-lombok-dari-bandung" },
    category: "Paket Wisata",
    excerpt:
      "Panduan untuk wisatawan Bandung yang ingin paket wisata Lombok yang praktis dan mudah dikonsultasikan.",
    description:
      "Informasi paket wisata Lombok dari Bandung untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sebelum keberangkatan.",
    publishedAt: "2026-05-20T10:20:00.000Z",
    content: buildPaketWisataLombokDariBandungContent(),
    faqs: [
      faq("Kenapa paket wisata Lombok dari Bandung banyak dicari?", "Karena wisatawan dari Bandung biasanya ingin semua detail trip lebih jelas sejak sebelum keberangkatan."),
      faq("Durasi apa yang paling sering dipilih?", "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang untuk liburan ke Lombok."),
      faq("Apakah paket bisa disesuaikan untuk keluarga atau pasangan?", "Bisa, itinerary dapat diarahkan sesuai kebutuhan family trip, private trip, maupun honeymoon."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-3-hari-2-malam", "/paket-honeymoon-lombok"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok dari Bandung.",
    seoTitle: "Paket Wisata Lombok dari Bandung untuk Trip yang Lebih Praktis",
    metaDescription:
      "Cari paket wisata Lombok dari Bandung? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis.",
    keywords: ["paket wisata lombok dari bandung", "tour lombok dari bandung", "travel lombok dari bandung"],
  },
  {
    _id: "article-tour-lombok-dari-bali",
    _type: "article",
    title: "Tour Lombok dari Bali untuk Liburan yang Praktis dan Terarah",
    slug: { _type: "slug", current: "tour-lombok-dari-bali" },
    category: "Paket Wisata",
    excerpt:
      "Panduan tour Lombok dari Bali untuk wisatawan yang ingin itinerary praktis dan durasi trip yang realistis.",
    description:
      "Informasi tour Lombok dari Bali untuk wisatawan yang membutuhkan durasi trip realistis, alur perjalanan jelas, dan itinerary yang efisien.",
    publishedAt: "2026-05-20T10:30:00.000Z",
    content: buildTourLombokDariBaliContent(),
    faqs: [
      faq("Apakah tour Lombok dari Bali cocok untuk short escape?", "Cocok, selama durasi dan fokus trip disusun realistis sesuai waktu perjalanan dari Bali ke Lombok."),
      faq("Apa yang perlu dipastikan sejak awal?", "Pastikan alur transport, durasi trip, hotel, dan fokus destinasi sudah jelas sejak awal konsultasi."),
      faq("Destinasi apa yang paling sering dipilih?", "Biasanya wisatawan memilih kombinasi area selatan Lombok, sunset spot, atau paket singkat yang efisien."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-2-hari-1-malam", "/wisata/kuta-mandalika"],
    ctaMessage: "Halo, saya ingin tour Lombok dari Bali.",
    seoTitle: "Tour Lombok dari Bali untuk Liburan yang Praktis dan Terarah",
    metaDescription:
      "Cari tour Lombok dari Bali? Simak gambaran durasi, alur perjalanan, dan itinerary Lombok yang lebih efisien.",
    keywords: ["tour lombok dari bali", "paket wisata lombok dari bali", "trip lombok dari bali"],
  },
  {
    _id: "article-wisata-bukit-merese-lombok",
    _type: "article",
    title: "Wisata Bukit Merese Lombok untuk Sunset dan View Pantai Selatan",
    slug: { _type: "slug", current: "wisata-bukit-merese-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Bukit Merese Lombok untuk sunset, viewpoint, dan short escape pantai selatan.",
    description:
      "Informasi wisata Bukit Merese Lombok untuk sunset, viewpoint, pantai selatan, dan short escape yang mudah dikombinasikan.",
    publishedAt: "2026-05-20T10:40:00.000Z",
    content: buildWisataBukitMereseLombokContent(),
    faqs: [
      faq("Kenapa Bukit Merese populer untuk wisata Lombok?", "Karena view bukit dan sunset-nya sangat kuat serta mudah digabungkan dengan area Kuta Lombok dan pantai selatan."),
      faq("Apakah Bukit Merese cocok untuk first timer?", "Cocok, karena aksesnya relatif nyaman dan menjadi salah satu highlight visual paling mudah dinikmati di Lombok selatan."),
      faq("Apakah Bukit Merese cocok untuk short escape?", "Sangat cocok untuk short escape, pasangan, maupun itinerary satu hari di area selatan Lombok."),
    ],
    relatedLinks: ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Bukit Merese Lombok.",
    seoTitle: "Wisata Bukit Merese Lombok untuk Sunset dan View Pantai Selatan",
    metaDescription:
      "Cari wisata Bukit Merese Lombok? Simak panduan sunset, viewpoint, dan short escape terbaik di area pantai selatan.",
    keywords: ["wisata bukit merese lombok", "bukit merese", "sunset bukit merese", "viewpoint lombok selatan"],
  },
  {
    _id: "article-wisata-rinjani-lombok",
    _type: "article",
    title: "Wisata Rinjani Lombok untuk Trip Alam dan View Pegunungan Ikonik",
    slug: { _type: "slug", current: "wisata-rinjani-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Rinjani Lombok untuk view alam, pegunungan, dan eksplorasi sisi berbeda dari Lombok.",
    description:
      "Informasi wisata Rinjani Lombok untuk trip alam, view pegunungan, udara sejuk, dan pengalaman Lombok yang lebih adventure.",
    publishedAt: "2026-05-20T10:50:00.000Z",
    content: buildWisataRinjaniLombokContent(),
    faqs: [
      faq("Apakah wisata Rinjani Lombok hanya untuk trekking?", "Tidak selalu. Banyak wisatawan tertarik pada citra alam, suasana pegunungan, dan eksplorasi sisi Lombok yang lebih adventure tanpa harus trekking penuh."),
      faq("Kenapa Rinjani menarik untuk wisata Lombok?", "Karena Rinjani mewakili sisi alam dan pegunungan Lombok yang ikonik bagi wisatawan yang ingin pengalaman berbeda dari pantai dan Gili."),
      faq("Siapa yang cocok tertarik dengan wisata Rinjani?", "Cocok untuk wisatawan yang ingin variasi selain pantai dan tertarik pada alam, view pegunungan, atau trip yang lebih adventure."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/wisata/senggigi", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin trip wisata Rinjani Lombok.",
    seoTitle: "Wisata Rinjani Lombok untuk Trip Alam dan View Pegunungan Ikonik",
    metaDescription:
      "Cari wisata Rinjani Lombok? Simak panduan trip alam, view pegunungan, dan pengalaman Lombok yang lebih adventure.",
    keywords: ["wisata rinjani lombok", "rinjani lombok", "trip rinjani lombok", "wisata alam lombok"],
  },
  {
    _id: "article-sewa-fortuner-lombok",
    _type: "article",
    title: "Sewa Fortuner Lombok untuk Trip Premium yang Lebih Tangguh",
    slug: { _type: "slug", current: "sewa-fortuner-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa Fortuner Lombok untuk private trip, tamu premium, dan perjalanan yang nyaman.",
    description:
      "Informasi sewa Fortuner Lombok untuk private trip, perjalanan keluarga, tamu premium, dan mobilitas yang lebih nyaman di Lombok.",
    publishedAt: "2026-05-20T11:00:00.000Z",
    content: buildSewaFortunerLombokContent(),
    faqs: [
      faq("Kapan sewa Fortuner Lombok paling cocok dipilih?", "Fortuner cocok untuk private trip, keluarga, tamu premium, dan perjalanan yang membutuhkan kendaraan nyaman serta representatif."),
      faq("Apakah Fortuner cocok untuk wisata keluarga?", "Ya, Fortuner cocok untuk keluarga kecil yang ingin kendaraan nyaman dengan kabin lega selama trip di Lombok."),
      faq("Apakah Fortuner bisa dipakai untuk airport transfer?", "Bisa, Fortuner relevan untuk jemput bandara, perjalanan hotel, maupun city tour yang mengutamakan kenyamanan."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/paket-wisata-lombok", "/blog/sewa-mobil-lombok-plus-driver"],
    ctaMessage: "Halo, saya ingin sewa Fortuner Lombok.",
    seoTitle: "Sewa Fortuner Lombok untuk Trip Premium yang Lebih Tangguh",
    metaDescription:
      "Cari sewa Fortuner Lombok? Simak panduan kendaraan premium untuk private trip, keluarga, dan perjalanan yang lebih nyaman di Lombok.",
    keywords: ["sewa fortuner lombok", "rental fortuner lombok", "fortuner lombok", "mobil premium lombok"],
  },
  {
    _id: "article-sewa-avanza-lombok",
    _type: "article",
    title: "Sewa Avanza Lombok untuk Liburan Praktis dan Nyaman",
    slug: { _type: "slug", current: "sewa-avanza-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa Avanza Lombok untuk liburan praktis, city tour, dan kebutuhan transport yang fleksibel.",
    description:
      "Informasi sewa Avanza Lombok untuk city tour, jemput bandara, keluarga kecil, dan perjalanan wisata yang praktis.",
    publishedAt: "2026-05-20T11:10:00.000Z",
    content: buildSewaAvanzaLombokContent(),
    faqs: [
      faq("Siapa yang paling cocok memilih sewa Avanza Lombok?", "Avanza cocok untuk pasangan, keluarga kecil, city tour, dan tamu yang ingin kendaraan praktis selama liburan di Lombok."),
      faq("Apakah Avanza cocok untuk jemput bandara?", "Ya, Avanza sangat cocok untuk jemput bandara, hotel transfer, dan perjalanan harian yang santai."),
      faq("Kenapa Avanza sering dipilih wisatawan?", "Karena nyaman, praktis, fleksibel, dan cocok untuk banyak kebutuhan perjalanan selama liburan di Lombok."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin sewa Avanza Lombok.",
    seoTitle: "Sewa Avanza Lombok untuk Liburan Praktis dan Nyaman",
    metaDescription:
      "Cari sewa Avanza Lombok? Simak panduan kendaraan praktis untuk city tour, jemput bandara, dan liburan keluarga kecil.",
    keywords: ["sewa avanza lombok", "rental avanza lombok", "avanza lombok", "mobil keluarga lombok"],
  },
  {
    _id: "article-paket-tour-lombok-murah",
    _type: "article",
    title: "Paket Tour Lombok Murah yang Tetap Nyaman untuk Liburan",
    slug: { _type: "slug", current: "paket-tour-lombok-murah" },
    category: "Paket Wisata",
    excerpt:
      "Panduan memilih paket tour Lombok murah yang tetap nyaman, rapi, dan realistis untuk liburan.",
    description:
      "Informasi paket tour Lombok murah untuk wisatawan yang mencari value terbaik dengan itinerary tetap nyaman dan realistis.",
    publishedAt: "2026-05-20T11:20:00.000Z",
    content: buildPaketTourLombokMurahContent(),
    faqs: [
      faq("Apakah paket tour Lombok murah tetap bisa nyaman?", "Bisa, selama itinerary disusun realistis dan fasilitas utama seperti transport, hotel, serta alur perjalanan tetap diperhatikan."),
      faq("Apa yang paling penting saat memilih paket murah?", "Utamakan value perjalanan, ritme trip yang nyaman, dan detail fasilitas yang jelas sejak awal."),
      faq("Siapa yang cocok memilih paket tour murah?", "Cocok untuk first timer, pasangan, keluarga, atau grup kecil yang ingin liburan lebih hemat namun tetap rapi."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-murah", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin tanya paket tour Lombok murah.",
    seoTitle: "Paket Tour Lombok Murah yang Tetap Nyaman untuk Liburan",
    metaDescription:
      "Cari paket tour Lombok murah? Simak tips memilih paket yang tetap nyaman, itinerary realistis, dan value terbaik untuk liburan.",
    keywords: ["paket tour lombok murah", "tour lombok murah", "paket wisata murah lombok", "liburan murah lombok"],
  },
  {
    _id: "article-open-trip-lombok",
    _type: "article",
    title: "Open Trip Lombok untuk Liburan Praktis dan Lebih Hemat",
    slug: { _type: "slug", current: "open-trip-lombok" },
    category: "Paket Wisata",
    excerpt:
      "Panduan open trip Lombok untuk tamu yang ingin liburan lebih hemat dan praktis.",
    description:
      "Informasi open trip Lombok untuk solo traveler, pasangan, atau tamu yang ingin sharing trip dengan biaya lebih hemat.",
    publishedAt: "2026-05-20T11:30:00.000Z",
    content: buildOpenTripLombokContent(),
    faqs: [
      faq("Siapa yang cocok ikut open trip Lombok?", "Open trip cocok untuk solo traveler, pasangan, atau tamu yang ingin liburan hemat tanpa membawa rombongan sendiri."),
      faq("Apa kelebihan open trip dibanding private trip?", "Kelebihannya ada pada efisiensi biaya dan itinerary yang sudah disusun praktis untuk tujuan populer."),
      faq("Apakah open trip tetap nyaman untuk first timer?", "Ya, open trip tetap nyaman untuk first timer selama ritme perjalanan sesuai dan kebutuhan utama sudah dijelaskan sejak awal."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/trip-gili-trawangan", "/wisata/kuta-mandalika"],
    ctaMessage: "Halo, saya ingin ikut open trip Lombok.",
    seoTitle: "Open Trip Lombok untuk Liburan Praktis dan Lebih Hemat",
    metaDescription:
      "Cari open trip Lombok? Simak panduan sharing trip yang lebih hemat, praktis, dan cocok untuk solo traveler maupun pasangan.",
    keywords: ["open trip lombok", "trip sharing lombok", "open trip wisata lombok", "open trip gili lombok"],
  },
  {
    _id: "article-wisata-desa-sade-lombok",
    _type: "article",
    title: "Wisata Desa Sade Lombok untuk Pengalaman Budaya Sasak",
    slug: { _type: "slug", current: "wisata-desa-sade-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Desa Sade Lombok untuk pengalaman budaya Sasak yang mudah masuk itinerary.",
    description:
      "Informasi wisata Desa Sade Lombok untuk pengalaman budaya Sasak, suasana kampung tradisional, dan kombinasi trip area selatan.",
    publishedAt: "2026-05-20T11:40:00.000Z",
    content: buildWisataDesaSadeLombokContent(),
    faqs: [
      faq("Kenapa Desa Sade menarik untuk wisatawan?", "Karena Desa Sade memberi pengalaman budaya lokal Sasak yang berbeda dari pantai, bukit, dan Gili."),
      faq("Apakah Desa Sade mudah digabungkan dengan itinerary lain?", "Ya, Desa Sade mudah dikombinasikan dengan Kuta Lombok dan destinasi area selatan lainnya."),
      faq("Siapa yang cocok mengunjungi Desa Sade?", "Cocok untuk wisatawan yang ingin perjalanan lebih lengkap dengan sentuhan budaya lokal selama di Lombok."),
    ],
    relatedLinks: ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Desa Sade Lombok.",
    seoTitle: "Wisata Desa Sade Lombok untuk Pengalaman Budaya Sasak",
    metaDescription:
      "Cari wisata Desa Sade Lombok? Simak panduan trip budaya Sasak dan kombinasi itinerary yang cocok di area selatan Lombok.",
    keywords: ["wisata desa sade lombok", "desa sade lombok", "budaya sasak lombok", "trip desa sade"],
  },
  {
    _id: "article-wisata-tanjung-aan-lombok",
    _type: "article",
    title: "Wisata Tanjung Aan Lombok untuk Pantai Cantik dan Short Escape",
    slug: { _type: "slug", current: "wisata-tanjung-aan-lombok" },
    category: "Wisata Lombok",
    excerpt:
      "Panduan wisata Tanjung Aan Lombok untuk pantai cantik, short escape, dan itinerary area selatan.",
    description:
      "Informasi wisata Tanjung Aan Lombok untuk pantai selatan, short escape santai, dan itinerary Kuta Lombok yang lebih lengkap.",
    publishedAt: "2026-05-20T11:50:00.000Z",
    content: buildWisataTanjungAanLombokContent(),
    faqs: [
      faq("Kenapa Tanjung Aan populer untuk wisata Lombok?", "Karena pantainya cantik, suasananya nyaman, dan cocok untuk short escape di area selatan Lombok."),
      faq("Apakah Tanjung Aan cocok untuk first timer?", "Cocok, terutama untuk tamu yang ingin menikmati pantai selatan dengan akses yang relatif mudah."),
      faq("Destinasi apa yang sering digabungkan dengan Tanjung Aan?", "Biasanya Tanjung Aan digabungkan dengan Bukit Merese dan area Kuta Lombok dalam satu itinerary."),
    ],
    relatedLinks: ["/wisata/kuta-mandalika", "/blog/wisata-bukit-merese-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin trip ke Tanjung Aan Lombok.",
    seoTitle: "Wisata Tanjung Aan Lombok untuk Pantai Cantik dan Short Escape",
    metaDescription:
      "Cari wisata Tanjung Aan Lombok? Simak panduan pantai cantik, short escape santai, dan itinerary terbaik di area selatan.",
    keywords: ["wisata tanjung aan lombok", "tanjung aan lombok", "pantai tanjung aan", "trip tanjung aan"],
  },
];

const testimonialDocs = [
  {
    _id: "testimonial-andi-rina",
    _type: "testimonial",
    customerName: "Andi & Rina",
    location: "Jakarta",
    tripType: "Honeymoon",
    quote:
      "Respon admin cepat, itinerary rapi, dan momen honeymoon kami terasa lebih personal karena semua detailnya dipersiapkan dengan baik.",
    rating: 5,
    featured: true,
  },
  {
    _id: "testimonial-keluarga-bima",
    _type: "testimonial",
    customerName: "Keluarga Bima",
    location: "Surabaya",
    tripType: "Family Trip",
    quote:
      "Trip keluarga jadi ringan karena driver paham spot yang cocok untuk anak-anak dan orang tua. Koordinasinya juga sangat mudah.",
    rating: 5,
    featured: true,
  },
  {
    _id: "testimonial-rombongan-sagara",
    _type: "testimonial",
    customerName: "Rombongan Sagara",
    location: "Bandung",
    tripType: "Corporate Trip",
    quote:
      "Untuk group trip kantor, komunikasi mereka rapi dan eksekusinya di lapangan sangat membantu. Kami jadi lebih yakin sejak awal karena informasinya jelas dan responsnya cepat.",
    rating: 5,
    featured: true,
  },
];

const baseDocs = [...packageDocs, ...destinationDocs, ...articleDocs, ...testimonialDocs];

async function run() {
  const docs = [];

  for (const doc of baseDocs) {
    docs.push(await enrichDocWithMedia(doc));
  }

  let transaction = client.transaction();

  for (const doc of docs) {
    transaction = transaction.createOrReplace(doc);
  }

  await transaction.commit();

  console.log(`Seed Sanity berhasil: ${docs.length} dokumen di dataset "${dataset}".`);
  console.log("- Packages:", packageDocs.length);
  console.log("- Destinations:", destinationDocs.length);
  console.log("- Articles:", articleDocs.length);
  console.log("- Testimonials:", testimonialDocs.length);
}

run().catch((error) => {
  console.error("Seed Sanity gagal dijalankan.");
  console.error(error);
  process.exit(1);
});

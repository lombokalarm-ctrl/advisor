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

function normalBlock(text, key) {
  return createTextBlock(text, { key, style: "normal" });
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
  const filename = `${cacheKey}.svg`;
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`, {
    filename,
  });

  if (existing?._id) {
    assetCache.set(cacheKey, existing);
    return existing;
  }

  const svg = createSeedSvg({
    title,
    subtitle,
    accent: visual.accent,
    background: visual.background,
    detail: visual.detail,
    variant,
  });
  let asset;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      asset = await client.assets.upload("image", Buffer.from(svg), {
        filename,
        contentType: "image/svg+xml",
      });
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
    quoteBlock(
      "Jika Anda mencari paket wisata Lombok yang fleksibel, nyaman, dan mudah dikonsultasikan, tim LombokAdvisor siap membantu dari tahap perencanaan sampai trip berjalan.",
      "paket-closing-quote",
    ),
  );

  return blocks;
}

function buildPaketHoneymoonLombokContent(detailImageId) {
  const blocks = [
    headingBlock("Paket honeymoon Lombok untuk perjalanan yang lebih personal dan romantis", "h2", "honeymoon-overview"),
    normalBlock(
      "Paket honeymoon Lombok dirancang untuk pasangan yang ingin menikmati liburan romantis dengan itinerary yang lebih santai, private, dan nyaman. Perjalanan dapat disusun untuk menikmati pantai, sunset, suasana island escape, makan malam romantis, hingga waktu berdua yang lebih berkualitas tanpa ritme trip yang terlalu padat.",
      "honeymoon-overview-body-1",
    ),
    normalBlock(
      "Paket ini cocok untuk pasangan dari Jakarta, Surabaya, dan kota besar lain di Indonesia, maupun tamu dari Malaysia, Singapura, Australia, dan Eropa yang ingin honeymoon praktis dengan kombinasi hotel, transport, makan, dan destinasi terbaik di Lombok.",
      "honeymoon-overview-body-2",
    ),
    headingBlock("Kenapa memilih paket honeymoon Lombok kami", "h2", "honeymoon-why"),
    bulletBlock("Itinerary dibuat lebih private, santai, dan fokus pada pengalaman pasangan.", "honeymoon-why-1"),
    bulletBlock("Bisa termasuk hotel atau villa pilihan untuk suasana yang lebih romantis.", "honeymoon-why-2"),
    bulletBlock("Dapat ditambah candle light dinner, sunset experience, atau private trip ke Gili.", "honeymoon-why-3"),
    bulletBlock("Cocok untuk first timer yang ingin perjalanan lebih praktis dan nyaman.", "honeymoon-why-4"),
    bulletBlock("Bisa disesuaikan dengan budget, durasi, dan gaya honeymoon yang diinginkan.", "honeymoon-why-5"),
    headingBlock("Pilihan durasi paket honeymoon", "h2", "honeymoon-duration"),
    headingBlock("2 Hari 1 Malam", "h3", "honeymoon-duration-1"),
    normalBlock(
      "Pilihan ini cocok untuk pasangan yang ingin short romantic escape dengan fokus ke hotel, dinner, dan beberapa spot sunset terbaik di Lombok.",
      "honeymoon-duration-1-body",
    ),
    headingBlock("3 Hari 2 Malam", "h3", "honeymoon-duration-2"),
    normalBlock(
      "Durasi paling populer untuk honeymoon karena cukup untuk menikmati suasana pantai, island experience, dinner romantis, dan waktu berdua yang lebih santai.",
      "honeymoon-duration-2-body",
    ),
    headingBlock("4 Hari 3 Malam", "h3", "honeymoon-duration-3"),
    normalBlock(
      "Direkomendasikan untuk pasangan yang ingin pengalaman lebih lengkap dengan ritme liburan yang tidak terburu-buru serta pilihan destinasi yang lebih beragam.",
      "honeymoon-duration-3-body",
    ),
    headingBlock("Destinasi romantis yang bisa masuk itinerary", "h2", "honeymoon-destinasi"),
    bulletBlock("Gili Trawangan untuk island vibes, sunset, dan private couple experience.", "honeymoon-destinasi-1"),
    bulletBlock("Kuta Lombok dan area selatan untuk pantai cantik, resort area, dan sunset spot.", "honeymoon-destinasi-2"),
    bulletBlock("Bukit sunset dan viewpoint untuk momen foto dan suasana romantis.", "honeymoon-destinasi-3"),
    bulletBlock("Pantai-pantai sepi dan area premium untuk quality time yang lebih intim.", "honeymoon-destinasi-4"),
    headingBlock("Fasilitas yang dapat disesuaikan", "h2", "honeymoon-fasilitas"),
    bulletBlock("Hotel atau villa pilihan sesuai budget dan preferensi pasangan.", "honeymoon-fasilitas-1"),
    bulletBlock("Transportasi dan driver selama perjalanan.", "honeymoon-fasilitas-2"),
    bulletBlock("Makan sesuai program paket dan kebutuhan perjalanan.", "honeymoon-fasilitas-3"),
    bulletBlock("Opsional candle light dinner, dekorasi, atau private trip experience.", "honeymoon-fasilitas-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual honeymoon Lombok", "honeymoon-detail-image"));
  }

  blocks.push(
    headingBlock("Harga paket honeymoon Lombok", "h2", "honeymoon-price"),
    normalBlock(
      "Harga paket honeymoon Lombok dapat menyesuaikan dengan pilihan hotel atau villa, durasi perjalanan, jumlah destinasi, dan tambahan experience romantis yang diinginkan. Konsultasi awal akan membantu pasangan mendapatkan paket yang lebih pas dengan budget dan suasana honeymoon yang dicari.",
      "honeymoon-price-body",
    ),
    headingBlock("Cara booking paket honeymoon", "h2", "honeymoon-booking"),
    normalBlock(
      "Kirim tanggal perjalanan, kota asal, jumlah malam, dan gambaran honeymoon yang diinginkan melalui WhatsApp. Tim LombokAdvisor akan membantu menyiapkan rekomendasi itinerary honeymoon yang lebih personal.",
      "honeymoon-booking-body",
    ),
    quoteBlock(
      "Paket honeymoon Lombok ini dibuat untuk pasangan yang ingin perjalanan romantis, lebih tenang, dan tetap mudah dikonsultasikan sejak awal.",
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
    headingBlock("Apa yang memengaruhi harga sewa mobil Lombok", "h2", "carprice-overview"),
    normalBlock(
      "Harga sewa mobil Lombok tidak selalu sama karena dipengaruhi oleh beberapa faktor seperti jenis armada, durasi penggunaan, area penjemputan, dan apakah layanan dipakai untuk transfer singkat, city tour, atau perjalanan beberapa hari. Karena itu, penting bagi calon tamu untuk memahami struktur kebutuhannya terlebih dahulu sebelum membandingkan harga.",
      "carprice-overview-body-1",
    ),
    normalBlock(
      "Untuk wisatawan yang datang ke Lombok, pilihan transport yang tepat bisa membantu perjalanan menjadi jauh lebih efisien. Artikel ini membantu Anda memahami kenapa harga rental mobil bisa berbeda dan bagaimana memilih armada yang sesuai tanpa hanya fokus pada tarif termurah.",
      "carprice-overview-body-2",
    ),
    headingBlock("Faktor penentu harga", "h2", "carprice-factors"),
    bulletBlock("Jenis mobil atau armada yang dipakai.", "carprice-factor-1"),
    bulletBlock("Durasi penggunaan harian, full day, atau multi day.", "carprice-factor-2"),
    bulletBlock("Area jemput seperti bandara, hotel, atau titik tertentu.", "carprice-factor-3"),
    bulletBlock("Kebutuhan city tour, transfer, atau perjalanan lintas area wisata.", "carprice-factor-4"),
    bulletBlock("Apakah layanan membutuhkan driver dan pengaturan itinerary khusus.", "carprice-factor-5"),
    headingBlock("Tips memilih armada", "h2", "carprice-tips"),
    bulletBlock("Gunakan city car atau MPV untuk perjalanan pasangan dan keluarga kecil.", "carprice-tip-1"),
    bulletBlock("Pilih armada yang lebih besar untuk rombongan agar tetap nyaman selama perjalanan.", "carprice-tip-2"),
    bulletBlock("Pertimbangkan rute wisata dan jumlah barang bawaan sebelum memilih kendaraan.", "carprice-tip-3"),
    bulletBlock("Jangan hanya fokus pada harga, tetapi juga kenyamanan, driver, dan fleksibilitas layanan.", "carprice-tip-4"),
    headingBlock("Kapan sewa mobil lebih cocok daripada ikut tour", "h2", "carprice-comparison"),
    normalBlock(
      "Sewa mobil lebih cocok untuk wisatawan yang ingin itinerary fleksibel, punya daftar destinasi sendiri, atau ingin bergerak lebih bebas bersama pasangan, keluarga, atau rombongan kecil. Untuk tamu yang butuh struktur trip lebih lengkap, sewa mobil juga bisa dikombinasikan dengan paket wisata Lombok.",
      "carprice-comparison-body",
    ),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual harga sewa mobil Lombok", "carprice-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Harga sewa mobil Lombok yang tepat bukan sekadar yang murah, tetapi yang paling sesuai dengan rute, jumlah peserta, dan kenyamanan perjalanan Anda.",
      "carprice-closing-quote",
    ),
  );

  return blocks;
}

function buildItineraryLombok3HariContent(detailImageId) {
  const blocks = [
    headingBlock("Gambaran itinerary Lombok 3 hari 2 malam untuk first timer", "h2", "itinerary-overview"),
    normalBlock(
      "Itinerary Lombok 3 hari 2 malam adalah salah satu durasi paling ideal untuk first timer karena cukup untuk menikmati beberapa area utama tanpa membuat perjalanan terasa terlalu padat. Kuncinya adalah memilih kombinasi destinasi yang realistis berdasarkan area, bukan sekadar memasukkan terlalu banyak tempat wisata ke dalam satu rute.",
      "itinerary-overview-body-1",
    ),
    normalBlock(
      "Dengan 3 hari 2 malam, wisatawan biasanya bisa menggabungkan pantai selatan, sunset spot, area menginap strategis, dan satu highlight utama seperti Gili Trawangan atau kombinasi destinasi daratan yang lebih santai. Artikel ini memberi gambaran rute yang efisien dan aman untuk pemula.",
      "itinerary-overview-body-2",
    ),
    headingBlock("Hari 1: Tiba dan eksplor area selatan", "h2", "itinerary-day-1"),
    normalBlock(
      "Hari pertama biasanya paling cocok diarahkan ke area yang mudah dijangkau dari bandara seperti Kuta Lombok dan spot sunset di sekitarnya. Pola ini membantu wisatawan langsung menikmati suasana Lombok tanpa perjalanan darat yang terlalu berat setelah tiba.",
      "itinerary-day-1-body",
    ),
    headingBlock("Hari 2: Highlight trip utama", "h2", "itinerary-day-2"),
    normalBlock(
      "Hari kedua biasanya dipakai untuk highlight utama sesuai preferensi trip, misalnya Gili Trawangan untuk pengalaman laut atau kombinasi beberapa pantai dan viewpoint jika ingin fokus di daratan. Ini adalah hari terpenting dalam itinerary sehingga rutenya harus paling efisien.",
      "itinerary-day-2-body",
    ),
    headingBlock("Hari 3: Penutup yang ringan", "h2", "itinerary-day-3"),
    normalBlock(
      "Hari terakhir sebaiknya tidak terlalu padat. Fokuskan pada destinasi yang dekat dengan titik kembali atau area menginap agar perjalanan tetap nyaman sebelum pulang atau menuju bandara.",
      "itinerary-day-3-body",
    ),
    headingBlock("Tips agar itinerary 3D2N tetap nyaman", "h2", "itinerary-tips"),
    bulletBlock("Jangan mencampur terlalu banyak area dalam satu hari.", "itinerary-tip-1"),
    bulletBlock("Tentukan sejak awal apakah ingin fokus ke Gili, pantai selatan, atau kombinasi ringan.", "itinerary-tip-2"),
    bulletBlock("Pilih area menginap yang mendukung rute utama perjalanan.", "itinerary-tip-3"),
    bulletBlock("Gunakan paket wisata atau transport dengan driver agar waktu lebih efisien.", "itinerary-tip-4"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual itinerary Lombok 3 hari", "itinerary-detail-image"));
  }

  blocks.push(
    quoteBlock(
      "Itinerary Lombok 3 hari 2 malam yang baik bukan yang paling penuh, tetapi yang paling realistis, nyaman, dan tetap memberi pengalaman terbaik untuk first timer.",
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
    headingBlock("Sewa mobil Lombok plus driver untuk trip yang lebih praktis", "h2", "driver-rental-overview"),
    normalBlock(
      "Sewa mobil Lombok plus driver menjadi pilihan populer untuk wisatawan yang ingin transport yang fleksibel tanpa harus menyetir sendiri. Layanan ini cocok untuk jemput bandara, city tour, perjalanan antardestinasi, hingga pemakaian beberapa hari selama liburan.",
      "driver-rental-overview-body-1",
    ),
    normalBlock(
      "Dengan driver lokal yang memahami rute dan kondisi area wisata, tamu bisa menikmati perjalanan dengan lebih santai. Hal ini sangat membantu untuk first timer, keluarga, pasangan, maupun wisatawan luar kota yang ingin pengalaman yang praktis.",
      "driver-rental-overview-body-2",
    ),
    headingBlock("Keunggulan sewa mobil plus driver", "h2", "driver-rental-benefits"),
    bulletBlock("Tidak perlu repot menyetir dan mencari rute sendiri.", "driver-rental-benefit-1"),
    bulletBlock("Cocok untuk transfer bandara, city tour, dan trip wisata harian.", "driver-rental-benefit-2"),
    bulletBlock("Driver lokal memahami ritme perjalanan dan area wisata populer.", "driver-rental-benefit-3"),
    headingBlock("Siapa yang paling cocok memilih layanan ini", "h2", "driver-rental-fit"),
    bulletBlock("First timer yang belum familiar dengan rute Lombok.", "driver-rental-fit-1"),
    bulletBlock("Keluarga dan pasangan yang ingin perjalanan lebih santai.", "driver-rental-fit-2"),
    bulletBlock("Tamu dari luar kota atau luar negeri yang ingin konsultasi transport lebih mudah.", "driver-rental-fit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil Lombok plus driver", "driver-rental-image"));
  }

  blocks.push(
    quoteBlock(
      "Sewa mobil Lombok plus driver adalah solusi praktis untuk wisatawan yang ingin fokus menikmati trip tanpa repot mengatur detail perjalanan sendiri.",
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
    headingBlock("Sewa mobil bandara Lombok untuk jemput dan trip yang lebih praktis", "h2", "airport-rental-overview"),
    normalBlock(
      "Sewa mobil bandara Lombok banyak dicari wisatawan yang ingin langsung dijemput setibanya di bandara tanpa repot mencari transport lanjutan. Layanan ini cocok untuk transfer hotel, perjalanan ke area Mandalika, Senggigi, atau langsung memulai itinerary wisata.",
      "airport-rental-overview-body-1",
    ),
    normalBlock(
      "Bagi keluarga, pasangan, dan wisatawan luar kota, layanan jemput bandara dengan driver sangat membantu karena perjalanan jadi lebih nyaman sejak hari pertama. Tamu bisa langsung fokus ke tujuan tanpa repot mengatur perpindahan awal.",
      "airport-rental-overview-body-2",
    ),
    headingBlock("Kapan layanan ini paling dibutuhkan", "h2", "airport-rental-fit"),
    bulletBlock("Saat ingin dijemput langsung dari bandara menuju hotel.", "airport-rental-fit-1"),
    bulletBlock("Saat ingin lanjut langsung ke area wisata seperti Kuta Lombok atau Senggigi.", "airport-rental-fit-2"),
    bulletBlock("Saat membawa keluarga atau barang yang lebih banyak selama perjalanan.", "airport-rental-fit-3"),
    headingBlock("Keunggulan sewa mobil dari bandara", "h2", "airport-rental-benefits"),
    bulletBlock("Lebih praktis untuk first timer dan wisatawan dari luar kota.", "airport-rental-benefit-1"),
    bulletBlock("Bisa disesuaikan untuk transfer singkat maupun lanjut itinerary wisata.", "airport-rental-benefit-2"),
    bulletBlock("Driver siap membantu ritme perjalanan lebih efisien sejak awal kedatangan.", "airport-rental-benefit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual sewa mobil bandara Lombok", "airport-rental-image"));
  }

  blocks.push(
    quoteBlock(
      "Sewa mobil bandara Lombok adalah pilihan paling praktis untuk tamu yang ingin perjalanan rapi sejak mendarat hingga masuk itinerary wisata.",
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
    headingBlock("Rental Hiace Lombok untuk rombongan dan perjalanan yang nyaman", "h2", "hiace-overview"),
    normalBlock(
      "Rental Hiace Lombok banyak dicari untuk rombongan keluarga, group trip, outing kantor, dan wisatawan yang membutuhkan kapasitas kendaraan lebih besar selama perjalanan. Armada ini cocok untuk airport transfer, city tour, dan trip beberapa hari di Lombok.",
      "hiace-overview-body-1",
    ),
    normalBlock(
      "Dengan kabin yang lebih lega dan kapasitas yang sesuai untuk grup, Hiace membantu perjalanan tetap efisien tanpa perlu memecah rombongan ke beberapa kendaraan. Hal ini sangat penting untuk ritme trip yang rapi dan nyaman.",
      "hiace-overview-body-2",
    ),
    headingBlock("Kapan rental Hiace paling dibutuhkan", "h2", "hiace-fit"),
    bulletBlock("Untuk rombongan keluarga atau group trip dengan peserta lebih banyak.", "hiace-fit-1"),
    bulletBlock("Untuk airport transfer grup agar perjalanan lebih praktis sejak awal.", "hiace-fit-2"),
    bulletBlock("Untuk trip wisata beberapa hari yang membutuhkan kendaraan lebih lega.", "hiace-fit-3"),
    headingBlock("Keunggulan Hiace untuk wisata Lombok", "h2", "hiace-benefits"),
    bulletBlock("Kapasitas lebih besar dan nyaman untuk perjalanan grup.", "hiace-benefit-1"),
    bulletBlock("Cocok untuk city tour, transfer, dan multi day trip.", "hiace-benefit-2"),
    bulletBlock("Memudahkan koordinasi rombongan agar tetap bersama sepanjang perjalanan.", "hiace-benefit-3"),
  ];

  if (detailImageId) {
    blocks.push(imageBlock(detailImageId, "Visual rental Hiace Lombok", "hiace-image"));
  }

  blocks.push(
    quoteBlock(
      "Rental Hiace Lombok paling cocok untuk tamu yang ingin perjalanan rombongan tetap nyaman, efisien, dan tidak terpecah ke banyak kendaraan.",
      "hiace-quote",
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
    category: "tour-package",
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
        "Apakah wisatawan luar negeri bisa booking juga?",
        "Bisa. Paket ini juga cocok untuk tamu dari Malaysia, Singapura, Australia, Eropa, dan negara lainnya yang ingin perjalanan lebih praktis di Lombok.",
      ),
      faq(
        "Bagaimana cara booking paket wisata Lombok?",
        "Cukup hubungi kami melalui WhatsApp lalu kirim tanggal perjalanan, jumlah peserta, dan gambaran trip yang Anda inginkan.",
      ),
    ],
    ctaMessage: "Halo, saya ingin konsultasi paket wisata Lombok mulai dari one day tour sampai 4D3N.",
    seoTitle: "Paket Wisata Lombok Mulai Rp1 Juta per Orang | One Day Tour, 2D1N, 3D2N, 4D3N",
    metaDescription:
      "Temukan paket wisata Lombok mulai Rp1 juta per orang untuk one day tour, 2D1N, 3D2N, hingga 4D3N. Bisa termasuk hotel, transport, makan, dan itinerary fleksibel.",
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
    duration: "2D1N hingga 4D3N",
    summary:
      "Paket honeymoon Lombok untuk pasangan yang ingin perjalanan romantis, private, dan fleksibel dengan pilihan hotel atau villa, sunset dinner, serta itinerary yang bisa disesuaikan.",
    highlights: [
      "Cocok untuk pasangan yang ingin honeymoon lebih private dan santai",
      "Bisa termasuk hotel atau villa, transport, dan makan sesuai kebutuhan",
      "Dapat diarahkan ke Gili Trawangan, Kuta Lombok, sunset spot, dan pengalaman romantis lainnya",
    ],
    heroNote:
      "Paket honeymoon ini cocok untuk pasangan dari Indonesia maupun luar negeri yang ingin liburan romantis di Lombok dengan itinerary yang lebih personal dan tidak terlalu padat.",
    content: buildPaketHoneymoonLombokContent(),
    faqs: [
      faq(
        "Apakah paket honeymoon bisa ditambah candle light dinner?",
        "Bisa. Paket honeymoon Lombok dapat ditambah candle light dinner, dekorasi, atau experience romantis lain sesuai kebutuhan pasangan.",
      ),
      faq(
        "Apakah cocok untuk pasangan baru pertama kali ke Lombok?",
        "Sangat cocok karena itinerary dapat difokuskan ke destinasi yang romantis, aman, dan lebih nyaman untuk pasangan first timer.",
      ),
      faq(
        "Apakah bisa termasuk hotel atau villa?",
        "Bisa. Paket dapat disesuaikan dengan hotel atau villa pilihan sesuai budget dan suasana honeymoon yang diinginkan.",
      ),
      faq(
        "Apakah paket ini bisa diarahkan ke Gili Trawangan?",
        "Bisa. Gili Trawangan termasuk salah satu destinasi favorit untuk honeymoon dan dapat dimasukkan ke itinerary.",
      ),
    ],
    ctaMessage: "Halo, saya ingin paket honeymoon Lombok.",
    seoTitle: "Paket Honeymoon Lombok | Liburan Romantis, Private Trip, dan Villa Pilihan",
    metaDescription:
      "Temukan paket honeymoon Lombok untuk pasangan dengan opsi villa, sunset dinner, itinerary romantis, dan private trip yang lebih nyaman.",
    keywords: ["paket honeymoon lombok", "bulan madu lombok", "honeymoon lombok", "honeymoon gili trawangan"],
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
    ],
    ctaMessage: "Halo, saya ingin sewa mobil di Lombok dengan driver.",
    seoTitle: "Sewa Mobil Lombok | Rental Mobil dengan Driver, Jemput Bandara, dan City Tour",
    metaDescription:
      "Cari sewa mobil Lombok? Tersedia rental mobil dengan driver untuk jemput bandara, city tour, full day trip, dan perjalanan multi day.",
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
      "Panduan ringkas membandingkan city car, MPV, hingga Hiace untuk kebutuhan trip yang berbeda di Lombok.",
    description:
      "Informasi harga sewa mobil Lombok, faktor yang memengaruhi tarif, tips memilih armada, dan cara menentukan layanan transport yang paling sesuai untuk trip Anda.",
    publishedAt: "2026-05-19T06:10:00.000Z",
    content: buildHargaSewaMobilLombokContent(),
    faqs: [
      faq(
        "Kenapa harga sewa mobil bisa berbeda?",
        "Harga bisa berbeda tergantung jenis armada, durasi, area penjemputan, dan apakah termasuk driver atau tidak.",
      ),
      faq(
        "Apakah sewa mobil lebih cocok daripada ikut tour?",
        "Untuk tamu yang ingin fleksibel dan punya itinerary sendiri, sewa mobil biasanya lebih cocok.",
      ),
      faq(
        "Kapan sebaiknya memilih armada yang lebih besar?",
        "Armada yang lebih besar cocok untuk rombongan, perjalanan keluarga besar, atau tamu yang membawa lebih banyak barang selama trip.",
      ),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin tanya harga sewa mobil Lombok.",
    seoTitle: "Harga Sewa Mobil Lombok | Tips Memilih Armada dan Driver",
    metaDescription:
      "Informasi harga sewa mobil Lombok, pilihan armada, tips memilih driver, dan rekomendasi rental terbaik.",
    keywords: ["harga sewa mobil lombok", "rental mobil lombok murah", "sewa hiace lombok"],
  },
  {
    _id: "article-itinerary-lombok-3-hari",
    _type: "article",
    title: "Itinerary Lombok 3 Hari 2 Malam Untuk First Timer",
    slug: { _type: "slug", current: "itinerary-lombok-3-hari" },
    category: "Itinerary",
    excerpt:
      "Rangkaian itinerary singkat dengan fokus rute efisien dan kombinasi destinasi paling aman untuk lead.",
    description:
      "Panduan itinerary Lombok 3 hari 2 malam untuk first timer dengan rute efisien, pilihan area wisata yang realistis, dan tips menyusun trip yang tetap nyaman.",
    publishedAt: "2026-05-19T06:20:00.000Z",
    content: buildItineraryLombok3HariContent(),
    faqs: [
      faq(
        "Apakah 3 hari cukup untuk melihat Lombok?",
        "Cukup untuk first timer selama rutenya fokus dan tidak terlalu banyak pindah area.",
      ),
      faq(
        "Perlu menginap di area mana?",
        "Area menginap bisa dipilih berdasarkan fokus trip, misalnya Senggigi untuk Lombok barat atau Kuta Mandalika untuk pantai selatan.",
      ),
      faq(
        "Apakah Gili Trawangan bisa masuk itinerary 3 hari 2 malam?",
        "Bisa, selama rutenya disusun dengan fokus dan tidak memaksakan terlalu banyak destinasi lain dalam waktu yang sama.",
      ),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"],
    ctaMessage: "Halo, saya ingin itinerary Lombok 3 hari 2 malam.",
    seoTitle: "Itinerary Lombok 3 Hari 2 Malam | Rute Efisien Untuk First Timer",
    metaDescription:
      "Itinerary Lombok 3 hari 2 malam dengan rute efisien, rekomendasi destinasi, dan opsi paket wisata terkait.",
    keywords: ["itinerary lombok 3 hari", "tour lombok 3 hari 2 malam", "trip lombok 3d2n"],
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
    title: "Sewa Mobil Lombok Plus Driver untuk Trip yang Lebih Praktis",
    slug: { _type: "slug", current: "sewa-mobil-lombok-plus-driver" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa mobil Lombok plus driver untuk transfer, city tour, dan perjalanan wisata yang lebih praktis.",
    description:
      "Informasi sewa mobil Lombok plus driver, termasuk manfaat driver lokal, area layanan, dan tips memilih transport yang lebih praktis selama liburan.",
    publishedAt: "2026-05-20T08:10:00.000Z",
    content: buildSewaMobilLombokPlusDriverContent(),
    faqs: [
      faq("Kenapa memilih sewa mobil plus driver di Lombok?", "Karena perjalanan jadi lebih praktis, terutama untuk tamu yang belum familiar dengan rute dan kondisi jalan di Lombok."),
      faq("Apakah layanan ini cocok untuk city tour?", "Sangat cocok untuk city tour, beach hopping, transfer bandara, dan perjalanan beberapa hari."),
      faq("Apakah area jemput bisa dari bandara atau hotel?", "Bisa, layanan dapat disesuaikan dari bandara, hotel, atau titik jemput lain sesuai kebutuhan perjalanan."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/wisata/kuta-mandalika"],
    ctaMessage: "Halo, saya ingin sewa mobil Lombok plus driver.",
    seoTitle: "Sewa Mobil Lombok Plus Driver untuk Trip yang Lebih Praktis",
    metaDescription:
      "Cari sewa mobil Lombok plus driver? Simak manfaat driver lokal, area layanan, dan tips memilih transport yang nyaman untuk liburan Anda.",
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
      "Panduan paket wisata Lombok 3 hari 2 malam untuk first timer yang ingin itinerary efisien dan tetap nyaman.",
    description:
      "Panduan paket wisata Lombok 3 hari 2 malam dengan gambaran itinerary, kelebihan durasi 3D2N, dan pilihan trip yang efisien untuk first timer.",
    publishedAt: "2026-05-20T09:00:00.000Z",
    content: buildPaketWisataLombok3Hari2MalamContent(),
    faqs: [
      faq("Apakah paket wisata Lombok 3 hari 2 malam cocok untuk first timer?", "Cocok, karena durasi 3D2N cukup ideal untuk menikmati highlight Lombok tanpa itinerary terlalu padat."),
      faq("Destinasi apa yang biasanya masuk paket 3D2N?", "Biasanya mencakup kombinasi area selatan, sunset spot, dan satu highlight utama seperti Gili atau destinasi daratan populer."),
      faq("Siapa yang paling cocok memilih paket ini?", "Paket ini cocok untuk pasangan, keluarga, dan wisatawan dari luar kota yang ingin liburan efisien."),
    ],
    relatedLinks: ["/paket-wisata-lombok", "/blog/itinerary-lombok-3-hari", "/wisata/gili-trawangan"],
    ctaMessage: "Halo, saya ingin paket wisata Lombok 3 hari 2 malam.",
    seoTitle: "Paket Wisata Lombok 3 Hari 2 Malam untuk Liburan yang Efisien",
    metaDescription:
      "Cari paket wisata Lombok 3 hari 2 malam? Simak gambaran itinerary, kelebihan durasi 3D2N, dan tips memilih trip yang efisien untuk first timer.",
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
    title: "Sewa Mobil Bandara Lombok untuk Jemput dan Trip yang Lebih Praktis",
    slug: { _type: "slug", current: "sewa-mobil-bandara-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa mobil bandara Lombok untuk jemput hotel, transfer area wisata, dan perjalanan yang lebih praktis.",
    description:
      "Informasi sewa mobil bandara Lombok untuk jemput bandara, transfer hotel, dan layanan driver yang memudahkan perjalanan sejak hari pertama.",
    publishedAt: "2026-05-20T09:20:00.000Z",
    content: buildSewaMobilBandaraLombokContent(),
    faqs: [
      faq("Apakah layanan ini bisa menjemput langsung dari bandara Lombok?", "Bisa, layanan sewa mobil bandara Lombok memang dirancang untuk jemput bandara dan transfer perjalanan lanjutan."),
      faq("Apakah bisa langsung lanjut ke hotel atau area wisata?", "Bisa, tamu dapat langsung menuju hotel, Mandalika, Senggigi, atau area wisata lain sesuai kebutuhan."),
      faq("Siapa yang paling cocok memakai layanan ini?", "Sangat cocok untuk keluarga, pasangan, first timer, dan wisatawan luar kota yang ingin perjalanan lebih praktis sejak tiba."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/sewa-mobil-lombok-plus-driver", "/wisata/kuta-mandalika"],
    ctaMessage: "Halo, saya ingin sewa mobil dari bandara Lombok.",
    seoTitle: "Sewa Mobil Bandara Lombok untuk Jemput dan Trip yang Lebih Praktis",
    metaDescription:
      "Cari sewa mobil bandara Lombok? Simak manfaat jemput bandara, transfer hotel, dan layanan driver yang praktis untuk liburan Anda.",
    keywords: ["sewa mobil bandara lombok", "rental mobil bandara lombok", "jemput bandara lombok", "driver bandara lombok"],
  },
  {
    _id: "article-honeymoon-gili-trawangan",
    _type: "article",
    title: "Honeymoon Gili Trawangan untuk Liburan Romantis di Pulau Favorit",
    slug: { _type: "slug", current: "honeymoon-gili-trawangan" },
    category: "Honeymoon",
    excerpt:
      "Panduan honeymoon Gili Trawangan untuk pasangan yang mencari sunset, island vibes, dan liburan romantis.",
    description:
      "Informasi honeymoon Gili Trawangan untuk pasangan yang ingin suasana romantis, sunset, island stay, dan trip yang lebih private.",
    publishedAt: "2026-05-20T09:30:00.000Z",
    content: buildHoneymoonGiliTrawanganContent(),
    faqs: [
      faq("Apakah Gili Trawangan cocok untuk honeymoon?", "Sangat cocok karena punya suasana pulau yang santai, sunset yang kuat, dan pengalaman yang terasa lebih private untuk pasangan."),
      faq("Lebih baik honeymoon day trip atau menginap di Gili?", "Menginap biasanya lebih ideal untuk honeymoon karena pasangan bisa menikmati sunset dan suasana malam di pulau dengan lebih santai."),
      faq("Apakah honeymoon Gili bisa digabung dengan paket Lombok lain?", "Bisa, honeymoon Gili Trawangan sangat cocok dikombinasikan dengan paket honeymoon Lombok yang lebih panjang."),
    ],
    relatedLinks: ["/paket-honeymoon-lombok", "/wisata/gili-trawangan", "/blog/tour-gili-trawangan-dari-lombok"],
    ctaMessage: "Halo, saya ingin honeymoon ke Gili Trawangan.",
    seoTitle: "Honeymoon Gili Trawangan untuk Liburan Romantis di Pulau Favorit",
    metaDescription:
      "Cari honeymoon Gili Trawangan? Simak inspirasi trip romantis dengan sunset, island vibes, dan suasana private untuk pasangan.",
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
    title: "Rental Hiace Lombok untuk Rombongan dan Perjalanan yang Nyaman",
    slug: { _type: "slug", current: "rental-hiace-lombok" },
    category: "Sewa Mobil",
    excerpt:
      "Panduan rental Hiace Lombok untuk rombongan, family trip, dan perjalanan yang lebih nyaman.",
    description:
      "Informasi rental Hiace Lombok untuk rombongan, airport transfer, city tour, dan trip beberapa hari dengan kendaraan yang lebih lega.",
    publishedAt: "2026-05-20T10:00:00.000Z",
    content: buildRentalHiaceLombokContent(),
    faqs: [
      faq("Kapan rental Hiace Lombok paling cocok dipakai?", "Rental Hiace paling cocok untuk rombongan keluarga, group trip, airport transfer grup, dan perjalanan beberapa hari di Lombok."),
      faq("Apakah Hiace cocok untuk wisata rombongan?", "Sangat cocok karena kapasitasnya lebih lega dan memudahkan grup tetap bersama selama perjalanan."),
      faq("Apakah Hiace bisa untuk jemput bandara juga?", "Bisa, Hiace sangat relevan untuk jemput bandara rombongan agar perjalanan lebih praktis sejak awal."),
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/paket-wisata-lombok"],
    ctaMessage: "Halo, saya ingin rental Hiace Lombok.",
    seoTitle: "Rental Hiace Lombok untuk Rombongan dan Perjalanan yang Nyaman",
    metaDescription:
      "Cari rental Hiace Lombok? Simak panduan armada untuk rombongan, transfer bandara, dan trip yang lebih nyaman selama di Lombok.",
    keywords: ["rental hiace lombok", "sewa hiace lombok", "hiace lombok", "hiace untuk rombongan lombok"],
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

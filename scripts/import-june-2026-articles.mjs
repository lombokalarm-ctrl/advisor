function createTextBlock(text, key, style = "normal") {
  return {
    _key: key,
    _type: "block",
    style,
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

function createBulletBlock(text, key) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    listItem: "bullet",
    level: 1,
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

function plainTextToPortableText(value) {
  const sections = value
    .split(/\r?\n\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sections.flatMap((section, index) => {
    const lines = section
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return [];
    }

    if (lines.every((line) => line.startsWith("- "))) {
      return lines.map((line, bulletIndex) => createBulletBlock(line.replace(/^- /, "").trim(), `block-${index + 1}-${bulletIndex + 1}`));
    }

    const text = lines.join(" ");

    if (text.startsWith("## ")) {
      return [createTextBlock(text.replace(/^## /, "").trim(), `block-${index + 1}`, "h2")];
    }

    if (text.startsWith("### ")) {
      return [createTextBlock(text.replace(/^### /, "").trim(), `block-${index + 1}`, "h3")];
    }

    if (text.startsWith("> ")) {
      return [createTextBlock(text.replace(/^> /, "").trim(), `block-${index + 1}`, "blockquote")];
    }

    return [createTextBlock(text, `block-${index + 1}`, "normal")];
  });
}

function imageUrl(prompt) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;
}

const juneArticles = [
  {
    title: "Sewa Mobil Lombok Juni 2026 untuk Liburan, Bandara, dan Trip Harian",
    slug: "sewa-mobil-lombok-juni-2026",
    status: "published",
    category: "Sewa Mobil",
    excerpt:
      "Panduan sewa mobil Lombok Juni 2026 untuk wisatawan yang ingin transport lebih praktis sejak jemput bandara sampai trip harian selama liburan.",
    description:
      "Cari sewa mobil Lombok Juni 2026? Simak siapa yang cocok memakai layanan ini, kebutuhan yang paling sering dicari, dan cara booking armada yang lebih nyaman untuk perjalanan Anda.",
    publishedAt: "2026-06-08T08:00:00.000Z",
    mainImage: {
      url: imageUrl(
        "realistic airport pickup and family holiday car rental in Lombok, tropical island travel, modern clean SUV with driver, sunny day, cinematic tourism photography, professional travel website hero image",
      ),
      alt: "Sewa mobil Lombok Juni 2026 untuk jemput bandara dan liburan keluarga",
      caption: "Transport yang rapi membuat perjalanan di Lombok lebih nyaman sejak hari pertama.",
    },
    content: plainTextToPortableText(`## Sewa mobil Lombok Juni 2026 untuk perjalanan yang lebih praktis sejak hari pertama

Sewa mobil Lombok Juni 2026 menjadi kebutuhan yang relevan untuk tamu yang sudah mulai menyiapkan liburan, airport transfer, dan trip harian di bulan berjalan. Ketika tanggal perjalanan sudah pasti, banyak wisatawan ingin memastikan transport lebih dulu agar alur perjalanan terasa rapi sejak tiba di bandara sampai selesai liburan.

Layanan ini paling sering dicari oleh pasangan, keluarga, dan rombongan kecil yang tidak ingin repot mengatur kendaraan mendadak. Dengan mobil yang sesuai, perjalanan ke hotel, area wisata, atau agenda harian terasa lebih efisien dan nyaman. Bagi wisatawan yang ingin liburan tanpa banyak jeda tidak produktif, kendaraan yang sudah siap sejak awal sering menjadi faktor kecil yang berdampak besar pada kenyamanan seluruh trip.

## Kebutuhan yang paling sering dicari pada bulan Juni

- Jemput bandara lalu lanjut ke hotel atau area menginap.
- Mobil untuk trip harian ke Kuta Lombok, Senggigi, atau pantai selatan.
- Armada keluarga dengan ruang bagasi yang lebih aman dan nyaman.
- Layanan dengan driver untuk tamu yang ingin perjalanan lebih santai.

## Kenapa booking lebih awal lebih aman

Pada bulan seperti Juni, wisatawan umumnya sudah mulai aktif mencari jadwal dan menyesuaikan transport dengan tiket pesawat maupun hotel. Booking lebih awal membantu tamu mendapatkan pilihan armada yang lebih leluasa dan koordinasi perjalanan yang lebih jelas sejak awal.

Jika Anda ingin melihat layanan utama, buka halaman sewa mobil Lombok. Untuk membandingkan kebutuhan armada dan biaya, cek juga harga sewa mobil Lombok dan paket wisata Lombok jika perjalanan Anda sekalian ingin disusun lebih terarah. Internal link seperti ini penting bukan hanya untuk navigasi user, tetapi juga untuk membantu search engine memahami hubungan halaman blog dengan money page utama.

## Hal yang sebaiknya disiapkan sebelum konsultasi

- Tanggal pemakaian dan jam kedatangan atau penjemputan.
- Jumlah peserta dan jumlah koper agar armada tidak terlalu sempit.
- Area jemput, area tujuan, dan apakah dipakai transfer atau full day trip.

Sebelum menghubungi admin, sebaiknya Anda sudah punya gambaran dasar tentang ritme perjalanan. Apakah mobil hanya dipakai untuk transfer bandara, dipakai keliling seharian, atau dipakai beberapa hari berturut-turut. Informasi sederhana seperti ini akan membantu tim operasional memberi rekomendasi kendaraan yang lebih pas dan mengurangi risiko salah pilih armada.

Untuk pasangan atau keluarga kecil, kenyamanan sering lebih penting daripada sekadar kapasitas kursi. Sementara untuk rombongan, ruang bagasi dan fleksibilitas jalur perjalanan juga perlu dipikirkan sejak awal. Itulah sebabnya konsultasi yang baik sebaiknya langsung mengarah ke kebutuhan aktual, bukan sekadar tanya harga umum.

> Sewa mobil Lombok Juni 2026 paling cocok untuk tamu yang ingin perjalanan lebih teratur, nyaman, dan siap jalan tanpa repot mengurus transport di saat terakhir.`),
    faqs: [
      {
        question: "Berapa lama sebaiknya booking sewa mobil Lombok untuk Juni 2026?",
        answer: "Jika tanggal perjalanan sudah pasti, booking lebih awal lebih aman agar pilihan armada dan jadwal jemput masih lebih fleksibel.",
      },
      {
        question: "Apakah sewa mobil Lombok Juni 2026 cocok untuk jemput bandara?",
        answer: "Sangat cocok, terutama untuk tamu yang ingin langsung menuju hotel atau lanjut ke area wisata tanpa repot mencari transport tambahan.",
      },
      {
        question: "Apakah lebih baik memakai driver?",
        answer: "Banyak tamu memilih driver karena perjalanan terasa lebih praktis, terutama jika belum familiar dengan rute di Lombok atau ingin liburan lebih santai.",
      },
      {
        question: "Apakah layanan ini bisa dipakai untuk trip harian?",
        answer: "Bisa. Sewa mobil sering dipakai untuk city tour, beach hopping, transfer antar area, dan agenda wisata harian selama di Lombok.",
      },
    ],
    relatedLinks: ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/paket-wisata-lombok"],
    ctaMessage:
      "Halo, saya ingin sewa mobil Lombok untuk Juni 2026. Tolong bantu rekomendasikan armada, area jemput, dan durasi yang paling cocok.",
    seoTitle: "Sewa Mobil Lombok Juni 2026 untuk Bandara, Liburan, dan Trip Harian",
    metaDescription:
      "Butuh sewa mobil Lombok Juni 2026? Temukan pilihan layanan untuk jemput bandara, liburan keluarga, pasangan, dan trip harian dengan driver yang lebih praktis.",
    keywords: [
      "sewa mobil lombok juni",
      "sewa mobil lombok juni 2026",
      "rental mobil lombok juni",
      "sewa mobil bandara lombok",
      "sewa mobil lombok dengan driver",
    ],
  },
  {
    title: "Paket Honeymoon Lombok Juni 2026 untuk Pasangan yang Ingin Liburan Romantis",
    slug: "paket-honeymoon-lombok-juni-2026",
    status: "published",
    category: "Honeymoon",
    excerpt:
      "Panduan paket honeymoon Lombok Juni 2026 untuk pasangan yang ingin liburan romantis dengan itinerary nyaman, suasana lebih intim, dan ritme perjalanan yang tidak melelahkan.",
    description:
      "Paket honeymoon Lombok Juni 2026 cocok untuk pasangan yang ingin menikmati liburan romantis dengan alur perjalanan yang santai, nyaman, dan mudah dikonsultasikan sejak awal.",
    publishedAt: "2026-06-08T08:10:00.000Z",
    mainImage: {
      url: imageUrl(
        "realistic romantic honeymoon couple in Lombok by the beach at sunset, elegant resort atmosphere, tropical island travel, cinematic warm light, premium travel website hero image",
      ),
      alt: "Paket honeymoon Lombok Juni 2026 untuk pasangan yang ingin liburan romantis",
      caption: "Itinerary honeymoon yang tenang membantu pasangan menikmati waktu berdua dengan lebih nyaman.",
    },
    content: plainTextToPortableText(`## Paket honeymoon Lombok Juni 2026 untuk pasangan yang ingin liburan lebih romantis

Paket honeymoon Lombok Juni 2026 cocok untuk pasangan yang ingin menyiapkan perjalanan berdua dengan ritme yang nyaman, tidak terlalu padat, dan terasa lebih personal. Banyak pasangan mencari paket bulan berjalan karena ingin memastikan tanggal, area menginap, dan suasana perjalanan sudah pas sebelum keberangkatan.

Di Lombok, honeymoon yang baik bukan hanya soal destinasi cantik, tetapi soal alur perjalanan yang tenang, momen berdua yang cukup, dan perpindahan yang tidak melelahkan. Karena itu, itinerary honeymoon sebaiknya tetap fokus pada kenyamanan pasangan. Paket yang terlalu padat justru sering membuat pasangan kelelahan dan kehilangan ruang untuk menikmati momen yang semestinya menjadi inti perjalanan.

## Yang paling sering dicari pasangan untuk Juni 2026

- Area menginap yang mendukung suasana romantis dan tidak terlalu ramai.
- Itinerary santai dengan sunset, pantai, dan quality time berdua.
- Private trip yang lebih fleksibel dibanding format wisata umum.
- Transport yang rapi agar perjalanan terasa ringan sejak hari pertama.

## Kenapa bulan Juni menarik untuk honeymoon di Lombok

Pada bulan Juni, banyak pasangan mulai aktif mencari paket yang relevan dengan waktu liburan mereka. Keyword musiman seperti ini cenderung datang dari calon tamu yang sudah dekat ke keputusan booking, sehingga kebutuhan mereka biasanya lebih jelas: durasi, hotel, area trip, dan suasana perjalanan yang ingin didapat.

Untuk melihat layanan utamanya, kunjungi paket honeymoon Lombok. Jika ingin membandingkan opsi itinerary umum, cek juga paket wisata Lombok dan ide area romantis seperti Gili Trawangan yang sering dipertimbangkan pasangan. Artikel yang menaut ke halaman transaksional seperti ini juga membantu memperkuat cluster topik romantis dan liburan pasangan di dalam situs.

## Apa yang perlu dipastikan sebelum booking

- Tanggal honeymoon dan durasi perjalanan yang diinginkan.
- Preferensi area menginap, apakah lebih suka suasana resort, pantai, atau pulau.
- Gaya trip, apakah ingin lebih santai, lebih private, atau tetap ada beberapa highlight destinasi.

Sebelum booking, pasangan sebaiknya mendiskusikan karakter perjalanan yang benar-benar mereka inginkan. Ada pasangan yang lebih suka itinerary simpel dengan banyak waktu santai di hotel, ada juga yang tetap ingin mengunjungi beberapa spot ikonik selama tetap terasa ringan. Dengan arah seperti itu, paket akan terasa lebih personal dan tidak seperti itinerary generik yang dipakai untuk semua orang.

Selain soal destinasi, detail kecil seperti alur penjemputan, area menginap, dan fleksibilitas transport sering menjadi penentu pengalaman honeymoon yang menyenangkan. Perjalanan berdua biasanya jauh lebih berkesan saat ritmenya tenang dan mudah dijalani sejak hari pertama.

> Paket honeymoon Lombok Juni 2026 paling efektif untuk pasangan yang ingin liburan romantis dengan susunan perjalanan yang hangat, tidak melelahkan, dan mudah dikonsultasikan sejak awal.`),
    faqs: [
      {
        question: "Apakah Juni 2026 waktu yang bagus untuk honeymoon di Lombok?",
        answer: "Juni cocok untuk pasangan yang ingin trip romantis dengan perencanaan lebih matang, suasana liburan yang nyaman, dan itinerary yang bisa disusun tanpa terlalu terburu-buru.",
      },
      {
        question: "Honeymoon di Lombok lebih cocok berapa hari?",
        answer: "Banyak pasangan memilih durasi singkat sampai menengah, tergantung gaya perjalanan, area menginap, dan seberapa santai ritme liburan yang diinginkan.",
      },
      {
        question: "Apakah paket honeymoon bisa dibuat private?",
        answer: "Bisa. Justru banyak pasangan lebih nyaman dengan perjalanan private agar suasana lebih intim dan alur trip lebih fleksibel.",
      },
      {
        question: "Apakah paket honeymoon harus selalu penuh aktivitas?",
        answer: "Tidak. Honeymoon yang baik justru sering terasa lebih berkesan ketika itinerary memberi ruang untuk santai dan menikmati waktu berdua.",
      },
    ],
    relatedLinks: ["/paket-honeymoon-lombok", "/paket-wisata-lombok", "/wisata/gili-trawangan"],
    ctaMessage:
      "Halo, saya ingin paket honeymoon Lombok untuk Juni 2026. Tolong bantu rekomendasikan durasi, area menginap, dan itinerary yang romantis untuk berdua.",
    seoTitle: "Paket Honeymoon Lombok Juni 2026 untuk Liburan Romantis Berdua",
    metaDescription:
      "Cari paket honeymoon Lombok Juni 2026? Temukan pilihan trip romantis untuk pasangan yang ingin suasana lebih intim, itinerary nyaman, dan momen liburan yang berkesan.",
    keywords: [
      "paket honeymoon lombok juni 2026",
      "honeymoon lombok juni",
      "paket honeymoon lombok",
      "liburan romantis lombok",
      "trip pasangan lombok",
    ],
  },
  {
    title: "Paket Wisata Lombok Juni 2026 untuk Liburan Keluarga, Pasangan, dan Rombongan",
    slug: "paket-wisata-lombok-juni-2026",
    status: "published",
    category: "Paket Wisata",
    excerpt:
      "Panduan paket wisata Lombok Juni 2026 untuk wisatawan yang ingin liburan lebih praktis dengan itinerary yang bisa disesuaikan untuk keluarga, pasangan, dan rombongan.",
    description:
      "Paket wisata Lombok Juni 2026 cocok untuk tamu yang ingin perjalanan lebih efisien sejak awal, mulai dari susunan rute, transport, sampai penyesuaian kebutuhan rombongan.",
    publishedAt: "2026-06-08T08:20:00.000Z",
    mainImage: {
      url: imageUrl(
        "realistic Lombok family tour and private travel group, tropical coastline, comfortable vacation transport, sunny cinematic scene, premium tourism website hero image",
      ),
      alt: "Paket wisata Lombok Juni 2026 untuk keluarga, pasangan, dan rombongan",
      caption: "Paket wisata yang terstruktur membuat liburan keluarga dan rombongan lebih efisien.",
    },
    content: plainTextToPortableText(`## Paket wisata Lombok Juni 2026 untuk keluarga, pasangan, dan rombongan

Paket wisata Lombok Juni 2026 banyak dicari oleh calon tamu yang sudah punya horizon waktu liburan dan ingin perjalanan lebih praktis sejak awal. Pada fase ini, kebutuhan mereka biasanya sudah cukup jelas: berapa lama durasi trip, siapa saja yang ikut, area mana yang ingin diprioritaskan, dan apakah perjalanan perlu dibuat santai atau lebih lengkap.

Konten musiman seperti ini penting karena intent pencari biasanya lebih dekat ke aksi. Alih-alih hanya mencari inspirasi, calon tamu mulai membandingkan opsi paket yang benar-benar siap dipesan dan mudah disesuaikan dengan kebutuhan rombongan mereka. Karena itu, artikel seperti ini sebaiknya tidak berhenti di informasi umum, tetapi juga mengarahkan pembaca ke jalur konsultasi dan halaman layanan yang relevan.

## Siapa yang paling cocok dengan paket bulan Juni

- Keluarga yang ingin perjalanan lebih terarah tanpa menyusun semuanya sendiri.
- Pasangan yang ingin liburan nyaman namun tidak harus dalam format honeymoon.
- Rombongan kecil yang membutuhkan susunan perjalanan dan transport yang rapi.

## Apa yang biasanya ingin dipastikan sebelum booking

- Tanggal trip, jumlah peserta, dan jam kedatangan.
- Durasi yang paling realistis untuk menikmati Lombok tanpa terlalu padat.
- Kebutuhan kendaraan dan area wisata yang ingin diprioritaskan.
- Apakah paket lebih cocok dibuat umum, family trip, atau diarahkan ke trip berdua.

Mulai dari halaman utama paket wisata Lombok untuk melihat layanan inti. Jika perjalanan membutuhkan kendaraan yang lebih fleksibel, lihat juga sewa mobil Lombok. Untuk pasangan yang ingin suasana lebih personal, bandingkan dengan paket honeymoon Lombok. Kombinasi artikel pendukung dan money page seperti ini membantu pembaca bergerak dari tahap riset ke tahap konsultasi yang lebih dekat ke transaksi.

## Kenapa artikel musiman ini penting untuk transaksi

Keyword Juni 2026 membantu halaman blog menjangkau long-tail yang lebih spesifik dan berpotensi lebih realistis untuk dikonversi. Selain menangkap sinyal freshness, artikel seperti ini juga memperkuat internal link ke money page yang menjadi pusat konversi.

Dalam praktiknya, calon tamu yang mencari paket bulan berjalan biasanya sudah menyiapkan tanggal dan mulai menyaring vendor yang responsif. Itu sebabnya artikel ini perlu menjawab kebutuhan yang paling umum: fleksibilitas itinerary, kenyamanan transport, kecocokan untuk keluarga atau rombongan, dan kemudahan konsultasi sebelum booking.

Jika artikel musiman dikelola konsisten setiap bulan, halaman blog juga akan membangun jejak topical authority yang lebih kuat. Search engine bisa melihat bahwa situs aktif memperbarui konten berdasarkan musim perjalanan dan niat pencarian yang nyata, bukan hanya menumpuk artikel informatif tanpa arah transaksi.

> Paket wisata Lombok Juni 2026 paling relevan untuk calon tamu yang sudah siap bergerak dari tahap riset ke tahap konsultasi dan booking.`),
    faqs: [
      {
        question: "Apakah paket wisata Lombok Juni 2026 cocok untuk keluarga?",
        answer: "Sangat cocok, terutama jika itinerary disusun dengan ritme yang santai dan transport disesuaikan dengan kebutuhan peserta.",
      },
      {
        question: "Apakah paket wisata bisa disesuaikan untuk pasangan dan rombongan?",
        answer: "Bisa. Paket wisata Lombok umumnya fleksibel untuk diarahkan menjadi trip keluarga, private trip pasangan, maupun perjalanan rombongan kecil.",
      },
      {
        question: "Kapan sebaiknya mulai booking untuk Juni 2026?",
        answer: "Jika tanggal perjalanan sudah ada, konsultasi lebih awal lebih baik agar susunan itinerary, transport, dan kebutuhan trip bisa disiapkan lebih rapi.",
      },
      {
        question: "Apa bedanya paket wisata biasa dengan paket honeymoon?",
        answer: "Paket wisata biasa lebih umum untuk berbagai tipe tamu, sedangkan paket honeymoon biasanya disusun lebih intim, lebih santai, dan lebih fokus pada pengalaman berdua.",
      },
    ],
    relatedLinks: ["/paket-wisata-lombok", "/sewa-mobil-lombok", "/paket-honeymoon-lombok"],
    ctaMessage:
      "Halo, saya ingin paket wisata Lombok untuk Juni 2026. Tolong bantu rekomendasikan durasi, itinerary, dan opsi trip yang paling cocok untuk kami.",
    seoTitle: "Paket Wisata Lombok Juni 2026 untuk Keluarga, Couple, dan Rombongan",
    metaDescription:
      "Cari paket wisata Lombok Juni 2026? Temukan pilihan trip untuk keluarga, pasangan, dan rombongan dengan itinerary yang lebih praktis dan mudah disesuaikan.",
    keywords: [
      "paket wisata lombok juni 2026",
      "paket wisata lombok juni",
      "tour lombok juni 2026",
      "trip lombok juni",
      "paket liburan lombok",
    ],
  },
];

async function loginCms() {
  process.loadEnvFile(".env.local");

  const username = process.env.CMS_ADMIN_USERNAME;
  const password = process.env.CMS_ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("CMS admin credentials belum lengkap di .env.local");
  }

  const response = await fetch("http://localhost:3000/api/cms/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Login CMS gagal: ${response.status} ${await response.text()}`);
  }

  const cookie = response.headers.get("set-cookie");

  if (!cookie) {
    throw new Error("Cookie session CMS tidak ditemukan setelah login.");
  }

  return cookie;
}

async function importArticles() {
  const cookie = await loginCms();
  const results = [];

  for (const article of juneArticles) {
    const response = await fetch("http://localhost:3000/api/cms/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(article),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`Gagal import ${article.slug}: ${response.status} ${JSON.stringify(data)}`);
    }

    results.push({
      slug: article.slug,
      status: response.status,
      id: data?.article?.id || null,
    });
  }

  console.log(JSON.stringify({ imported: results.length, results }, null, 2));
}

importArticles().catch((error) => {
  console.error(error);
  process.exit(1);
});

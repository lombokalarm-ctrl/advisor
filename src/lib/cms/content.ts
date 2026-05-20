import { featuredDestinations, featuredServices, latestArticles } from "@/data/seed/home";
import { articlePages, destinationPages, servicePages } from "@/data/seed/routes";
import type { ArticleItem, DestinationItem, PortableTextNode, ServiceItem, TestimonialItem } from "@/types/content";
import { isSanityConfigured, sanityClient } from "@/sanity/lib/client";
import {
  articleBySlugQuery,
  articleSlugsQuery,
  destinationBySlugQuery,
  destinationSlugsQuery,
  homeArticlesQuery,
  homeDestinationsQuery,
  homePackagesQuery,
  homeTestimonialsQuery,
  packageBySlugQuery,
  packageSlugsQuery,
} from "@/sanity/lib/queries";

type HomePageData = {
  services: ServiceItem[];
  destinations: DestinationItem[];
  articles: ArticleItem[];
  testimonials: TestimonialItem[];
};

function textToPortableBlocks(...paragraphs: string[]): PortableTextNode[] {
  return paragraphs.map((paragraph, index) => ({
    _key: `block-${index + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `span-${index + 1}`,
        _type: "span",
        marks: [],
        text: paragraph,
      },
    ],
  }));
}

function textToBulletBlock(text: string, key: string): PortableTextNode {
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

function paketWisataLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "paket-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "paket-overview-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok yang fleksibel untuk berbagai gaya perjalanan" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok cocok untuk wisatawan yang ingin menikmati liburan lebih praktis tanpa repot menyusun itinerary dari nol. Mulai dari one day tour, 2 hari 1 malam, 3 hari 2 malam, hingga 4 hari 3 malam, setiap paket dapat disesuaikan dengan jumlah peserta, preferensi destinasi, dan gaya perjalanan.",
      "Melalui LombokAdvisor, perjalanan bisa diarahkan ke Gili Trawangan, Kuta Lombok, pantai-pantai populer, bukit sunset, air terjun, hingga wisata alam dan budaya di Lombok. Paket ini cocok untuk keluarga, pasangan, rombongan, maupun wisatawan first timer dari Jakarta, Surabaya, kota besar lain di Indonesia, serta tamu dari Malaysia, Singapura, Australia, dan Eropa.",
    ),
    {
      _key: "paket-why-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "paket-why-heading-span", _type: "span", marks: [], text: "Kenapa memilih paket wisata Lombok kami" }],
    },
    textToBulletBlock("Itinerary fleksibel untuk one day tour, 2D1N, 3D2N, 4D3N, hingga custom trip.", "paket-why-1"),
    textToBulletBlock("Cocok untuk private trip, family trip, honeymoon, dan group tour.", "paket-why-2"),
    textToBulletBlock("Destinasi bisa mencakup Gili Trawangan, Kuta Lombok, pantai, bukit, gunung, air terjun, dan wisata budaya.", "paket-why-3"),
    textToBulletBlock("Paket dapat mencakup hotel, transport, dan makan sesuai kebutuhan perjalanan.", "paket-why-4"),
    {
      _key: "paket-duration-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "paket-duration-heading-span", _type: "span", marks: [], text: "Pilihan paket wisata Lombok berdasarkan durasi" }],
    },
    {
      _key: "paket-duration-subheading",
      _type: "block",
      style: "h3",
      markDefs: [],
      children: [{ _key: "paket-duration-subheading-span", _type: "span", marks: [], text: "One Day Tour hingga 4D3N" }],
    },
    ...textToPortableBlocks(
      "Pilihan durasi tersedia mulai one day tour, 2 hari 1 malam, 3 hari 2 malam, hingga 4 hari 3 malam. Setiap durasi dapat diarahkan ke kombinasi destinasi yang paling realistis dan nyaman untuk peserta.",
      "Selain paket reguler, itinerary juga dapat diarahkan ke kebutuhan yang lebih personal seperti honeymoon, private trip keluarga, atau group trip dengan pengaturan lebih fleksibel.",
      "Harga paket wisata Lombok mulai dari Rp1 juta per orang dan dapat menyesuaikan dengan durasi perjalanan, jumlah peserta, pilihan hotel, area destinasi, musim liburan, dan kebutuhan tambahan selama perjalanan.",
    ),
  ];
}

function paketHoneymoonLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "honeymoon-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "honeymoon-overview-heading-span", _type: "span", marks: [], text: "Paket honeymoon Lombok untuk perjalanan yang lebih personal dan romantis" }],
    },
    ...textToPortableBlocks(
      "Paket honeymoon Lombok dirancang untuk pasangan yang ingin menikmati liburan romantis dengan itinerary yang lebih santai, private, dan nyaman. Perjalanan dapat disusun untuk menikmati pantai, sunset, suasana island escape, makan malam romantis, hingga waktu berdua yang lebih berkualitas.",
      "Paket ini cocok untuk pasangan dari kota besar di Indonesia maupun tamu dari Malaysia, Singapura, Australia, dan Eropa yang ingin honeymoon praktis dengan kombinasi hotel, transport, makan, dan destinasi terbaik di Lombok.",
    ),
    {
      _key: "honeymoon-why-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "honeymoon-why-heading-span", _type: "span", marks: [], text: "Kenapa memilih paket honeymoon Lombok kami" }],
    },
    textToBulletBlock("Itinerary dibuat lebih private, santai, dan fokus pada pengalaman pasangan.", "honeymoon-why-1"),
    textToBulletBlock("Bisa termasuk hotel atau villa pilihan untuk suasana yang lebih romantis.", "honeymoon-why-2"),
    textToBulletBlock("Dapat ditambah candle light dinner, sunset experience, atau private trip ke Gili.", "honeymoon-why-3"),
    {
      _key: "honeymoon-duration-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "honeymoon-duration-heading-span", _type: "span", marks: [], text: "Pilihan durasi paket honeymoon" }],
    },
    ...textToPortableBlocks(
      "Paket honeymoon tersedia mulai 2 hari 1 malam hingga 4 hari 3 malam dan dapat disesuaikan dengan preferensi pasangan, budget, serta suasana perjalanan yang diinginkan.",
      "Destinasi yang dapat diarahkan ke itinerary honeymoon mencakup Gili Trawangan, Kuta Lombok, pantai selatan, bukit sunset, dan area resort yang lebih private.",
    ),
  ];
}

function sewaMobilLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "car-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "car-overview-heading-span", _type: "span", marks: [], text: "Sewa mobil Lombok yang fleksibel untuk airport transfer, city tour, dan overland trip" }],
    },
    ...textToPortableBlocks(
      "Sewa mobil Lombok cocok untuk wisatawan yang ingin perjalanan lebih fleksibel tanpa harus ikut paket tour penuh. Layanan ini dapat dipakai untuk jemput bandara, transfer hotel, city tour, perjalanan antar area wisata, hingga trip harian dengan driver.",
      "Layanan ini ideal untuk tamu domestik maupun internasional yang membutuhkan transportasi yang praktis selama berada di Lombok.",
    ),
    {
      _key: "car-why-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "car-why-heading-span", _type: "span", marks: [], text: "Kenapa memilih sewa mobil Lombok dengan driver" }],
    },
    textToBulletBlock("Lebih fleksibel untuk itinerary sendiri maupun kebutuhan transport selama liburan.", "car-why-1"),
    textToBulletBlock("Tersedia untuk jemput bandara, antar hotel, city tour, dan full day trip.", "car-why-2"),
    textToBulletBlock("Driver lokal memahami area wisata, rute, dan ritme perjalanan yang efisien.", "car-why-3"),
    {
      _key: "car-needs-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "car-needs-heading-span", _type: "span", marks: [], text: "Kebutuhan sewa mobil yang paling sering dicari" }],
    },
    ...textToPortableBlocks(
      "Layanan ini cocok untuk jemput bandara, city tour, full day trip, hingga multi day transport sesuai itinerary tamu.",
      "Harga sewa mobil Lombok mulai dari kebutuhan harian dan dapat menyesuaikan dengan jenis armada, durasi penggunaan, area penjemputan, serta kebutuhan perjalanan.",
    ),
  ];
}

function giliTrawanganFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "gili-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "gili-overview-heading-span", _type: "span", marks: [], text: "Wisata Gili Trawangan untuk island escape, snorkeling, dan sunset" }],
    },
    ...textToPortableBlocks(
      "Gili Trawangan adalah salah satu destinasi paling populer di Lombok untuk wisatawan yang ingin menikmati suasana pulau kecil dengan kombinasi laut jernih, snorkeling, beach club, jalur sepeda, dan sunset yang ikonik.",
      "Destinasi ini cocok untuk first timer, pasangan, hingga wisatawan yang ingin menambah island hopping ke itinerary Lombok tanpa ritme perjalanan yang terlalu rumit.",
    ),
    {
      _key: "gili-activity-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "gili-activity-heading-span", _type: "span", marks: [], text: "Aktivitas yang paling sering dicari di Gili Trawangan" }],
    },
    textToBulletBlock("Snorkeling, island hopping, dan menikmati laut sekitar Gili.", "gili-activity-1"),
    textToBulletBlock("Sunset dan quality time untuk pasangan atau honeymoon trip.", "gili-activity-2"),
    textToBulletBlock("Bersepeda keliling pulau dan menikmati suasana santai.", "gili-activity-3"),
  ];
}

function kutaMandalikaFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "kuta-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "kuta-overview-heading-span", _type: "span", marks: [], text: "Wisata Kuta Mandalika untuk pantai selatan, sunset, dan short escape Lombok" }],
    },
    ...textToPortableBlocks(
      "Kuta Mandalika menjadi salah satu area favorit di Lombok selatan karena aksesnya relatif mudah dari bandara, pilihan pantainya beragam, dan suasananya cocok untuk wisatawan yang ingin liburan santai namun tetap visual.",
      "Area ini sering dipilih untuk short escape, family trip, pasangan, hingga tamu yang baru pertama kali datang ke Lombok karena banyak spot berdekatan dan mudah dikombinasikan dalam itinerary.",
    ),
    {
      _key: "kuta-activity-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "kuta-activity-heading-span", _type: "span", marks: [], text: "Aktivitas yang biasa dilakukan di Kuta Mandalika" }],
    },
    textToBulletBlock("Beach hopping ke pantai selatan Lombok.", "kuta-activity-1"),
    textToBulletBlock("Menikmati sunset dari bukit dan viewpoint ikonik.", "kuta-activity-2"),
    textToBulletBlock("Trip keluarga atau pasangan dengan ritme yang tidak terlalu berat.", "kuta-activity-3"),
  ];
}

function senggigiFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "senggigi-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "senggigi-overview-heading-span", _type: "span", marks: [], text: "Wisata Senggigi untuk sunset, hotel, kuliner, dan basecamp perjalanan" }],
    },
    ...textToPortableBlocks(
      "Senggigi dikenal sebagai salah satu kawasan wisata klasik di Lombok barat yang cocok untuk wisatawan yang ingin area menginap strategis, dekat ke banyak fasilitas, dan nyaman untuk memulai perjalanan ke berbagai destinasi.",
      "Keunggulan Senggigi ada pada kombinasi hotel, restoran, akses transport, pantai untuk sunset, dan posisinya yang cukup strategis ke Lombok barat maupun titik keberangkatan ke area Gili.",
    ),
    {
      _key: "senggigi-activity-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "senggigi-activity-heading-span", _type: "span", marks: [], text: "Hal yang membuat Senggigi tetap menarik" }],
    },
    textToBulletBlock("Sunset yang mudah dinikmati dari area pantai dan hotel sekitar.", "senggigi-activity-1"),
    textToBulletBlock("Pilihan hotel dan restoran yang cukup lengkap untuk wisatawan.", "senggigi-activity-2"),
    textToBulletBlock("Cocok sebagai basecamp sebelum lanjut ke Gili atau Lombok barat.", "senggigi-activity-3"),
  ];
}

function tempatWisataLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "places-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "places-overview-heading-span", _type: "span", marks: [], text: "Tempat wisata di Lombok yang paling sering masuk itinerary first timer" }],
    },
    ...textToPortableBlocks(
      "Lombok punya kombinasi destinasi yang sangat lengkap, mulai dari pantai, gili, bukit sunset, air terjun, hingga wisata budaya. Untuk wisatawan yang baru pertama kali datang, tantangan utamanya adalah memilih destinasi yang paling cocok digabungkan agar itinerary tetap realistis dan nyaman.",
      "Artikel ini membantu Anda mengenali tempat wisata di Lombok yang paling populer sekaligus memberi gambaran destinasi mana yang cocok untuk family trip, honeymoon, short escape, atau private trip.",
    ),
    {
      _key: "places-guide-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "places-guide-heading-span", _type: "span", marks: [], text: "Cara memilih destinasi yang tepat" }],
    },
    textToBulletBlock("Fokus pada 1-2 area wisata utama agar rute tidak terlalu padat.", "places-guide-1"),
    textToBulletBlock("Sesuaikan pilihan destinasi dengan durasi trip seperti 3D2N atau 4D3N.", "places-guide-2"),
    textToBulletBlock("Gunakan paket wisata atau transport dengan driver agar perpindahan lebih efisien.", "places-guide-3"),
  ];
}

function hargaSewaMobilLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "carprice-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "carprice-overview-heading-span", _type: "span", marks: [], text: "Apa yang memengaruhi harga sewa mobil Lombok" }],
    },
    ...textToPortableBlocks(
      "Harga sewa mobil Lombok tidak selalu sama karena dipengaruhi oleh jenis armada, durasi penggunaan, area penjemputan, dan kebutuhan perjalanan. Karena itu, penting bagi calon tamu untuk memahami struktur kebutuhannya sebelum membandingkan tarif.",
      "Artikel ini membantu Anda memahami kenapa harga rental mobil bisa berbeda dan bagaimana memilih armada yang sesuai tanpa hanya fokus pada tarif termurah.",
    ),
    {
      _key: "carprice-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "carprice-tips-heading-span", _type: "span", marks: [], text: "Tips memilih armada" }],
    },
    textToBulletBlock("Pilih kendaraan berdasarkan jumlah peserta dan kenyamanan selama perjalanan.", "carprice-tip-1"),
    textToBulletBlock("Pertimbangkan rute wisata dan jumlah barang bawaan.", "carprice-tip-2"),
    textToBulletBlock("Jangan hanya fokus pada harga, tetapi juga layanan driver dan fleksibilitas trip.", "carprice-tip-3"),
  ];
}

function itineraryLombok3HariFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "itinerary-overview-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "itinerary-overview-heading-span", _type: "span", marks: [], text: "Gambaran itinerary Lombok 3 hari 2 malam untuk first timer" }],
    },
    ...textToPortableBlocks(
      "Itinerary Lombok 3 hari 2 malam adalah salah satu durasi paling ideal untuk first timer karena cukup untuk menikmati beberapa area utama tanpa membuat perjalanan terasa terlalu padat.",
      "Kuncinya adalah memilih kombinasi destinasi yang realistis berdasarkan area, bukan sekadar memasukkan terlalu banyak tempat wisata ke dalam satu rute.",
    ),
    {
      _key: "itinerary-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "itinerary-tips-heading-span", _type: "span", marks: [], text: "Tips agar itinerary 3D2N tetap nyaman" }],
    },
    textToBulletBlock("Jangan mencampur terlalu banyak area dalam satu hari.", "itinerary-tip-1"),
    textToBulletBlock("Tentukan fokus trip sejak awal, apakah ke Gili atau pantai selatan.", "itinerary-tip-2"),
    textToBulletBlock("Gunakan paket wisata atau transport dengan driver agar waktu lebih efisien.", "itinerary-tip-3"),
  ];
}

function paketWisataLombokMurahFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "cheap-package-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-package-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok murah bukan berarti itinerary seadanya" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok murah tetap bisa nyaman selama rute, durasi, dan fasilitasnya dirancang dengan realistis. Fokus utamanya adalah efisiensi, bukan sekadar menekan biaya tanpa arah.",
      "Dengan itinerary yang efisien, biaya perjalanan bisa lebih terukur tanpa membuat pengalaman liburan terasa terlalu padat atau melelahkan.",
    ),
    {
      _key: "cheap-package-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-package-tips-heading-span", _type: "span", marks: [], text: "Tips memilih paket yang tetap nyaman" }],
    },
    textToBulletBlock("Utamakan value dan efisiensi rute, bukan harga terendah saja.", "cheap-package-tip-1"),
    textToBulletBlock("Pastikan detail hotel, transport, dan makan dijelaskan sejak awal.", "cheap-package-tip-2"),
    textToBulletBlock("Pilih durasi yang paling sesuai dengan budget dan tenaga peserta.", "cheap-package-tip-3"),
  ];
}

function tourLombok3Hari2MalamFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "tour-3d2n-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "tour-3d2n-heading-span", _type: "span", marks: [], text: "Kenapa tour Lombok 3 hari 2 malam paling sering dipilih" }],
    },
    ...textToPortableBlocks(
      "Tour Lombok 3 hari 2 malam menjadi pilihan populer untuk first timer karena cukup untuk melihat highlight utama Lombok tanpa membutuhkan waktu liburan yang terlalu panjang.",
      "Durasi ini ideal untuk menggabungkan area selatan, sunset spot, dan satu highlight utama seperti Gili Trawangan atau kombinasi destinasi daratan yang lebih ringan.",
    ),
    {
      _key: "tour-3d2n-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "tour-3d2n-tips-heading-span", _type: "span", marks: [], text: "Tips memilih paket 3D2N" }],
    },
    textToBulletBlock("Tentukan fokus area utama sejak awal.", "tour-3d2n-tip-1"),
    textToBulletBlock("Jangan memaksakan terlalu banyak destinasi dalam satu hari.", "tour-3d2n-tip-2"),
    textToBulletBlock("Gunakan operator yang bisa menyesuaikan ritme trip dengan profil peserta.", "tour-3d2n-tip-3"),
  ];
}

function tripGiliTrawanganFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "trip-gili-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "trip-gili-heading-span", _type: "span", marks: [], text: "Trip Gili Trawangan dari Lombok untuk day trip atau menginap" }],
    },
    ...textToPortableBlocks(
      "Trip Gili Trawangan cocok untuk wisatawan yang ingin snorkeling, sunset, dan suasana pulau yang santai. Pilihan trip bisa diarahkan sebagai day trip atau dengan menginap, tergantung durasi liburan.",
      "Yang terpenting adalah merencanakan alur transport darat dan lautnya sejak awal agar perjalanan tetap nyaman.",
    ),
    {
      _key: "trip-gili-options-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "trip-gili-options-heading-span", _type: "span", marks: [], text: "Pilihan trip yang umum" }],
    },
    textToBulletBlock("Day trip untuk waktu singkat.", "trip-gili-option-1"),
    textToBulletBlock("Menginap untuk tamu yang ingin sunset dan suasana malam di pulau.", "trip-gili-option-2"),
    textToBulletBlock("Kombinasi dengan paket wisata Lombok yang lebih panjang.", "trip-gili-option-3"),
  ];
}

function paketWisataLombokDariJakartaFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "jakarta-package-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "jakarta-package-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok dari Jakarta untuk perjalanan yang lebih praktis" }],
    },
    ...textToPortableBlocks(
      "Wisatawan dari Jakarta umumnya mencari paket wisata Lombok yang lebih jelas sejak awal, mulai dari durasi, hotel, transport, hingga gambaran itinerary.",
      "Paket seperti ini cocok untuk pasangan, keluarga, maupun grup kecil yang ingin konsultasi cepat sebelum keberangkatan.",
    ),
    {
      _key: "jakarta-package-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "jakarta-package-tips-heading-span", _type: "span", marks: [], text: "Tips sebelum booking" }],
    },
    textToBulletBlock("Tentukan tanggal perjalanan dan jumlah peserta lebih awal.", "jakarta-package-tip-1"),
    textToBulletBlock("Pilih fokus trip: Gili, pantai selatan, atau kombinasi keduanya.", "jakarta-package-tip-2"),
    textToBulletBlock("Pastikan detail hotel dan transport dibahas sejak awal.", "jakarta-package-tip-3"),
  ];
}

function rentalMobilLombokMurahFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "cheap-rental-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-rental-heading-span", _type: "span", marks: [], text: "Rental mobil Lombok murah untuk trip yang tetap nyaman" }],
    },
    ...textToPortableBlocks(
      "Rental mobil Lombok murah cocok untuk wisatawan yang ingin transport fleksibel tanpa harus ikut tour penuh. Namun harga hemat tetap harus dibarengi pemilihan armada dan rute yang tepat.",
      "Dengan layanan yang komunikatif dan estimasi kebutuhan yang jelas, wisatawan tetap bisa mendapatkan transport yang efisien tanpa mengorbankan kenyamanan dasar perjalanan.",
    ),
    {
      _key: "cheap-rental-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-rental-tips-heading-span", _type: "span", marks: [], text: "Cara memilih rental yang tepat" }],
    },
    textToBulletBlock("Sesuaikan armada dengan jumlah peserta dan barang bawaan.", "cheap-rental-tip-1"),
    textToBulletBlock("Perjelas area jemput dan durasi penggunaan sejak awal.", "cheap-rental-tip-2"),
    textToBulletBlock("Bandingkan layanan berdasarkan value, bukan hanya harga.", "cheap-rental-tip-3"),
  ];
}

function tempatWisataLombokSelainGiliFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "non-gili-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "non-gili-heading-span", _type: "span", marks: [], text: "Pilihan tempat wisata di Lombok selain Gili" }],
    },
    ...textToPortableBlocks(
      "Lombok tetap sangat menarik meski tanpa fokus utama ke Gili. Pantai selatan, bukit sunset, Senggigi, dan wisata alam lain bisa menjadi kombinasi itinerary yang sangat kuat.",
      "Artikel ini cocok untuk wisatawan yang ingin eksplor daratan Lombok atau mencari alternatif rute yang lebih sederhana dan seimbang.",
    ),
    {
      _key: "non-gili-options-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "non-gili-options-heading-span", _type: "span", marks: [], text: "Alternatif destinasi yang layak dipertimbangkan" }],
    },
    textToBulletBlock("Kuta Mandalika dan pantai selatan.", "non-gili-option-1"),
    textToBulletBlock("Bukit Merese dan viewpoint lain untuk sunset.", "non-gili-option-2"),
    textToBulletBlock("Senggigi untuk basecamp Lombok barat.", "non-gili-option-3"),
    textToBulletBlock("Air terjun dan wisata alam untuk variasi trip.", "non-gili-option-4"),
  ];
}

function paketHoneymoonLombokMurahFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "cheap-honeymoon-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-honeymoon-heading-span", _type: "span", marks: [], text: "Paket honeymoon Lombok murah tetap bisa terasa romantis dan nyaman" }],
    },
    ...textToPortableBlocks(
      "Paket honeymoon Lombok murah banyak dicari pasangan yang ingin menikmati liburan romantis tanpa mengambil budget terlalu tinggi. Kuncinya bukan hanya mencari harga rendah, tetapi memastikan itinerary, hotel, transport, dan ritme perjalanan tetap realistis.",
      "Dengan pemilihan durasi yang tepat dan fokus ke destinasi yang benar-benar relevan untuk pasangan, honeymoon yang lebih hemat tetap bisa memberi pengalaman yang berkesan.",
    ),
    {
      _key: "cheap-honeymoon-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-honeymoon-tips-heading-span", _type: "span", marks: [], text: "Cara memilih paket honeymoon yang tetap nyaman" }],
    },
    textToBulletBlock("Utamakan suasana trip dan kenyamanan hotel, bukan harga termurah semata.", "cheap-honeymoon-tip-1"),
    textToBulletBlock("Pilih durasi 2D1N atau 3D2N jika ingin budget lebih terkontrol.", "cheap-honeymoon-tip-2"),
    textToBulletBlock("Fokus ke destinasi romantis yang aksesnya mudah dan tidak terlalu menguras waktu.", "cheap-honeymoon-tip-3"),
  ];
}

function sewaMobilLombokPlusDriverFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "driver-rental-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "driver-rental-heading-span", _type: "span", marks: [], text: "Sewa mobil Lombok plus driver untuk perjalanan yang lebih praktis" }],
    },
    ...textToPortableBlocks(
      "Sewa mobil Lombok plus driver cocok untuk wisatawan yang ingin transport fleksibel tanpa perlu menyetir sendiri. Layanan ini banyak dipilih untuk jemput bandara, city tour, beach hopping, dan perjalanan beberapa hari di Lombok.",
      "Dengan driver lokal yang memahami rute dan ritme perjalanan, tamu bisa lebih fokus menikmati liburan tanpa repot mengatur detail perpindahan antar destinasi.",
    ),
    {
      _key: "driver-rental-benefits-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "driver-rental-benefits-heading-span", _type: "span", marks: [], text: "Keunggulan sewa mobil dengan driver" }],
    },
    textToBulletBlock("Lebih nyaman untuk tamu dari luar kota atau luar negeri yang belum familiar dengan rute Lombok.", "driver-rental-benefit-1"),
    textToBulletBlock("Cocok untuk transfer bandara, city tour, dan itinerary wisata yang fleksibel.", "driver-rental-benefit-2"),
    textToBulletBlock("Membantu perjalanan lebih efisien karena driver memahami area wisata populer.", "driver-rental-benefit-3"),
  ];
}

function paketWisataLombok4Hari3MalamFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "package-4d3n-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-4d3n-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok 4 hari 3 malam untuk liburan yang lebih lengkap" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok 4 hari 3 malam cocok untuk wisatawan yang ingin menjelajahi Lombok dengan ritme lebih santai dan destinasi yang lebih beragam. Durasi ini memberi ruang lebih nyaman untuk menggabungkan area selatan, Gili, dan titik wisata daratan.",
      "Pilihan 4D3N sering dicari keluarga, pasangan, dan tamu dari luar kota yang ingin liburan lebih maksimal tanpa itinerary yang terlalu padat setiap hari.",
    ),
    {
      _key: "package-4d3n-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-4d3n-points-heading-span", _type: "span", marks: [], text: "Kenapa durasi 4D3N banyak dipilih" }],
    },
    textToBulletBlock("Lebih leluasa untuk menggabungkan destinasi laut dan daratan.", "package-4d3n-point-1"),
    textToBulletBlock("Ritme perjalanan lebih santai dibanding itinerary singkat 2D1N atau 3D2N.", "package-4d3n-point-2"),
    textToBulletBlock("Cocok untuk first timer yang ingin pengalaman Lombok lebih lengkap.", "package-4d3n-point-3"),
  ];
}

function wisataKutaLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "kuta-lombok-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "kuta-lombok-heading-span", _type: "span", marks: [], text: "Wisata Kuta Lombok untuk pantai selatan dan sunset terbaik" }],
    },
    ...textToPortableBlocks(
      "Wisata Kuta Lombok menjadi salah satu pilihan paling populer untuk wisatawan yang ingin menikmati pantai selatan, sunset, dan suasana liburan yang santai namun tetap visual. Area ini cocok untuk short escape, pasangan, keluarga, maupun first timer.",
      "Lokasinya yang relatif dekat dari bandara membuat Kuta Lombok sering dipilih sebagai titik awal perjalanan atau area menginap untuk itinerary Lombok selatan.",
    ),
    {
      _key: "kuta-lombok-activities-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "kuta-lombok-activities-heading-span", _type: "span", marks: [], text: "Aktivitas yang sering dicari di Kuta Lombok" }],
    },
    textToBulletBlock("Beach hopping ke pantai selatan yang populer.", "kuta-lombok-activity-1"),
    textToBulletBlock("Menikmati sunset di bukit atau viewpoint ikonik.", "kuta-lombok-activity-2"),
    textToBulletBlock("Liburan santai untuk pasangan, keluarga, atau tamu short escape.", "kuta-lombok-activity-3"),
  ];
}

function paketWisataLombokDariSurabayaFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "surabaya-package-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "surabaya-package-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok dari Surabaya untuk trip yang lebih praktis" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok dari Surabaya banyak dicari wisatawan yang ingin liburan lebih praktis sejak sebelum keberangkatan. Biasanya tamu membutuhkan gambaran durasi, destinasi, hotel, dan transport yang jelas agar proses booking lebih cepat.",
      "Layanan seperti ini cocok untuk pasangan, keluarga, dan grup kecil dari Surabaya yang ingin itinerary Lombok yang efisien dan mudah dikonsultasikan.",
    ),
    {
      _key: "surabaya-package-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "surabaya-package-tips-heading-span", _type: "span", marks: [], text: "Hal yang perlu disiapkan sebelum booking" }],
    },
    textToBulletBlock("Tentukan tanggal perjalanan dan jumlah peserta lebih awal.", "surabaya-package-tip-1"),
    textToBulletBlock("Pilih fokus trip apakah ke Gili, pantai selatan, atau kombinasi keduanya.", "surabaya-package-tip-2"),
    textToBulletBlock("Pastikan detail hotel dan transport dibahas sejak awal agar itinerary lebih jelas.", "surabaya-package-tip-3"),
  ];
}

function tourGiliTrawanganDariLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "gili-tour-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "gili-tour-heading-span", _type: "span", marks: [], text: "Tour Gili Trawangan dari Lombok untuk day trip atau menginap" }],
    },
    ...textToPortableBlocks(
      "Tour Gili Trawangan dari Lombok cocok untuk wisatawan yang ingin menikmati snorkeling, sunset, dan suasana pulau paling populer di kawasan Gili. Pilihan tour bisa disusun sebagai day trip maupun trip dengan menginap.",
      "Yang paling penting adalah memastikan alur transport darat dan laut sudah tersusun rapi agar pengalaman ke Gili tetap nyaman dan tidak terasa merepotkan.",
    ),
    {
      _key: "gili-tour-options-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "gili-tour-options-heading-span", _type: "span", marks: [], text: "Pilihan tour yang umum dipilih" }],
    },
    textToBulletBlock("Day trip untuk wisatawan yang punya waktu terbatas.", "gili-tour-option-1"),
    textToBulletBlock("Menginap untuk menikmati sunset dan suasana malam di pulau.", "gili-tour-option-2"),
    textToBulletBlock("Kombinasi dengan paket wisata Lombok yang lebih panjang.", "gili-tour-option-3"),
  ];
}

function paketWisataLombok3Hari2MalamFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "package-3d2n-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-3d2n-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok 3 hari 2 malam untuk liburan yang efisien" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok 3 hari 2 malam adalah salah satu durasi yang paling banyak dicari karena cukup ideal untuk first timer yang ingin melihat highlight utama Lombok tanpa mengambil liburan terlalu panjang.",
      "Dengan penyusunan rute yang tepat, durasi 3D2N bisa mencakup kombinasi pantai selatan, sunset spot, area menginap strategis, dan highlight utama seperti Gili atau destinasi daratan populer.",
    ),
    {
      _key: "package-3d2n-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-3d2n-points-heading-span", _type: "span", marks: [], text: "Kenapa paket 3D2N paling sering dipilih" }],
    },
    textToBulletBlock("Cukup efisien untuk first timer dan tamu dari luar kota.", "package-3d2n-point-1"),
    textToBulletBlock("Bisa mencakup destinasi utama tanpa ritme trip terlalu berat.", "package-3d2n-point-2"),
    textToBulletBlock("Cocok untuk pasangan, keluarga, dan private trip singkat.", "package-3d2n-point-3"),
  ];
}

function paketWisataLombok2Hari1MalamFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "package-2d1n-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-2d1n-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok 2 hari 1 malam untuk short escape yang praktis" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok 2 hari 1 malam cocok untuk wisatawan yang memiliki waktu singkat namun tetap ingin menikmati pengalaman liburan yang terarah. Durasi ini sering dipilih untuk short escape pasangan, keluarga kecil, atau extension trip.",
      "Kunci paket 2D1N adalah memilih area wisata yang tidak terlalu berjauhan agar perjalanan tetap nyaman dan tidak terasa terburu-buru.",
    ),
    {
      _key: "package-2d1n-tips-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "package-2d1n-tips-heading-span", _type: "span", marks: [], text: "Cara membuat trip 2D1N tetap nyaman" }],
    },
    textToBulletBlock("Fokus ke satu area utama seperti Kuta Lombok atau Lombok barat.", "package-2d1n-tip-1"),
    textToBulletBlock("Hindari terlalu banyak perpindahan destinasi dalam satu hari.", "package-2d1n-tip-2"),
    textToBulletBlock("Gunakan transport dan itinerary yang sudah tersusun agar waktu lebih efisien.", "package-2d1n-tip-3"),
  ];
}

function sewaMobilBandaraLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "airport-rental-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "airport-rental-heading-span", _type: "span", marks: [], text: "Sewa mobil bandara Lombok untuk jemput dan trip yang lebih praktis" }],
    },
    ...textToPortableBlocks(
      "Sewa mobil bandara Lombok cocok untuk wisatawan yang ingin langsung dijemput setibanya di bandara tanpa repot mencari transport lanjutan. Layanan ini banyak dipakai untuk transfer hotel, perjalanan ke Mandalika, Senggigi, atau langsung mulai city tour.",
      "Dengan layanan driver yang sudah siap menjemput, tamu bisa memulai perjalanan di Lombok dengan lebih nyaman, terutama untuk keluarga, pasangan, atau wisatawan dari luar kota dan luar negeri.",
    ),
    {
      _key: "airport-rental-benefits-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "airport-rental-benefits-heading-span", _type: "span", marks: [], text: "Kapan layanan ini paling dibutuhkan" }],
    },
    textToBulletBlock("Saat baru tiba di bandara dan ingin langsung menuju hotel.", "airport-rental-benefit-1"),
    textToBulletBlock("Saat ingin langsung lanjut ke area wisata seperti Kuta Lombok atau Senggigi.", "airport-rental-benefit-2"),
    textToBulletBlock("Saat membawa keluarga atau barang yang lebih banyak selama perjalanan.", "airport-rental-benefit-3"),
  ];
}

function honeymoonGiliTrawanganFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "honeymoon-gili-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "honeymoon-gili-heading-span", _type: "span", marks: [], text: "Honeymoon Gili Trawangan untuk liburan romantis di pulau favorit" }],
    },
    ...textToPortableBlocks(
      "Honeymoon Gili Trawangan banyak dipilih pasangan yang ingin suasana pulau yang santai, sunset yang kuat, dan pengalaman berdua yang terasa lebih private. Pulau ini cocok untuk honeymoon ringan maupun bagian dari paket Lombok yang lebih panjang.",
      "Dengan kombinasi sunset, sepeda keliling pulau, suasana tepi pantai, dan opsi menginap yang romantis, Gili Trawangan menjadi salah satu destinasi honeymoon paling favorit di Lombok.",
    ),
    {
      _key: "honeymoon-gili-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "honeymoon-gili-points-heading-span", _type: "span", marks: [], text: "Kenapa Gili Trawangan cocok untuk honeymoon" }],
    },
    textToBulletBlock("Suasana pulau lebih santai dan terasa intimate untuk pasangan.", "honeymoon-gili-point-1"),
    textToBulletBlock("Sunset dan island vibes sangat kuat untuk momen romantis.", "honeymoon-gili-point-2"),
    textToBulletBlock("Bisa digabungkan dengan paket honeymoon Lombok yang lebih lengkap.", "honeymoon-gili-point-3"),
  ];
}

function wisataSenggigiLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "senggigi-lombok-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "senggigi-lombok-heading-span", _type: "span", marks: [], text: "Wisata Senggigi Lombok untuk sunset, hotel, dan basecamp trip" }],
    },
    ...textToPortableBlocks(
      "Wisata Senggigi Lombok cocok untuk wisatawan yang mencari area menginap strategis, sunset yang mudah dinikmati, dan akses yang nyaman ke banyak titik perjalanan di Lombok barat. Area ini populer untuk keluarga, pasangan, dan tamu yang ingin basecamp stabil.",
      "Senggigi juga menarik karena kombinasi hotel, restoran, dan kedekatannya dengan jalur perjalanan menuju Gili atau destinasi lain di Lombok barat.",
    ),
    {
      _key: "senggigi-lombok-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "senggigi-lombok-points-heading-span", _type: "span", marks: [], text: "Hal yang paling sering dicari wisatawan" }],
    },
    textToBulletBlock("Sunset dan area pantai yang mudah diakses.", "senggigi-lombok-point-1"),
    textToBulletBlock("Pilihan hotel dan restoran yang nyaman untuk beberapa hari.", "senggigi-lombok-point-2"),
    textToBulletBlock("Posisi strategis untuk basecamp sebelum lanjut ke Gili atau Lombok barat.", "senggigi-lombok-point-3"),
  ];
}

function wisataPinkBeachLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "pink-beach-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "pink-beach-heading-span", _type: "span", marks: [], text: "Wisata Pink Beach Lombok untuk trip pantai timur yang berbeda" }],
    },
    ...textToPortableBlocks(
      "Wisata Pink Beach Lombok cocok untuk wisatawan yang ingin pengalaman pantai yang berbeda dari area Lombok selatan atau Gili. Destinasi ini terkenal karena visual pantai yang unik, suasana lebih tenang, dan pengalaman trip timur Lombok yang terasa spesial.",
      "Pink Beach sering dipilih untuk day trip, island experience ringan, atau variasi itinerary bagi tamu yang ingin melihat sisi Lombok yang lebih hidden gem.",
    ),
    {
      _key: "pink-beach-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "pink-beach-points-heading-span", _type: "span", marks: [], text: "Kenapa Pink Beach layak masuk itinerary" }],
    },
    textToBulletBlock("Visual pantainya berbeda dan kuat untuk dokumentasi perjalanan.", "pink-beach-point-1"),
    textToBulletBlock("Cocok untuk wisatawan yang ingin variasi selain area selatan atau Gili.", "pink-beach-point-2"),
    textToBulletBlock("Bisa diarahkan sebagai day trip dengan ritme yang lebih private.", "pink-beach-point-3"),
  ];
}

function rentalHiaceLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "hiace-rental-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "hiace-rental-heading-span", _type: "span", marks: [], text: "Rental Hiace Lombok untuk rombongan dan perjalanan yang nyaman" }],
    },
    ...textToPortableBlocks(
      "Rental Hiace Lombok cocok untuk rombongan keluarga, group trip, outing kantor, dan wisatawan yang membutuhkan kapasitas lebih besar selama perjalanan. Armada ini banyak dipilih untuk transfer bandara, city tour, dan trip beberapa hari di Lombok.",
      "Dengan kapasitas yang lebih lega dan ritme perjalanan yang lebih nyaman untuk grup, Hiace menjadi salah satu pilihan transport paling relevan untuk tamu yang ingin mobilitas tetap efisien tanpa harus memecah kendaraan.",
    ),
    {
      _key: "hiace-rental-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "hiace-rental-points-heading-span", _type: "span", marks: [], text: "Kapan rental Hiace paling dibutuhkan" }],
    },
    textToBulletBlock("Untuk rombongan keluarga atau group trip dengan peserta lebih banyak.", "hiace-rental-point-1"),
    textToBulletBlock("Untuk airport transfer grup agar perjalanan lebih praktis.", "hiace-rental-point-2"),
    textToBulletBlock("Untuk trip wisata beberapa hari yang butuh kendaraan lebih lega.", "hiace-rental-point-3"),
  ];
}

function sewaAlphardLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "alphard-rental-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "alphard-rental-heading-span", _type: "span", marks: [], text: "Sewa Alphard Lombok untuk trip premium yang lebih nyaman" }],
    },
    ...textToPortableBlocks(
      "Sewa Alphard Lombok cocok untuk tamu yang mencari kenyamanan lebih tinggi selama perjalanan di Lombok. Layanan ini sering dipilih untuk tamu VIP, pasangan honeymoon, airport service premium, dan perjalanan bisnis yang membutuhkan kendaraan representatif.",
      "Dengan suasana kabin yang lebih eksklusif dan pengalaman perjalanan yang lebih tenang, Alphard memberi nilai tambah bagi tamu yang memprioritaskan kenyamanan dan kesan premium selama trip.",
    ),
    {
      _key: "alphard-rental-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "alphard-rental-points-heading-span", _type: "span", marks: [], text: "Kapan Alphard paling relevan dipilih" }],
    },
    textToBulletBlock("Untuk tamu VIP atau perjalanan bisnis yang butuh kendaraan representatif.", "alphard-rental-point-1"),
    textToBulletBlock("Untuk honeymoon atau private trip yang ingin kenyamanan lebih premium.", "alphard-rental-point-2"),
    textToBulletBlock("Untuk airport transfer dengan pengalaman jemput yang lebih eksklusif.", "alphard-rental-point-3"),
  ];
}

function paketWisataLombokDariBandungFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "bandung-package-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "bandung-package-heading-span", _type: "span", marks: [], text: "Paket wisata Lombok dari Bandung untuk trip yang lebih praktis" }],
    },
    ...textToPortableBlocks(
      "Paket wisata Lombok dari Bandung cocok untuk wisatawan yang ingin semua detail perjalanan lebih jelas sejak sebelum keberangkatan. Biasanya tamu membutuhkan gambaran durasi, hotel, transport, dan fokus destinasi agar proses booking lebih cepat dan terarah.",
      "Layanan seperti ini relevan untuk pasangan, keluarga, dan grup kecil dari Bandung yang ingin itinerary Lombok yang mudah dikonsultasikan dan siap dijalankan tanpa banyak revisi di akhir.",
    ),
    {
      _key: "bandung-package-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "bandung-package-points-heading-span", _type: "span", marks: [], text: "Hal yang perlu disiapkan sebelum booking" }],
    },
    textToBulletBlock("Tentukan tanggal perjalanan dan jumlah peserta sejak awal.", "bandung-package-point-1"),
    textToBulletBlock("Pilih fokus trip apakah ke Gili, pantai selatan, atau kombinasi keduanya.", "bandung-package-point-2"),
    textToBulletBlock("Pastikan detail hotel dan transport dibahas sejak konsultasi awal.", "bandung-package-point-3"),
  ];
}

function tourLombokDariBaliFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "bali-tour-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "bali-tour-heading-span", _type: "span", marks: [], text: "Tour Lombok dari Bali untuk liburan yang praktis dan terarah" }],
    },
    ...textToPortableBlocks(
      "Tour Lombok dari Bali banyak dicari wisatawan yang ingin menambah Lombok sebagai kelanjutan perjalanan dari Bali. Biasanya kebutuhan utamanya adalah itinerary yang jelas, durasi yang realistis, dan alur perjalanan yang mudah dipahami sejak awal.",
      "Karena pola perjalanan dari Bali ke Lombok sering membutuhkan penyesuaian waktu dan akses, layanan yang responsif sangat penting agar trip tetap efisien dan tidak terasa merepotkan.",
    ),
    {
      _key: "bali-tour-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "bali-tour-points-heading-span", _type: "span", marks: [], text: "Kenapa artikel ini relevan untuk tamu dari Bali" }],
    },
    textToBulletBlock("Membantu memilih durasi trip yang paling realistis setelah perjalanan dari Bali.", "bali-tour-point-1"),
    textToBulletBlock("Memudahkan konsultasi transport, hotel, dan fokus destinasi sejak awal.", "bali-tour-point-2"),
    textToBulletBlock("Cocok untuk short escape maupun lanjutan trip yang lebih panjang.", "bali-tour-point-3"),
  ];
}

function wisataBukitMereseLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "merese-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "merese-heading-span", _type: "span", marks: [], text: "Wisata Bukit Merese Lombok untuk sunset dan view pantai selatan" }],
    },
    ...textToPortableBlocks(
      "Wisata Bukit Merese Lombok menjadi salah satu destinasi paling populer di area selatan karena view bukitnya sangat kuat untuk menikmati sunset, panorama garis pantai, dan suasana short escape yang ringan namun visual.",
      "Bukit Merese sering digabungkan dengan Kuta Lombok dan pantai selatan lainnya dalam itinerary satu hari karena aksesnya relatif nyaman dan cocok untuk first timer, pasangan, maupun keluarga.",
    ),
    {
      _key: "merese-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "merese-points-heading-span", _type: "span", marks: [], text: "Kenapa Bukit Merese sering masuk itinerary" }],
    },
    textToBulletBlock("Sunset dan viewpoint-nya sangat kuat untuk pengalaman visual.", "merese-point-1"),
    textToBulletBlock("Mudah dikombinasikan dengan Kuta Lombok dan pantai sekitar.", "merese-point-2"),
    textToBulletBlock("Cocok untuk short escape, pasangan, dan first timer.", "merese-point-3"),
  ];
}

function wisataRinjaniLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "rinjani-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "rinjani-heading-span", _type: "span", marks: [], text: "Wisata Rinjani Lombok untuk trip alam dan view pegunungan ikonik" }],
    },
    ...textToPortableBlocks(
      "Wisata Rinjani Lombok cocok untuk tamu yang ingin melihat sisi Lombok yang berbeda dari pantai dan Gili. Nama Rinjani sangat kuat untuk wisata alam, view pegunungan, udara sejuk, dan pengalaman perjalanan yang lebih adventure.",
      "Tidak semua wisatawan datang untuk trekking penuh, tetapi banyak yang tetap tertarik pada area dan citra Rinjani sebagai bagian dari pengalaman alam Lombok yang ikonik.",
    ),
    {
      _key: "rinjani-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "rinjani-points-heading-span", _type: "span", marks: [], text: "Kenapa Rinjani menarik untuk wisata Lombok" }],
    },
    textToBulletBlock("Menawarkan citra alam dan pegunungan yang sangat kuat.", "rinjani-point-1"),
    textToBulletBlock("Cocok untuk wisatawan yang mencari variasi selain pantai.", "rinjani-point-2"),
    textToBulletBlock("Bisa diarahkan untuk trip alam, adventure, atau eksplorasi Lombok yang lebih beragam.", "rinjani-point-3"),
  ];
}

function sewaFortunerLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "fortuner-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "fortuner-heading-span", _type: "span", marks: [], text: "Sewa Fortuner Lombok untuk trip premium yang lebih tangguh" }],
    },
    ...textToPortableBlocks(
      "Sewa Fortuner Lombok cocok untuk tamu yang menginginkan kendaraan nyaman dengan kesan premium selama perjalanan di Lombok. Armada ini relevan untuk private trip, tamu VIP, perjalanan keluarga, dan wisatawan yang ingin mobilitas lebih leluasa selama eksplorasi.",
      "Fortuner sering dipilih karena memberikan perpaduan antara kenyamanan, kabin yang lega, dan tampilan kendaraan yang lebih kuat untuk perjalanan wisata, airport transfer, maupun aktivitas bisnis di Lombok.",
    ),
    {
      _key: "fortuner-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "fortuner-points-heading-span", _type: "span", marks: [], text: "Kapan Fortuner paling cocok dipilih" }],
    },
    textToBulletBlock("Untuk private trip yang ingin kenyamanan dan kesan premium.", "fortuner-point-1"),
    textToBulletBlock("Untuk tamu keluarga atau bisnis yang butuh kendaraan lega dan representatif.", "fortuner-point-2"),
    textToBulletBlock("Untuk perjalanan bandara, city tour, dan trip beberapa hari di Lombok.", "fortuner-point-3"),
  ];
}

function sewaAvanzaLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "avanza-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "avanza-heading-span", _type: "span", marks: [], text: "Sewa Avanza Lombok untuk liburan praktis dan nyaman" }],
    },
    ...textToPortableBlocks(
      "Sewa Avanza Lombok menjadi pilihan populer untuk pasangan, keluarga kecil, dan wisatawan yang ingin kendaraan praktis selama liburan. Armada ini cocok untuk city tour, jemput bandara, perjalanan hotel, dan eksplorasi Lombok dengan ritme santai.",
      "Karena irit, nyaman, dan fleksibel dipakai di banyak kebutuhan perjalanan, Avanza sering menjadi opsi sewa mobil yang aman untuk tamu yang ingin perjalanan efisien tanpa harus mengambil kendaraan yang terlalu besar.",
    ),
    {
      _key: "avanza-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "avanza-points-heading-span", _type: "span", marks: [], text: "Kenapa Avanza sering dipilih wisatawan" }],
    },
    textToBulletBlock("Cocok untuk pasangan, keluarga kecil, dan city tour harian.", "avanza-point-1"),
    textToBulletBlock("Nyaman untuk jemput bandara, hotel transfer, dan perjalanan wisata ringan.", "avanza-point-2"),
    textToBulletBlock("Memberi solusi transport yang praktis dan lebih fleksibel untuk banyak kebutuhan.", "avanza-point-3"),
  ];
}

function paketTourLombokMurahFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "cheap-tour-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-tour-heading-span", _type: "span", marks: [], text: "Paket tour Lombok murah yang tetap nyaman untuk liburan" }],
    },
    ...textToPortableBlocks(
      "Paket tour Lombok murah banyak dicari wisatawan yang ingin perjalanan tetap nyaman dengan biaya yang lebih terjangkau. Fokus utamanya biasanya pada itinerary yang realistis, fasilitas penting yang tetap aman, dan pengalaman wisata yang tetap menyenangkan.",
      "Paket murah yang baik bukan berarti asal menekan harga, tetapi menyusun rute, durasi, transport, dan kebutuhan dasar tamu agar tetap efisien tanpa membuat liburan terasa terburu-buru atau melelahkan.",
    ),
    {
      _key: "cheap-tour-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "cheap-tour-points-heading-span", _type: "span", marks: [], text: "Yang perlu diperhatikan saat memilih paket murah" }],
    },
    textToBulletBlock("Pastikan itinerary tetap realistis dan tidak terlalu padat.", "cheap-tour-point-1"),
    textToBulletBlock("Periksa fasilitas utama seperti transport, hotel, dan makan.", "cheap-tour-point-2"),
    textToBulletBlock("Utamakan value perjalanan, bukan hanya harga paling rendah.", "cheap-tour-point-3"),
  ];
}

function openTripLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "open-trip-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "open-trip-heading-span", _type: "span", marks: [], text: "Open trip Lombok untuk liburan praktis dan lebih hemat" }],
    },
    ...textToPortableBlocks(
      "Open trip Lombok cocok untuk wisatawan yang ingin liburan lebih hemat tanpa harus menyiapkan rombongan sendiri. Model perjalanan ini biasanya menarik untuk solo traveler, pasangan, atau tamu yang ingin itinerary populer dengan biaya yang lebih efisien.",
      "Dengan format sharing trip, tamu tetap bisa menikmati destinasi utama Lombok sambil mendapatkan ritme perjalanan yang sudah disusun lebih praktis oleh tim perjalanan.",
    ),
    {
      _key: "open-trip-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "open-trip-points-heading-span", _type: "span", marks: [], text: "Kenapa open trip sering dipilih" }],
    },
    textToBulletBlock("Lebih hemat untuk tamu yang tidak membawa rombongan sendiri.", "open-trip-point-1"),
    textToBulletBlock("Cocok untuk solo traveler, pasangan, atau tamu yang ingin gabung trip.", "open-trip-point-2"),
    textToBulletBlock("Itinerary populer sudah disusun lebih praktis dan mudah diikuti.", "open-trip-point-3"),
  ];
}

function wisataDesaSadeLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "sade-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "sade-heading-span", _type: "span", marks: [], text: "Wisata Desa Sade Lombok untuk pengalaman budaya Sasak" }],
    },
    ...textToPortableBlocks(
      "Wisata Desa Sade Lombok menjadi pilihan menarik bagi tamu yang ingin melihat sisi budaya lokal selama liburan di Lombok. Desa ini dikenal sebagai salah satu spot yang sering masuk itinerary area selatan karena memberi pengalaman yang berbeda dari pantai dan bukit.",
      "Bagi banyak wisatawan, Desa Sade memberi kesempatan untuk mengenal suasana kampung tradisional Sasak, melihat elemen budaya lokal, dan menambah variasi perjalanan agar trip terasa lebih lengkap.",
    ),
    {
      _key: "sade-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "sade-points-heading-span", _type: "span", marks: [], text: "Kenapa Desa Sade layak masuk itinerary" }],
    },
    textToBulletBlock("Memberi pengalaman budaya lokal yang berbeda dari pantai dan Gili.", "sade-point-1"),
    textToBulletBlock("Mudah dikombinasikan dengan Kuta Lombok dan area selatan lainnya.", "sade-point-2"),
    textToBulletBlock("Cocok untuk wisatawan yang ingin trip lebih lengkap dan beragam.", "sade-point-3"),
  ];
}

function wisataTanjungAanLombokFallbackContent(): PortableTextNode[] {
  return [
    {
      _key: "aan-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "aan-heading-span", _type: "span", marks: [], text: "Wisata Tanjung Aan Lombok untuk pantai cantik dan short escape" }],
    },
    ...textToPortableBlocks(
      "Wisata Tanjung Aan Lombok selalu menjadi salah satu favorit untuk area selatan karena pantainya luas, pasirnya menarik, dan suasananya cocok untuk short escape. Destinasi ini sering dipilih first timer yang ingin menikmati pantai cantik dengan akses yang relatif mudah.",
      "Tanjung Aan juga mudah digabungkan dengan Bukit Merese dan area Kuta Lombok, sehingga sangat relevan sebagai bagian dari itinerary satu hari atau setengah hari yang santai.",
    ),
    {
      _key: "aan-points-heading",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: "aan-points-heading-span", _type: "span", marks: [], text: "Alasan Tanjung Aan disukai wisatawan" }],
    },
    textToBulletBlock("Pantainya cantik, nyaman, dan cocok untuk menikmati suasana santai.", "aan-point-1"),
    textToBulletBlock("Mudah digabungkan dengan Bukit Merese dan Kuta Lombok.", "aan-point-2"),
    textToBulletBlock("Cocok untuk first timer, pasangan, dan keluarga yang ingin short escape.", "aan-point-3"),
  ];
}

function fallbackServices(): ServiceItem[] {
  return featuredServices.map((item) => ({
    ...item,
    slug: item.href.replace("/", ""),
    category:
      item.href === "/paket-honeymoon-lombok"
        ? "honeymoon"
        : item.href === "/sewa-mobil-lombok"
          ? "transport"
          : "tour",
    content: textToPortableBlocks(item.summary),
    heroNote: "",
    ctaMessage: "",
    gallery: [],
    faqs: [],
    mainImage: null,
  }));
}

function fallbackDestinations(): DestinationItem[] {
  return featuredDestinations.map((item) => {
    const details = destinationPages[item.slug as keyof typeof destinationPages];
    const isGili = item.slug === "gili-trawangan";
    const isKuta = item.slug === "kuta-mandalika";
    const isSenggigi = item.slug === "senggigi";

    return {
      ...item,
      title: details?.title || item.name,
      content: isGili
        ? giliTrawanganFallbackContent()
        : isKuta
          ? kutaMandalikaFallbackContent()
          : isSenggigi
            ? senggigiFallbackContent()
            : textToPortableBlocks(
                details?.description || `${item.name} adalah destinasi unggulan Lombok yang cocok menjadi inspirasi perjalanan dan referensi trip untuk tamu.`,
              ),
      recommendations: isGili
        ? [
            "Gili Trawangan cocok digabungkan dengan paket 3D2N atau 4D3N agar ritme perjalanan terasa lebih lengkap.",
            "Pilihan ini juga menarik untuk pasangan yang ingin suasana lebih romantis dan private.",
            "Transport menuju pelabuhan bisa disiapkan agar perjalanan terasa lebih praktis sejak awal.",
          ]
        : isKuta
          ? [
              "Kuta Mandalika cocok dipilih jika Anda ingin menjelajahi pantai selatan Lombok dalam satu perjalanan.",
              "Sewa mobil bisa menjadi pilihan nyaman untuk tamu yang ingin beach hopping lebih fleksibel.",
              "Area ini juga cocok dimasukkan ke itinerary honeymoon karena punya sunset spot dan resort area yang menarik.",
            ]
          : isSenggigi
            ? [
                "Senggigi nyaman dijadikan area menginap untuk itinerary beberapa hari yang lebih santai.",
                "Sewa mobil bisa membantu perjalanan Anda lebih fleksibel saat menjelajahi Lombok barat.",
                "Destinasi ini juga cocok digabungkan dengan trip ke Gili Trawangan untuk pengalaman laut dan sunset sekaligus.",
              ]
            : [
                "Pilih paket wisata yang paling sesuai dengan area dan durasi perjalanan Anda.",
                "Pertimbangkan transport tambahan agar perjalanan lebih nyaman.",
                "Lengkapi rencana trip dengan destinasi lain yang searah.",
              ],
      ctaMessage: `Halo, saya ingin trip ke ${item.name}.`,
      metaDescription: isGili
        ? "Panduan wisata Gili Trawangan untuk snorkeling, sunset, honeymoon, cara akses, dan rekomendasi trip dari Lombok."
        : isKuta
          ? "Panduan wisata Kuta Mandalika untuk pantai selatan, sunset, akses dari bandara, dan itinerary short escape di Lombok."
          : isSenggigi
            ? "Panduan wisata Senggigi untuk sunset, hotel, kuliner, area menginap, dan itinerary Lombok barat."
            : details?.description,
      seoTitle: isGili
        ? "Wisata Gili Trawangan | Snorkeling, Sunset, Honeymoon, dan Island Escape"
        : isKuta
          ? "Wisata Kuta Mandalika | Pantai Selatan, Sunset, dan Short Escape Lombok"
          : isSenggigi
            ? "Wisata Senggigi | Sunset, Hotel, Kuliner, dan Basecamp Lombok Barat"
            : details?.title,
      keywords: isGili
        ? ["gili trawangan", "wisata gili trawangan", "trip gili trawangan", "honeymoon gili trawangan"]
        : isKuta
          ? ["wisata mandalika", "kuta mandalika", "pantai selatan lombok", "wisata kuta lombok"]
          : isSenggigi
            ? ["wisata senggigi", "senggigi lombok", "hotel senggigi", "sunset senggigi"]
            : [item.name.toLowerCase(), "wisata lombok", item.category.toLowerCase()],
      gallery: [],
      faqs: isGili
        ? [
            {
              question: "Kapan waktu terbaik ke Gili Trawangan?",
              answer: "Musim kemarau umumnya paling nyaman untuk snorkeling, island hopping, dan aktivitas laut, tetapi itinerary ke Gili Trawangan masih bisa disesuaikan sepanjang tahun.",
            },
            {
              question: "Apakah destinasi ini cocok untuk honeymoon?",
              answer: "Ya. Gili Trawangan sangat cocok untuk pasangan karena banyak pilihan sunset spot dan private trip.",
            },
            {
              question: "Apakah lebih baik day trip atau menginap?",
              answer: "Keduanya bisa. Day trip cocok untuk itinerary singkat, sedangkan menginap memberi waktu lebih leluasa menikmati sunset dan suasana malam di pulau.",
            },
          ]
        : isKuta
          ? [
              {
                question: "Apakah Mandalika dekat dari bandara?",
                answer: "Ya. Mandalika termasuk area yang relatif dekat dari bandara sehingga cocok untuk short escape.",
              },
              {
                question: "Aktivitas apa yang paling sering dipilih?",
                answer: "Pantai hopping, sunset, kuliner, dan kombinasi dengan Bukit Merese atau Tanjung Aan.",
              },
              {
                question: "Apakah Kuta Mandalika cocok untuk keluarga?",
                answer: "Cocok. Area ini relatif mudah diakses dan punya banyak pilihan spot yang nyaman untuk family trip.",
              },
            ]
          : isSenggigi
            ? [
                {
                  question: "Apa keunggulan utama Senggigi?",
                  answer: "Keunggulan utama Senggigi adalah lokasi strategis, banyak hotel, dan akses mudah ke Lombok barat serta Gili.",
                },
                {
                  question: "Apakah cocok untuk menginap keluarga?",
                  answer: "Cocok. Senggigi punya banyak opsi hotel, restoran, dan akses transport yang nyaman.",
                },
                {
                  question: "Apakah Senggigi cocok dijadikan basecamp beberapa hari?",
                  answer: "Ya. Senggigi termasuk area yang nyaman untuk basecamp karena aksesnya relatif mudah ke banyak titik perjalanan.",
                },
              ]
            : [
                {
                  question: `Apa aktivitas utama di ${item.name}?`,
                  answer: `Aktivitas utama di ${item.name} bisa diisi sesuai intent wisata yang paling relevan di halaman destinasi ini.`,
                },
              ],
      mainImage: null,
    };
  });
}

function fallbackArticles(): ArticleItem[] {
  return latestArticles.map((item) => {
    const details = articlePages[item.slug as keyof typeof articlePages];
    const isPlaces = item.slug === "tempat-wisata-di-lombok";
    const isCarPrice = item.slug === "harga-sewa-mobil-lombok";
    const isItinerary = item.slug === "itinerary-lombok-3-hari";

    return {
      ...item,
      description: isPlaces
        ? "Panduan tempat wisata di Lombok untuk first timer, mulai dari Gili Trawangan, Kuta Mandalika, Senggigi, pantai, bukit, hingga air terjun yang paling sering masuk itinerary."
        : isCarPrice
          ? "Informasi harga sewa mobil Lombok, faktor yang memengaruhi tarif, tips memilih armada, dan cara menentukan layanan transport yang paling sesuai untuk trip Anda."
          : isItinerary
            ? "Panduan itinerary Lombok 3 hari 2 malam untuk first timer dengan rute efisien, pilihan area wisata yang realistis, dan tips menyusun trip yang tetap nyaman."
            : details?.description || item.excerpt,
      content: isPlaces
        ? tempatWisataLombokFallbackContent()
        : isCarPrice
          ? hargaSewaMobilLombokFallbackContent()
          : isItinerary
            ? itineraryLombok3HariFallbackContent()
            : textToPortableBlocks(
                "Panduan perjalanan ini akan segera dilengkapi dengan informasi utama, tips, dan rekomendasi trip yang paling relevan untuk tamu.",
                "Sambil menunggu pembaruan lengkap, Anda tetap bisa melihat pilihan paket, transport, dan destinasi lain yang tersedia di LombokAdvisor.",
              ),
      relatedLinks: isPlaces
        ? ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"]
        : isCarPrice
          ? ["/sewa-mobil-lombok", "/paket-wisata-lombok"]
          : isItinerary
            ? ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"]
            : ["/paket-wisata-lombok", "/sewa-mobil-lombok", "/paket-honeymoon-lombok"],
      ctaMessage: isCarPrice
        ? "Halo, saya ingin tanya harga sewa mobil Lombok."
        : isItinerary
          ? "Halo, saya ingin itinerary Lombok 3 hari 2 malam."
          : "Halo, saya ingin itinerary wisata Lombok.",
      metaDescription: isPlaces
        ? "Daftar tempat wisata di Lombok untuk first timer, lengkap dengan rekomendasi itinerary, tips, dan paket trip terkait."
        : isCarPrice
          ? "Informasi harga sewa mobil Lombok, pilihan armada, tips memilih driver, dan rekomendasi rental terbaik."
          : isItinerary
            ? "Itinerary Lombok 3 hari 2 malam dengan rute efisien, rekomendasi destinasi, dan opsi paket wisata terkait."
            : details?.description || item.excerpt,
      seoTitle: isPlaces
        ? "10 Tempat Wisata di Lombok | Panduan Destinasi Terbaik"
        : isCarPrice
          ? "Harga Sewa Mobil Lombok | Tips Memilih Armada dan Driver"
          : isItinerary
            ? "Itinerary Lombok 3 Hari 2 Malam | Rute Efisien Untuk First Timer"
            : details?.title || item.title,
      keywords: isPlaces
        ? ["tempat wisata di lombok", "wisata lombok", "destinasi lombok"]
        : isCarPrice
          ? ["harga sewa mobil lombok", "rental mobil lombok murah", "sewa hiace lombok"]
          : isItinerary
            ? ["itinerary lombok 3 hari", "tour lombok 3 hari 2 malam", "trip lombok 3d2n"]
            : [item.category.toLowerCase(), "blog wisata lombok", "travel lombok"],
      gallery: [],
      faqs: isPlaces
        ? [
            {
              question: "Berapa lama ideal liburan pertama ke Lombok?",
              answer: "Durasi ideal untuk first timer biasanya 3 hari 2 malam sampai 4 hari 3 malam.",
            },
            {
              question: "Apakah semua destinasi bisa digabung dalam satu trip?",
              answer: "Tidak selalu. Pilihan destinasi sebaiknya dibagi berdasarkan area agar itinerary tetap realistis.",
            },
          ]
        : isCarPrice
          ? [
              {
                question: "Kenapa harga sewa mobil bisa berbeda?",
                answer: "Harga bisa berbeda tergantung jenis armada, durasi, area penjemputan, dan apakah termasuk driver atau tidak.",
              },
              {
                question: "Apakah sewa mobil lebih cocok daripada ikut tour?",
                answer: "Untuk tamu yang ingin fleksibel dan punya itinerary sendiri, sewa mobil biasanya lebih cocok.",
              },
            ]
          : isItinerary
            ? [
                {
                  question: "Apakah 3 hari cukup untuk melihat Lombok?",
                  answer: "Cukup untuk first timer selama rutenya fokus dan tidak terlalu banyak pindah area.",
                },
                {
                  question: "Perlu menginap di area mana?",
                  answer: "Area menginap bisa dipilih berdasarkan fokus trip, misalnya Senggigi untuk Lombok barat atau Kuta Mandalika untuk pantai selatan.",
                },
              ]
            : [
                {
                  question: `Artikel ${item.title} ini cocok untuk siapa?`,
                  answer: "Artikel ini cocok untuk calon wisatawan yang masih mencari referensi awal sebelum memilih paket atau rencana perjalanan yang paling sesuai.",
                },
              ],
      mainImage: null,
    };
  });
}

function fallbackArticleBySlug(slug: string): ArticleItem | null {
  const details = articlePages[slug as keyof typeof articlePages];

  if (!details) {
    return null;
  }

  const isPlaces = slug === "tempat-wisata-di-lombok";
  const isCarPrice = slug === "harga-sewa-mobil-lombok";
  const isItinerary = slug === "itinerary-lombok-3-hari";
  const isCheapPackage = slug === "paket-wisata-lombok-murah";
  const isTour3d2n = slug === "tour-lombok-3-hari-2-malam";
  const isTripGili = slug === "trip-gili-trawangan";
  const isJakartaPackage = slug === "paket-wisata-lombok-dari-jakarta";
  const isCheapRental = slug === "rental-mobil-lombok-murah";
  const isNonGili = slug === "tempat-wisata-di-lombok-selain-gili";
  const isCheapHoneymoon = slug === "paket-honeymoon-lombok-murah";
  const isDriverRental = slug === "sewa-mobil-lombok-plus-driver";
  const isPackage4d3n = slug === "paket-wisata-lombok-4-hari-3-malam";
  const isKutaLombok = slug === "wisata-kuta-lombok";
  const isSurabayaPackage = slug === "paket-wisata-lombok-dari-surabaya";
  const isGiliTour = slug === "tour-gili-trawangan-dari-lombok";
  const isPackage3d2n = slug === "paket-wisata-lombok-3-hari-2-malam";
  const isPackage2d1n = slug === "paket-wisata-lombok-2-hari-1-malam";
  const isAirportRental = slug === "sewa-mobil-bandara-lombok";
  const isHoneymoonGili = slug === "honeymoon-gili-trawangan";
  const isSenggigiLombok = slug === "wisata-senggigi-lombok";
  const isPinkBeachLombok = slug === "wisata-pink-beach-lombok";
  const isRentalHiace = slug === "rental-hiace-lombok";
  const isSewaAlphard = slug === "sewa-alphard-lombok";
  const isBandungPackage = slug === "paket-wisata-lombok-dari-bandung";
  const isBaliTour = slug === "tour-lombok-dari-bali";
  const isBukitMerese = slug === "wisata-bukit-merese-lombok";
  const isRinjaniLombok = slug === "wisata-rinjani-lombok";
  const isFortunerRental = slug === "sewa-fortuner-lombok";
  const isAvanzaRental = slug === "sewa-avanza-lombok";
  const isCheapTourPackage = slug === "paket-tour-lombok-murah";
  const isOpenTrip = slug === "open-trip-lombok";
  const isDesaSade = slug === "wisata-desa-sade-lombok";
  const isTanjungAan = slug === "wisata-tanjung-aan-lombok";

  return {
    title: details.title,
    slug,
    category: details.category,
    excerpt: isFortunerRental
      ? "Panduan sewa Fortuner Lombok untuk private trip, tamu premium, dan perjalanan yang nyaman."
      : isAvanzaRental
        ? "Panduan sewa Avanza Lombok untuk liburan praktis, city tour, dan kebutuhan transport yang fleksibel."
        : isCheapTourPackage
          ? "Panduan memilih paket tour Lombok murah yang tetap nyaman, rapi, dan realistis untuk liburan."
          : isOpenTrip
            ? "Panduan open trip Lombok untuk tamu yang ingin liburan lebih hemat dan praktis."
            : isDesaSade
              ? "Panduan wisata Desa Sade Lombok untuk pengalaman budaya Sasak yang mudah masuk itinerary."
              : isTanjungAan
                ? "Panduan wisata Tanjung Aan Lombok untuk pantai cantik, short escape, dan itinerary area selatan."
                : isRentalHiace
      ? "Panduan rental Hiace Lombok untuk rombongan, family trip, dan perjalanan yang lebih nyaman."
      : isSewaAlphard
        ? "Panduan sewa Alphard Lombok untuk tamu premium, honeymoon, dan perjalanan yang lebih eksklusif."
        : isBandungPackage
          ? "Panduan untuk wisatawan Bandung yang ingin paket wisata Lombok yang praktis dan mudah dikonsultasikan."
          : isBaliTour
            ? "Panduan tour Lombok dari Bali untuk wisatawan yang ingin itinerary praktis dan durasi trip yang realistis."
            : isBukitMerese
              ? "Panduan wisata Bukit Merese Lombok untuk sunset, viewpoint, dan short escape pantai selatan."
              : isRinjaniLombok
                ? "Panduan wisata Rinjani Lombok untuk view alam, pegunungan, dan eksplorasi sisi berbeda dari Lombok."
                : isPackage3d2n
      ? "Panduan paket wisata Lombok 3 hari 2 malam untuk first timer yang ingin itinerary efisien dan tetap nyaman."
      : isPackage2d1n
        ? "Panduan paket wisata Lombok 2 hari 1 malam untuk short escape yang ringkas, praktis, dan tetap nyaman."
        : isAirportRental
          ? "Panduan sewa mobil bandara Lombok untuk jemput hotel, transfer area wisata, dan perjalanan yang lebih praktis."
          : isHoneymoonGili
            ? "Panduan honeymoon Gili Trawangan untuk pasangan yang mencari sunset, island vibes, dan liburan romantis."
            : isSenggigiLombok
              ? "Panduan wisata Senggigi Lombok untuk sunset, hotel, dan area menginap strategis di Lombok barat."
              : isPinkBeachLombok
                ? "Panduan wisata Pink Beach Lombok untuk trip pantai timur yang unik, tenang, dan cocok jadi variasi itinerary."
                : isCheapHoneymoon
      ? "Panduan memilih paket honeymoon Lombok murah yang tetap romantis, nyaman, dan cocok untuk pasangan."
      : isDriverRental
        ? "Panduan sewa mobil Lombok plus driver untuk transfer, city tour, dan perjalanan wisata yang lebih praktis."
        : isPackage4d3n
          ? "Panduan paket wisata Lombok 4 hari 3 malam untuk trip yang lebih lengkap, santai, dan tetap efisien."
          : isKutaLombok
            ? "Panduan wisata Kuta Lombok untuk menikmati pantai selatan, sunset, dan short escape yang mudah diakses."
            : isSurabayaPackage
              ? "Panduan untuk wisatawan Surabaya yang ingin paket wisata Lombok yang praktis dan mudah dikonsultasikan."
              : isGiliTour
                ? "Panduan tour Gili Trawangan dari Lombok untuk day trip atau menginap, lengkap dengan tips perjalanan."
                : isCheapPackage
      ? "Panduan memilih paket wisata Lombok murah dengan itinerary tetap realistis, nyaman, dan cocok untuk first timer."
      : isTour3d2n
        ? "Pilihan tour Lombok 3 hari 2 malam untuk first timer yang ingin itinerary efisien dan tetap nyaman."
        : isTripGili
          ? "Panduan trip Gili Trawangan dari Lombok untuk day trip atau menginap, lengkap dengan akses dan tips."
          : isJakartaPackage
            ? "Panduan untuk wisatawan Jakarta yang ingin paket wisata Lombok yang mudah dikonsultasikan dan efisien."
            : isCheapRental
              ? "Panduan rental mobil Lombok murah untuk city tour, transfer, dan perjalanan fleksibel dengan driver."
              : isNonGili
                ? "Alternatif tempat wisata di Lombok selain Gili untuk wisatawan yang ingin fokus ke pantai, bukit, Senggigi, dan daratan Lombok."
                : isPlaces
                  ? "Panduan destinasi inti untuk first-timer yang ingin menggabungkan pantai, budaya, dan spot sunset di Lombok."
                  : isCarPrice
                    ? "Panduan ringkas membandingkan city car, MPV, hingga Hiace untuk kebutuhan trip yang berbeda di Lombok."
                    : "Rangkaian itinerary singkat dengan fokus rute efisien dan kombinasi destinasi paling aman untuk lead.",
    description: isFortunerRental
      ? "Informasi sewa Fortuner Lombok untuk private trip, perjalanan keluarga, tamu premium, dan mobilitas yang lebih nyaman di Lombok."
      : isAvanzaRental
        ? "Informasi sewa Avanza Lombok untuk city tour, jemput bandara, keluarga kecil, dan perjalanan wisata yang praktis."
        : isCheapTourPackage
          ? "Informasi paket tour Lombok murah untuk wisatawan yang mencari value terbaik dengan itinerary tetap nyaman dan realistis."
          : isOpenTrip
            ? "Informasi open trip Lombok untuk solo traveler, pasangan, atau tamu yang ingin sharing trip dengan biaya lebih hemat."
            : isDesaSade
              ? "Informasi wisata Desa Sade Lombok untuk pengalaman budaya Sasak, suasana kampung tradisional, dan kombinasi trip area selatan."
              : isTanjungAan
                ? "Informasi wisata Tanjung Aan Lombok untuk pantai selatan, short escape santai, dan itinerary Kuta Lombok yang lebih lengkap."
                : isRentalHiace
      ? "Informasi rental Hiace Lombok untuk rombongan, airport transfer, city tour, dan trip beberapa hari dengan kendaraan yang lebih lega."
      : isSewaAlphard
        ? "Informasi sewa Alphard Lombok untuk tamu VIP, honeymoon, airport service premium, dan perjalanan yang mengutamakan kenyamanan."
        : isBandungPackage
          ? "Informasi paket wisata Lombok dari Bandung untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sebelum keberangkatan."
          : isBaliTour
            ? "Informasi tour Lombok dari Bali untuk wisatawan yang membutuhkan durasi trip realistis, alur perjalanan jelas, dan itinerary yang efisien."
            : isBukitMerese
              ? "Informasi wisata Bukit Merese Lombok untuk sunset, viewpoint, pantai selatan, dan short escape yang mudah dikombinasikan."
              : isRinjaniLombok
                ? "Informasi wisata Rinjani Lombok untuk trip alam, view pegunungan, udara sejuk, dan pengalaman Lombok yang lebih adventure."
                : isPackage3d2n
      ? "Panduan paket wisata Lombok 3 hari 2 malam dengan gambaran itinerary, kelebihan durasi 3D2N, dan pilihan trip yang efisien untuk first timer."
      : isPackage2d1n
        ? "Panduan paket wisata Lombok 2 hari 1 malam untuk wisatawan yang ingin short escape praktis dengan itinerary ringkas dan tetap nyaman."
        : isAirportRental
          ? "Informasi sewa mobil bandara Lombok untuk jemput bandara, transfer hotel, dan layanan driver yang memudahkan perjalanan sejak hari pertama."
          : isHoneymoonGili
            ? "Informasi honeymoon Gili Trawangan untuk pasangan yang ingin suasana romantis, sunset, island stay, dan trip yang lebih private."
            : isSenggigiLombok
              ? "Informasi wisata Senggigi Lombok untuk sunset, hotel, kuliner, area menginap, dan basecamp trip yang nyaman di Lombok barat."
              : isPinkBeachLombok
                ? "Informasi wisata Pink Beach Lombok untuk pantai timur, visual unik, day trip, dan pengalaman hidden gem yang berbeda dari destinasi utama lainnya."
                : isCheapHoneymoon
      ? "Panduan paket honeymoon Lombok murah untuk pasangan yang ingin liburan romantis dengan itinerary nyaman, hotel yang sesuai, dan budget yang lebih terkontrol."
      : isDriverRental
        ? "Informasi sewa mobil Lombok plus driver, termasuk manfaat driver lokal, area layanan, dan tips memilih transport yang lebih praktis selama liburan."
        : isPackage4d3n
          ? "Panduan paket wisata Lombok 4 hari 3 malam dengan gambaran itinerary, kelebihan durasi 4D3N, dan pilihan trip yang lebih lengkap untuk first timer."
          : isKutaLombok
            ? "Informasi wisata Kuta Lombok untuk pantai selatan, sunset, akses dari bandara, dan itinerary short escape yang nyaman."
            : isSurabayaPackage
              ? "Informasi paket wisata Lombok dari Surabaya untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sebelum keberangkatan."
              : isGiliTour
                ? "Informasi tour Gili Trawangan dari Lombok, mulai dari akses, aktivitas, pilihan day trip atau menginap, dan cara merencanakan perjalanan yang lebih nyaman."
                : isCheapPackage
      ? "Panduan paket wisata Lombok murah untuk wisatawan yang ingin trip hemat namun tetap nyaman, dengan tips memilih itinerary, fasilitas, dan value paket."
      : isTour3d2n
        ? "Panduan tour Lombok 3 hari 2 malam dengan gambaran itinerary, kelebihan durasi 3D2N, dan tips memilih paket yang paling cocok."
        : isTripGili
          ? "Informasi trip Gili Trawangan dari Lombok, mulai dari akses, pilihan aktivitas, day trip vs menginap, dan cara merencanakan perjalanan yang lebih praktis."
          : isJakartaPackage
            ? "Informasi paket wisata Lombok dari Jakarta untuk pasangan, keluarga, dan grup kecil yang ingin itinerary praktis sejak sebelum keberangkatan."
            : isCheapRental
              ? "Informasi rental mobil Lombok murah dengan driver, termasuk tips memilih armada, area jemput, dan cara mendapat layanan yang tetap nyaman."
              : isNonGili
                ? "Panduan tempat wisata di Lombok selain Gili, termasuk pantai selatan, bukit sunset, Senggigi, dan destinasi daratan lain yang cocok untuk itinerary yang lebih seimbang."
                : isPlaces
                  ? "Panduan tempat wisata di Lombok untuk first timer, mulai dari Gili Trawangan, Kuta Mandalika, Senggigi, pantai, bukit, hingga air terjun yang paling sering masuk itinerary."
                  : isCarPrice
                    ? "Informasi harga sewa mobil Lombok, faktor yang memengaruhi tarif, tips memilih armada, dan cara menentukan layanan transport yang paling sesuai untuk trip Anda."
                    : "Panduan itinerary Lombok 3 hari 2 malam untuk first timer dengan rute efisien, pilihan area wisata yang realistis, dan tips menyusun trip yang tetap nyaman.",
    content: isFortunerRental
      ? sewaFortunerLombokFallbackContent()
      : isAvanzaRental
        ? sewaAvanzaLombokFallbackContent()
        : isCheapTourPackage
          ? paketTourLombokMurahFallbackContent()
          : isOpenTrip
            ? openTripLombokFallbackContent()
            : isDesaSade
              ? wisataDesaSadeLombokFallbackContent()
              : isTanjungAan
                ? wisataTanjungAanLombokFallbackContent()
                : isRentalHiace
      ? rentalHiaceLombokFallbackContent()
      : isSewaAlphard
        ? sewaAlphardLombokFallbackContent()
        : isBandungPackage
          ? paketWisataLombokDariBandungFallbackContent()
          : isBaliTour
            ? tourLombokDariBaliFallbackContent()
            : isBukitMerese
              ? wisataBukitMereseLombokFallbackContent()
              : isRinjaniLombok
                ? wisataRinjaniLombokFallbackContent()
                : isPackage3d2n
      ? paketWisataLombok3Hari2MalamFallbackContent()
      : isPackage2d1n
        ? paketWisataLombok2Hari1MalamFallbackContent()
        : isAirportRental
          ? sewaMobilBandaraLombokFallbackContent()
          : isHoneymoonGili
            ? honeymoonGiliTrawanganFallbackContent()
            : isSenggigiLombok
              ? wisataSenggigiLombokFallbackContent()
              : isPinkBeachLombok
                ? wisataPinkBeachLombokFallbackContent()
                : isCheapHoneymoon
      ? paketHoneymoonLombokMurahFallbackContent()
      : isDriverRental
        ? sewaMobilLombokPlusDriverFallbackContent()
        : isPackage4d3n
          ? paketWisataLombok4Hari3MalamFallbackContent()
          : isKutaLombok
            ? wisataKutaLombokFallbackContent()
            : isSurabayaPackage
              ? paketWisataLombokDariSurabayaFallbackContent()
              : isGiliTour
                ? tourGiliTrawanganDariLombokFallbackContent()
                : isCheapPackage
      ? paketWisataLombokMurahFallbackContent()
      : isTour3d2n
        ? tourLombok3Hari2MalamFallbackContent()
        : isTripGili
          ? tripGiliTrawanganFallbackContent()
          : isJakartaPackage
            ? paketWisataLombokDariJakartaFallbackContent()
            : isCheapRental
              ? rentalMobilLombokMurahFallbackContent()
              : isNonGili
                ? tempatWisataLombokSelainGiliFallbackContent()
                : isPlaces
                  ? tempatWisataLombokFallbackContent()
                  : isCarPrice
                    ? hargaSewaMobilLombokFallbackContent()
                    : itineraryLombok3HariFallbackContent(),
    relatedLinks: isFortunerRental
      ? ["/sewa-mobil-lombok", "/paket-wisata-lombok", "/blog/sewa-mobil-lombok-plus-driver"]
      : isAvanzaRental
        ? ["/sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/paket-wisata-lombok"]
        : isCheapTourPackage
          ? ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-murah", "/sewa-mobil-lombok"]
          : isOpenTrip
            ? ["/paket-wisata-lombok", "/blog/trip-gili-trawangan", "/wisata/kuta-mandalika"]
            : isDesaSade
              ? ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"]
              : isTanjungAan
                ? ["/wisata/kuta-mandalika", "/blog/wisata-bukit-merese-lombok", "/paket-wisata-lombok"]
                : isRentalHiace
      ? ["/sewa-mobil-lombok", "/blog/sewa-mobil-bandara-lombok", "/paket-wisata-lombok"]
      : isSewaAlphard
        ? ["/sewa-mobil-lombok", "/paket-honeymoon-lombok", "/blog/sewa-mobil-bandara-lombok"]
        : isBandungPackage
          ? ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-3-hari-2-malam", "/paket-honeymoon-lombok"]
          : isBaliTour
            ? ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-2-hari-1-malam", "/wisata/kuta-mandalika"]
            : isBukitMerese
              ? ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"]
              : isRinjaniLombok
                ? ["/paket-wisata-lombok", "/wisata/senggigi", "/sewa-mobil-lombok"]
                : isPackage3d2n
      ? ["/paket-wisata-lombok", "/blog/itinerary-lombok-3-hari", "/wisata/gili-trawangan"]
      : isPackage2d1n
        ? ["/paket-wisata-lombok", "/wisata/kuta-mandalika", "/sewa-mobil-lombok"]
        : isAirportRental
          ? ["/sewa-mobil-lombok", "/blog/sewa-mobil-lombok-plus-driver", "/wisata/kuta-mandalika"]
          : isHoneymoonGili
            ? ["/paket-honeymoon-lombok", "/wisata/gili-trawangan", "/blog/tour-gili-trawangan-dari-lombok"]
            : isSenggigiLombok
              ? ["/wisata/senggigi", "/sewa-mobil-lombok", "/paket-wisata-lombok"]
              : isPinkBeachLombok
                ? ["/paket-wisata-lombok", "/wisata/kuta-mandalika", "/sewa-mobil-lombok"]
                : isCheapHoneymoon
      ? ["/paket-honeymoon-lombok", "/blog/paket-wisata-lombok-4-hari-3-malam", "/wisata/gili-trawangan"]
      : isDriverRental
        ? ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/wisata/kuta-mandalika"]
        : isPackage4d3n
          ? ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/wisata/gili-trawangan"]
          : isKutaLombok
            ? ["/wisata/kuta-mandalika", "/paket-wisata-lombok", "/sewa-mobil-lombok"]
            : isSurabayaPackage
              ? ["/paket-wisata-lombok", "/blog/paket-wisata-lombok-4-hari-3-malam", "/paket-honeymoon-lombok"]
              : isGiliTour
                ? ["/wisata/gili-trawangan", "/paket-wisata-lombok", "/paket-honeymoon-lombok"]
                : isCheapPackage
      ? ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/sewa-mobil-lombok"]
      : isTour3d2n
        ? ["/paket-wisata-lombok", "/blog/itinerary-lombok-3-hari", "/wisata/gili-trawangan"]
        : isTripGili
          ? ["/wisata/gili-trawangan", "/paket-wisata-lombok", "/paket-honeymoon-lombok"]
          : isJakartaPackage
            ? ["/paket-wisata-lombok", "/blog/tour-lombok-3-hari-2-malam", "/paket-honeymoon-lombok"]
            : isCheapRental
              ? ["/sewa-mobil-lombok", "/blog/harga-sewa-mobil-lombok", "/paket-wisata-lombok"]
              : isNonGili
                ? ["/wisata/kuta-mandalika", "/wisata/senggigi", "/paket-wisata-lombok"]
                : isPlaces
                  ? ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"]
                  : isCarPrice
                    ? ["/sewa-mobil-lombok", "/paket-wisata-lombok"]
                    : ["/paket-wisata-lombok", "/wisata/gili-trawangan", "/wisata/kuta-mandalika"],
    ctaMessage: isFortunerRental
      ? "Halo, saya ingin sewa Fortuner Lombok."
      : isAvanzaRental
        ? "Halo, saya ingin sewa Avanza Lombok."
        : isCheapTourPackage
          ? "Halo, saya ingin tanya paket tour Lombok murah."
          : isOpenTrip
            ? "Halo, saya ingin ikut open trip Lombok."
            : isDesaSade
              ? "Halo, saya ingin trip ke Desa Sade Lombok."
              : isTanjungAan
                ? "Halo, saya ingin trip ke Tanjung Aan Lombok."
                : isRentalHiace
      ? "Halo, saya ingin rental Hiace Lombok."
      : isSewaAlphard
        ? "Halo, saya ingin sewa Alphard Lombok."
        : isBandungPackage
          ? "Halo, saya ingin paket wisata Lombok dari Bandung."
          : isBaliTour
            ? "Halo, saya ingin tour Lombok dari Bali."
            : isBukitMerese
              ? "Halo, saya ingin trip ke Bukit Merese Lombok."
              : isRinjaniLombok
                ? "Halo, saya ingin trip wisata Rinjani Lombok."
                : isPackage3d2n
      ? "Halo, saya ingin paket wisata Lombok 3 hari 2 malam."
      : isPackage2d1n
        ? "Halo, saya ingin paket wisata Lombok 2 hari 1 malam."
        : isAirportRental
          ? "Halo, saya ingin sewa mobil dari bandara Lombok."
          : isHoneymoonGili
            ? "Halo, saya ingin honeymoon ke Gili Trawangan."
            : isSenggigiLombok
              ? "Halo, saya ingin trip ke Senggigi Lombok."
              : isPinkBeachLombok
                ? "Halo, saya ingin trip ke Pink Beach Lombok."
                : isCheapHoneymoon
      ? "Halo, saya ingin tanya paket honeymoon Lombok murah."
      : isDriverRental
        ? "Halo, saya ingin sewa mobil Lombok plus driver."
        : isPackage4d3n
          ? "Halo, saya ingin paket wisata Lombok 4 hari 3 malam."
          : isKutaLombok
            ? "Halo, saya ingin trip ke Kuta Lombok."
            : isSurabayaPackage
              ? "Halo, saya ingin paket wisata Lombok dari Surabaya."
              : isGiliTour
                ? "Halo, saya ingin tour Gili Trawangan dari Lombok."
                : isCheapPackage
      ? "Halo, saya ingin tanya paket wisata Lombok murah."
      : isTour3d2n
        ? "Halo, saya ingin tour Lombok 3 hari 2 malam."
        : isTripGili
          ? "Halo, saya ingin trip ke Gili Trawangan."
          : isJakartaPackage
            ? "Halo, saya ingin paket wisata Lombok dari Jakarta."
            : isCheapRental
              ? "Halo, saya ingin rental mobil Lombok murah."
              : isNonGili
                ? "Halo, saya ingin itinerary Lombok selain Gili."
                : isCarPrice
                  ? "Halo, saya ingin tanya harga sewa mobil Lombok."
                  : isItinerary
                    ? "Halo, saya ingin itinerary Lombok 3 hari 2 malam."
                    : "Halo, saya ingin itinerary wisata Lombok.",
    seoTitle: isFortunerRental
      ? "Sewa Fortuner Lombok untuk Trip Premium yang Lebih Tangguh"
      : isAvanzaRental
        ? "Sewa Avanza Lombok untuk Liburan Praktis dan Nyaman"
        : isCheapTourPackage
          ? "Paket Tour Lombok Murah yang Tetap Nyaman untuk Liburan"
          : isOpenTrip
            ? "Open Trip Lombok untuk Liburan Praktis dan Lebih Hemat"
            : isDesaSade
              ? "Wisata Desa Sade Lombok untuk Pengalaman Budaya Sasak"
              : isTanjungAan
                ? "Wisata Tanjung Aan Lombok untuk Pantai Cantik dan Short Escape"
                : isRentalHiace
      ? "Rental Hiace Lombok untuk Rombongan dan Perjalanan yang Nyaman"
      : isSewaAlphard
        ? "Sewa Alphard Lombok untuk Trip Premium yang Lebih Nyaman"
        : isBandungPackage
          ? "Paket Wisata Lombok dari Bandung untuk Trip yang Lebih Praktis"
          : isBaliTour
            ? "Tour Lombok dari Bali untuk Liburan yang Praktis dan Terarah"
            : isBukitMerese
              ? "Wisata Bukit Merese Lombok untuk Sunset dan View Pantai Selatan"
              : isRinjaniLombok
                ? "Wisata Rinjani Lombok untuk Trip Alam dan View Pegunungan Ikonik"
                : isPackage3d2n
      ? "Paket Wisata Lombok 3 Hari 2 Malam untuk Liburan yang Efisien"
      : isPackage2d1n
        ? "Paket Wisata Lombok 2 Hari 1 Malam untuk Short Escape yang Praktis"
        : isAirportRental
          ? "Sewa Mobil Bandara Lombok untuk Jemput dan Trip yang Lebih Praktis"
          : isHoneymoonGili
            ? "Honeymoon Gili Trawangan untuk Liburan Romantis di Pulau Favorit"
            : isSenggigiLombok
              ? "Wisata Senggigi Lombok untuk Sunset, Hotel, dan Basecamp Trip"
              : isPinkBeachLombok
                ? "Wisata Pink Beach Lombok untuk Trip Pantai Timur yang Berbeda"
                : isCheapHoneymoon
      ? "Paket Honeymoon Lombok Murah yang Tetap Nyaman untuk Pasangan"
      : isDriverRental
        ? "Sewa Mobil Lombok Plus Driver untuk Trip yang Lebih Praktis"
        : isPackage4d3n
          ? "Paket Wisata Lombok 4 Hari 3 Malam untuk Liburan yang Lebih Lengkap"
          : isKutaLombok
            ? "Wisata Kuta Lombok untuk Pantai Selatan dan Sunset Terbaik"
            : isSurabayaPackage
              ? "Paket Wisata Lombok dari Surabaya untuk Trip yang Praktis"
              : isGiliTour
                ? "Tour Gili Trawangan dari Lombok untuk Day Trip atau Menginap"
                : isCheapPackage
      ? "Paket Wisata Lombok Murah yang Tetap Nyaman untuk Liburan"
      : isTour3d2n
        ? "Tour Lombok 3 Hari 2 Malam untuk Liburan yang Efisien"
        : isTripGili
          ? "Trip Gili Trawangan dari Lombok: Panduan Akses, Aktivitas, dan Tips"
          : isJakartaPackage
            ? "Paket Wisata Lombok dari Jakarta untuk Trip yang Lebih Praktis"
            : isCheapRental
              ? "Rental Mobil Lombok Murah dengan Driver untuk Trip yang Fleksibel"
              : isNonGili
                ? "Tempat Wisata di Lombok Selain Gili yang Layak Masuk Itinerary"
                : isPlaces
                  ? "10 Tempat Wisata di Lombok | Panduan Destinasi Terbaik"
                  : isCarPrice
                    ? "Harga Sewa Mobil Lombok | Tips Memilih Armada dan Driver"
                    : "Itinerary Lombok 3 Hari 2 Malam | Rute Efisien Untuk First Timer",
    metaDescription: isFortunerRental
      ? "Cari sewa Fortuner Lombok? Simak panduan kendaraan premium untuk private trip, keluarga, dan perjalanan yang lebih nyaman di Lombok."
      : isAvanzaRental
        ? "Cari sewa Avanza Lombok? Simak panduan kendaraan praktis untuk city tour, jemput bandara, dan liburan keluarga kecil."
        : isCheapTourPackage
          ? "Cari paket tour Lombok murah? Simak tips memilih paket yang tetap nyaman, itinerary realistis, dan value terbaik untuk liburan."
          : isOpenTrip
            ? "Cari open trip Lombok? Simak panduan sharing trip yang lebih hemat, praktis, dan cocok untuk solo traveler maupun pasangan."
            : isDesaSade
              ? "Cari wisata Desa Sade Lombok? Simak panduan trip budaya Sasak dan kombinasi itinerary yang cocok di area selatan Lombok."
              : isTanjungAan
                ? "Cari wisata Tanjung Aan Lombok? Simak panduan pantai cantik, short escape santai, dan itinerary terbaik di area selatan."
                : isRentalHiace
      ? "Cari rental Hiace Lombok? Simak panduan armada untuk rombongan, transfer bandara, dan trip yang lebih nyaman selama di Lombok."
      : isSewaAlphard
        ? "Cari sewa Alphard Lombok? Simak layanan premium untuk tamu VIP, honeymoon, airport service, dan perjalanan yang lebih eksklusif."
        : isBandungPackage
          ? "Cari paket wisata Lombok dari Bandung? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis."
          : isBaliTour
            ? "Cari tour Lombok dari Bali? Simak gambaran durasi, alur perjalanan, dan itinerary Lombok yang lebih efisien."
            : isBukitMerese
              ? "Cari wisata Bukit Merese Lombok? Simak panduan sunset, viewpoint, dan short escape terbaik di area pantai selatan."
              : isRinjaniLombok
                ? "Cari wisata Rinjani Lombok? Simak panduan trip alam, view pegunungan, dan pengalaman Lombok yang lebih adventure."
                : isPackage3d2n
      ? "Cari paket wisata Lombok 3 hari 2 malam? Simak gambaran itinerary, kelebihan durasi 3D2N, dan tips memilih trip yang efisien untuk first timer."
      : isPackage2d1n
        ? "Cari paket wisata Lombok 2 hari 1 malam? Simak tips memilih short escape yang tetap nyaman, ringkas, dan realistis."
        : isAirportRental
          ? "Cari sewa mobil bandara Lombok? Simak manfaat jemput bandara, transfer hotel, dan layanan driver yang praktis untuk liburan Anda."
          : isHoneymoonGili
            ? "Cari honeymoon Gili Trawangan? Simak inspirasi trip romantis dengan sunset, island vibes, dan suasana private untuk pasangan."
            : isSenggigiLombok
              ? "Cari wisata Senggigi Lombok? Simak panduan sunset, hotel, kuliner, dan basecamp trip yang nyaman di Lombok barat."
              : isPinkBeachLombok
                ? "Cari wisata Pink Beach Lombok? Simak panduan trip pantai timur, visual unik, dan pengalaman hidden gem yang berbeda."
                : isCheapHoneymoon
      ? "Cari paket honeymoon Lombok murah? Simak tips memilih trip romantis yang tetap nyaman, realistis, dan sesuai budget pasangan."
      : isDriverRental
        ? "Cari sewa mobil Lombok plus driver? Simak manfaat driver lokal, area layanan, dan tips memilih transport yang nyaman untuk liburan Anda."
        : isPackage4d3n
          ? "Cari paket wisata Lombok 4 hari 3 malam? Simak gambaran itinerary, kelebihan durasi 4D3N, dan tips memilih trip yang lebih lengkap."
          : isKutaLombok
            ? "Cari wisata Kuta Lombok? Simak panduan pantai selatan, sunset, akses bandara, dan itinerary short escape yang nyaman."
            : isSurabayaPackage
              ? "Cari paket wisata Lombok dari Surabaya? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis."
              : isGiliTour
                ? "Panduan tour Gili Trawangan dari Lombok, lengkap dengan akses, aktivitas, pilihan day trip atau menginap, dan tips perjalanan."
                : isCheapPackage
      ? "Cari paket wisata Lombok murah? Simak tips memilih paket yang tetap nyaman, itinerary realistis, dan cocok untuk first timer maupun keluarga."
      : isTour3d2n
        ? "Panduan tour Lombok 3 hari 2 malam untuk first timer, lengkap dengan gambaran itinerary, highlight trip, dan tips memilih paket."
        : isTripGili
          ? "Panduan trip Gili Trawangan dari Lombok, lengkap dengan akses, aktivitas, pilihan day trip atau menginap, dan tips perjalanan."
          : isJakartaPackage
            ? "Cari paket wisata Lombok dari Jakarta? Simak pilihan durasi, tips booking, dan cara memilih trip yang paling praktis untuk liburan Anda."
            : isCheapRental
              ? "Cari rental mobil Lombok murah? Simak tips memilih armada, driver, dan layanan transport yang tetap nyaman untuk liburan Anda."
              : isNonGili
                ? "Cari tempat wisata di Lombok selain Gili? Simak rekomendasi pantai selatan, bukit, Senggigi, dan destinasi daratan lain yang layak masuk itinerary."
                : isPlaces
                  ? "Daftar tempat wisata di Lombok untuk first timer, lengkap dengan rekomendasi itinerary, tips, dan paket trip terkait."
                  : isCarPrice
                    ? "Informasi harga sewa mobil Lombok, pilihan armada, tips memilih driver, dan rekomendasi rental terbaik."
                    : "Itinerary Lombok 3 hari 2 malam dengan rute efisien, rekomendasi destinasi, dan opsi paket wisata terkait.",
    keywords: isFortunerRental
      ? ["sewa fortuner lombok", "rental fortuner lombok", "fortuner lombok", "mobil premium lombok"]
      : isAvanzaRental
        ? ["sewa avanza lombok", "rental avanza lombok", "avanza lombok", "mobil keluarga lombok"]
        : isCheapTourPackage
          ? ["paket tour lombok murah", "tour lombok murah", "paket wisata murah lombok", "liburan murah lombok"]
          : isOpenTrip
            ? ["open trip lombok", "trip sharing lombok", "open trip wisata lombok", "open trip gili lombok"]
            : isDesaSade
              ? ["wisata desa sade lombok", "desa sade lombok", "budaya sasak lombok", "trip desa sade"]
              : isTanjungAan
                ? ["wisata tanjung aan lombok", "tanjung aan lombok", "pantai tanjung aan", "trip tanjung aan"]
                : isRentalHiace
      ? ["rental hiace lombok", "sewa hiace lombok", "hiace lombok", "hiace untuk rombongan lombok"]
      : isSewaAlphard
        ? ["sewa alphard lombok", "rental alphard lombok", "alphard lombok", "alphard premium lombok"]
        : isBandungPackage
          ? ["paket wisata lombok dari bandung", "tour lombok dari bandung", "travel lombok dari bandung"]
          : isBaliTour
            ? ["tour lombok dari bali", "paket wisata lombok dari bali", "trip lombok dari bali"]
            : isBukitMerese
              ? ["wisata bukit merese lombok", "bukit merese", "sunset bukit merese", "viewpoint lombok selatan"]
              : isRinjaniLombok
                ? ["wisata rinjani lombok", "rinjani lombok", "trip rinjani lombok", "wisata alam lombok"]
                : isPackage3d2n
      ? ["paket wisata lombok 3 hari 2 malam", "paket tour lombok 3 hari 2 malam", "trip lombok 3d2n"]
      : isPackage2d1n
        ? ["paket wisata lombok 2 hari 1 malam", "paket tour lombok 2d1n", "trip lombok 2 hari 1 malam"]
        : isAirportRental
          ? ["sewa mobil bandara lombok", "rental mobil bandara lombok", "jemput bandara lombok", "driver bandara lombok"]
          : isHoneymoonGili
            ? ["honeymoon gili trawangan", "bulan madu gili trawangan", "paket honeymoon gili", "trip romantis gili trawangan"]
            : isSenggigiLombok
              ? ["wisata senggigi lombok", "senggigi lombok", "hotel senggigi", "sunset senggigi"]
              : isPinkBeachLombok
                ? ["wisata pink beach lombok", "pink beach lombok", "trip pink beach lombok", "pantai pink lombok"]
                : isCheapHoneymoon
      ? ["paket honeymoon lombok murah", "honeymoon lombok murah", "paket bulan madu lombok murah", "honeymoon lombok"]
      : isDriverRental
        ? ["sewa mobil lombok plus driver", "rental mobil lombok dengan driver", "driver lombok", "sewa mobil lombok"]
        : isPackage4d3n
          ? ["paket wisata lombok 4 hari 3 malam", "paket tour lombok 4d3n", "trip lombok 4 hari 3 malam"]
          : isKutaLombok
            ? ["wisata kuta lombok", "kuta lombok", "pantai selatan lombok", "wisata mandalika"]
            : isSurabayaPackage
              ? ["paket wisata lombok dari surabaya", "tour lombok dari surabaya", "travel lombok dari surabaya"]
              : isGiliTour
                ? ["tour gili trawangan dari lombok", "trip gili trawangan dari lombok", "day trip gili trawangan"]
                : isCheapPackage
      ? ["paket wisata lombok murah", "tour lombok murah", "paket tour lombok murah", "travel lombok murah"]
      : isTour3d2n
        ? ["tour lombok 3 hari 2 malam", "paket wisata lombok 3 hari 2 malam", "trip lombok 3d2n"]
        : isTripGili
          ? ["trip gili trawangan", "wisata gili trawangan", "day trip gili trawangan", "honeymoon gili trawangan"]
          : isJakartaPackage
            ? ["paket wisata lombok dari jakarta", "tour lombok dari jakarta", "travel lombok dari jakarta"]
            : isCheapRental
              ? ["rental mobil lombok murah", "sewa mobil lombok murah", "rental mobil lombok", "driver lombok"]
              : isNonGili
                ? ["tempat wisata di lombok selain gili", "wisata lombok selain gili", "destinasi lombok selain gili"]
                : isPlaces
                  ? ["tempat wisata di lombok", "wisata lombok", "destinasi lombok"]
                  : isCarPrice
                    ? ["harga sewa mobil lombok", "rental mobil lombok murah", "sewa hiace lombok"]
                    : ["itinerary lombok 3 hari", "tour lombok 3 hari 2 malam", "trip lombok 3d2n"],
    gallery: [],
    faqs: isFortunerRental
      ? [
          {
            question: "Kapan sewa Fortuner Lombok paling cocok dipilih?",
            answer: "Fortuner cocok untuk private trip, keluarga, tamu premium, dan perjalanan yang membutuhkan kendaraan nyaman serta representatif.",
          },
          {
            question: "Apakah Fortuner cocok untuk wisata keluarga?",
            answer: "Ya, Fortuner cocok untuk keluarga kecil yang ingin kendaraan nyaman dengan kabin lega selama trip di Lombok.",
          },
          {
            question: "Apakah Fortuner bisa dipakai untuk airport transfer?",
            answer: "Bisa, Fortuner relevan untuk jemput bandara, perjalanan hotel, maupun city tour yang mengutamakan kenyamanan.",
          },
        ]
      : isAvanzaRental
        ? [
            {
              question: "Siapa yang paling cocok memilih sewa Avanza Lombok?",
              answer: "Avanza cocok untuk pasangan, keluarga kecil, city tour, dan tamu yang ingin kendaraan praktis selama liburan di Lombok.",
            },
            {
              question: "Apakah Avanza cocok untuk jemput bandara?",
              answer: "Ya, Avanza sangat cocok untuk jemput bandara, hotel transfer, dan perjalanan harian yang santai.",
            },
            {
              question: "Kenapa Avanza sering dipilih wisatawan?",
              answer: "Karena nyaman, praktis, fleksibel, dan cocok untuk banyak kebutuhan perjalanan selama liburan di Lombok.",
            },
          ]
        : isCheapTourPackage
          ? [
              {
                question: "Apakah paket tour Lombok murah tetap bisa nyaman?",
                answer: "Bisa, selama itinerary disusun realistis dan fasilitas utama seperti transport, hotel, serta alur perjalanan tetap diperhatikan.",
              },
              {
                question: "Apa yang paling penting saat memilih paket murah?",
                answer: "Utamakan value perjalanan, ritme trip yang nyaman, dan detail fasilitas yang jelas sejak awal.",
              },
              {
                question: "Siapa yang cocok memilih paket tour murah?",
                answer: "Cocok untuk first timer, pasangan, keluarga, atau grup kecil yang ingin liburan lebih hemat namun tetap rapi.",
              },
            ]
          : isOpenTrip
            ? [
                {
                  question: "Siapa yang cocok ikut open trip Lombok?",
                  answer: "Open trip cocok untuk solo traveler, pasangan, atau tamu yang ingin liburan hemat tanpa membawa rombongan sendiri.",
                },
                {
                  question: "Apa kelebihan open trip dibanding private trip?",
                  answer: "Kelebihannya ada pada efisiensi biaya dan itinerary yang sudah disusun praktis untuk tujuan populer.",
                },
                {
                  question: "Apakah open trip tetap nyaman untuk first timer?",
                  answer: "Ya, open trip tetap nyaman untuk first timer selama ritme perjalanan sesuai dan kebutuhan utama sudah dijelaskan sejak awal.",
                },
              ]
            : isDesaSade
              ? [
                  {
                    question: "Kenapa Desa Sade menarik untuk wisatawan?",
                    answer: "Karena Desa Sade memberi pengalaman budaya lokal Sasak yang berbeda dari pantai, bukit, dan Gili.",
                  },
                  {
                    question: "Apakah Desa Sade mudah digabungkan dengan itinerary lain?",
                    answer: "Ya, Desa Sade mudah dikombinasikan dengan Kuta Lombok dan destinasi area selatan lainnya.",
                  },
                  {
                    question: "Siapa yang cocok mengunjungi Desa Sade?",
                    answer: "Cocok untuk wisatawan yang ingin perjalanan lebih lengkap dengan sentuhan budaya lokal selama di Lombok.",
                  },
                ]
              : isTanjungAan
                ? [
                    {
                      question: "Kenapa Tanjung Aan populer untuk wisata Lombok?",
                      answer: "Karena pantainya cantik, suasananya nyaman, dan cocok untuk short escape di area selatan Lombok.",
                    },
                    {
                      question: "Apakah Tanjung Aan cocok untuk first timer?",
                      answer: "Cocok, terutama untuk tamu yang ingin menikmati pantai selatan dengan akses yang relatif mudah.",
                    },
                    {
                      question: "Destinasi apa yang sering digabungkan dengan Tanjung Aan?",
                      answer: "Biasanya Tanjung Aan digabungkan dengan Bukit Merese dan area Kuta Lombok dalam satu itinerary.",
                    },
                  ]
                : isRentalHiace
      ? [
          {
            question: "Kapan rental Hiace Lombok paling cocok dipakai?",
            answer: "Rental Hiace paling cocok untuk rombongan keluarga, group trip, airport transfer grup, dan perjalanan beberapa hari di Lombok.",
          },
          {
            question: "Apakah Hiace cocok untuk wisata rombongan?",
            answer: "Sangat cocok karena kapasitasnya lebih lega dan memudahkan grup tetap bersama selama perjalanan.",
          },
          {
            question: "Apakah Hiace bisa untuk jemput bandara juga?",
            answer: "Bisa, Hiace sangat relevan untuk jemput bandara rombongan agar perjalanan lebih praktis sejak awal.",
          },
        ]
      : isSewaAlphard
        ? [
            {
              question: "Siapa yang paling cocok memilih sewa Alphard Lombok?",
              answer: "Layanan ini cocok untuk tamu VIP, honeymoon, perjalanan bisnis, dan wisatawan yang ingin kenyamanan premium.",
            },
            {
              question: "Apakah Alphard cocok untuk airport service?",
              answer: "Ya, Alphard sangat cocok untuk airport service premium dengan pengalaman jemput yang lebih eksklusif.",
            },
            {
              question: "Apakah sewa Alphard bisa untuk trip wisata juga?",
              answer: "Bisa, Alphard dapat dipakai untuk private trip, honeymoon, city tour, dan perjalanan wisata yang lebih nyaman.",
            },
          ]
        : isBandungPackage
          ? [
              {
                question: "Kenapa paket wisata Lombok dari Bandung banyak dicari?",
                answer: "Karena wisatawan dari Bandung biasanya ingin semua detail trip lebih jelas sejak sebelum keberangkatan.",
              },
              {
                question: "Durasi apa yang paling sering dipilih?", 
                answer: "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang untuk liburan ke Lombok.",
              },
              {
                question: "Apakah paket bisa disesuaikan untuk keluarga atau pasangan?",
                answer: "Bisa, itinerary dapat diarahkan sesuai kebutuhan family trip, private trip, maupun honeymoon.",
              },
            ]
          : isBaliTour
            ? [
                {
                  question: "Apakah tour Lombok dari Bali cocok untuk short escape?",
                  answer: "Cocok, selama durasi dan fokus trip disusun realistis sesuai waktu perjalanan dari Bali ke Lombok.",
                },
                {
                  question: "Apa yang perlu dipastikan sejak awal?",
                  answer: "Pastikan alur transport, durasi trip, hotel, dan fokus destinasi sudah jelas sejak awal konsultasi.",
                },
                {
                  question: "Destinasi apa yang paling sering dipilih?",
                  answer: "Biasanya wisatawan memilih kombinasi area selatan Lombok, sunset spot, atau paket singkat yang efisien.",
                },
              ]
            : isBukitMerese
              ? [
                  {
                    question: "Kenapa Bukit Merese populer untuk wisata Lombok?",
                    answer: "Karena view bukit dan sunset-nya sangat kuat serta mudah digabungkan dengan area Kuta Lombok dan pantai selatan.",
                  },
                  {
                    question: "Apakah Bukit Merese cocok untuk first timer?",
                    answer: "Cocok, karena aksesnya relatif nyaman dan menjadi salah satu highlight visual paling mudah dinikmati di Lombok selatan.",
                  },
                  {
                    question: "Apakah Bukit Merese cocok untuk short escape?",
                    answer: "Sangat cocok untuk short escape, pasangan, maupun itinerary satu hari di area selatan Lombok.",
                  },
                ]
              : isRinjaniLombok
                ? [
                    {
                      question: "Apakah wisata Rinjani Lombok hanya untuk trekking?",
                      answer: "Tidak selalu. Banyak wisatawan tertarik pada citra alam, suasana pegunungan, dan eksplorasi sisi Lombok yang lebih adventure tanpa harus trekking penuh.",
                    },
                    {
                      question: "Kenapa Rinjani menarik untuk wisata Lombok?",
                      answer: "Karena Rinjani mewakili sisi alam dan pegunungan Lombok yang ikonik bagi wisatawan yang ingin pengalaman berbeda dari pantai dan Gili.",
                    },
                    {
                      question: "Siapa yang cocok tertarik dengan wisata Rinjani?",
                      answer: "Cocok untuk wisatawan yang ingin variasi selain pantai dan tertarik pada alam, view pegunungan, atau trip yang lebih adventure.",
                    },
                  ]
                : isPackage3d2n
      ? [
          {
            question: "Apakah paket wisata Lombok 3 hari 2 malam cocok untuk first timer?",
            answer: "Cocok, karena durasi 3D2N cukup ideal untuk menikmati highlight Lombok tanpa itinerary terlalu padat.",
          },
          {
            question: "Destinasi apa yang biasanya masuk paket 3D2N?",
            answer: "Biasanya mencakup kombinasi area selatan, sunset spot, dan satu highlight utama seperti Gili atau destinasi daratan populer.",
          },
          {
            question: "Siapa yang paling cocok memilih paket ini?",
            answer: "Paket ini cocok untuk pasangan, keluarga, dan wisatawan dari luar kota yang ingin liburan efisien.",
          },
        ]
      : isPackage2d1n
        ? [
            {
              question: "Apakah paket wisata Lombok 2 hari 1 malam tetap worth it?",
              answer: "Tetap worth it, selama itinerary difokuskan ke area yang realistis dan tidak terlalu banyak berpindah destinasi.",
            },
            {
              question: "Trip 2D1N cocok untuk siapa?",
              answer: "Cocok untuk short escape pasangan, keluarga kecil, atau wisatawan yang memiliki waktu sangat terbatas.",
            },
            {
              question: "Area mana yang paling cocok untuk trip singkat ini?",
              answer: "Biasanya area seperti Kuta Lombok atau Lombok barat lebih ideal karena aksesnya lebih efisien.",
            },
          ]
        : isAirportRental
          ? [
              {
                question: "Apakah layanan ini bisa menjemput langsung dari bandara Lombok?",
                answer: "Bisa, layanan sewa mobil bandara Lombok memang dirancang untuk jemput bandara dan transfer perjalanan lanjutan.",
              },
              {
                question: "Apakah bisa langsung lanjut ke hotel atau area wisata?",
                answer: "Bisa, tamu dapat langsung menuju hotel, Mandalika, Senggigi, atau area wisata lain sesuai kebutuhan.",
              },
              {
                question: "Siapa yang paling cocok memakai layanan ini?",
                answer: "Sangat cocok untuk keluarga, pasangan, first timer, dan wisatawan luar kota yang ingin perjalanan lebih praktis sejak tiba.",
              },
            ]
          : isHoneymoonGili
            ? [
                {
                  question: "Apakah Gili Trawangan cocok untuk honeymoon?",
                  answer: "Sangat cocok karena punya suasana pulau yang santai, sunset yang kuat, dan pengalaman yang terasa lebih private untuk pasangan.",
                },
                {
                  question: "Lebih baik honeymoon day trip atau menginap di Gili?",
                  answer: "Menginap biasanya lebih ideal untuk honeymoon karena pasangan bisa menikmati sunset dan suasana malam di pulau dengan lebih santai.",
                },
                {
                  question: "Apakah honeymoon Gili bisa digabung dengan paket Lombok lain?",
                  answer: "Bisa, honeymoon Gili Trawangan sangat cocok dikombinasikan dengan paket honeymoon Lombok yang lebih panjang.",
                },
              ]
            : isSenggigiLombok
              ? [
                  {
                    question: "Apa daya tarik utama wisata Senggigi Lombok?",
                    answer: "Daya tarik utamanya adalah sunset, hotel yang nyaman, kuliner, dan posisinya yang strategis untuk basecamp Lombok barat.",
                  },
                  {
                    question: "Apakah Senggigi cocok untuk keluarga?",
                    answer: "Cocok, karena fasilitas hotel dan akses area cukup nyaman untuk keluarga maupun tamu yang ingin ritme liburan lebih tenang.",
                  },
                  {
                    question: "Apakah Senggigi cocok untuk menginap beberapa hari?",
                    answer: "Ya, banyak wisatawan memilih Senggigi sebagai basecamp karena aksesnya nyaman ke banyak titik perjalanan.",
                  },
                ]
              : isPinkBeachLombok
                ? [
                    {
                      question: "Apa yang membuat Pink Beach Lombok berbeda?",
                      answer: "Pink Beach punya karakter visual yang unik dan memberi pengalaman trip pantai timur yang berbeda dari area wisata Lombok lainnya.",
                    },
                    {
                      question: "Apakah Pink Beach cocok untuk day trip?",
                      answer: "Cocok, Pink Beach sering dipilih sebagai day trip untuk wisatawan yang ingin variasi itinerary dan pengalaman hidden gem.",
                    },
                    {
                      question: "Siapa yang cocok ke Pink Beach Lombok?",
                      answer: "Cocok untuk wisatawan yang ingin eksplor sisi Lombok yang lebih berbeda, tenang, dan kuat secara visual.",
                    },
                  ]
                : isCheapHoneymoon
      ? [
          {
            question: "Apakah paket honeymoon Lombok murah tetap bisa romantis?",
            answer: "Bisa, selama fokus trip, hotel, dan ritme perjalanan disusun dengan tepat sesuai kebutuhan pasangan.",
          },
          {
            question: "Durasi apa yang paling cocok untuk honeymoon hemat?",
            answer: "Biasanya 2D1N atau 3D2N paling banyak dipilih karena tetap nyaman namun budget lebih mudah dikontrol.",
          },
          {
            question: "Apakah paket bisa termasuk hotel dan transport?",
            answer: "Bisa, paket honeymoon dapat disesuaikan dengan hotel, transport, dan kebutuhan perjalanan pasangan.",
          },
        ]
      : isDriverRental
        ? [
            {
              question: "Kenapa memilih sewa mobil plus driver di Lombok?",
              answer: "Karena perjalanan jadi lebih praktis, terutama untuk tamu yang belum familiar dengan rute dan kondisi jalan di Lombok.",
            },
            {
              question: "Apakah layanan ini cocok untuk city tour?",
              answer: "Sangat cocok untuk city tour, beach hopping, transfer bandara, dan perjalanan beberapa hari.",
            },
            {
              question: "Apakah area jemput bisa dari bandara atau hotel?",
              answer: "Bisa, layanan dapat disesuaikan dari bandara, hotel, atau titik jemput lain sesuai kebutuhan perjalanan.",
            },
          ]
        : isPackage4d3n
          ? [
              {
                question: "Apa kelebihan paket wisata 4 hari 3 malam?",
                answer: "Durasi 4D3N memberi waktu lebih leluasa untuk menikmati destinasi Lombok dengan ritme yang lebih santai dan lengkap.",
              },
              {
                question: "Apakah paket 4D3N cocok untuk first timer?",
                answer: "Cocok, terutama untuk wisatawan yang ingin pengalaman Lombok lebih lengkap tanpa itinerary terlalu padat.",
              },
              {
                question: "Destinasi apa saja yang biasanya bisa masuk?",
                answer: "Umumnya dapat mencakup kombinasi Gili, pantai selatan, sunset spot, dan beberapa destinasi daratan lain sesuai fokus trip.",
              },
            ]
          : isKutaLombok
            ? [
                {
                  question: "Apakah Kuta Lombok dekat dari bandara?",
                  answer: "Ya, Kuta Lombok termasuk area yang relatif dekat dari bandara sehingga cocok untuk short escape.",
                },
                {
                  question: "Apa aktivitas paling populer di Kuta Lombok?",
                  answer: "Pantai selatan, beach hopping, sunset, dan liburan santai di area resort atau viewpoint.",
                },
                {
                  question: "Apakah Kuta Lombok cocok untuk keluarga?",
                  answer: "Cocok, karena banyak spot yang mudah diakses dan ritme perjalanannya bisa dibuat lebih ringan.",
                },
              ]
            : isSurabayaPackage
              ? [
                  {
                    question: "Kenapa paket wisata Lombok dari Surabaya banyak dicari?",
                    answer: "Karena wisatawan dari Surabaya biasanya ingin itinerary, hotel, dan transport lebih jelas sejak sebelum keberangkatan.",
                  },
                  {
                    question: "Durasi apa yang paling sering dipilih?",
                    answer: "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang untuk liburan ke Lombok.",
                  },
                  {
                    question: "Apakah paket bisa disesuaikan untuk keluarga atau pasangan?",
                    answer: "Bisa, itinerary dapat diarahkan sesuai kebutuhan family trip, private trip, maupun honeymoon.",
                  },
                ]
              : isGiliTour
                ? [
                    {
                      question: "Apakah tour Gili Trawangan lebih baik day trip atau menginap?",
                      answer: "Tergantung durasi liburan. Day trip cocok untuk waktu singkat, sedangkan menginap memberi pengalaman yang lebih santai.",
                    },
                    {
                      question: "Aktivitas apa yang paling sering dicari di Gili Trawangan?",
                      answer: "Snorkeling, island hopping, sunset, bersepeda keliling pulau, dan honeymoon trip.",
                    },
                    {
                      question: "Apakah tour Gili Trawangan cocok untuk first timer?",
                      answer: "Sangat cocok, terutama untuk wisatawan yang ingin pengalaman pulau yang ikonik dan mudah dikombinasikan dengan itinerary Lombok.",
                    },
                  ]
                : isCheapPackage
      ? [
          {
            question: "Apakah paket wisata Lombok murah tetap bisa nyaman?",
            answer: "Bisa, selama itinerary disusun realistis dan fasilitas utama seperti transport serta ritme perjalanan tetap diperhatikan.",
          },
          {
            question: "Apa yang membuat paket bisa lebih hemat?",
            answer: "Biasanya dipengaruhi oleh durasi, jumlah peserta, pilihan hotel, dan rute destinasi yang dipilih.",
          },
          {
            question: "Apakah paket murah cocok untuk first timer?",
            answer: "Cocok, terutama jika wisatawan ingin perjalanan praktis dengan budget yang lebih terkontrol.",
          },
        ]
      : isTour3d2n
        ? [
            {
              question: "Apakah 3 hari 2 malam cukup untuk tour Lombok?",
              answer: "Cukup untuk first timer selama fokus area wisata dan ritme perjalanan diatur dengan baik.",
            },
            {
              question: "Destinasi apa yang biasanya masuk tour 3D2N?",
              answer: "Umumnya kombinasi area selatan Lombok, sunset spot, dan satu highlight utama seperti Gili Trawangan atau pantai populer.",
            },
            {
              question: "Siapa yang cocok memilih durasi ini?",
              answer: "Durasi ini cocok untuk pasangan, keluarga, dan tamu dari luar kota yang ingin liburan singkat namun tetap lengkap.",
            },
          ]
        : isTripGili
          ? [
              {
                question: "Apakah trip Gili Trawangan lebih baik day trip atau menginap?",
                answer: "Tergantung durasi liburan. Day trip cocok untuk waktu singkat, sementara menginap memberi waktu lebih leluasa menikmati sunset dan suasana pulau.",
              },
              {
                question: "Aktivitas apa yang paling sering dicari di Gili Trawangan?",
                answer: "Snorkeling, island hopping, sunset, bersepeda keliling pulau, dan honeymoon trip.",
              },
              {
                question: "Apakah trip Gili Trawangan cocok untuk first timer?",
                answer: "Sangat cocok, terutama untuk wisatawan yang ingin pengalaman pulau yang paling ikonik di Lombok.",
              },
            ]
          : isJakartaPackage
            ? [
                {
                  question: "Kenapa paket wisata Lombok dari Jakarta banyak dicari?",
                  answer: "Karena wisatawan dari Jakarta biasanya ingin semua detail perjalanan lebih jelas sejak sebelum keberangkatan.",
                },
                {
                  question: "Durasi apa yang paling cocok untuk tamu dari Jakarta?",
                  answer: "Durasi 3 hari 2 malam dan 4 hari 3 malam paling sering dipilih karena cukup seimbang antara waktu dan pengalaman trip.",
                },
                {
                  question: "Apakah paket bisa disesuaikan untuk keluarga atau pasangan?",
                  answer: "Bisa, itinerary dapat diarahkan untuk family trip, private trip, maupun honeymoon.",
                },
              ]
            : isCheapRental
              ? [
                  {
                    question: "Apakah rental mobil Lombok murah tetap bisa nyaman?",
                    answer: "Bisa, selama armada sesuai kebutuhan dan layanan driver atau rute perjalanan dijelaskan sejak awal.",
                  },
                  {
                    question: "Kapan rental murah paling cocok dipakai?",
                    answer: "Biasanya untuk city tour, transfer bandara, perjalanan pasangan, dan keluarga kecil dengan rute yang jelas.",
                  },
                  {
                    question: "Apa yang perlu dicek sebelum booking?",
                    answer: "Pastikan jenis armada, area jemput, durasi penggunaan, dan detail layanan sudah sesuai kebutuhan perjalanan Anda.",
                  },
                ]
              : isNonGili
                ? [
                    {
                      question: "Apakah Lombok tetap menarik tanpa fokus ke Gili?",
                      answer: "Tetap sangat menarik karena Lombok punya banyak destinasi daratan seperti pantai selatan, bukit, Senggigi, dan air terjun.",
                    },
                    {
                      question: "Siapa yang cocok dengan itinerary selain Gili?",
                      answer: "Cocok untuk keluarga, wisatawan yang ingin fokus ke daratan, atau tamu yang ingin rute lebih sederhana.",
                    },
                    {
                      question: "Destinasi apa yang paling sering dipilih selain Gili?",
                      answer: "Biasanya Kuta Mandalika, Bukit Merese, Senggigi, dan beberapa spot pantai selatan atau wisata alam lainnya.",
                    },
                  ]
                : isPlaces
                  ? [
                      {
                        question: "Berapa lama ideal liburan pertama ke Lombok?",
                        answer: "Durasi ideal untuk first timer biasanya 3 hari 2 malam sampai 4 hari 3 malam.",
                      },
                      {
                        question: "Apakah semua destinasi bisa digabung dalam satu trip?",
                        answer: "Tidak selalu. Pilihan destinasi sebaiknya dibagi berdasarkan area agar itinerary tetap realistis.",
                      },
                      {
                        question: "Destinasi mana yang paling cocok untuk first timer?",
                        answer: "Biasanya wisatawan first timer memilih kombinasi Gili Trawangan, Kuta Mandalika, Senggigi, dan beberapa spot sunset atau pantai selatan yang mudah diakses.",
                      },
                    ]
                  : isCarPrice
                    ? [
                        {
                          question: "Kenapa harga sewa mobil bisa berbeda?",
                          answer: "Harga bisa berbeda tergantung jenis armada, durasi, area penjemputan, dan apakah termasuk driver atau tidak.",
                        },
                        {
                          question: "Apakah sewa mobil lebih cocok daripada ikut tour?",
                          answer: "Untuk tamu yang ingin fleksibel dan punya itinerary sendiri, sewa mobil biasanya lebih cocok.",
                        },
                        {
                          question: "Kapan sebaiknya memilih armada yang lebih besar?",
                          answer: "Armada yang lebih besar cocok untuk rombongan, perjalanan keluarga besar, atau tamu yang membawa lebih banyak barang selama trip.",
                        },
                      ]
                    : [
                        {
                          question: "Apakah 3 hari cukup untuk melihat Lombok?",
                          answer: "Cukup untuk first timer selama rutenya fokus dan tidak terlalu banyak pindah area.",
                        },
                        {
                          question: "Perlu menginap di area mana?",
                          answer: "Area menginap bisa dipilih berdasarkan fokus trip, misalnya Senggigi untuk Lombok barat atau Kuta Mandalika untuk pantai selatan.",
                        },
                        {
                          question: "Apakah Gili Trawangan bisa masuk itinerary 3 hari 2 malam?",
                          answer: "Bisa, selama rutenya disusun dengan fokus dan tidak memaksakan terlalu banyak destinasi lain dalam waktu yang sama.",
                        },
                      ],
    mainImage: null,
  };
}

function fallbackTestimonials(): TestimonialItem[] {
  return [
    {
      customerName: "Andi & Rina",
      location: "Jakarta",
      tripType: "Honeymoon",
      quote: "Tim cepat merespons, itinerary rapi, dan trip terasa personal sejak hari pertama kami tiba di Lombok.",
      rating: 5,
      featured: true,
    },
    {
      customerName: "Keluarga Bima",
      location: "Surabaya",
      tripType: "Family Trip",
      quote: "Driver sabar, rute efisien, dan destinasi yang dipilih cocok untuk anak-anak maupun orang tua.",
      rating: 5,
      featured: true,
    },
    {
      customerName: "Rombongan Kantor Sagara",
      location: "Bandung",
      tripType: "Corporate Trip",
      quote: "Koordinasi mudah, armada nyaman, dan tim lokalnya paham cara menangani group trip dengan baik.",
      rating: 5,
      featured: true,
    },
  ];
}

function fallbackPackageBySlug(slug: string): ServiceItem | null {
  const details = servicePages[slug as keyof typeof servicePages];

  if (!details) {
    return null;
  }

  return {
    title: details.title,
    slug,
    href: `/${slug}`,
    category: slug === "sewa-mobil-lombok" ? "transport" : slug.includes("honeymoon") ? "honeymoon" : "tour",
    price:
      slug === "sewa-mobil-lombok"
        ? "Mulai 350 rb / hari"
        : slug === "paket-honeymoon-lombok"
          ? "Mulai 2,7 jt / pax"
          : "Mulai Rp1 juta / orang",
    summary:
      slug === "paket-wisata-lombok"
        ? "Paket wisata Lombok untuk one day tour, 2D1N, 3D2N, dan 4D3N dengan itinerary fleksibel ke Gili Trawangan, Kuta Lombok, pantai, bukit, air terjun, dan destinasi populer lainnya di Lombok."
        : slug === "paket-honeymoon-lombok"
          ? "Paket honeymoon Lombok untuk pasangan yang ingin perjalanan romantis, private, dan fleksibel dengan pilihan hotel atau villa, sunset dinner, serta itinerary yang bisa disesuaikan."
          : slug === "sewa-mobil-lombok"
            ? "Sewa mobil Lombok dengan driver untuk jemput bandara, city tour, full day trip, dan perjalanan multi day dengan armada yang fleksibel sesuai kebutuhan tamu."
        : details.description,
    bullets:
      slug === "paket-wisata-lombok"
        ? [
            "Durasi tersedia mulai one day tour, 2D1N, 3D2N, hingga 4D3N",
            "Harga mulai Rp1 juta per orang dengan opsi hotel, transport, dan makan",
            "Cocok untuk private trip, keluarga, honeymoon, dan wisatawan first timer",
          ]
        : slug === "paket-honeymoon-lombok"
          ? [
              "Cocok untuk pasangan yang ingin honeymoon lebih private dan santai",
              "Bisa termasuk hotel atau villa, transport, dan makan sesuai kebutuhan",
              "Dapat diarahkan ke Gili Trawangan, Kuta Lombok, sunset spot, dan pengalaman romantis lainnya",
            ]
          : slug === "sewa-mobil-lombok"
            ? [
                "Cocok untuk airport transfer, city tour, dan transport selama liburan",
                "Driver lokal profesional yang memahami rute wisata Lombok",
                "Tersedia pilihan armada yang dapat disesuaikan dengan jumlah peserta dan kebutuhan perjalanan",
              ]
        : [...details.bullets],
    content:
      slug === "paket-wisata-lombok"
        ? paketWisataLombokFallbackContent()
        : slug === "paket-honeymoon-lombok"
          ? paketHoneymoonLombokFallbackContent()
          : slug === "sewa-mobil-lombok"
            ? sewaMobilLombokFallbackContent()
            : textToPortableBlocks(details.description),
    heroNote:
      slug === "paket-wisata-lombok"
        ? "Paket ini dirancang untuk wisatawan domestik dari Jakarta, Surabaya, dan kota besar lain di Indonesia, serta tamu dari Malaysia, Singapura, Australia, dan Eropa yang ingin itinerary Lombok lebih praktis dan fleksibel."
        : slug === "paket-honeymoon-lombok"
          ? "Paket honeymoon ini cocok untuk pasangan dari Indonesia maupun luar negeri yang ingin liburan romantis di Lombok dengan itinerary yang lebih personal dan tidak terlalu padat."
        : slug === "sewa-mobil-lombok"
          ? "Layanan ini cocok untuk wisatawan domestik maupun internasional yang membutuhkan transport fleksibel, nyaman, dan mudah dikonsultasikan selama berada di Lombok."
          : "Halaman ini membantu tamu menemukan pilihan perjalanan yang paling sesuai sebelum berkonsultasi langsung.",
    ctaMessage:
      slug === "paket-wisata-lombok"
        ? "Halo, saya ingin konsultasi paket wisata Lombok mulai dari one day tour sampai 4D3N."
        : slug === "paket-honeymoon-lombok"
        ? "Halo, saya ingin paket honeymoon Lombok."
        : slug === "sewa-mobil-lombok"
          ? "Halo, saya ingin sewa mobil di Lombok."
          : "Halo, saya ingin paket wisata Lombok.",
    seoTitle:
      slug === "paket-wisata-lombok"
        ? "Paket Wisata Lombok Mulai Rp1 Juta per Orang | One Day Tour, 2D1N, 3D2N, 4D3N"
        : slug === "paket-honeymoon-lombok"
          ? "Paket Honeymoon Lombok | Liburan Romantis, Private Trip, dan Villa Pilihan"
          : slug === "sewa-mobil-lombok"
            ? "Sewa Mobil Lombok | Rental Mobil dengan Driver, Jemput Bandara, dan City Tour"
        : details.title,
    metaDescription:
      slug === "paket-wisata-lombok"
        ? "Temukan paket wisata Lombok mulai Rp1 juta per orang untuk one day tour, 2D1N, 3D2N, hingga 4D3N. Bisa termasuk hotel, transport, makan, dan itinerary fleksibel."
        : slug === "paket-honeymoon-lombok"
          ? "Temukan paket honeymoon Lombok untuk pasangan dengan opsi villa, sunset dinner, itinerary romantis, dan private trip yang lebih nyaman."
          : slug === "sewa-mobil-lombok"
            ? "Cari sewa mobil Lombok? Tersedia rental mobil dengan driver untuk jemput bandara, city tour, full day trip, dan perjalanan multi day."
        : details.description,
    keywords:
      slug === "paket-wisata-lombok"
        ? ["paket wisata lombok", "paket tour lombok", "paket wisata lombok 3 hari 2 malam", "travel lombok"]
        : slug === "paket-honeymoon-lombok"
          ? ["paket honeymoon lombok", "bulan madu lombok", "honeymoon lombok", "honeymoon gili trawangan"]
          : slug === "sewa-mobil-lombok"
            ? ["sewa mobil lombok", "rental mobil lombok", "sewa mobil bandara lombok", "driver lombok"]
        : [details.title.toLowerCase(), "travel lombok"],
    gallery: [],
    faqs: [
      ...(slug === "paket-wisata-lombok"
        ? [
            {
              question: "Apakah itinerary bisa disesuaikan?",
              answer: "Bisa. Itinerary paket wisata Lombok dapat disesuaikan dengan durasi, jumlah peserta, titik jemput, dan preferensi destinasi.",
            },
            {
              question: "Berapa harga paket wisata Lombok per orang?",
              answer: "Harga mulai dari Rp1 juta per orang dan dapat menyesuaikan dengan durasi, hotel, jumlah peserta, dan rute wisata yang dipilih.",
            },
            {
              question: "Apakah paket sudah termasuk hotel, transport, dan makan?",
              answer: "Bisa. Paket dapat mencakup hotel, transportasi, dan makan sesuai kebutuhan perjalanan dan jenis paket yang dipilih.",
            },
            {
              question: "Apakah bisa sekalian ke Gili Trawangan?",
              answer: "Bisa. Itinerary dapat diarahkan untuk mencakup Gili Trawangan, Kuta Lombok, pantai, bukit, air terjun, dan destinasi populer lain di Lombok.",
            },
          ]
        : slug === "paket-honeymoon-lombok"
          ? [
              {
                question: "Apakah paket honeymoon bisa ditambah candle light dinner?",
                answer: "Bisa. Paket honeymoon Lombok dapat ditambah candle light dinner, dekorasi, atau experience romantis lain sesuai kebutuhan pasangan.",
              },
              {
                question: "Apakah cocok untuk pasangan baru pertama kali ke Lombok?",
                answer: "Sangat cocok karena itinerary dapat difokuskan ke destinasi yang romantis, aman, dan lebih nyaman untuk pasangan first timer.",
              },
              {
                question: "Apakah bisa termasuk hotel atau villa?",
                answer: "Bisa. Paket dapat disesuaikan dengan hotel atau villa pilihan sesuai budget dan suasana honeymoon yang diinginkan.",
              },
              {
                question: "Apakah paket ini bisa diarahkan ke Gili Trawangan?",
                answer: "Bisa. Gili Trawangan termasuk salah satu destinasi favorit untuk honeymoon dan dapat dimasukkan ke itinerary.",
              },
            ]
          : slug === "sewa-mobil-lombok"
            ? [
                {
                  question: "Apakah tersedia jemput bandara?",
                  answer: "Tersedia. Layanan sewa mobil dapat disesuaikan untuk jemput bandara, transfer hotel, atau full day trip.",
                },
                {
                  question: "Apakah bisa pilih jenis mobil?",
                  answer: "Bisa. Layanan ini siap dikembangkan ke variasi armada seperti Avanza, Hiace, Fortuner, atau Alphard.",
                },
                {
                  question: "Apakah sewa mobil cocok untuk city tour?",
                  answer: "Ya. Sewa mobil dengan driver sangat cocok untuk city tour, beach hopping, dan perjalanan antar destinasi di Lombok.",
                },
                {
                  question: "Apakah bisa dipakai beberapa hari?",
                  answer: "Bisa. Layanan tersedia untuk kebutuhan harian maupun multi day sesuai itinerary tamu.",
                },
              ]
        : [
            {
              question: "Apakah itinerary bisa disesuaikan?",
              answer: "Bisa. Struktur awal ini memang disiapkan untuk fleksibilitas itinerary sesuai kebutuhan tamu dan durasi trip.",
            },
            {
              question: "Apakah pemesanan diarahkan ke WhatsApp?",
              answer: "Ya, CTA utama diarahkan ke WhatsApp agar proses konsultasi dan closing lebih cepat.",
            },
          ]),
    ],
    mainImage: null,
  };
}

async function fetchSanityData<T>(query: string, params?: Record<string, unknown>) {
  if (!sanityClient) {
    return null;
  }

  try {
    if (params) {
      return await sanityClient.fetch<T>(query, params);
    }

    return await sanityClient.fetch<T>(query);
  } catch (error) {
    console.error("Sanity fetch gagal, fallback lokal akan digunakan.", error);
    return null;
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!isSanityConfigured) {
    return {
      services: fallbackServices(),
      destinations: fallbackDestinations(),
      articles: fallbackArticles(),
      testimonials: fallbackTestimonials(),
    };
  }

  const [services, destinations, articles, testimonials] = await Promise.all([
    fetchSanityData<ServiceItem[]>(homePackagesQuery),
    fetchSanityData<DestinationItem[]>(homeDestinationsQuery),
    fetchSanityData<ArticleItem[]>(homeArticlesQuery),
    fetchSanityData<TestimonialItem[]>(homeTestimonialsQuery),
  ]);

  return {
    services: services?.length ? services : fallbackServices(),
    destinations: destinations?.length ? destinations : fallbackDestinations(),
    articles: articles?.length ? articles : fallbackArticles(),
    testimonials: testimonials?.length ? testimonials : fallbackTestimonials(),
  };
}

export async function getPackageBySlug(slug: string) {
  if (!isSanityConfigured) {
    return fallbackPackageBySlug(slug);
  }

  return (await fetchSanityData<ServiceItem>(packageBySlugQuery, { slug })) || fallbackPackageBySlug(slug);
}

export async function getDestinationBySlug(slug: string) {
  if (!isSanityConfigured) {
    return fallbackDestinations().find((item) => item.slug === slug) || null;
  }

  return (
    (await fetchSanityData<DestinationItem>(destinationBySlugQuery, { slug })) ||
    fallbackDestinations().find((item) => item.slug === slug) ||
    null
  );
}

export async function getArticleBySlug(slug: string) {
  if (!isSanityConfigured) {
    return fallbackArticleBySlug(slug);
  }

  return (
    (await fetchSanityData<ArticleItem>(articleBySlugQuery, { slug })) ||
    fallbackArticleBySlug(slug) ||
    null
  );
}

export async function getPackageSlugs() {
  if (!isSanityConfigured) {
    return Object.keys(servicePages);
  }

  const slugs = await fetchSanityData<string[]>(packageSlugsQuery);
  return slugs?.length ? slugs : Object.keys(servicePages);
}

export async function getDestinationSlugs() {
  if (!isSanityConfigured) {
    return Object.keys(destinationPages);
  }

  const slugs = await fetchSanityData<string[]>(destinationSlugsQuery);
  return slugs?.length ? slugs : Object.keys(destinationPages);
}

export async function getArticleSlugs() {
  if (!isSanityConfigured) {
    return Object.keys(articlePages);
  }

  const slugs = await fetchSanityData<string[]>(articleSlugsQuery);
  return slugs?.length ? slugs : Object.keys(articlePages);
}

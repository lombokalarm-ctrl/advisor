import type { ArticleItem, DestinationItem, ServiceItem } from "@/types/content";

export const featuredServices: ServiceItem[] = [
  {
    title: "Paket Wisata Lombok",
    href: "/paket-wisata-lombok",
    price: "Mulai 1,9 jt / pax",
    summary: "Paket private dan group dengan itinerary fleksibel untuk pantai, budaya, dan island hopping.",
    bullets: ["Itinerary custom", "Guide lokal", "Hotel opsional"],
  },
  {
    title: "Paket Honeymoon",
    href: "/paket-honeymoon-lombok",
    price: "Mulai 2,7 jt / pax",
    summary: "Trip romantis dengan sunset terbaik, villa pilihan, dan pengalaman yang lebih personal.",
    bullets: ["Setup romantis", "Villa & dinner", "Spot sunset"],
  },
  {
    title: "Sewa Mobil Lombok",
    href: "/sewa-mobil-lombok",
    price: "Mulai 350 rb / hari",
    summary: "Armada lengkap dengan opsi driver profesional untuk bandara, city tour, dan overland trip.",
    bullets: ["Driver berpengalaman", "Unit bersih", "Jemput bandara"],
  },
];

export const featuredDestinations: DestinationItem[] = [
  {
    name: "Gili Trawangan",
    slug: "gili-trawangan",
    category: "Island Escape",
    summary: "Destinasi favorit untuk snorkeling, sunset, dan honeymoon dengan atmosfer santai premium.",
    highlight: "Trip paling dicari untuk pasangan dan first-timer Lombok.",
  },
  {
    name: "Mandalika",
    slug: "kuta-mandalika",
    category: "Beach & Lifestyle",
    summary: "Kawasan pantai selatan dengan kombinasi resort, pantai cantik, dan akses mudah dari bandara.",
    highlight: "Cocok untuk short escape, family trip, dan konten visual premium.",
  },
  {
    name: "Senggigi",
    slug: "senggigi",
    category: "Classic Coastal",
    summary: "Pilihan klasik untuk wisata santai, sunset, kuliner, dan basecamp eksplorasi Lombok barat.",
    highlight: "Ideal untuk wisatawan domestik yang mencari area strategis.",
  },
  {
    name: "Pink Beach",
    slug: "pink-beach",
    category: "Hidden Gem",
    summary: "Pantai eksotis dengan warna pasir unik, air jernih, dan paket island hopping yang menarik.",
    highlight: "Spot cantik untuk foto perjalanan dan pengalaman pantai yang berbeda.",
  },
];

export const latestArticles: ArticleItem[] = [
  {
    title: "10 Tempat Wisata di Lombok yang Wajib Masuk Itinerary Pertama",
    slug: "tempat-wisata-di-lombok",
    category: "Wisata Lombok",
    excerpt: "Panduan destinasi inti untuk first-timer yang ingin menggabungkan pantai, budaya, dan spot sunset.",
  },
  {
    title: "Harga Sewa Mobil Lombok Terbaru dan Tips Memilih Armada",
    slug: "harga-sewa-mobil-lombok",
    category: "Sewa Mobil",
    excerpt: "Panduan ringkas membandingkan city car, MPV, hingga Hiace untuk kebutuhan trip yang berbeda.",
  },
  {
    title: "Itinerary Lombok 3 Hari 2 Malam untuk Liburan Efisien",
    slug: "itinerary-lombok-3-hari",
    category: "Itinerary",
    excerpt: "Rangkaian itinerary singkat dengan rute efisien dan kombinasi destinasi yang nyaman untuk first timer.",
  },
];

export const trustStats = [
  { value: "1.000+", label: "wisatawan dilayani" },
  { value: "4.9/5", label: "rating kepuasan tamu" },
  { value: "24/7", label: "respon WhatsApp" },
];

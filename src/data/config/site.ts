export const siteConfig = {
  name: "LombokAdvisor",
  title: "Paket Wisata & Sewa Mobil Terbaik di Lombok",
  description:
    "Layanan travel Lombok untuk paket wisata, honeymoon, sewa mobil, dan panduan destinasi yang mudah dikonsultasikan.",
  domain: "https://lombokadvisor.com",
  whatsappNumber: "6287766116599",
  whatsappMessage:
    "Halo LombokAdvisor, saya ingin konsultasi paket wisata atau sewa mobil di Lombok.",
  locale: "id_ID",
  navItems: [
    { label: "Paket Wisata", href: "/paket-wisata-lombok" },
    { label: "Honeymoon", href: "/paket-honeymoon-lombok" },
    { label: "Sewa Mobil", href: "/sewa-mobil-lombok" },
    { label: "Destinasi", href: "/wisata/gili-trawangan" },
    { label: "Blog", href: "/blog/tempat-wisata-di-lombok" },
  ],
};

export function getWhatsappLink(message = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

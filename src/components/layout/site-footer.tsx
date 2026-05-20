import Link from "next/link";

import { getWhatsappLink } from "@/data/config/site";

const footerLinks = [
  { label: "Paket Wisata", href: "/paket-wisata-lombok" },
  { label: "Honeymoon", href: "/paket-honeymoon-lombok" },
  { label: "Sewa Mobil", href: "/sewa-mobil-lombok" },
  { label: "Blog", href: "/blog/tempat-wisata-di-lombok" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,#102131_0%,#071523_34%,#06111d_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(248,245,239,0.18)_0%,rgba(7,21,35,0)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,139,136,0.10),transparent_28%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.3fr_0.8fr] lg:px-10">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">
            Perjalanan Nyaman di Lombok
          </div>
          <div className="space-y-4">
            <p className="font-display text-[2.2rem] leading-none sm:text-4xl">LombokAdvisor</p>
            <p className="max-w-2xl text-sm leading-7 text-white/68">
              Temukan paket wisata, honeymoon, sewa mobil, dan inspirasi destinasi Lombok
              dengan alur konsultasi yang mudah dan ramah untuk setiap tamu.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={getWhatsappLink()}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
            >
              Konsultasi via WhatsApp
            </a>
            <Link
              href="/paket-wisata-lombok"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/82 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Lihat Halaman Paket
            </Link>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/46">Navigasi</p>
            <div className="mt-4 grid gap-3 text-sm text-white/76">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/46">Kontak</p>
            <div className="mt-4 grid gap-3 text-sm text-white/76">
              <a href="mailto:hello@lombokadvisor.com" className="transition hover:text-white">
                hello@lombokadvisor.com
              </a>
              <a href={getWhatsappLink()} className="transition hover:text-white">
                WhatsApp aktif setiap hari
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-white/42 sm:px-6 sm:text-sm lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>Siap membantu kebutuhan liburan, honeymoon, dan transport Anda selama di Lombok.</p>
          <p>© 2026 LombokAdvisor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

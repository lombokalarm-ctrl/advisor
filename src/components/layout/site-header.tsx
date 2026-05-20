"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getWhatsappLink, siteConfig } from "@/data/config/site";

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/wisata/")) {
      return pathname.startsWith("/wisata/");
    }

    if (href.startsWith("/blog/")) {
      return pathname.startsWith("/blog/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(5,18,32,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 lg:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-white sm:gap-3">
          <span className="truncate font-display text-[1.55rem] tracking-wide sm:text-2xl">LombokAdvisor</span>
          <span className="hidden rounded-full border border-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 md:inline-flex">
            Paket & Trip Lombok
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm transition ${
                isActive(item.href)
                  ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/76 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsappLink()}
            className="hidden rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-[var(--color-accent-strong)] md:inline-flex"
          >
            WhatsApp
          </a>

          <a
            href={getWhatsappLink()}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-[var(--color-accent-strong)] md:hidden"
          >
            WA
          </a>

          <details className="group relative md:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition hover:bg-white/12 hover:text-white [&::-webkit-details-marker]:hidden">
              <Menu className="size-5 group-open:hidden" />
              <X className="hidden size-5 group-open:block" />
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] rounded-[1.75rem] border border-white/10 bg-[rgba(7,21,35,0.96)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-4 border-b border-white/8 pb-4">
                <p className="font-display text-2xl text-white">Navigasi</p>
                <p className="mt-2 text-sm leading-6 text-white/62">Pilih halaman utama atau langsung konsultasi via WhatsApp.</p>
              </div>
              <nav className="grid gap-2">
                {siteConfig.navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/14 text-white"
                        : "border-white/8 bg-white/[0.04] text-white/78 hover:border-white/14 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <a
                href={getWhatsappLink()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
              >
                <MessageCircle className="size-4" />
                Konsultasi WhatsApp
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

"use client";

import { ArrowRight, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getWhatsappLink } from "@/data/config/site";

function getContextAction(pathname: string) {
  if (pathname.startsWith("/blog/")) {
    return {
      href: "/paket-wisata-lombok",
      label: "Lihat Paket",
    };
  }

  if (pathname.startsWith("/wisata/")) {
    return {
      href: "/paket-wisata-lombok",
      label: "Paket Terkait",
    };
  }

  if (pathname === "/paket-honeymoon-lombok") {
    return {
      href: "/paket-honeymoon-lombok",
      label: "Lihat Detail",
    };
  }

  if (pathname === "/sewa-mobil-lombok") {
    return {
      href: "/sewa-mobil-lombok",
      label: "Lihat Armada",
    };
  }

  return {
    href: "/paket-wisata-lombok",
    label: "Lihat Paket",
  };
}

export function MobileStickyCta() {
  const pathname = usePathname();
  const contextAction = getContextAction(pathname);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(6,17,29,0.86)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
        <a
          href={getWhatsappLink()}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(245,197,92,0.26)] transition hover:bg-[var(--color-accent-strong)]"
        >
          <MessageCircleMore className="size-4 shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>
        <Link
          href={contextAction.href}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-3.5 text-sm font-semibold text-white/86 transition hover:border-white/20 hover:bg-white/12"
        >
          <span className="truncate">{contextAction.label}</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}

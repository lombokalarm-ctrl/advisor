import type { Metadata } from "next";
import "./globals.css";

import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/data/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.title} | ${siteConfig.name}`,
  description: siteConfig.description,
  path: "/",
  keywords: [
    "paket wisata lombok",
    "sewa mobil lombok",
    "paket honeymoon lombok",
    "travel lombok",
    "wisata lombok",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-ink)]">
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[linear-gradient(180deg,#04101d_0%,#071523_48%,#f8f5ef_100%)]" />
          <SiteHeader />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <SiteFooter />
          <MobileStickyCta />
        </div>
      </body>
    </html>
  );
}

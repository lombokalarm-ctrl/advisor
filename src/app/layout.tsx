import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { GoogleAnalyticsRouteTracker } from "@/components/analytics/google-analytics-route-tracker";
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

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-ink)]">
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}', { send_page_view: false });`}
            </Script>
            <Suspense fallback={null}>
              <GoogleAnalyticsRouteTracker measurementId={googleAnalyticsId} />
            </Suspense>
          </>
        ) : null}
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

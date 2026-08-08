import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/sections/page-hero";
import { getPublishedArticles } from "@/lib/cms/content";
import { estimateArticleReadingTime } from "@/lib/custom-cms/article-seo";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 900;

function formatArticleDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Blog LombokAdvisor | Panduan Wisata, Sewa Mobil, dan Itinerary Lombok",
    description:
      "Kumpulan artikel LombokAdvisor tentang paket wisata, honeymoon, sewa mobil, itinerary, dan tips perjalanan yang lebih siap transaksi dan search-engine friendly.",
    path: "/blog",
    keywords: ["blog lombok", "wisata lombok", "sewa mobil lombok", "paket honeymoon lombok", "paket wisata lombok"],
    type: "website",
  });
}

export default async function BlogArchivePage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <PageHero
        eyebrow="Blog LombokAdvisor"
        title="Artikel wisata Lombok yang lebih siap ranking dan lebih dekat ke intent booking."
        description="Temukan panduan perjalanan, artikel musiman, inspirasi itinerary, dan halaman pendukung yang membantu calon tamu menemukan layanan LombokAdvisor lewat pencarian organik."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => {
            const readingStats = estimateArticleReadingTime(article.content);
            const publishedLabel = formatArticleDate(article.publishedAt);

            return (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex h-full flex-col rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/24 hover:shadow-[0_24px_50px_rgba(8,21,34,0.08)]"
              >
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                  <span>{article.category}</span>
                  {publishedLabel ? <span>{publishedLabel}</span> : null}
                </div>
                <h2 className="mt-4 font-display text-[1.7rem] leading-tight text-[var(--color-ink)] line-clamp-2">
                  {article.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] line-clamp-3">{article.excerpt}</p>
                <div className="mt-auto pt-6 text-sm font-semibold text-[var(--color-brand)]">
                  <span>{readingStats.readingTimeMinutes} menit baca</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

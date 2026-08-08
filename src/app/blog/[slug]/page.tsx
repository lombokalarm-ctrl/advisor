import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getArticleBySlug, getArticleSlugs } from "@/lib/cms/content";
import { estimateArticleReadingTime } from "@/lib/custom-cms/article-seo";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildArticlePageSchemas } from "@/lib/seo/schema";

export const revalidate = 900;

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function formatRelatedLinkLabel(href: string) {
  return href
    .replace(/^\//, "")
    .replaceAll("/", " ")
    .replaceAll("-", " ")
    .replace(/^blog\s+/i, "")
    .trim();
}

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

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return buildMetadata({
    title: article.seoTitle || `${article.title} | Blog LombokAdvisor`,
    description: article.metaDescription || article.description || article.excerpt,
    path: `/blog/${slug}`,
    keywords: article.keywords?.length ? article.keywords : [article.category.toLowerCase(), "blog wisata lombok", "travel lombok"],
    image: article.mainImage?.url || article.gallery?.[0]?.url,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt || article.publishedAt,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const schemas = buildArticlePageSchemas(article, `/blog/${slug}`);
  const publishedLabel = formatArticleDate(article.publishedAt);
  const updatedLabel = formatArticleDate(article.updatedAt);
  const readingStats = estimateArticleReadingTime(article.content);

  return (
    <>
      <JsonLd id={`article-json-ld-${slug}`} data={schemas} />
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.description || article.excerpt}
        aside={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {publishedLabel ? <span>Dipublish {publishedLabel}</span> : null}
              <span>{readingStats.readingTimeMinutes} menit baca</span>
              <span>{readingStats.wordCount} kata</span>
            </div>
            <p>{article.excerpt}</p>
            <CtaLink href={getWhatsappLink(article.ctaMessage || "Halo, saya ingin itinerary atau paket Lombok.")}>
              Tanya Paket Terkait
            </CtaLink>
          </div>
        }
      />
      <DetailContentSections
        content={article.content}
        fallbackContent="Panduan perjalanan ini akan segera dilengkapi dengan informasi utama, tips penting, dan rekomendasi trip yang paling relevan untuk Anda."
        faqs={article.faqs}
        gallery={article.gallery}
        mainImage={article.mainImage}
      />
      <section className="mx-auto w-full max-w-5xl px-6 pb-14 lg:px-10 lg:pb-16">
        <article className="mb-6 rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white/78 p-6 shadow-[0_18px_48px_rgba(8,21,34,0.05)] lg:p-7">
          <div className="flex flex-wrap gap-4 text-sm leading-7 text-[var(--color-muted)]">
            {publishedLabel ? <span>Publish: {publishedLabel}</span> : null}
            {updatedLabel && updatedLabel !== publishedLabel ? <span>Update: {updatedLabel}</span> : null}
            <span>Estimasi baca: {readingStats.readingTimeMinutes} menit</span>
          </div>
        </article>
        <article className="rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white/78 p-7 shadow-[0_18px_48px_rgba(8,21,34,0.05)] lg:p-8">
          <p className="text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">
            Baca juga halaman terkait:
            {" "}
            {(article.relatedLinks?.length
              ? article.relatedLinks
              : ["/paket-wisata-lombok", "/sewa-mobil-lombok", "/paket-honeymoon-lombok"]
            ).map((href, index, array) => (
              <span key={href}>
                <Link className="font-medium text-[var(--color-brand)] underline underline-offset-4" href={href}>
                  {formatRelatedLinkLabel(href)}
                </Link>
                {index < array.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
          <div className="mt-5">
            <Link className="text-sm font-semibold text-[var(--color-brand)] underline underline-offset-4" href="/blog">
              Lihat semua artikel blog
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getArticleBySlug, getArticleSlugs } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";

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
    description: article.description || article.excerpt,
    path: `/blog/${slug}`,
    keywords: article.keywords?.length ? article.keywords : [article.category.toLowerCase(), "blog wisata lombok", "travel lombok"],
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.description || article.excerpt}
        aside={
          <div className="space-y-4">
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
        </article>
      </section>
    </>
  );
}

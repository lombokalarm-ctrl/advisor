import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getWhatsappLink } from "@/data/config/site";
import type { ArticleItem } from "@/types/content";

import { CtaLink } from "../ui/cta-link";
import { SectionHeading } from "../ui/section-heading";

type ArticlesSectionProps = {
  articles: ArticleItem[];
};

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section className="relative bg-[linear-gradient(180deg,#f6f1e8_0%,#f8f5ef_100%)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(7,21,35,0.18)_0%,rgba(248,245,239,0)_100%)]" />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-18 lg:px-10 lg:py-22">
        <div className="rounded-[2.1rem] border border-white/55 bg-[rgba(255,255,255,0.48)] px-4 py-12 shadow-[0_26px_70px_rgba(8,21,34,0.06)] backdrop-blur-sm sm:rounded-[2.5rem] sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="flex flex-col gap-6 sm:gap-7 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Inspirasi Perjalanan"
              title="Baca panduan dan ide trip sebelum berangkat ke Lombok."
              description="Artikel pilihan ini membantu Anda membandingkan rute, destinasi, durasi liburan, dan opsi perjalanan yang paling cocok."
            />
            <CtaLink href={getWhatsappLink()} variant="ghost" className="rounded-full bg-white/72 px-6">
              Konsultasi trip dan paket
            </CtaLink>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:mt-12 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex h-full flex-col rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white/78 p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/24 hover:bg-white hover:shadow-[0_24px_50px_rgba(8,21,34,0.08)] sm:rounded-[2rem] sm:p-6 lg:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">
                  {article.category}
                </p>
                <h3 className="mt-4 min-h-[4rem] font-display text-[1.58rem] leading-tight text-[var(--color-ink)] line-clamp-2 sm:mt-5 sm:min-h-[4.3rem] sm:text-[1.72rem] lg:min-h-[4.8rem] lg:text-[1.95rem]">
                  {article.title}
                </h3>
                <p className="mt-3.5 min-h-[4.9rem] text-sm leading-7 text-[var(--color-muted)] line-clamp-3 sm:mt-4 sm:min-h-[5.25rem] md:min-h-[5.8rem] md:text-[15px]">
                  {article.excerpt}
                </p>
                <div className="mt-auto pt-6 sm:pt-7">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]">
                    Baca artikel
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

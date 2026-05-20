import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getDestinationBySlug, getDestinationSlugs } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildDestinationPageSchemas } from "@/lib/seo/schema";

type DestinationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    return {};
  }

  return buildMetadata({
    title: destination.seoTitle || `${destination.title} | Destinasi Wisata Lombok`,
    description: destination.metaDescription || destination.summary,
    path: `/wisata/${slug}`,
    keywords: destination.keywords?.length ? destination.keywords : [destination.title.toLowerCase(), "wisata lombok", "destinasi lombok"],
  });
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const schemas = buildDestinationPageSchemas(destination, `/wisata/${slug}`);

  return (
    <>
      <JsonLd id={`destination-json-ld-${slug}`} data={schemas} />
      <PageHero
        eyebrow={destination.category}
        title={destination.title || destination.name}
        description={destination.metaDescription || destination.summary}
        aside={
          <div className="space-y-4">
            <p>{destination.highlight || "Temukan gambaran singkat destinasi, aktivitas yang cocok, dan rekomendasi perjalanan terkait untuk trip Anda."}</p>
            <CtaLink href={getWhatsappLink(destination.ctaMessage || `Halo, saya ingin trip ke ${destination.title || destination.name}.`)}>
              Tanya Trip Terkait
            </CtaLink>
          </div>
        }
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white/78 p-7 shadow-[0_18px_48px_rgba(8,21,34,0.05)] lg:p-8">
            <p className="text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">{destination.summary}</p>
          </div>
          <div className="rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-[rgba(240,236,227,0.72)] p-7 shadow-[0_18px_48px_rgba(8,21,34,0.05)] lg:p-8">
            <p className="font-display text-[1.9rem] leading-tight text-[var(--color-ink)] lg:text-[2.2rem]">Insight trip terkait</p>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-[var(--color-muted)]">
              {(destination.recommendations?.length
                ? destination.recommendations
                : [
                    "Pilih paket wisata yang paling sesuai dengan area dan durasi perjalanan Anda.",
                    "Pertimbangkan transport atau trip tambahan agar perjalanan lebih nyaman.",
                    "Lengkapi rencana perjalanan dengan destinasi lain yang searah.",
                  ]
              ).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <DetailContentSections
        content={destination.content}
        fallbackContent="Informasi destinasi ini akan segera dilengkapi dengan aktivitas terbaik, tips perjalanan, akses, dan rekomendasi trip yang paling sesuai."
        faqs={destination.faqs}
        gallery={destination.gallery}
        mainImage={destination.mainImage}
      />
    </>
  );
}

import type { Metadata } from "next";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getPackageBySlug } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServicePageSchemas } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  const service = await getPackageBySlug("paket-honeymoon-lombok");

  return buildMetadata({
    title: service?.seoTitle || "Paket Honeymoon Lombok | Trip Romantis, Sunset, dan Villa Pilihan",
    description:
      service?.metaDescription ||
      "Pilihan paket honeymoon Lombok untuk pasangan yang mencari trip romantis, suasana private, dan pengalaman liburan yang nyaman.",
    path: "/paket-honeymoon-lombok",
    keywords: service?.keywords?.length ? service.keywords : ["paket honeymoon lombok", "bulan madu lombok", "honeymoon gili trawangan"],
  });
}

export default async function PaketHoneymoonPage() {
  const service = await getPackageBySlug("paket-honeymoon-lombok");

  if (!service) {
    return null;
  }

  const schemas = buildServicePageSchemas(service, "/paket-honeymoon-lombok");

  return (
    <>
      <JsonLd id="paket-honeymoon-json-ld" data={schemas} />
      <PageHero
        eyebrow="Paket Honeymoon"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-4">
            <p>{service.heroNote || "Pilih suasana honeymoon yang lebih romantis dengan alur perjalanan yang nyaman dan mudah dikonsultasikan."}</p>
            <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket honeymoon Lombok.")}>
              Konsultasi Honeymoon
            </CtaLink>
          </div>
        }
      />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 lg:grid-cols-3 lg:px-10 lg:py-16">
        {service.bullets.map((item) => (
          <div
            key={item}
            className="flex min-h-[10.5rem] items-end rounded-[1.9rem] border border-[rgba(16,34,51,0.08)] bg-white/76 p-6 shadow-[0_18px_48px_rgba(8,21,34,0.05)]"
          >
            <p className="font-display text-[1.8rem] leading-tight text-[var(--color-ink)] lg:text-[2rem]">{item}</p>
          </div>
        ))}
      </section>
      <DetailContentSections
        content={service.content}
        fallbackContent="Detail honeymoon ini akan segera dilengkapi dengan pilihan suasana romantis, villa, aktivitas pasangan, dan informasi perjalanan yang dibutuhkan."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
      />
    </>
  );
}

import type { Metadata } from "next";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getPackageBySlug } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const service = await getPackageBySlug("paket-wisata-lombok");

  return buildMetadata({
    title: service?.seoTitle || "Paket Wisata Lombok | Private Trip, Group Trip, dan Itinerary Fleksibel",
    description:
      service?.metaDescription ||
      "Pilihan paket wisata Lombok dengan itinerary fleksibel, destinasi populer, dan konsultasi mudah untuk pasangan, keluarga, maupun rombongan.",
    path: "/paket-wisata-lombok",
    keywords: service?.keywords?.length ? service.keywords : ["paket wisata lombok", "paket tour lombok", "tour lombok murah"],
  });
}

export default async function PaketWisataPage() {
  const service = await getPackageBySlug("paket-wisata-lombok");

  if (!service) {
    return null;
  }

  return (
    <>
      <PageHero
        eyebrow="Paket Wisata"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-4">
            <p>{service.heroNote || "Temukan pilihan perjalanan yang lebih mudah disesuaikan dengan durasi, gaya liburan, dan kebutuhan tamu Anda."}</p>
            <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket wisata Lombok.")}>
              Tanya Paket via WhatsApp
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
        fallbackContent="Detail paket ini akan segera dilengkapi dengan itinerary, pilihan hotel, fasilitas perjalanan, dan rekomendasi destinasi terkait."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
      />
    </>
  );
}

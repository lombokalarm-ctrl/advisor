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
  const service = await getPackageBySlug("sewa-mobil-lombok");

  return buildMetadata({
    title: service?.seoTitle || "Sewa Mobil Lombok | Rental Mobil Bandara, Driver, dan Armada Lengkap",
    description:
      service?.metaDescription ||
      "Pilihan sewa mobil Lombok dengan driver, jemput bandara, dan armada yang siap mendukung perjalanan wisata Anda.",
    path: "/sewa-mobil-lombok",
    keywords: service?.keywords?.length ? service.keywords : ["sewa mobil lombok", "rental mobil lombok", "sewa mobil bandara lombok"],
  });
}

export default async function SewaMobilPage() {
  const service = await getPackageBySlug("sewa-mobil-lombok");

  if (!service) {
    return null;
  }

  const schemas = buildServicePageSchemas(service, "/sewa-mobil-lombok");

  return (
    <>
      <JsonLd id="sewa-mobil-json-ld" data={schemas} />
      <PageHero
        eyebrow="Sewa Mobil"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-4">
            <p>{service.heroNote || "Tentukan jenis kendaraan, area jemput, dan kebutuhan perjalanan Anda untuk mendapatkan pilihan transport yang paling nyaman."}</p>
            <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin sewa mobil di Lombok.")}>
              Tanya Armada via WhatsApp
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
        fallbackContent="Detail layanan ini akan segera dilengkapi dengan pilihan armada, area jemput, durasi pemakaian, dan informasi penting lainnya."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
      />
    </>
  );
}

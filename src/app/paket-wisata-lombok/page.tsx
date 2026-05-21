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

  const schemas = buildServicePageSchemas(service, "/paket-wisata-lombok");
  const travelHighlights = [
    {
      label: "Flexible plan",
      title: service.bullets[0] || "Durasi dan ritme trip lebih mudah disesuaikan",
      description: "Cocok untuk tamu yang ingin menyesuaikan perjalanan dengan waktu liburan, gaya trip, dan prioritas destinasi di Lombok.",
    },
    {
      label: "Popular routes",
      title: service.bullets[1] || "Destinasi populer lebih mudah dirangkai",
      description: "Mulai dari Gili Trawangan, Kuta Lombok, bukit, pantai, hingga air terjun bisa diarahkan dalam alur perjalanan yang lebih rapi.",
    },
    {
      label: "Comfort first",
      title: service.bullets[2] || "Perjalanan terasa nyaman untuk berbagai tipe tamu",
      description: "Pasangan, keluarga, maupun rombongan tetap bisa menikmati perjalanan dengan ritme yang lebih tenang dan jelas sejak awal.",
    },
  ];
  const tripMoments = [
    "Itinerary lebih mudah diarahkan sesuai jumlah hari dan gaya liburan.",
    "Pilihan destinasi bisa disusun agar perjalanan tetap nyaman dan tidak terasa terburu-buru.",
    "Cocok untuk tamu yang ingin sekali berangkat tetapi tetap ingin alur trip yang rapi.",
  ];

  return (
    <>
      <JsonLd id="paket-wisata-json-ld" data={schemas} />
      <PageHero
        eyebrow="Paket Wisata"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Trip planning note</p>
              <p className="mt-3 text-sm leading-7 text-white/74">
                {service.heroNote ||
                  "Temukan pilihan perjalanan yang lebih mudah disesuaikan dengan durasi, gaya liburan, dan kebutuhan tamu Anda sejak awal konsultasi."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Trip Style</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Fleksibel, nyaman, dan mudah disesuaikan</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Cocok Untuk</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Pasangan, keluarga, dan rombongan</p>
              </div>
            </div>
            <CtaLink
              href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket wisata Lombok.")}
              className="w-full sm:w-auto"
            >
              Tanya Paket via WhatsApp
            </CtaLink>
          </div>
        }
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(244,247,250,0.94)_100%)] p-7 shadow-[0_22px_60px_rgba(8,21,34,0.06)] lg:p-9"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">Gambaran perjalanan</p>
            <h2 className="mt-4 max-w-2xl font-display text-[2.2rem] leading-tight text-[var(--color-ink)] sm:text-[2.6rem]">
              Paket wisata yang membantu tamu berangkat dengan rencana yang lebih jelas.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">
              Halaman ini cocok untuk tamu yang ingin menyusun liburan di Lombok tanpa harus memikirkan semuanya dari nol. Fokusnya adalah memberi
              pilihan trip yang terasa praktis, nyaman, dan tetap fleksibel untuk menyesuaikan durasi serta destinasi favorit.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {tripMoments.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[rgba(16,34,51,0.08)] bg-white/78 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(160deg,#133348_0%,#10283b_52%,#1f3143_100%)] p-7 text-white shadow-[0_26px_60px_rgba(14,28,42,0.24)] lg:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Kenapa banyak tamu memilih paket</p>
            <h2 className="mt-4 max-w-lg font-display text-[2.1rem] leading-tight sm:text-[2.5rem]">Lebih mudah menentukan trip saat pilihan durasi dan arah perjalanan sudah jelas.</h2>
            <p className="mt-5 text-sm leading-8 text-white/74 md:text-[15px]">
              Banyak tamu ingin menikmati Lombok tanpa repot membangun itinerary sendiri. Karena itu paket wisata menjadi titik awal yang nyaman untuk
              memilih durasi, area trip, dan suasana perjalanan yang paling sesuai.
            </p>
            <div className="mt-7 grid gap-3">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Popular fit</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Cocok untuk short escape, family trip, hingga rombongan kecil</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Easy consult</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Tamu tinggal sampaikan durasi dan preferensi utama perjalanan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {travelHighlights.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.9rem] border border-[rgba(16,34,51,0.08)] bg-white/78 p-6 shadow-[0_18px_48px_rgba(8,21,34,0.05)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">{item.label}</p>
              <p className="mt-4 font-display text-[1.75rem] leading-tight text-[var(--color-ink)]">{item.title}</p>
              <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10 lg:pb-16">
        <div className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(135deg,rgba(13,43,62,0.98)_0%,rgba(20,50,72,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_60px_rgba(18,24,37,0.2)] lg:px-10 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Rencanakan lebih mudah</p>
              <h2 className="mt-4 font-display text-[2.1rem] leading-tight sm:text-[2.6rem]">Ceritakan durasi liburan, jumlah peserta, dan destinasi yang paling ingin dikunjungi.</h2>
              <p className="mt-4 text-sm leading-8 text-white/74 md:text-[15px]">
                Kami bantu arahkan opsi paket yang paling pas agar perjalanan terasa lebih praktis sejak awal, tanpa harus bingung menyusun alur trip.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket wisata Lombok.")}>Diskusikan Rencana Trip</CtaLink>
              <CtaLink href="#detail-paket-wisata" variant="secondary">
                Lihat Detail Paket
              </CtaLink>
            </div>
          </div>
        </div>
      </section>
      <div id="detail-paket-wisata">
      <DetailContentSections
        content={service.content}
        fallbackContent="Detail paket ini akan segera dilengkapi dengan itinerary, pilihan hotel, fasilitas perjalanan, dan rekomendasi destinasi terkait."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
        galleryProps={{
          eyebrow: "Travel moments",
          title: "Dokumentasi visual untuk memberi gambaran ritme perjalanan di Lombok",
          description:
            "Bagian ini membantu tamu melihat suasana trip, jenis destinasi, dan gaya perjalanan yang bisa disesuaikan dengan durasi maupun kebutuhan rombongan.",
        }}
        faqProps={{
          eyebrow: "FAQ Paket Wisata",
          title: "Pertanyaan yang sering muncul sebelum tamu menentukan paket perjalanan",
          description:
            "Jawaban berikut membantu Anda memahami alur konsultasi, durasi trip, dan hal-hal penting sebelum memilih paket wisata Lombok.",
        }}
      />
      </div>
    </>
  );
}

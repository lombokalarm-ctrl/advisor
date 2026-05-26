import type { Metadata } from "next";

import { DetailContentSections } from "@/components/cms/detail-content-sections";
import { PageHero } from "@/components/sections/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaLink } from "@/components/ui/cta-link";
import { getWhatsappLink } from "@/data/config/site";
import { getPackageBySlug } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildServicePageSchemas } from "@/lib/seo/schema";

export const revalidate = 900;

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
  const mobilityHighlights = [
    {
      label: "Airport pickup",
      title: service.bullets[0] || "Jemput bandara dan area hotel lebih mudah diatur",
      description: "Cocok untuk tamu yang ingin langsung melanjutkan perjalanan tanpa repot mencari transport setelah tiba di Lombok.",
    },
    {
      label: "Driver option",
      title: service.bullets[1] || "Tersedia pilihan mobil dengan driver",
      description: "Lebih nyaman untuk tamu yang ingin fokus menikmati trip, terutama untuk airport transfer, city route, dan wisata harian.",
    },
    {
      label: "Flexible use",
      title: service.bullets[2] || "Pemakaian lebih fleksibel sesuai kebutuhan perjalanan",
      description: "Bisa diarahkan untuk keluarga, pasangan, perjalanan bisnis, maupun rombongan kecil dengan ritme trip yang lebih praktis.",
    },
  ];
  const mobilityMoments = [
    "Area jemput, tujuan, dan durasi pemakaian bisa dibicarakan sejak awal.",
    "Lebih praktis untuk tamu yang baru tiba, pindah hotel, atau lanjut ke spot wisata tertentu.",
    "Pilihan armada membantu perjalanan terasa lebih nyaman sesuai jumlah peserta.",
  ];

  return (
    <>
      <JsonLd id="sewa-mobil-json-ld" data={schemas} />
      <PageHero
        eyebrow="Sewa Mobil"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Transport note</p>
              <p className="mt-3 text-sm leading-7 text-white/74">
                {service.heroNote ||
                  "Tentukan jenis kendaraan, area jemput, dan kebutuhan perjalanan Anda untuk mendapatkan pilihan transport yang paling nyaman sejak awal."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Use Case</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Airport transfer, trip harian, dan mobilitas tamu</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Cocok Untuk</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Pasangan, keluarga, hingga rombongan kecil</p>
              </div>
            </div>
            <CtaLink
              href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin sewa mobil di Lombok.")}
              className="w-full sm:w-auto"
            >
              Tanya Armada via WhatsApp
            </CtaLink>
          </div>
        }
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(243,247,250,0.94)_100%)] p-7 shadow-[0_22px_60px_rgba(8,21,34,0.06)] lg:p-9"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">Gambaran layanan</p>
            <h2 className="mt-4 max-w-2xl font-display text-[2.2rem] leading-tight text-[var(--color-ink)] sm:text-[2.6rem]">
              Sewa mobil yang membantu perjalanan terasa lebih praktis sejak titik jemput pertama.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">
              Layanan ini cocok untuk tamu yang ingin langsung bergerak dengan lebih nyaman, baik dari bandara, hotel, maupun titik jemput lain di
              Lombok. Fokusnya adalah memudahkan mobilitas tanpa membuat perjalanan terasa rumit atau terburu-buru.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {mobilityMoments.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[rgba(16,34,51,0.08)] bg-white/78 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(160deg,#143349_0%,#10283b_52%,#1f3143_100%)] p-7 text-white shadow-[0_26px_60px_rgba(14,28,42,0.24)] lg:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Kenapa tamu memilih layanan ini</p>
            <h2 className="mt-4 max-w-lg font-display text-[2.1rem] leading-tight sm:text-[2.5rem]">Lebih mudah atur transport saat rute perjalanan sudah jelas sejak awal.</h2>
            <p className="mt-5 text-sm leading-8 text-white/74 md:text-[15px]">
              Banyak tamu membutuhkan kendaraan yang siap dipakai tanpa proses yang berbelit. Karena itu layanan sewa mobil menjadi pilihan nyaman
              untuk airport transfer, perjalanan wisata, hingga mobilitas selama stay di Lombok.
            </p>
            <div className="mt-7 grid gap-3">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Popular request</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Jemput bandara, transfer hotel, dan trip harian paling sering dicari</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Easy booking</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Cukup sampaikan rute, waktu pakai, dan jumlah peserta perjalanan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {mobilityHighlights.map((item) => (
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Atur transport lebih cepat</p>
              <h2 className="mt-4 font-display text-[2.1rem] leading-tight sm:text-[2.6rem]">Ceritakan lokasi jemput, tujuan perjalanan, dan jenis kendaraan yang Anda butuhkan.</h2>
              <p className="mt-4 text-sm leading-8 text-white/74 md:text-[15px]">
                Kami bantu arahkan pilihan armada yang paling sesuai agar perjalanan di Lombok terasa lebih nyaman, praktis, dan jelas sejak awal.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin sewa mobil di Lombok.")}>Diskusikan Kebutuhan Armada</CtaLink>
              <CtaLink href="#detail-sewa-mobil" variant="secondary">
                Lihat Detail Layanan
              </CtaLink>
            </div>
          </div>
        </div>
      </section>
      <div id="detail-sewa-mobil">
      <DetailContentSections
        content={service.content}
        fallbackContent="Detail layanan ini akan segera dilengkapi dengan pilihan armada, area jemput, durasi pemakaian, dan informasi penting lainnya."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
        galleryProps={{
          eyebrow: "Transport moments",
          title: "Dokumentasi visual untuk memberi gambaran kenyamanan perjalanan dan pilihan armada",
          description:
            "Bagian ini membantu tamu melihat suasana layanan, jenis kendaraan, dan ritme perjalanan yang lebih nyaman untuk trip di Lombok.",
        }}
        faqProps={{
          eyebrow: "FAQ Sewa Mobil",
          title: "Pertanyaan yang paling sering diajukan sebelum booking kendaraan",
          description:
            "Jawaban berikut membantu Anda memahami area jemput, pilihan driver, durasi pemakaian, dan hal penting lainnya sebelum memesan.",
        }}
      />
      </div>
    </>
  );
}

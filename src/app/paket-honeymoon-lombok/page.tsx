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
  const honeymoonHighlights = [
    {
      label: "Private journey",
      title: service.bullets[0] || "Trip lebih tenang untuk pasangan",
      description: "Perjalanan dirancang agar pasangan bisa menikmati waktu berdua tanpa ritme yang terlalu padat atau terburu-buru.",
    },
    {
      label: "Flexible itinerary",
      title: service.bullets[1] || "Lebih santai dan mudah disesuaikan",
      description: "Alur perjalanan bisa diarahkan ke suasana yang lebih romantis, mulai dari sunset spot, villa stay, sampai island escape.",
    },
    {
      label: "Romantic spots",
      title: service.bullets[2] || "Destinasi dipilih untuk suasana yang hangat",
      description: "Kuta Lombok, Gili Trawangan, bukit, pantai, dan makan malam spesial terasa lebih cocok untuk momen honeymoon.",
    },
  ];
  const romanticMoments = [
    "Sunset dan dinner dengan suasana yang lebih intim.",
    "Perjalanan santai dengan ritme yang tidak melelahkan.",
    "Pilihan villa, hotel, dan area menginap yang mendukung privasi pasangan.",
  ];

  return (
    <>
      <JsonLd id="paket-honeymoon-json-ld" data={schemas} />
      <PageHero
        eyebrow="Paket Honeymoon"
        title={service.title}
        description={service.summary}
        aside={
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Romantic trip note</p>
              <p className="mt-3 text-sm leading-7 text-white/74">
                {service.heroNote ||
                  "Pilih suasana honeymoon yang lebih romantis dengan alur perjalanan yang nyaman, private, dan mudah disesuaikan untuk momen berdua."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Vibe</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Private, hangat, dan santai</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Cocok Untuk</p>
                <p className="mt-2 font-display text-[1.2rem] leading-tight text-white">Pasangan yang ingin liburan lebih berkesan</p>
              </div>
            </div>
            <CtaLink
              href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket honeymoon Lombok.")}
              className="w-full sm:w-auto"
            >
              Rencanakan Honeymoon Anda
            </CtaLink>
          </div>
        }
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className="rounded-[2.1rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(249,244,248,0.92)_100%)] p-7 shadow-[0_22px_60px_rgba(8,21,34,0.06)] lg:p-9"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">Suasana perjalanan</p>
            <h2 className="mt-4 max-w-2xl font-display text-[2.2rem] leading-tight text-[var(--color-ink)] sm:text-[2.6rem]">
              Honeymoon yang terasa lebih intim, santai, dan mudah dinikmati berdua.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">
              Paket ini cocok untuk pasangan yang ingin menikmati Lombok tanpa itinerary yang terasa melelahkan. Fokusnya bukan sekadar berpindah
              destinasi, tetapi menciptakan ritme perjalanan yang nyaman dengan momen-momen yang terasa hangat sejak hari pertama.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {romanticMoments.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[rgba(16,34,51,0.08)] bg-white/78 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.1rem] border border-[rgba(88,40,78,0.14)] bg-[linear-gradient(160deg,#5d294f_0%,#3b204d_52%,#1f3143_100%)] p-7 text-white shadow-[0_26px_60px_rgba(29,20,37,0.26)] lg:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Kenapa dipilih pasangan</p>
            <h2 className="mt-4 max-w-lg font-display text-[2.1rem] leading-tight sm:text-[2.5rem]">Dirancang untuk momen yang terasa spesial, bukan sekadar penuh destinasi.</h2>
            <p className="mt-5 text-sm leading-8 text-white/74 md:text-[15px]">
              Cocok untuk pasangan yang ingin perjalanan lebih rapi, tidak repot, dan punya ruang untuk menikmati sunset, suasana menginap, dan waktu
              berdua dengan lebih tenang.
            </p>
            <div className="mt-7 grid gap-3">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Ideal pace</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Perjalanan tetap nyaman meski durasi singkat</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Easy planning</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight text-white">Tanggal, hotel, dan kebutuhan trip lebih mudah disesuaikan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {honeymoonHighlights.map((item) => (
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
        <div className="rounded-[2.1rem] border border-[rgba(88,40,78,0.12)] bg-[linear-gradient(135deg,rgba(78,33,63,0.96)_0%,rgba(23,43,60,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_60px_rgba(18,24,37,0.2)] lg:px-10 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,236,214,0.72)]">Rencanakan dengan lebih tenang</p>
              <h2 className="mt-4 font-display text-[2.1rem] leading-tight sm:text-[2.6rem]">Ceritakan tanggal perjalanan, gaya trip, dan suasana honeymoon yang Anda inginkan.</h2>
              <p className="mt-4 text-sm leading-8 text-white/74 md:text-[15px]">
                Kami bantu arahkan pilihan durasi, area menginap, dan ritme perjalanan agar honeymoon di Lombok terasa lebih nyaman dan berkesan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink href={getWhatsappLink(service.ctaMessage || "Halo, saya ingin paket honeymoon Lombok.")}>Diskusikan Itinerary Berdua</CtaLink>
              <CtaLink href="#detail-honeymoon" variant="secondary">
                Lihat Detail Perjalanan
              </CtaLink>
            </div>
          </div>
        </div>
      </section>
      <div id="detail-honeymoon">
      <DetailContentSections
        content={service.content}
        fallbackContent="Detail honeymoon ini akan segera dilengkapi dengan pilihan suasana romantis, villa, aktivitas pasangan, dan informasi perjalanan yang dibutuhkan."
        faqs={service.faqs}
        gallery={service.gallery}
        mainImage={service.mainImage}
      />
      </div>
    </>
  );
}

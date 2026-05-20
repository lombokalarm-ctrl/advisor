import { ArrowRight, CircleCheckBig, PhoneCall } from "lucide-react";

import { getWhatsappLink } from "@/data/config/site";

import { CtaLink } from "../ui/cta-link";

const quickPoints = [
  "Tour Lombok murah dengan itinerary fleksibel",
  "Paket honeymoon romantis untuk pasangan",
  "Driver profesional dan armada lengkap",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#071523_0%,#0b2134_42%,#10283b_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(12,139,136,0.34),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(245,197,92,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(7,21,35,0.04),rgba(7,21,35,0.55)_42%,rgba(7,21,35,0)_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(7,21,35,0)_0%,rgba(248,245,239,0.20)_30%,rgba(248,245,239,0.78)_72%,rgba(248,245,239,0.98)_100%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-18 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pb-36 lg:pt-24">
        <div className="space-y-6 md:space-y-8">
          <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72 shadow-[0_14px_32px_rgba(0,0,0,0.14)] backdrop-blur-sm">
            Teman Perjalanan Anda di Lombok
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="max-w-4xl font-display text-[2.75rem] leading-[0.98] text-slate-50 sm:text-[3.15rem] md:text-[4.6rem] lg:text-[5.35rem]">
              Paket Wisata &amp; Sewa Mobil Terbaik di Lombok
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-white/82 sm:text-base sm:leading-8 md:text-[1.08rem]">
              Temukan paket wisata, honeymoon, sewa mobil, dan inspirasi trip Lombok yang
              mudah dikonsultasikan untuk pasangan, keluarga, maupun rombongan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaLink href={getWhatsappLink()} className="gap-2">
              <PhoneCall className="size-4" />
              Konsultasi Gratis
            </CtaLink>
            <CtaLink href="/paket-wisata-lombok" variant="secondary" className="gap-2">
              Lihat Paket
              <ArrowRight className="size-4" />
            </CtaLink>
          </div>

          <div className="grid gap-3 text-sm text-white/86 md:grid-cols-3">
            {quickPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-3xl border border-white/12 bg-[rgba(255,255,255,0.09)] px-4 py-3.5 shadow-[0_18px_34px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:py-4"
              >
                <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-[var(--color-accent)]" />
                <span className="leading-6 sm:leading-7">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-10 h-28 w-28 rounded-full bg-[var(--color-accent)]/24 blur-3xl" />
          <div className="absolute -right-8 bottom-12 h-44 w-44 rounded-full bg-[var(--color-brand)]/28 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(160deg,rgba(10,30,48,0.98),rgba(5,16,28,0.96))] p-5 shadow-[0_32px_100px_rgba(0,0,0,0.34)] sm:p-6 lg:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/12 bg-white/8 p-4 sm:p-5 lg:p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Pilihan Trip</p>
                <p className="mt-5 font-display text-[2rem] leading-tight text-white lg:text-[2.3rem]">12+ opsi</p>
                <p className="mt-3 text-sm leading-7 text-white/74">
                  Paket wisata, honeymoon, dan transport yang siap disesuaikan dengan kebutuhan perjalanan Anda.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.06] p-4 sm:p-5 lg:p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Destinasi Populer</p>
                <p className="mt-5 font-display text-[2rem] leading-tight text-white lg:text-[2.3rem]">Lombok lengkap</p>
                <p className="mt-3 text-sm leading-7 text-white/74">
                  Dari Gili Trawangan, Kuta Lombok, Senggigi, pantai selatan, hingga trip budaya dan alam.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.6rem] border border-white/12 bg-[rgba(255,255,255,0.06)] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Kenapa Pilih Kami</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {["Respon cepat", "Pilihan trip fleksibel", "Nyaman untuk berbagai kebutuhan"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/18 px-4 py-5 text-sm leading-7 text-white/86">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

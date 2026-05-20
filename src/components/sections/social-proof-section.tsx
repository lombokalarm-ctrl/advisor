import { MessageCircleMore, ShieldCheck, Star } from "lucide-react";

import { trustStats } from "@/data/seed/home";
import type { TestimonialItem } from "@/types/content";

import { SectionHeading } from "../ui/section-heading";

const proofCards = [
  {
    title: "Respon cepat dan mudah dihubungi",
    description: "Tamu bisa langsung bertanya lewat WhatsApp untuk mendapatkan jawaban yang cepat dan jelas sebelum booking.",
    icon: MessageCircleMore,
  },
  {
    title: "Tim lokal yang paham kebutuhan perjalanan",
    description: "Saran trip, rute, dan rekomendasi destinasi disusun agar lebih relevan dengan perjalanan tamu di Lombok.",
    icon: ShieldCheck,
  },
  {
    title: "Ulasan tamu yang memberi rasa aman",
    description: "Testimoni, dokumentasi perjalanan, dan informasi yang jelas membantu tamu merasa lebih yakin sebelum berangkat.",
    icon: Star,
  },
];

type SocialProofSectionProps = {
  testimonials?: TestimonialItem[];
};

function renderStars(rating: number) {
  return Array.from({ length: Math.max(1, Math.min(5, rating)) }, (_, index) => (
    <Star key={`star-${index + 1}`} className="size-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
  ));
}

export function SocialProofSection({ testimonials = [] }: SocialProofSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#091827_0%,#071523_24%,#071523_78%,#0a1d2d_100%)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(248,245,239,0.20)_0%,rgba(7,21,35,0)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,139,136,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,197,92,0.10),transparent_24%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(7,21,35,0)_0%,rgba(248,245,239,0.22)_100%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 sm:py-22 lg:px-10 lg:py-24">
        <SectionHeading
          eyebrow="Kenapa Tamu Percaya"
          title="Rasa aman sebelum berangkat sama pentingnya dengan itinerary."
          description="Karena itu kami menampilkan komunikasi yang mudah, informasi yang jelas, dan ulasan tamu yang membantu Anda lebih yakin sebelum booking."
          invert
        />

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:mt-12 md:grid-cols-3">
          {proofCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6 lg:p-7">
                <Icon className="size-8 text-[var(--color-accent)]" />
                <h3 className="mt-6 font-display text-[1.72rem] leading-tight text-white sm:mt-7 sm:text-[1.95rem] lg:text-[2.2rem]">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68 md:text-[15px]">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:mt-10 sm:pt-10 md:grid-cols-3">
          {trustStats.map((item) => (
            <div key={item.label} className="rounded-[1.6rem] border border-white/8 bg-white/[0.045] px-5 py-5 lg:px-6">
              <p className="font-display text-[2rem] leading-tight text-white lg:text-[2.35rem]">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/56">{item.label}</p>
            </div>
          ))}
        </div>

        {!!testimonials.length && (
          <div className="mt-8 border-t border-white/10 pt-8 sm:mt-10 sm:pt-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Testimonial</p>
              <h3 className="mt-3 font-display text-[1.95rem] leading-tight text-white sm:text-[2.2rem] md:text-[2.8rem]">
                Cerita tamu yang sudah menikmati perjalanan mereka di Lombok
              </h3>
            </div>
            <div className="mt-7 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <article key={`${item.customerName}-${item.tripType}`} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6 lg:p-7">
                  <div className="flex gap-1">{renderStars(item.rating)}</div>
                  <p className="mt-5 text-sm leading-8 text-white/82 md:text-[15px]">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold text-white">{item.customerName}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/56">
                      {[item.tripType, item.location].filter(Boolean).join(" . ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { DestinationItem } from "@/types/content";

import { SectionHeading } from "../ui/section-heading";

type DestinationsSectionProps = {
  destinations: DestinationItem[];
};

export function DestinationsSection({ destinations }: DestinationsSectionProps) {
  return (
    <section className="relative bg-[linear-gradient(180deg,#f8f5ef_0%,#f2ede4_100%)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(248,245,239,0.34)_0%,rgba(248,245,239,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(242,237,228,0)_0%,rgba(7,21,35,0.14)_100%)]" />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-18 lg:px-10 lg:py-22">
        <SectionHeading
          eyebrow="Destinasi Pilihan"
          title="Jelajahi spot terbaik untuk liburan Anda di Lombok."
          description="Temukan inspirasi pantai, pulau, sunset spot, dan area menginap yang paling sering dipilih wisatawan."
        />

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:mt-12 lg:grid-cols-2">
          {destinations.map((destination, index) => (
            <Link
              key={destination.slug}
              href={`/wisata/${destination.slug}`}
              className={`group flex h-full flex-col rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-[rgba(255,255,255,0.50)] p-5 shadow-[0_18px_44px_rgba(8,21,34,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/24 hover:bg-[rgba(255,255,255,0.82)] hover:shadow-[0_24px_56px_rgba(8,21,34,0.08)] sm:rounded-[2rem] sm:p-6 lg:p-7 ${
                destinations.length % 2 === 1 && index === destinations.length - 1 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">
                  {destination.category}
                </span>
                <span className="line-clamp-1 text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  {destination.highlight}
                </span>
              </div>
              <h3 className="mt-5 min-h-[4rem] font-display text-[1.68rem] leading-tight text-[var(--color-ink)] line-clamp-2 sm:mt-6 sm:min-h-[4.3rem] sm:text-[1.85rem] lg:min-h-[4.9rem] lg:text-[2.1rem]">
                {destination.name}
              </h3>
              <p className="mt-3.5 max-w-2xl min-h-[4.9rem] text-sm leading-7 text-[var(--color-muted)] line-clamp-3 sm:mt-4 sm:min-h-[5.25rem] md:min-h-[5.8rem] md:text-[15px]">
                {destination.summary}
              </p>
              <div className="mt-auto pt-6 sm:pt-7">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]">
                  Lihat destinasi
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

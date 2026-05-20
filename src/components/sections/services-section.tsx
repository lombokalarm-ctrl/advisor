import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ServiceItem } from "@/types/content";

import { SectionHeading } from "../ui/section-heading";

type ServicesSectionProps = {
  services: ServiceItem[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="relative z-10 -mt-12 sm:-mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[2.1rem] border border-white/55 bg-[linear-gradient(180deg,rgba(248,245,239,0.78)_0%,rgba(248,245,239,0.96)_24%,rgba(248,245,239,1)_100%)] px-4 py-12 shadow-[0_30px_90px_rgba(8,21,34,0.10)] backdrop-blur-sm sm:rounded-[2.5rem] sm:px-6 sm:py-14 lg:px-10 lg:py-18">
          <SectionHeading
            eyebrow="Layanan Utama"
            title="Pilihan layanan inti untuk liburan Anda di Lombok."
            description="Pilih paket wisata, honeymoon, atau sewa mobil sesuai gaya perjalanan, durasi, dan kebutuhan tamu Anda."
          />

          <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 lg:mt-12 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group flex h-full flex-col rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-[rgba(255,255,255,0.74)] p-5 shadow-[0_22px_60px_rgba(8,21,34,0.06)] transition hover:-translate-y-1 hover:border-[var(--color-brand)]/18 hover:bg-white hover:shadow-[0_28px_70px_rgba(8,21,34,0.12)] sm:rounded-[2rem] sm:p-6 lg:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">
                      {service.price}
                    </p>
                    <h3 className="mt-4 min-h-[4.15rem] font-display text-[1.65rem] leading-tight text-[var(--color-ink)] line-clamp-2 sm:min-h-[4.6rem] sm:text-[1.8rem] lg:min-h-[5.2rem] lg:text-[2rem]">
                      {service.title}
                    </h3>
                  </div>
                  <div className="rounded-full border border-[rgba(16,34,51,0.08)] bg-white/80 p-2.5">
                    <ArrowUpRight className="size-4 text-[var(--color-muted)] transition group-hover:text-[var(--color-ink)]" />
                  </div>
                </div>

                <p className="mt-4 min-h-[4.9rem] text-sm leading-7 text-[var(--color-muted)] line-clamp-3 sm:mt-5 sm:min-h-[5.25rem] md:min-h-[5.8rem] md:text-[15px]">
                  {service.summary}
                </p>

                <ul className="mt-6 grid gap-3 text-sm text-[var(--color-ink)] sm:mt-7">
                  {service.bullets.slice(0, 3).map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full bg-[rgba(240,236,227,0.86)] px-4 py-3 leading-6 line-clamp-2 min-h-[3.5rem]"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6 sm:pt-7">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]">
                    Lihat layanan
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

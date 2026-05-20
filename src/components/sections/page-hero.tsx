import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, description, aside }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#071523_0%,#0b2032_45%,#10283b_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(12,139,136,0.26),transparent_30%),radial-gradient(circle_at_top_right,rgba(245,197,92,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(7,21,35,0)_0%,rgba(248,245,239,0.12)_100%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-7 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1.16fr_0.84fr] lg:px-10 lg:py-18">
        <div className="space-y-4 md:space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)] md:text-xs">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-[2.45rem] leading-[0.99] text-white sm:text-[2.9rem] md:text-[4.2rem] lg:text-[4.8rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/74 md:text-[1.02rem] md:leading-8">{description}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-7 text-white/72 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:rounded-[2rem] sm:p-5 md:p-6 lg:p-7">
          {aside}
        </div>
      </div>
    </section>
  );
}

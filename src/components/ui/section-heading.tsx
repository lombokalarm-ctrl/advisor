type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  invert?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4 md:space-y-5">
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.3em] md:text-xs ${
          invert ? "text-[var(--color-accent)]" : "text-[var(--color-brand)]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-display text-[2.15rem] leading-[1.08] md:text-[2.85rem] lg:text-[3.2rem] ${
          invert ? "text-white" : "text-[var(--color-ink)]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`max-w-2xl text-sm leading-7 md:text-[1.02rem] md:leading-8 ${
          invert ? "text-white/72" : "text-[var(--color-muted)]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

import type { FaqItem } from "@/types/content";

export type FaqListProps = {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: "default" | "romantic";
};

export function FaqList({
  items,
  eyebrow = "FAQ",
  title = "Pertanyaan yang paling sering ditanyakan calon tamu",
  description,
  variant = "default",
}: FaqListProps) {
  if (!items?.length) {
    return null;
  }

  const isRomantic = variant === "romantic";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <div
        className={
          isRomantic
            ? "rounded-[2.2rem] border border-[rgba(88,40,78,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.84)_0%,rgba(246,240,246,0.92)_100%)] p-6 shadow-[0_24px_60px_rgba(18,24,37,0.08)] sm:p-7 lg:p-8"
            : ""
        }
      >
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-brand)] md:text-xs">{eyebrow}</p>
          <h2 className="mt-3 font-display text-[2.15rem] leading-tight text-[var(--color-ink)] md:text-[2.8rem]">{title}</h2>
          {description ? <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">{description}</p> : null}
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5">
          {items.map((item) => (
            <div
              key={item.question}
              className={`rounded-[1.55rem] border p-5 shadow-[0_18px_40px_rgba(8,21,34,0.04)] sm:rounded-[1.8rem] sm:p-6 ${
                isRomantic
                  ? "border-[rgba(88,40,78,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,252,0.96)_100%)]"
                  : "border-[rgba(16,34,51,0.08)] bg-white/80"
              }`}
            >
              <h3 className="font-display text-[1.7rem] leading-tight text-[var(--color-ink)] md:text-[1.95rem]">{item.question}</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

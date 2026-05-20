import type { FaqItem } from "@/types/content";

type FaqListProps = {
  items?: FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-brand)] md:text-xs">FAQ</p>
        <h2 className="mt-3 font-display text-[2.15rem] leading-tight text-[var(--color-ink)] md:text-[2.8rem]">
          Pertanyaan yang paling sering ditanyakan calon tamu
        </h2>
      </div>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5">
        {items.map((item) => (
          <div key={item.question} className="rounded-[1.55rem] border border-[rgba(16,34,51,0.08)] bg-white/80 p-5 shadow-[0_18px_40px_rgba(8,21,34,0.04)] sm:rounded-[1.8rem] sm:p-6">
            <h3 className="font-display text-[1.7rem] leading-tight text-[var(--color-ink)] md:text-[1.95rem]">{item.question}</h3>
            <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

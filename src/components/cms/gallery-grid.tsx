import Image from "next/image";

import type { GalleryImage } from "@/types/content";

export type GalleryGridProps = {
  items?: GalleryImage[];
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: "default" | "romantic";
};

export function GalleryGrid({
  items,
  eyebrow = "Gallery",
  title = "Dokumentasi visual dan suasana trip",
  description,
  variant = "default",
}: GalleryGridProps) {
  if (!items?.length) {
    return null;
  }

  const validItems = items.filter((item) => item.url);
  const isRomantic = variant === "romantic";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <div
        className={
          isRomantic
            ? "rounded-[2.2rem] border border-[rgba(88,40,78,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(249,240,245,0.92)_46%,rgba(242,247,250,0.92)_100%)] p-6 shadow-[0_24px_60px_rgba(18,24,37,0.08)] sm:p-7 lg:p-8"
            : ""
        }
      >
        <div className="flex items-end justify-between gap-4">
          <div className={isRomantic ? "max-w-3xl" : ""}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-brand)] md:text-xs">{eyebrow}</p>
            <h2 className="mt-3 font-display text-[2.15rem] leading-tight text-[var(--color-ink)] md:text-[2.8rem]">{title}</h2>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)] md:text-[15px]">{description}</p>
            ) : null}
          </div>
        </div>
        <div className={`mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 ${isRomantic ? "xl:grid-cols-12" : "xl:grid-cols-3"}`}>
          {validItems.map((item, index) => (
            <figure
              key={`${item.url}-${item.caption || item.alt || "gallery"}`}
              className={`overflow-hidden rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white/80 shadow-[0_18px_44px_rgba(8,21,34,0.05)] ${
                isRomantic
                  ? index === 0
                    ? "md:col-span-2 xl:col-span-7"
                    : "xl:col-span-5"
                  : ""
              }`}
            >
              <Image
                alt={item.alt || item.caption || "Gallery image"}
                className={`w-full object-cover ${isRomantic && index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}`}
                height={900}
                src={item.url || ""}
                width={1200}
              />
              {(item.caption || item.alt) && (
                <figcaption className={`px-5 py-4 text-sm leading-7 text-[var(--color-muted)] ${isRomantic ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,248,251,0.95)_100%)]" : ""}`}>
                  {item.caption || item.alt}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import type { GalleryImage } from "@/types/content";

type GalleryGridProps = {
  items?: GalleryImage[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-brand)] md:text-xs">Gallery</p>
          <h2 className="mt-3 font-display text-[2.15rem] leading-tight text-[var(--color-ink)] md:text-[2.8rem]">
            Dokumentasi visual dan suasana trip
          </h2>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items
          .filter((item) => item.url)
          .map((item) => (
            <figure
              key={`${item.url}-${item.caption || item.alt || "gallery"}`}
              className="overflow-hidden rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white/80 shadow-[0_18px_44px_rgba(8,21,34,0.05)]"
            >
              <Image
                alt={item.alt || item.caption || "Gallery image"}
                className="aspect-[4/3] w-full object-cover"
                height={900}
                src={item.url || ""}
                width={1200}
              />
              {(item.caption || item.alt) && (
                <figcaption className="px-5 py-4 text-sm leading-7 text-[var(--color-muted)]">
                  {item.caption || item.alt}
                </figcaption>
              )}
            </figure>
          ))}
      </div>
    </section>
  );
}

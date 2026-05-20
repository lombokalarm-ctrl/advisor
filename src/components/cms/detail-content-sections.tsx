import { FaqList } from "@/components/cms/faq-list";
import { GalleryGrid } from "@/components/cms/gallery-grid";
import { PortableRichText } from "@/components/cms/portable-rich-text";
import type { FaqItem, GalleryImage, PortableTextNode } from "@/types/content";
import Image from "next/image";

type DetailContentSectionsProps = {
  content?: PortableTextNode[];
  mainImage?: GalleryImage | null;
  gallery?: GalleryImage[];
  faqs?: FaqItem[];
  fallbackContent: string;
};

export function DetailContentSections({
  content,
  mainImage,
  gallery,
  faqs,
  fallbackContent,
}: DetailContentSectionsProps) {
  const contentValue =
    content?.length
      ? content
      : [
          {
            _key: "fallback-content",
            _type: "block",
            style: "normal",
            markDefs: [],
            children: [{ _key: "fallback-span", _type: "span", marks: [], text: fallbackContent }],
          },
        ];

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="rounded-[2rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.96)_100%)] p-5 shadow-[0_24px_70px_rgba(8,21,34,0.07)] backdrop-blur-sm sm:rounded-[2.25rem] sm:p-6 lg:p-10">
          {mainImage?.url && (
            <figure className="mb-7 overflow-hidden rounded-[1.5rem] border border-[rgba(16,34,51,0.08)] bg-[var(--color-surface)] shadow-[0_16px_36px_rgba(8,21,34,0.05)] sm:mb-8 sm:rounded-[1.8rem]">
              <Image
                alt={mainImage.alt || mainImage.caption || "LombokAdvisor image"}
                className="aspect-[16/8] w-full object-cover"
                height={900}
                src={mainImage.url}
                width={1600}
              />
              {(mainImage.caption || mainImage.alt) && (
                <figcaption className="px-5 py-4 text-sm leading-7 text-[var(--color-muted)]">
                  {mainImage.caption || mainImage.alt}
                </figcaption>
              )}
            </figure>
          )}
          <PortableRichText value={contentValue} />
        </div>
      </section>
      <GalleryGrid items={gallery} />
      <FaqList items={faqs} />
    </>
  );
}

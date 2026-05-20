"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";

import type { PortableTextNode } from "@/types/content";
import { urlForImage } from "@/sanity/lib/image";

type PortableRichTextProps = {
  value?: PortableTextNode[];
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-12 font-display text-[2rem] leading-tight tracking-[-0.02em] text-[var(--color-ink)] sm:text-[2.3rem] md:text-[2.7rem]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-display text-[1.55rem] leading-tight tracking-[-0.01em] text-[var(--color-ink)] sm:text-[1.8rem] md:text-[2rem]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-10 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-[linear-gradient(180deg,rgba(240,236,227,0.75)_0%,rgba(255,255,255,0.9)_100%)] px-5 py-5 text-[1.02rem] italic leading-8 text-[var(--color-ink)] shadow-[0_18px_40px_rgba(8,21,34,0.04)] sm:px-6">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="text-[15px] leading-8 text-[var(--color-muted)] md:text-[1.02rem] md:leading-9">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="ml-5 mt-5 list-disc space-y-3 text-[var(--color-muted)] marker:text-[var(--color-brand)]">{children}</ul>,
    number: ({ children }) => <ol className="ml-5 mt-5 list-decimal space-y-3 text-[var(--color-muted)] marker:font-semibold marker:text-[var(--color-brand)]">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1 text-[15px] leading-8 md:text-[1.02rem] md:leading-9">{children}</li>,
    number: ({ children }) => <li className="pl-1 text-[15px] leading-8 md:text-[1.02rem] md:leading-9">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[var(--color-ink)]">{children}</strong>,
    em: ({ children }) => <em className="italic text-[var(--color-ink)]">{children}</em>,
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      if (isExternal) {
        return (
          <a
            className="font-medium text-[var(--color-brand)] underline decoration-[var(--color-accent)]/80 underline-offset-4 transition hover:text-[var(--color-ink)]"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          className="font-medium text-[var(--color-brand)] underline decoration-[var(--color-accent)]/80 underline-offset-4 transition hover:text-[var(--color-ink)]"
          href={href}
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlForImage(value)?.width(1400).quality(80).url();

      if (!imageUrl) {
        return null;
      }

      const alt = typeof value?.alt === "string" ? value.alt : "LombokAdvisor content image";

      return (
        <figure className="mt-10 overflow-hidden rounded-[1.8rem] border border-[rgba(16,34,51,0.08)] bg-white shadow-[0_18px_44px_rgba(8,21,34,0.05)]">
          <Image
            alt={alt}
            className="h-auto w-full object-cover"
            height={900}
            src={imageUrl}
            width={1400}
          />
          {alt && <figcaption className="px-5 py-4 text-sm leading-7 text-[var(--color-muted)]">{alt}</figcaption>}
        </figure>
      );
    },
  },
};

export function PortableRichText({ value }: PortableRichTextProps) {
  if (!value?.length) {
    return null;
  }

  return (
    <div className="space-y-6 text-pretty">
      <PortableText components={components} value={value} />
    </div>
  );
}

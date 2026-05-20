"use client";

import { NextStudio } from "next-sanity/studio";

import { isSanityConfigured } from "@/sanity/lib/client";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-20">
        <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_24px_60px_rgba(8,21,34,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">
            Sanity Setup
          </p>
          <h1 className="mt-4 font-display text-5xl text-[var(--color-ink)]">Studio siap, env belum diisi.</h1>
          <p className="mt-5 text-sm leading-8 text-[var(--color-muted)]">
            Isi `NEXT_PUBLIC_SANITY_PROJECT_ID` dan `NEXT_PUBLIC_SANITY_DATASET` pada file `.env.local`,
            lalu restart dev server untuk membuka Sanity Studio penuh di route ini.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}

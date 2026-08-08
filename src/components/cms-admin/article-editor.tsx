"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buildArticleSeoAudit } from "@/lib/custom-cms/article-seo";
import { plainTextToPortableText, portableTextToPlainText } from "@/lib/custom-cms/content-utils";
import type { CmsArticleRecord } from "@/types/custom-cms";
import { LogoutButton } from "@/components/cms-admin/logout-button";

type ArticleEditorProps = {
  article?: CmsArticleRecord | null;
};

type FaqDraft = {
  question: string;
  answer: string;
};

type GalleryDraft = {
  url: string;
  alt: string;
  caption: string;
};

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (input: number) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatSnippetDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal belum valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(article?.status || "draft");
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [category, setCategory] = useState(article?.category || "Artikel");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [description, setDescription] = useState(article?.description || "");
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocal(article?.publishedAt));
  const [ctaMessage, setCtaMessage] = useState(article?.ctaMessage || "");
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription || "");
  const [keywords, setKeywords] = useState((article?.keywords || []).join(", "));
  const [relatedLinks, setRelatedLinks] = useState((article?.relatedLinks || []).join("\n"));
  const [mainImageUrl, setMainImageUrl] = useState(article?.mainImage?.url || "");
  const [mainImageAlt, setMainImageAlt] = useState(article?.mainImage?.alt || "");
  const [mainImageCaption, setMainImageCaption] = useState(article?.mainImage?.caption || "");
  const [faqs, setFaqs] = useState<FaqDraft[]>(article?.faqs?.length ? article.faqs : [{ question: "", answer: "" }]);
  const [gallery, setGallery] = useState<GalleryDraft[]>(
    article?.gallery?.length
      ? article.gallery.map((item) => ({
          url: item.url || "",
          alt: item.alt || "",
          caption: item.caption || "",
        }))
      : [{ url: "", alt: "", caption: "" }],
  );
  const [editorMode, setEditorMode] = useState<"simple" | "json">(article ? "json" : "simple");
  const [contentText, setContentText] = useState(portableTextToPlainText(article?.content));
  const [contentJson, setContentJson] = useState(JSON.stringify(article?.content || [], null, 2));
  const [feedback, setFeedback] = useState<string>("");
  const previewSlug = useMemo(() => (slug || title).trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, ""), [slug, title]);
  const parsedJsonContent = useMemo(() => {
    try {
      return JSON.parse(contentJson || "[]");
    } catch {
      return null;
    }
  }, [contentJson]);
  const contentForAudit = useMemo(
    () => (editorMode === "json" ? parsedJsonContent || [] : plainTextToPortableText(contentText)),
    [contentText, editorMode, parsedJsonContent],
  );
  const normalizedKeywords = keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const normalizedRelatedLinks = relatedLinks
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const seoAudit = useMemo(
    () =>
      buildArticleSeoAudit({
        title,
        seoTitle,
        metaDescription,
        keywords: normalizedKeywords,
        relatedLinks: normalizedRelatedLinks,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        mainImage: mainImageUrl
          ? {
              url: mainImageUrl,
              alt: mainImageAlt,
              caption: mainImageCaption,
            }
          : null,
        content: contentForAudit,
        faqs: faqs.filter((item) => item.question.trim() && item.answer.trim()),
        status,
      }),
    [
      title,
      seoTitle,
      metaDescription,
      normalizedKeywords,
      normalizedRelatedLinks,
      publishedAt,
      mainImageUrl,
      mainImageAlt,
      mainImageCaption,
      contentForAudit,
      faqs,
      status,
    ],
  );
  const snippetTitle = seoTitle.trim() || title.trim() || "Judul artikel";
  const snippetDescription = metaDescription.trim() || description.trim() || excerpt.trim() || "Meta description artikel akan muncul di sini.";
  const snippetPath = previewSlug ? `lombokadvisor.com/blog/${previewSlug}` : "lombokadvisor.com/blog/slug-artikel";

  function updateFaq(index: number, key: keyof FaqDraft, value: string) {
    setFaqs((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function updateGallery(index: number, key: keyof GalleryDraft, value: string) {
    setGallery((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function addFaq() {
    setFaqs((current) => [...current, { question: "", answer: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs((current) => (current.length === 1 ? [{ question: "", answer: "" }] : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  function addGalleryItem() {
    setGallery((current) => [...current, { url: "", alt: "", caption: "" }]);
  }

  function removeGalleryItem(index: number) {
    setGallery((current) => (current.length === 1 ? [{ url: "", alt: "", caption: "" }] : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    let content;

    try {
      content = editorMode === "json" ? JSON.parse(contentJson || "[]") : plainTextToPortableText(contentText);
    } catch {
      setFeedback("JSON konten tidak valid.");
      return;
    }

    if (status === "published" && seoAudit.blockers.length > 0) {
      setFeedback(`Artikel belum siap publish: ${seoAudit.blockers.join(" ")}`);
      return;
    }

    const payload = {
      currentSlug: article?.slug,
      title,
      slug,
      status,
      category,
      excerpt,
      description,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      content,
      mainImage: mainImageUrl
        ? {
            url: mainImageUrl,
            alt: mainImageAlt,
            caption: mainImageCaption,
          }
        : null,
      gallery: gallery.filter((item) => item.url.trim()),
      faqs: faqs.filter((item) => item.question.trim() && item.answer.trim()),
      relatedLinks: relatedLinks
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      ctaMessage,
      seoTitle,
      metaDescription,
      keywords: keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      const response = await fetch("/api/cms/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string; article?: CmsArticleRecord };

      if (!response.ok || !result.article) {
        setFeedback(result.error || "Gagal menyimpan artikel.");
        return;
      }

      setFeedback("Artikel berhasil disimpan.");
      router.push(`/cms/articles/${result.article.slug}`);
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!article?.slug || !window.confirm("Hapus artikel ini dari CMS custom?")) {
      return;
    }

    const response = await fetch(`/api/cms/articles/${article.slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setFeedback("Gagal menghapus artikel.");
      return;
    }

    router.push("/cms/articles");
    router.refresh();
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">CMS Artikel</p>
            <h1 className="mt-3 font-display text-[2rem] leading-tight text-[var(--color-ink)]">
              {article ? "Edit artikel" : "Artikel baru"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full border border-[rgba(16,34,51,0.12)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)]" href="/cms/articles">
              Kembali ke daftar
            </Link>
            {previewSlug ? (
              <Link className="rounded-full bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white" href={`/blog/${previewSlug}`} target="_blank">
                Preview publik
              </Link>
            ) : null}
            <LogoutButton className="rounded-full border border-[rgba(16,34,51,0.12)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)]" />
          </div>
        </div>
        {feedback ? <p className="mt-4 text-sm font-medium text-[var(--color-brand)]">{feedback}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Informasi utama</h2>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Judul</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Slug</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Kategori</span>
              <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={category} onChange={(event) => setCategory(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Status</span>
              <select className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={status} onChange={(event) => setStatus(event.target.value as "draft" | "published")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Excerpt</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Deskripsi hero</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Tanggal publish</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
          </label>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">SEO dan CTA</h2>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">SEO title</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
            <p className="text-xs text-[var(--color-muted)]">Panjang saat ini: {seoAudit.titleLength} karakter. Idealnya 45-65 karakter.</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Meta description</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} />
            <p className="text-xs text-[var(--color-muted)]">Panjang saat ini: {seoAudit.metaLength} karakter. Idealnya 120-160 karakter.</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Keywords</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" placeholder="pisahkan dengan koma" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">CTA message</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={ctaMessage} onChange={(event) => setCtaMessage(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Related links</span>
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" placeholder="/paket-wisata-lombok" value={relatedLinks} onChange={(event) => setRelatedLinks(event.target.value)} />
          </label>
          <div className="rounded-[1.5rem] border border-[rgba(16,34,51,0.08)] bg-[rgba(248,245,239,0.7)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand)]">Preview Snippet</p>
            <p className="mt-3 text-[13px] text-[#1a0dab]">{snippetTitle}</p>
            <p className="mt-1 text-xs text-[#006621]">
              {snippetPath}
              {publishedAt ? ` • ${formatSnippetDate(publishedAt)}` : ""}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{snippetDescription}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Checklist SEO Publish</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[rgba(16,34,51,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Kata</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{seoAudit.wordCount}</p>
            </div>
            <div className="rounded-2xl bg-[rgba(16,34,51,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Baca</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{seoAudit.readingTimeMinutes} menit</p>
            </div>
            <div className="rounded-2xl bg-[rgba(16,34,51,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Keyword</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{normalizedKeywords.length}</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Wajib untuk publish</p>
            {seoAudit.blockers.length ? (
              seoAudit.blockers.map((item) => (
                <div key={item} className="rounded-2xl border border-[rgba(145,21,21,0.18)] bg-[#fff7f7] px-4 py-3 text-sm leading-7 text-[#7f1d1d]">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[rgba(12,139,136,0.18)] bg-[rgba(12,139,136,0.08)] px-4 py-3 text-sm leading-7 text-[#0b6b68]">
                Artikel sudah lolos syarat minimum untuk dipublish.
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Rekomendasi Optimasi</h2>
          {seoAudit.recommendations.length ? (
            seoAudit.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-[rgba(16,34,51,0.08)] bg-[rgba(16,34,51,0.03)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)]">
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[rgba(16,34,51,0.08)] bg-[rgba(16,34,51,0.03)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)]">
              Tidak ada rekomendasi utama. Struktur artikel sudah cukup ramah SEO.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Konten artikel</h2>
          <div className="flex gap-2 rounded-full bg-[rgba(16,34,51,0.06)] p-1 text-sm">
            <button
              className={`rounded-full px-4 py-2 font-semibold ${editorMode === "simple" ? "bg-white text-[var(--color-ink)]" : "text-[var(--color-muted)]"}`}
              onClick={() => setEditorMode("simple")}
              type="button"
            >
              Editor sederhana
            </button>
            <button
              className={`rounded-full px-4 py-2 font-semibold ${editorMode === "json" ? "bg-white text-[var(--color-ink)]" : "text-[var(--color-muted)]"}`}
              onClick={() => setEditorMode("json")}
              type="button"
            >
              JSON lanjutan
            </button>
          </div>
        </div>
        {editorMode === "simple" ? (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              Gunakan paragraf biasa. Awali <code>##</code> untuk heading 2, <code>###</code> untuk heading 3, <code>-</code> untuk bullet, dan <code>&gt;</code> untuk quote.
            </p>
            <textarea
              className="min-h-[420px] w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3 font-mono text-sm"
              value={contentText}
              onChange={(event) => setContentText(event.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              className="min-h-[420px] w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3 font-mono text-sm"
              value={contentJson}
              onChange={(event) => setContentJson(event.target.value)}
            />
            {!parsedJsonContent ? (
              <p className="text-sm font-medium text-[#8b1f1f]">JSON konten belum valid. Perbaiki sebelum menyimpan artikel.</p>
            ) : null}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Gambar utama</h2>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">URL gambar</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={mainImageUrl} onChange={(event) => setMainImageUrl(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Alt</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={mainImageAlt} onChange={(event) => setMainImageAlt(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Caption</span>
            <input className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3" value={mainImageCaption} onChange={(event) => setMainImageCaption(event.target.value)} />
          </label>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">FAQ</h2>
            <button className="rounded-full border border-[rgba(16,34,51,0.12)] px-4 py-2 text-sm font-semibold" onClick={addFaq} type="button">
              Tambah FAQ
            </button>
          </div>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div key={`faq-${index + 1}`} className="rounded-2xl border border-[rgba(16,34,51,0.1)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">FAQ {index + 1}</p>
                  <button className="text-sm font-semibold text-[var(--color-brand)]" onClick={() => removeFaq(index)} type="button">
                    Hapus
                  </button>
                </div>
                <input
                  className="mt-3 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
                  placeholder="Pertanyaan"
                  value={item.question}
                  onChange={(event) => updateFaq(index, "question", event.target.value)}
                />
                <textarea
                  className="mt-3 min-h-24 w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
                  placeholder="Jawaban"
                  value={item.answer}
                  onChange={(event) => updateFaq(index, "answer", event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(8,21,34,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[1.5rem] text-[var(--color-ink)]">Gallery</h2>
          <button className="rounded-full border border-[rgba(16,34,51,0.12)] px-4 py-2 text-sm font-semibold" onClick={addGalleryItem} type="button">
            Tambah gambar
          </button>
        </div>
        <div className="space-y-4">
          {gallery.map((item, index) => (
            <div key={`gallery-${index + 1}`} className="grid gap-3 rounded-2xl border border-[rgba(16,34,51,0.1)] p-4 lg:grid-cols-[1.3fr,1fr,1fr,auto] lg:items-start">
              <input
                className="rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
                placeholder="URL gambar"
                value={item.url}
                onChange={(event) => updateGallery(index, "url", event.target.value)}
              />
              <input
                className="rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
                placeholder="Alt"
                value={item.alt}
                onChange={(event) => updateGallery(index, "alt", event.target.value)}
              />
              <input
                className="rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
                placeholder="Caption"
                value={item.caption}
                onChange={(event) => updateGallery(index, "caption", event.target.value)}
              />
              <button className="rounded-full border border-[rgba(16,34,51,0.12)] px-4 py-3 text-sm font-semibold" onClick={() => removeGalleryItem(index)} type="button">
                Hapus
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <button className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending} type="submit">
          {isPending ? "Menyimpan..." : "Simpan artikel"}
        </button>
        {article ? (
          <button className="rounded-full border border-[rgba(145,21,21,0.18)] px-6 py-3 text-sm font-semibold text-[#8b1f1f]" onClick={handleDelete} type="button">
            Hapus artikel
          </button>
        ) : null}
      </section>
    </form>
  );
}

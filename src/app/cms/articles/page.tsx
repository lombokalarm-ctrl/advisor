import Link from "next/link";

import { LogoutButton } from "@/components/cms-admin/logout-button";
import { getAllCmsArticles, initializeArticleStore } from "@/lib/custom-cms/article-store";
import { requireCmsPageAuth } from "@/lib/custom-cms/auth-server";

export const dynamic = "force-dynamic";

export default async function CmsArticlesPage() {
  await requireCmsPageAuth("/cms/articles");
  await initializeArticleStore();
  const articles = await getAllCmsArticles();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white p-6 shadow-[0_24px_70px_rgba(8,21,34,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">Custom CMS</p>
            <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-[var(--color-ink)]">Kelola artikel blog</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
              Halaman ini membaca dan menulis artikel dari storage lokal CMS custom. Artikel publik blog sekarang diambil dari sumber ini.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full border border-[rgba(16,34,51,0.12)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)]" href="/">
              Lihat situs
            </Link>
            <Link className="rounded-full bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white" href="/cms/articles/new">
              Artikel baru
            </Link>
            <LogoutButton className="rounded-full border border-[rgba(16,34,51,0.12)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)]" />
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white shadow-[0_24px_70px_rgba(8,21,34,0.06)]">
        <div className="grid grid-cols-[1.6fr,0.9fr,0.7fr,0.9fr] gap-4 border-b border-[rgba(16,34,51,0.08)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          <span>Judul</span>
          <span>Kategori</span>
          <span>Status</span>
          <span>Update</span>
        </div>
        <div className="divide-y divide-[rgba(16,34,51,0.08)]">
          {articles.map((article) => (
            <Link
              key={article.id}
              className="grid grid-cols-1 gap-3 px-6 py-5 transition hover:bg-[rgba(16,34,51,0.02)] md:grid-cols-[1.6fr,0.9fr,0.7fr,0.9fr]"
              href={`/cms/articles/${article.slug}`}
            >
              <div>
                <h2 className="font-semibold text-[var(--color-ink)]">{article.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">/blog/{article.slug}</p>
              </div>
              <p className="text-sm text-[var(--color-muted)]">{article.category}</p>
              <p className="text-sm font-semibold text-[var(--color-brand)]">{article.status}</p>
              <p className="text-sm text-[var(--color-muted)]">{new Date(article.updatedAt).toLocaleString("id-ID")}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

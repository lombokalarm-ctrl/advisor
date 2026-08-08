import { NextResponse } from "next/server";

import { ensureCmsApiAuthorized } from "@/app/api/cms/auth/guard";
import { buildArticleSeoAudit } from "@/lib/custom-cms/article-seo";
import { getAllCmsArticles, saveCmsArticle } from "@/lib/custom-cms/article-store";
import type { CmsArticleInput } from "@/types/custom-cms";

export async function GET() {
  const unauthorized = await ensureCmsApiAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  const articles = await getAllCmsArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const unauthorized = await ensureCmsApiAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as CmsArticleInput & { currentSlug?: string };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Judul artikel wajib diisi." }, { status: 400 });
    }

    if (!body.category?.trim()) {
      return NextResponse.json({ error: "Kategori artikel wajib diisi." }, { status: 400 });
    }

    if (!body.excerpt?.trim()) {
      return NextResponse.json({ error: "Excerpt artikel wajib diisi." }, { status: 400 });
    }

    const seoAudit = buildArticleSeoAudit({
      title: body.title,
      seoTitle: body.seoTitle,
      metaDescription: body.metaDescription,
      keywords: body.keywords,
      relatedLinks: body.relatedLinks,
      publishedAt: body.publishedAt,
      mainImage: body.mainImage,
      content: body.content,
      faqs: body.faqs,
      status: body.status,
    });

    if (body.status === "published" && seoAudit.blockers.length > 0) {
      return NextResponse.json(
        {
          error: `Artikel belum siap publish: ${seoAudit.blockers.join(" ")}`,
        },
        { status: 400 },
      );
    }

    const article = await saveCmsArticle(body);
    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan artikel.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

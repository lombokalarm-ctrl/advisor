import { NextResponse } from "next/server";

import { ensureCmsApiAuthorized } from "@/app/api/cms/auth/guard";
import { deleteCmsArticle, getCmsArticleBySlug } from "@/lib/custom-cms/article-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const unauthorized = await ensureCmsApiAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await context.params;
  const article = await getCmsArticleBySlug(slug, { includeDraft: true });

  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function DELETE(_: Request, context: RouteContext) {
  const unauthorized = await ensureCmsApiAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await context.params;
  const deleted = await deleteCmsArticle(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { notFound } from "next/navigation";

import { ArticleEditor } from "@/components/cms-admin/article-editor";
import { getCmsArticleBySlug } from "@/lib/custom-cms/article-store";
import { requireCmsPageAuth } from "@/lib/custom-cms/auth-server";

export const dynamic = "force-dynamic";

type CmsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CmsArticlePage({ params }: CmsArticlePageProps) {
  const { slug } = await params;
  await requireCmsPageAuth(`/cms/articles/${slug}`);
  const article = await getCmsArticleBySlug(slug, { includeDraft: true });

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
      <ArticleEditor article={article} />
    </main>
  );
}

import { ArticleEditor } from "@/components/cms-admin/article-editor";
import { requireCmsPageAuth } from "@/lib/custom-cms/auth-server";

export const dynamic = "force-dynamic";

export default async function NewCmsArticlePage() {
  await requireCmsPageAuth("/cms/articles/new");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
      <ArticleEditor />
    </main>
  );
}

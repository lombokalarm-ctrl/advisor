import { redirect } from "next/navigation";

import { LoginForm } from "@/components/cms-admin/login-form";
import { isCmsAuthConfigured } from "@/lib/custom-cms/auth";
import { getCmsSession } from "@/lib/custom-cms/auth-server";

export const dynamic = "force-dynamic";

export default async function CmsLoginPage() {
  const session = await getCmsSession();

  if (session) {
    redirect("/cms/articles");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
      <LoginForm isConfigured={isCmsAuthConfigured()} />
    </main>
  );
}

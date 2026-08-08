"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type LoginFormProps = {
  isConfigured: boolean;
};

export function LoginForm({ isConfigured }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const nextPath = searchParams.get("next") || "/cms/articles";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/cms/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "Login CMS gagal.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <section className="w-full max-w-xl rounded-[2rem] border border-[rgba(16,34,51,0.08)] bg-white p-8 shadow-[0_24px_70px_rgba(8,21,34,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">CMS Login</p>
      <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-[var(--color-ink)]">Masuk ke Custom CMS</h1>
      <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
        Gunakan akun admin CMS untuk mengelola artikel blog, draft, dan update konten transaksi.
      </p>

      {!isConfigured ? (
        <div className="mt-6 rounded-3xl border border-[rgba(145,21,21,0.18)] bg-[#fff7f7] px-5 py-4 text-sm leading-7 text-[#7f1d1d]">
          Auth CMS belum aktif karena environment belum lengkap. Tambahkan `CMS_ADMIN_USERNAME`, `CMS_ADMIN_PASSWORD`, dan `CMS_AUTH_SECRET`.
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">Username</span>
          <input
            autoComplete="username"
            className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
            disabled={!isConfigured || isPending}
            onChange={(event) => setUsername(event.target.value)}
            value={username}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-ink)]">Password</span>
          <input
            autoComplete="current-password"
            className="w-full rounded-2xl border border-[rgba(16,34,51,0.12)] px-4 py-3"
            disabled={!isConfigured || isPending}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="text-sm font-medium text-[#8b1f1f]">{error}</p> : null}
        <button
          className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isConfigured || isPending}
          type="submit"
        >
          {isPending ? "Memproses..." : "Masuk CMS"}
        </button>
      </form>
    </section>
  );
}

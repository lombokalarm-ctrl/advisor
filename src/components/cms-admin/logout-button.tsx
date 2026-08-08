"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className={className}
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const response = await fetch("/api/cms/auth/logout", {
              method: "POST",
            });

            if (!response.ok) {
              setError("Gagal logout dari CMS.");
              return;
            }

            router.push("/cms/login");
            router.refresh();
          });
        }}
        type="button"
      >
        {isPending ? "Logout..." : "Logout CMS"}
      </button>
      {error ? <p className="text-sm font-medium text-[#8b1f1f]">{error}</p> : null}
    </div>
  );
}

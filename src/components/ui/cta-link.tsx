import Link from "next/link";
import type { ReactNode } from "react";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variantClasses = {
  primary:
    "bg-[var(--color-accent)] text-slate-950 shadow-[0_18px_50px_rgba(245,197,92,0.28)] hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)] focus-visible:-translate-y-0.5",
  secondary:
    "border border-white/15 bg-white/8 text-white hover:border-white/30 hover:bg-white/12 focus-visible:border-white/30 focus-visible:bg-white/12",
  ghost:
    "text-[var(--color-ink)] hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)]",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  className = "",
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminUserBar } from "@/components/admin/user-bar";

export const metadata: Metadata = {
  title: { default: "Casting admin", template: "%s — Casting admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

/**
 * Minimal staff chrome — no cinematic navigation, analytics, or external
 * requests. The session is only read inside the Suspense boundary.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-ivory">
      <a
        href="#admin-main"
        className="label sr-only z-50 bg-gold px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="gutter border-b border-line bg-night">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <Link href="/admin/casting" className="flex items-baseline gap-3">
            <span className="font-display text-lg uppercase tracking-wide">Nation Divided</span>
            <span className="label text-ash">Casting review</span>
          </Link>
          <Suspense fallback={null}>
            <AdminUserBar />
          </Suspense>
        </div>
      </header>
      <main id="admin-main" className="gutter flex-1 py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <footer className="gutter border-t border-line py-6">
        <p className="label mx-auto max-w-7xl text-ash">
          Confidential — applicant information is private. Do not copy or share outside the casting team.
        </p>
      </footer>
    </div>
  );
}

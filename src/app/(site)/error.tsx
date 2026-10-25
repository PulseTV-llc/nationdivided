"use client";

import Link from "next/link";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";
  return (
    <section className="gutter flex min-h-[80svh] flex-col justify-center pt-[var(--nav-h)]">
      <p className="label mb-6 text-crimson-lit">Signal lost</p>
      <h1 className="display text-[clamp(3rem,9vw,9rem)]">Something went wrong.</h1>
      <p className="mt-6 max-w-lg text-bone">
        This part of the page couldn&rsquo;t load. If you were submitting an application, nothing was sent — please try again.
      </p>
      {digest && <p className="label mt-4 text-ash">Error reference: {digest}</p>}
      <div className="mt-10 flex gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="label min-h-12 rounded-full bg-ivory px-7 text-ink transition-colors hover:bg-gold"
        >
          Try again
        </button>
        <Link href="/" className="label inline-flex min-h-12 items-center rounded-full border border-ivory/40 px-7 hover:border-gold">
          Home
        </Link>
      </div>
    </section>
  );
}

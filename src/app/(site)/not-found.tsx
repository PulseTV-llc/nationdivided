import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-[90svh] flex-col justify-center pt-[var(--nav-h)]">
      <p className="label mb-6 text-gold">404 · Off the map</p>
      <h1 className="display text-[clamp(3.4rem,11vw,11rem)]">
        This page
        <br />
        <span className="text-bone">isn&rsquo;t here.</span>
      </h1>
      <p className="editorial mt-8 max-w-xl text-2xl italic text-ivory">But there are millions of other stories.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/" className="label inline-flex min-h-12 items-center rounded-full bg-ivory px-7 text-ink hover:bg-gold">
          Back to the film
        </Link>
        <Link href="/casting" className="label inline-flex min-h-12 items-center rounded-full border border-ivory/40 px-7 hover:border-gold">
          Share your story
        </Link>
      </div>
    </section>
  );
}

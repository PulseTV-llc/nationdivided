import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getParticipant, people } from "@/content/people";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { Cta } from "@/components/ui/cta";

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getParticipant(slug);
  if (!p) return { title: "Story not found" };
  return {
    title: p.placeholder ? `${p.displayName} (in production)` : p.displayName,
    description: p.summary,
    alternates: { canonical: `/stories/${p.slug}` },
    // Unpublished (in-production) profiles stay out of search results.
    robots: p.placeholder ? { index: false, follow: true } : undefined,
  };
}

export default function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <Story params={params} />
    </Suspense>
  );
}

async function Story({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getParticipant(slug);
  if (!p) notFound();
  const index = people.indexOf(p);
  const next = people[(index + 1) % people.length];

  return (
    <article>
      <header className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden={p.portrait ? undefined : true}>
          <Frame image={p.portrait} scene={p.scene} tint="neutral" seed={60 + index} showLabel={false} className="h-full w-full" priority drift />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden />
        <div className="gutter pb-16 pt-[calc(var(--nav-h)+3rem)]">
          <p className="label mb-6 text-gold">
            {String(index + 1).padStart(2, "0")} · Chapter: {p.chapter}
          </p>
          <h1 className="display text-[clamp(3.6rem,12vw,12rem)] leading-[0.82]">{p.displayName}</h1>
          <p className="label mt-6 text-bone">
            {p.role} · {p.location ?? "Location withheld"}
          </p>
        </div>
      </header>

      {p.placeholder && (
        <div role="note" className="gutter border-y border-gold/40 bg-gold/5 py-5 text-sm text-bone">
          <span className="label mr-3 text-gold">In production</span>
          This story is still being filmed and will be published once the participant has approved it.
        </div>
      )}

      <section className="gutter grid gap-14 py-[clamp(5rem,12vh,9rem)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label mb-4 text-ash">In brief</p>
          <Reveal as="p" className="editorial text-3xl italic leading-tight text-ivory">
            {p.summary}
          </Reveal>
        </div>
        <div className="space-y-6 text-lg leading-[1.75] text-bone lg:col-span-6 lg:col-start-6">
          {p.story.map((para, i) => (
            <Reveal as="p" key={i} delay={i * 60}>
              {para}
            </Reveal>
          ))}
        </div>
      </section>

      {p.quotes.length > 0 && (
        <section aria-label="In their words" className="border-t border-line bg-night py-[clamp(5rem,12vh,9rem)]">
          {p.quotes.map((q, i) => (
            <figure key={i} className="gutter mx-auto max-w-5xl py-10 text-center">
              <blockquote className="editorial text-[clamp(2rem,4.5vw,4.4rem)] leading-[1.08] text-ivory">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              {q.context && <figcaption className="label mt-6 text-ash">{q.context}</figcaption>}
            </figure>
          ))}
        </section>
      )}

      {p.excerptYouTubeId && (
        <section aria-labelledby="excerpt-title" className="gutter border-t border-line py-[clamp(5rem,12vh,9rem)]">
          <h2 id="excerpt-title" className="label mb-8 text-gold">
            Documentary excerpt
          </h2>
          <YouTubeEmbed id={p.excerptYouTubeId} title={`${p.displayName} — excerpt from Nation Divided`} />
        </section>
      )}

      <nav aria-label="Next story" className="border-t border-line">
        <Link href={`/stories/${next.slug}`} data-cursor="Next" className="gutter group flex items-end justify-between gap-6 py-20">
          <span>
            <span className="label mb-4 block text-ash">Next story</span>
            <Lines as="span" lines={[next.displayName]} className="display block text-[clamp(2.8rem,8vw,8rem)] transition-colors group-hover:text-gold" />
          </span>
          <span aria-hidden className="display text-6xl text-gold transition-transform duration-500 group-hover:translate-x-3">
            &rarr;
          </span>
        </Link>
      </nav>
      <div className="gutter pb-20">
        <Cta href="/stories" variant="outline">
          All stories
        </Cta>
      </div>
    </article>
  );
}

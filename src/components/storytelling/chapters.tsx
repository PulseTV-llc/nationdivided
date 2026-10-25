"use client";

import { useEffect, useRef, useState } from "react";
import { chapters } from "@/content/story";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal, Words } from "@/components/cinematic/reveal";
import type { PlaceholderScene } from "@/content/media";
import type { Tint } from "@/components/cinematic/scene";

const scenes: PlaceholderScene[] = ["crowd", "road", "kitchen", "diner", "porch"];
const tints: Tint[] = ["neutral", "crimson", "steel", "gold", "neutral"];

/** BEYOND THE BALLOT — the premise told as five documentary chapters. */
export function Chapters() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="story" aria-labelledby="story-title" className="relative bg-ink">
      {/* Opening */}
      <div className="gutter grid gap-10 border-t border-line pb-24 pt-[clamp(6rem,14vh,10rem)] md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label mb-8 text-gold">The Story</p>
          <Lines
            as="h2"
            lines={["Beyond", "the ballot"]}
            className="display text-[clamp(3.6rem,12vw,12.5rem)]"
          />
          <span id="story-title" className="sr-only">
            Beyond the ballot
          </span>
        </div>
        <div className="space-y-5 self-end md:col-span-4 md:col-start-9">
          <Words
            className="editorial text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.15] text-ivory"
            text="Every election produces winners and losers. Every vote carries expectations."
          />
          <Words
            delay={300}
            className="editorial text-[clamp(1.5rem,2.4vw,2.1rem)] italic leading-[1.15] text-gold"
            text="But the story doesn't end when the ballots are counted."
          />
        </div>
      </div>

      <div className="gutter relative grid md:grid-cols-12 md:gap-10">
        {/* Sticky chapter index (desktop) */}
        <aside className="hidden md:col-span-4 md:block" aria-hidden>
          <div className="sticky top-0 flex h-[100svh] flex-col justify-center">
            <div className="relative h-[clamp(9rem,22vw,20rem)] overflow-hidden">
              {chapters.map((c, i) => (
                <span
                  key={c.id}
                  className="display absolute inset-0 text-[clamp(9rem,22vw,20rem)] leading-none text-transparent transition-transform duration-[900ms] ease-[var(--ease-cinema)] [-webkit-text-stroke:1px_rgb(201_165_106/0.8)]"
                  style={{ transform: `translateY(${(i - active) * 100}%)` }}
                >
                  {c.number}
                </span>
              ))}
            </div>
            <ol className="mt-10 space-y-3">
              {chapters.map((c, i) => (
                <li key={c.id} className="flex items-center gap-4">
                  <span
                    className={`h-px transition-all duration-700 ease-[var(--ease-out-expo)] ${
                      i === active ? "w-14 bg-gold" : "w-6 bg-ivory/25"
                    }`}
                  />
                  <span className={`label transition-colors duration-500 ${i === active ? "text-ivory" : "text-smoke"}`}>
                    {c.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <ol className="md:col-span-8">
          {chapters.map((c, i) => (
            <li
              key={c.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              aria-labelledby={`chapter-${c.id}`}
              className="flex min-h-[100svh] flex-col justify-center border-b border-line py-20 last:border-b-0"
            >
              <div className="mb-8 flex items-baseline justify-between gap-6">
                <p className="label text-ash">
                  <span className="text-gold md:hidden">{c.number} · </span>Chapter {c.number} — {c.kicker}
                </p>
              </div>
              <Lines
                as="h3"
                lines={[c.title]}
                className="display text-[clamp(3rem,8vw,8rem)]"
              />
              <span id={`chapter-${c.id}`} className="sr-only">
                Chapter {c.number}: {c.title}
              </span>
              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <Reveal mode="mask" className="relative aspect-[4/5] lg:order-2">
                  <Frame scene={scenes[i]} tint={tints[i]} seed={i + 3} label={c.title} className="h-full w-full" drift />
                </Reveal>
                <div className="flex flex-col justify-between gap-10">
                  <Reveal as="p" className="text-lg leading-relaxed text-bone">
                    {c.body}
                  </Reveal>
                  <Reveal as="blockquote" delay={200} className="border-l border-gold/60 pl-6">
                    <p className="label mb-3 text-ash">We asked</p>
                    <p className="editorial text-[clamp(1.6rem,2.6vw,2.4rem)] italic leading-[1.1] text-ivory">
                      &ldquo;{c.question}&rdquo;
                    </p>
                  </Reveal>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

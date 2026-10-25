"use client";

import { useEffect, useRef, useState } from "react";
import { eras, validateTimeline, type TimelineEntry } from "@/content/timeline";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";
import { Lines } from "@/components/cinematic/reveal";

const entries = validateTimeline();

function EntryCard({ e, index }: { e: TimelineEntry; index: number }) {
  return (
    <article className="group relative flex h-full flex-col border-l border-line pl-6 pt-10">
      <span aria-hidden className="absolute -left-[5px] top-[2.6rem] h-[9px] w-[9px] rotate-45 border border-gold bg-ink transition-colors group-hover:bg-gold" />
      <p className="label mb-3 flex items-center gap-3 text-ash">
        <span className="tabular-nums text-gold">{String(index + 1).padStart(2, "0")}</span>
        <span>{e.date}</span>
      </p>
      <h4 className="display mb-4 text-[clamp(1.7rem,2.4vw,2.4rem)] leading-[0.95] text-ivory">{e.title}</h4>
      <p className="max-w-[34ch] leading-relaxed text-bone">{e.body}</p>
      <div className="mt-auto pt-6">
        {e.kind === "fact" ? (
          <div>
            <p className="label mb-2 text-[0.6rem] text-ash">Public record · Source</p>
            <ul className="space-y-1">
              {e.sources?.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-steel-lit underline decoration-steel-lit/40 underline-offset-4 hover:decoration-steel-lit"
                  >
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="label text-[0.6rem] text-gold/80">Production note · StockHouse Films</p>
        )}
      </div>
    </article>
  );
}

/**
 * Interactive documentary timeline. Desktop: a horizontal track driven by
 * vertical scroll. Mobile and reduced motion: a vertical list.
 */
export function Timeline() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setHorizontal(mq.matches && !prefersReducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!horizontal) return;
    const sec = section.current!;
    const tr = track.current!;
    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const setHeight = () => {
        sec.style.height = `${distance() + window.innerHeight}px`;
      };
      setHeight();
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: setHeight,
        },
      });
      gsap.to("[data-tl-line]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true },
      });
      // Era labels drift slower than the track (parallax)
      gsap.utils.toArray<HTMLElement>("[data-era-word]").forEach((w) => {
        gsap.fromTo(
          w,
          { x: 120 },
          {
            x: -120,
            ease: "none",
            scrollTrigger: { trigger: w, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
    }, sec);
    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      sec.style.height = "";
    };
  }, [horizontal]);

  const header = (
    <div className="gutter shrink-0 lg:w-[34vw] lg:pr-10">
      <p className="label mb-6 text-gold">Timeline</p>
      <Lines as="h2" lines={["What happens", "after the vote?"]} className="display text-[clamp(3rem,6.5vw,7rem)]" />
      <p className="mt-8 max-w-sm text-bone">
        From the campaign trail to today. Public events are linked to their sources; production notes come from the film
        team.
      </p>
    </div>
  );

  if (!horizontal) {
    return (
      <section ref={section} aria-label="Documentary timeline" className="relative border-t border-line bg-ink py-24">
        {header}
        <div className="gutter mt-16 space-y-20">
          {eras.map((era) => {
            const items = entries.filter((e) => e.era === era.id);
            return (
              <div key={era.id}>
                <h3 className="mb-8 flex items-baseline gap-4 border-b border-line pb-4">
                  <span className="display text-6xl text-gold">{era.year}</span>
                  <span className="label text-ash">{era.title}</span>
                </h3>
                <ol className="space-y-12">
                  {items.map((e) => (
                    <li key={e.id}>
                      <EntryCard e={e} index={entries.indexOf(e)} />
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section ref={section} aria-label="Documentary timeline" className="relative border-t border-line bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div ref={track} className="flex h-[78vh] items-stretch will-change-transform">
          <div className="flex items-center">{header}</div>
          {eras.map((era) => {
            const items = entries.filter((e) => e.era === era.id);
            return (
              <div key={era.id} className="relative flex shrink-0 items-stretch">
                <div className="relative flex w-[30vw] shrink-0 flex-col justify-end pb-10 pl-6">
                  <span
                    data-era-word
                    aria-hidden
                    className="display pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[24vh] leading-none text-transparent [-webkit-text-stroke:1px_rgb(243_240_234/0.12)]"
                  >
                    {era.year}
                  </span>
                  <h3>
                    <span className="display block text-[clamp(4rem,9vw,9rem)] leading-none text-gold">{era.year}</span>
                    <span className="label mt-3 block text-ivory">{era.title}</span>
                  </h3>
                </div>
                <ol className="flex">
                  {items.map((e) => (
                    <li key={e.id} className="w-[min(26rem,28vw)] shrink-0 pr-8">
                      <EntryCard e={e} index={entries.indexOf(e)} />
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          <div className="w-[20vw] shrink-0" />
        </div>
        <div className="gutter absolute inset-x-0 bottom-8 flex items-center gap-4">
          <span className="label text-ash">2024</span>
          <span className="relative h-px flex-1 bg-line">
            <span data-tl-line className="absolute inset-0 origin-left scale-x-0 bg-gold" />
          </span>
          <span className="label text-ash">Beyond</span>
        </div>
      </div>
    </section>
  );
}

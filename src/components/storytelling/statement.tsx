"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";
import { site } from "@/content/site";

const LINES = [
  { text: "We know how America voted.", tone: "text-ivory" },
  { text: "But do we know why?", tone: "text-gold" },
];

/** Words light up as they pass through the frame, like a teleprompter. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);

  useGsap(
    (_c, el) => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll(".sw"),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: el.querySelector("[data-statement]"), start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.to(el.querySelector("[data-marquee]"), {
        xPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    ref,
  );

  const phrases = [...site.phrases, ...site.phrases];

  return (
    <section id="statement" ref={ref} aria-label="Why this film" className="relative overflow-hidden py-[clamp(7rem,18vh,14rem)]">
      <div className="gutter">
        <p className="label mb-10 flex items-center gap-3 text-ash">
          <span className="h-px w-10 bg-ash/50" aria-hidden /> Prologue
        </p>
        <h2 data-statement className="display max-w-[14ch] text-[clamp(3.2rem,10.5vw,11rem)]">
          {LINES.map((line, li) => (
            <span key={li} className={`block ${line.tone}`}>
              {line.text.split(" ").map((w, i) => (
                <span key={i} className="sw inline-block">
                  {w}&nbsp;
                </span>
              ))}
            </span>
          ))}
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-12">
          <p className="text-lg leading-relaxed text-bone md:col-span-5 md:col-start-7">
            Nation Divided follows real Americans beyond campaign rhetoric and political headlines, into kitchens, workplaces and
            front porches, to understand the hopes, doubts and everyday realities behind a vote.
          </p>
        </div>
      </div>

      <div aria-hidden className="mt-24 overflow-hidden border-y border-line py-6">
        <div data-marquee className="flex w-max gap-12 whitespace-nowrap">
          {phrases.map((p, i) => (
            <span key={i} className="editorial flex items-center gap-12 text-[clamp(1.8rem,3.5vw,3.2rem)] italic text-ivory/35">
              {p}
              <span className="inline-block h-2 w-2 rotate-45 border border-gold/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

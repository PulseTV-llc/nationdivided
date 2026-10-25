"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { StudioLogo } from "@/components/ui/studio-logo";

declare global {
  interface Window {
    __ndFirstPath?: string;
  }
}

export const INTRO_DONE_EVENT = "nd:intro-done";

function finish() {
  document.documentElement.dataset.intro = "done";
  try {
    sessionStorage.setItem("nd-intro", "1");
  } catch {}
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

/**
 * Opening title sequence: a slate, a running frame counter, and a hairline
 * that becomes the seam the screen splits along. Plays once per session on
 * a direct visit to the homepage; never for reduced motion.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const skip = () => {
    tl.current?.progress(1);
  };

  useLayoutEffect(() => {
    const html = document.documentElement;
    const shouldSkip = html.dataset.intro === "skip" || html.dataset.intro === "done" || window.__ndFirstPath !== "/";
    if (shouldSkip) {
      root.current?.setAttribute("hidden", "");
      if (html.dataset.intro !== "done") finish();
    }
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || el.hidden) return;
    window.__lenis?.stop();
    const counter = { f: 0 };
    const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

    const ctx = gsap.context(() => {
      const t = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          el.setAttribute("hidden", "");
          window.__lenis?.start();
        },
      });
      tl.current = t;
      t.from("[data-intro-label]", { opacity: 0, y: 12, duration: 0.8, stagger: 0.12 }, 0.15)
        .fromTo("[data-intro-line]", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.25)
        .to(
          counter,
          {
            f: 60,
            duration: 1.6,
            ease: "none",
            onUpdate: () => {
              if (tc.current) tc.current.textContent = `00:00:${pad(counter.f / 24)}:${pad(counter.f % 24)}`;
            },
          },
          0.25,
        )
        .to("[data-intro-label]", { opacity: 0, y: -8, duration: 0.45, stagger: 0.05, ease: "power2.in" }, 1.75)
        .add(() => finish(), 2.05)
        .to("[data-intro-top]", { yPercent: -100, duration: 1.15, ease: "power4.inOut" }, 2.0)
        .to("[data-intro-bottom]", { yPercent: 100, duration: 1.15, ease: "power4.inOut" }, 2.0)
        .to("[data-intro-line]", { opacity: 0, duration: 0.4 }, 2.1);
    }, el);

    return () => {
      ctx.revert();
      window.__lenis?.start();
    };
  }, []);

  return (
    <div ref={root} className="intro fixed inset-0 z-[80]" role="presentation">
      <div data-intro-top className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-intro-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
        <div data-intro-label className="mb-8 flex flex-col items-center gap-4">
          <StudioLogo decorative className="w-32 text-ivory sm:w-40" />
          <span className="label text-ash">presents</span>
        </div>
        <div data-intro-line className="h-px w-[min(70vw,46rem)] origin-center bg-gold" />
        <p data-intro-label className="label mt-6 flex gap-6 text-ash">
          <span>Reel 01</span>
          <span ref={tc} className="tabular-nums text-ivory">
            00:00:00:00
          </span>
          <span>Take 01</span>
        </p>
      </div>
      <button
        type="button"
        onClick={skip}
        className="label absolute bottom-6 right-6 min-h-11 px-3 text-ash transition-colors hover:text-ivory"
      >
        Skip intro
      </button>
    </div>
  );
}

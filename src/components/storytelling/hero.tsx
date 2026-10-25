"use client";

import { useEffect, useRef, useState } from "react";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { HorizonShader } from "@/components/cinematic/horizon-shader";
import { Timecode } from "@/components/cinematic/timecode";
import { Cta } from "@/components/ui/cta";
import { INTRO_DONE_EVENT } from "@/components/cinematic/intro";
import { prefersReducedMotion, useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Cinematic opening. The title is cut along a horizontal seam; pointer
 * movement nudges the halves off-register and scrolling pulls them apart.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();

  // Wait for the intro sequence (or its skip) before the title enters.
  useEffect(() => {
    const check = () => {
      const s = document.documentElement.dataset.intro;
      if (s === "done" || s === "skip") setReady(true);
    };
    check();
    window.addEventListener(INTRO_DONE_EVENT, check);
    const fallback = window.setTimeout(() => setReady(true), 3200);
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, check);
      window.clearTimeout(fallback);
    };
  }, []);

  // Pointer + scroll drive CSS variables — no React re-renders.
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const state = { mx: 0, tmx: 0, sp: 0 };
    const onMove = (e: PointerEvent) => {
      state.tmx = (e.clientX / window.innerWidth) * 2 - 1;
    };
    const loop = () => {
      state.mx += (state.tmx - state.mx) * 0.06;
      const h = el.offsetHeight || 1;
      state.sp = Math.min(1, Math.max(0, window.scrollY / h));
      el.style.setProperty("--mx", state.mx.toFixed(4));
      el.style.setProperty("--sp", state.sp.toFixed(4));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const video = media.heroVideo;

  return (
    <section
      ref={ref}
      data-ready={ready ? "" : undefined}
      aria-labelledby="hero-title"
      className="group/hero relative isolate flex h-[100svh] min-h-[620px] flex-col overflow-hidden"
      style={{ "--mx": 0, "--sp": 0 } as React.CSSProperties}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10 scale-[1.02] [transform:translate3d(0,calc(var(--sp)*12vh),0)]">
        {video ? (
          reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={video.poster}
              aria-hidden
            >
              {video.srcWebm && <source src={video.srcWebm} type="video/webm" />}
              <source src={video.src} type="video/mp4" />
            </video>
          )
        ) : (
          <HorizonShader />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink" />
      </div>

      {/* Frame guides */}
      <div aria-hidden className="pointer-events-none absolute inset-[clamp(0.75rem,2.5vw,2rem)] top-[calc(var(--nav-h)+0.5rem)] opacity-0 transition-opacity delay-700 duration-1000 group-data-[ready]/hero:opacity-100">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-ivory/30" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-ivory/30" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-ivory/30" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-ivory/30" />
      </div>

      <div className="gutter relative flex flex-1 flex-col justify-end pb-24 pt-[calc(var(--nav-h)+2rem)] md:pb-28">
        <p className="label mb-6 flex items-center gap-3 text-ivory/80 md:mb-8">
          <span className="inline-block h-px w-10 bg-gold" aria-hidden />
          <span className="overflow-hidden">
            <span className="block translate-y-full transition-transform delay-100 duration-1000 ease-[var(--ease-out-expo)] group-data-[ready]/hero:translate-y-0">
              A {site.studio} documentary
            </span>
          </span>
        </p>

        <h1 id="hero-title" className="display relative text-[clamp(4.5rem,min(23vw,25svh),21rem)] leading-[0.8] text-ivory">
          <span className="sr-only">Nation Divided</span>
          <span aria-hidden className="line-mask">
            <span className="block translate-y-[105%] transition-transform delay-200 duration-[1400ms] ease-[var(--ease-out-expo)] group-data-[ready]/hero:translate-y-0">
              Nation
            </span>
          </span>
          <span aria-hidden className="line-mask md:pl-[12vw]">
            <span className="relative block translate-y-[105%] transition-transform delay-[350ms] duration-[1400ms] ease-[var(--ease-out-expo)] group-data-[ready]/hero:translate-y-0">
              {/* Top half */}
              <span className="block [clip-path:inset(0_0_50%_0)] [transform:translate3d(calc(var(--mx)*-0.5vw_-_var(--sp)*6vw),0,0)]">
                Divided
              </span>
              {/* Bottom half, off-register */}
              <span className="absolute inset-0 block text-bone [clip-path:inset(50%_0_0_0)] [transform:translate3d(calc(var(--mx)*0.7vw_+_var(--sp)*6vw),calc(var(--sp)*2vw),0)]">
                Divided
              </span>
              {/* Seam */}
              <span className="absolute left-0 right-[-4vw] top-1/2 h-px origin-left scale-x-0 bg-gold transition-transform delay-[1100ms] duration-[1600ms] ease-[var(--ease-cinema)] group-data-[ready]/hero:scale-x-100" />
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5 md:col-start-1">
            <p className="editorial text-[clamp(1.6rem,3.2vw,2.6rem)] italic leading-[1.05] text-ivory opacity-0 transition-opacity delay-[900ms] duration-1000 group-data-[ready]/hero:opacity-100">
              {site.tagline}
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="max-w-md text-[1.0625rem] leading-relaxed text-bone opacity-0 transition-[opacity,transform] delay-[1050ms] duration-1000 group-data-[ready]/hero:opacity-100">
              An independent documentary exploring the people, beliefs, and personal stories behind America&rsquo;s political
              divide.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 opacity-0 transition-opacity delay-[1200ms] duration-1000 group-data-[ready]/hero:opacity-100">
              <Cta href="#divide">Explore the story</Cta>
              <Cta href="/casting" variant="outline">
                Tell us your story
              </Cta>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom slate */}
      <div className="gutter absolute inset-x-0 bottom-0 flex items-center justify-between pb-6 text-ash opacity-0 transition-opacity delay-[1400ms] duration-1000 group-data-[ready]/hero:opacity-100">
        <a href="#statement" className="label group/cue flex min-h-11 items-center gap-3 hover:text-ivory">
          <span aria-hidden className="relative block h-9 w-px overflow-hidden bg-ivory/15">
            <span className="absolute inset-x-0 top-0 block h-1/3 animate-[scroll-cue_2.2s_var(--ease-cinema)_infinite] bg-gold" />
          </span>
          Scroll
        </a>
        <p className="label hidden items-center gap-3 sm:flex">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-crimson" aria-hidden />
          <span>TC</span>
          <Timecode className="text-ivory/80" />
        </p>
        <p className="label">2024 — Present</p>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import { paintTown } from "@/components/cinematic/town-canvas";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * THE DIVIDE
 * One town at night. As you scroll, the frame splits into two tinted
 * halves that slide apart and fall out of register — the same place, seen
 * differently. Then they drift back together.
 */
export function Divide() {
  const reduced = useReducedMotion();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const c = document.createElement("canvas");
    const w = Math.min(2200, Math.max(1100, window.innerWidth * Math.min(window.devicePixelRatio, 1.5)));
    c.width = Math.round(w);
    c.height = Math.round(w * 0.5625);
    // Paint off the critical path.
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => {
          paintTown(c);
          setImage(c.toDataURL("image/jpeg", 0.86));
        })
      : window.setTimeout(() => {
          paintTown(c);
          setImage(c.toDataURL("image/jpeg", 0.86));
        }, 50);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  return (
    <section id="divide" aria-labelledby="divide-title" className="relative bg-ink">
      <h2 id="divide-title" className="sr-only">
        The Divide
      </h2>
      {reduced ? <StaticDivide image={image} /> : <ScrollDivide image={image} />}
    </section>
  );
}

function Panel({
  image,
  side,
  className = "",
  children,
}: {
  image: string | null;
  side: "left" | "right";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-panel={side}
      className={`absolute inset-y-0 w-1/2 overflow-hidden ${side === "left" ? "left-0" : "right-0"} ${className}`}
    >
      <div
        data-panel-image={side}
        className="absolute inset-y-0 w-[200%] bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
          left: side === "left" ? 0 : "-100%",
          opacity: image ? 1 : 0,
        }}
      />
      <div
        data-tint={side}
        className={`absolute inset-0 opacity-0 mix-blend-color ${side === "left" ? "bg-crimson" : "bg-steel"}`}
      />
      <div
        data-shade={side}
        className={`absolute inset-0 opacity-0 ${
          side === "left" ? "bg-gradient-to-r from-ink/80 to-transparent" : "bg-gradient-to-l from-ink/80 to-transparent"
        }`}
      />
      {children}
    </div>
  );
}

function ScrollDivide({ image }: { image: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(
    (_ctx, el) => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      const vw = () => window.innerWidth;

      tl.set("[data-s2], [data-s3], [data-s4]", { autoAlpha: 0 })
        // 1 — the same country
        .fromTo("[data-whole]", { scale: 1.12 }, { scale: 1, duration: 2 }, 0)
        .fromTo("[data-s1] .w", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.8 }, 0.3)
        .to("[data-s1]", { autoAlpha: 0, y: -30, duration: 0.8 }, 2.2)
        // 2 — the split
        .to("[data-panel=left]", { x: () => -vw() * 0.06, duration: 2 }, 2.6)
        .to("[data-panel=right]", { x: () => vw() * 0.06, duration: 2 }, 2.6)
        .to("[data-panel-image=right]", { yPercent: 4, xPercent: 3, duration: 2 }, 2.6)
        .to("[data-panel-image=left]", { yPercent: -2, duration: 2 }, 2.6)
        .to("[data-tint]", { opacity: 0.55, duration: 1.6 }, 2.8)
        .to("[data-shade]", { opacity: 1, duration: 1.6 }, 2.8)
        .fromTo("[data-seam]", { scaleY: 0 }, { scaleY: 1, duration: 1.2 }, 2.7)
        .to("[data-s2]", { autoAlpha: 1, duration: 0.6 }, 3.4)
        .fromTo("[data-s2-left]", { xPercent: 8 }, { xPercent: 0, duration: 1.4 }, 3.2)
        .fromTo("[data-s2-right]", { xPercent: -8 }, { xPercent: 0, duration: 1.4 }, 3.2)
        .to("[data-s2]", { autoAlpha: 0, duration: 0.6 }, 5.2)
        // 3 — listening
        .to("[data-s3]", { autoAlpha: 1, duration: 0.6 }, 5.7)
        .fromTo("[data-s3] .w", { autoAlpha: 0, filter: "blur(8px)" }, { autoAlpha: 1, filter: "blur(0px)", stagger: 0.08, duration: 0.6 }, 5.7)
        .to("[data-s3]", { autoAlpha: 0, duration: 0.5 }, 7.2)
        // 4 — convergence
        .to("[data-panel]", { x: 0, duration: 2 }, 7.2)
        .to("[data-panel-image]", { xPercent: 0, yPercent: 0, duration: 2 }, 7.2)
        .to("[data-tint]", { opacity: 0, duration: 1.6 }, 7.4)
        .to("[data-shade]", { opacity: 0, duration: 1.6 }, 7.4)
        .to("[data-warm]", { opacity: 0.35, duration: 1.6 }, 7.8)
        .to("[data-seam]", { scaleY: 0, duration: 1 }, 8)
        .to("[data-s4]", { autoAlpha: 1, duration: 0.5 }, 8.8)
        .fromTo("[data-s4] .line-mask > span", { yPercent: 110 }, { yPercent: 0, stagger: 0.25, duration: 0.9 }, 8.8)
        .to("[data-progress]", { scaleX: 1, duration: 10.5 }, 0);
    },
    ref,
    [],
  );

  return (
    <div ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-whole className="absolute inset-0">
          <Panel image={image} side="left">
            <div data-s2 data-s2-left className="invisible absolute inset-y-0 right-[clamp(1rem,3vw,3rem)] flex items-center justify-end">
              <p className="display text-right text-[clamp(2.3rem,7vw,7.5rem)] text-ivory">
                We don&rsquo;t
                <br />
                always see
              </p>
            </div>
            <p className="label absolute bottom-24 left-[var(--gutter)] hidden text-ivory/60 sm:block">Perspective · A</p>
          </Panel>
          <Panel image={image} side="right">
            <div data-s2 data-s2-right className="invisible absolute inset-y-0 left-[clamp(1rem,3vw,3rem)] flex items-center">
              <p className="display text-[clamp(2.3rem,7vw,7.5rem)] text-ivory">
                the same
                <br />
                reality.
              </p>
            </div>
            <p className="label absolute bottom-24 right-[var(--gutter)] hidden text-ivory/60 sm:block">Perspective · B</p>
          </Panel>
          <div data-warm className="pointer-events-none absolute inset-0 bg-gold opacity-0 mix-blend-soft-light" />
        </div>

        {/* Seam */}
        <div data-seam className="absolute inset-y-[8%] left-1/2 w-px origin-center -translate-x-1/2 bg-gold" aria-hidden />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/80" />

        {/* 1 */}
        <div data-s1 className="gutter absolute inset-0 flex items-center justify-center text-center">
          <p className="display text-[clamp(2.8rem,9vw,9rem)] text-ivory">
            {"We see the same country.".split(" ").map((w, i) => (
              <span key={i} className="w inline-block">
                {w}&nbsp;
              </span>
            ))}
          </p>
        </div>

        {/* 3 */}
        <div data-s3 className="invisible gutter absolute inset-0 flex items-center justify-center text-center">
          <p className="editorial max-w-4xl text-[clamp(2.2rem,5.4vw,5.5rem)] italic leading-[1.02] text-gold">
            {"But what happens when we listen?".split(" ").map((w, i) => (
              <span key={i} className="w inline-block">
                {w}&nbsp;
              </span>
            ))}
          </p>
        </div>

        {/* 4 */}
        <div data-s4 className="invisible gutter absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="display text-[clamp(2.8rem,8.5vw,8.5rem)] text-ivory">
            <span className="line-mask">
              <span className="block">Different beliefs.</span>
            </span>
            <span className="line-mask">
              <span className="block text-gold">Shared consequences.</span>
            </span>
          </p>
        </div>

        {/* Progress */}
        <div className="gutter absolute inset-x-0 bottom-8 flex items-center gap-4">
          <span className="label text-ash">The Divide</span>
          <span className="relative h-px flex-1 bg-line">
            <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-ivory/70" />
          </span>
          <span className="label text-ash">Scroll</span>
        </div>
      </div>

      {/* Accessible text equivalent of the sequence */}
      <div className="sr-only">
        <p>We see the same country.</p>
        <p>We don&rsquo;t always see the same reality.</p>
        <p>But what happens when we listen?</p>
        <p>Different beliefs. Shared consequences.</p>
      </div>
    </div>
  );
}

/** Reduced-motion alternative: the same story as three still frames. */
function StaticDivide({ image }: { image: string | null }) {
  const bg = image ? { backgroundImage: `url(${image})` } : undefined;
  return (
    <div className="gutter space-y-6 py-24">
      <figure className="relative aspect-[16/9] overflow-hidden bg-night bg-cover bg-center" style={bg}>
        <figcaption className="display absolute inset-0 flex items-center justify-center bg-ink/40 p-6 text-center text-[clamp(2rem,6vw,5rem)]">
          We see the same country.
        </figcaption>
      </figure>
      <figure className="relative grid aspect-[16/9] grid-cols-2 gap-3">
        <div className="relative overflow-hidden bg-night bg-cover bg-left" style={bg}>
          <div className="absolute inset-0 bg-crimson/50 mix-blend-color" />
        </div>
        <div className="relative overflow-hidden bg-night bg-cover bg-right" style={bg}>
          <div className="absolute inset-0 bg-steel/50 mix-blend-color" />
        </div>
        <figcaption className="display absolute inset-0 flex items-center justify-center p-6 text-center text-[clamp(2rem,6vw,5rem)]">
          We don&rsquo;t always see the same reality.
        </figcaption>
      </figure>
      <div className="py-12 text-center">
        <p className="editorial text-[clamp(2rem,5vw,4.5rem)] italic text-gold">But what happens when we listen?</p>
        <p className="display mt-8 text-[clamp(2.4rem,7vw,6rem)]">
          Different beliefs. <span className="text-gold">Shared consequences.</span>
        </p>
      </div>
    </div>
  );
}

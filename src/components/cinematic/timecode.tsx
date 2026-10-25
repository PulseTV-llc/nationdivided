"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";

/** A running SMPTE-style timecode (24 fps). Decorative. */
export function Timecode({ className = "", offset = 0 }: { className?: string; offset?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now() - offset * 1000;
    const pad = (n: number) => String(n).padStart(2, "0");
    const render = (now: number) => {
      const total = (now - start) / 1000;
      const f = Math.floor((total % 1) * 24);
      const s = Math.floor(total) % 60;
      const m = Math.floor(total / 60) % 60;
      const h = Math.floor(total / 3600);
      el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
    };
    if (prefersReducedMotion()) {
      render(performance.now());
      return;
    }
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 40) {
        render(now);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [offset]);

  return (
    <span ref={ref} aria-hidden className={`tabular-nums ${className}`}>
      00:00:00:00
    </span>
  );
}

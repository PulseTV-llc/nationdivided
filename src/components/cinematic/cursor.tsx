"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Viewfinder cursor for fine pointers. Grows over interactive elements and
 * shows a label from the nearest [data-cursor="…"] ancestor. Purely visual —
 * the native cursor returns for text inputs, touch, and reduced motion.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    const r = ring.current!;
    const d = dot.current!;
    const l = label.current!;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: -100, y: -100, rx: -100, ry: -100 };
    let raf = 0;
    let hidden = true;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (hidden) {
        hidden = false;
        pos.rx = pos.x;
        pos.ry = pos.y;
        r.style.opacity = "1";
        d.style.opacity = "1";
      }
      const target = e.target as Element | null;
      const interactive = target?.closest("a, button, [role='button'], label, summary, [data-cursor]");
      const text = target?.closest("input, textarea, select, [contenteditable]");
      const tag = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      r.dataset.state = text ? "text" : tag ? "label" : interactive ? "hover" : "idle";
      if (l.textContent !== tag) l.textContent = tag;
    };
    const onLeave = () => {
      hidden = true;
      r.style.opacity = "0";
      d.style.opacity = "0";
    };
    const onDown = () => r.classList.add("scale-75");
    const onUp = () => r.classList.remove("scale-75");

    const loop = () => {
      pos.rx += (pos.x - pos.rx) * 0.18;
      pos.ry += (pos.y - pos.ry) * 0.18;
      r.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0)`;
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        data-state="idle"
        className="group absolute left-0 top-0 opacity-0 transition-opacity duration-300"
      >
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 border border-ivory/60 transition-[width,height,border-color,background-color,border-radius] duration-500 ease-[var(--ease-out-expo)]
          h-8 w-8 rounded-full
          group-data-[state=hover]:h-14 group-data-[state=hover]:w-14 group-data-[state=hover]:border-gold
          group-data-[state=label]:h-24 group-data-[state=label]:w-24 group-data-[state=label]:border-gold group-data-[state=label]:bg-ink/40 group-data-[state=label]:backdrop-blur-sm
          group-data-[state=text]:h-7 group-data-[state=text]:w-0.5 group-data-[state=text]:rounded-none group-data-[state=text]:border-gold"
        >
          {/* Viewfinder corners */}
          <span className="absolute -left-1 -top-1 h-2 w-2 border-l border-t border-ivory/70 group-data-[state=text]:hidden" />
          <span className="absolute -right-1 -top-1 h-2 w-2 border-r border-t border-ivory/70 group-data-[state=text]:hidden" />
          <span className="absolute -bottom-1 -left-1 h-2 w-2 border-b border-l border-ivory/70 group-data-[state=text]:hidden" />
          <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-ivory/70 group-data-[state=text]:hidden" />
          <span
            ref={label}
            className="label absolute inset-0 flex items-center justify-center text-[0.55rem] text-gold opacity-0 transition-opacity group-data-[state=label]:opacity-100"
          />
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0 opacity-0">
        <div className="h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </div>
    </div>
  );
}

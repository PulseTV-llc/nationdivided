"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Lets visitors turn off motion on this site regardless of OS settings. */
export function MotionToggle({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const toggle = () => {
    const root = document.documentElement;
    if (root.dataset.motion === "reduced") {
      delete root.dataset.motion;
      try {
        localStorage.removeItem("nd-motion");
      } catch {}
    } else {
      root.dataset.motion = "reduced";
      try {
        localStorage.setItem("nd-motion", "reduced");
      } catch {}
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reduced}
      className={`label inline-flex min-h-11 items-center gap-2 text-ash transition-colors hover:text-ivory ${className}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full border border-current ${reduced ? "" : "bg-gold border-gold"}`} />
      Motion {reduced ? "reduced" : "on"}
    </button>
  );
}

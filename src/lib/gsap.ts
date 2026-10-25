"use client";

import { useEffect, useLayoutEffect, useRef, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Runs GSAP code scoped to `scope` and reverts every tween/ScrollTrigger on
 * cleanup (including when Next.js hides the route with <Activity>).
 */
export function useGsap(
  setup: (ctx: gsap.Context, scope: HTMLElement) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
) {
  const setupRef = useRef(setup);
  useIsoLayoutEffect(() => {
    setupRef.current = setup;
  });
  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    let extra: void | (() => void);
    const ctx = gsap.context((self) => {
      extra = setupRef.current(self, el);
    }, el);
    return () => {
      if (typeof extra === "function") extra();
      ctx.revert();
    };
  }, deps);
}

export { gsap, ScrollTrigger };

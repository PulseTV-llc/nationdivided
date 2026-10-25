"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type Mode = "fade" | "lines" | "words" | "mask" | "rule";

type RevealProps = {
  as?: ElementType;
  mode?: Mode;
  delay?: number;
  /** Fraction of the element that must be visible. */
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
};

/**
 * Scroll-triggered reveal. Visual state lives in CSS (see globals.css
 * "Reveal"), so content is fully visible without JavaScript and instantly
 * visible with reduced motion.
 */
export function Reveal({
  as = "div",
  mode = "fade",
  delay = 0,
  threshold = 0.2,
  once = true,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "";
          if (once) io.disconnect();
        } else if (!once) {
          delete el.dataset.shown;
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const Tag = as;
  return (
    <Tag ref={ref} data-reveal={mode} className={className} style={{ ...style, "--d": `${delay}ms` } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}

/** Headline split into masked lines that slide up in sequence. */
export function Lines({
  lines,
  as = "h2",
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  return (
    <Reveal as={as} mode="lines" className={className} delay={delay}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <span className={lineClassName} style={{ "--i": i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Reveal>
  );
}

/** Paragraph whose words resolve from blur, one after another. */
export function Words({
  text,
  as = "p",
  className,
  delay = 0,
  step,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <Reveal as={as} mode="words" className={className} delay={delay} style={step ? ({ "--step": `${step}ms` } as CSSProperties) : undefined}>
      {words.map((w, i) => (
        <span key={i} className="w" style={{ "--i": i } as CSSProperties}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Reveal>
  );
}

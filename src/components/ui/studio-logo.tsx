import type { CSSProperties } from "react";
import { media } from "@/content/media";

/**
 * The official StockHouse Films logo, tinted with the current text colour.
 * The source file is black on transparent, so it is used as a CSS mask —
 * set the colour with a text-* class (e.g. text-ivory, text-gold).
 */
export function StudioLogo({ className = "", decorative = false }: { className?: string; decorative?: boolean }) {
  const logo = media.studioLogo;
  if (!logo) {
    return (
      <span className={`display tracking-[0.04em] ${className}`} aria-hidden={decorative || undefined}>
        StockHouse Films
      </span>
    );
  }
  const mask = `url("${logo.src}") center / contain no-repeat`;
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : logo.alt}
      aria-hidden={decorative || undefined}
      className={`inline-block bg-current ${className}`}
      style={
        {
          aspectRatio: `${logo.width} / ${logo.height}`,
          WebkitMask: mask,
          mask,
        } as CSSProperties
      }
    />
  );
}

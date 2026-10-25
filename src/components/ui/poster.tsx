import Image from "next/image";
import { media } from "@/content/media";

/**
 * The official one-sheet. Rendered at its native 2:3 ratio with a soft
 * frame and shadow so it reads as a printed poster on the dark page.
 */
export function Poster({
  className = "",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  priority = false,
  hover = false,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
  hover?: boolean;
}) {
  const poster = media.poster;
  if (!poster) return null;
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden bg-night shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] ring-1 ring-ivory/10 ${className}`}
    >
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${
          hover ? "transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" : ""
        }`}
      />
    </div>
  );
}

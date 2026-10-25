import Image from "next/image";
import type { ImageAsset, PlaceholderScene } from "@/content/media";
import { Scene, type Tint } from "./scene";

/**
 * A media frame. Renders the real image when one is registered in
 * src/content/media.ts, otherwise an original generative scene that is
 * visibly labelled as a placeholder.
 */
export function Frame({
  image,
  scene,
  tint = "neutral",
  seed,
  label,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  showLabel = true,
  drift = false,
}: {
  image?: ImageAsset | null;
  scene: PlaceholderScene;
  tint?: Tint;
  seed?: number;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showLabel?: boolean;
  drift?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-night ${className}`}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${drift ? "animate-drift" : ""}`}
        />
      ) : (
        <Scene
          scene={scene}
          tint={tint}
          seed={seed}
          className={`absolute inset-0 h-full w-full ${drift ? "animate-drift" : ""}`}
        />
      )}
      <div className="vignette absolute inset-0" aria-hidden />
      {/* Generated scenes and illustrative images are always labelled; real production stills are not. */}
      {showLabel && (!image || image.illustrative) && (
        <span className="label absolute bottom-3 left-3 z-10 flex items-center gap-2 text-[0.6rem] text-ivory/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          Placeholder{label ? ` · ${label}` : ""}
        </span>
      )}
    </div>
  );
}

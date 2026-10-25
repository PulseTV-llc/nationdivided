"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Privacy-conscious YouTube player. Nothing is requested from YouTube until
 * the visitor presses play; then the video loads from youtube-nocookie.com.
 */
export function YouTubeEmbed({ id, title, poster }: { id: string; title: string; poster?: string }) {
  const [active, setActive] = useState(false);
  const safeId = /^[\w-]{6,20}$/.test(id) ? id : null;
  if (!safeId) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-night">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          data-cursor="Play"
          className="group absolute inset-0 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster ?? `https://i.ytimg.com/vi/${safeId}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-700 group-hover:opacity-90"
          />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-ivory/60 bg-ink/40 backdrop-blur transition-transform duration-500 group-hover:scale-110">
            <Play aria-hidden className="ml-1 h-8 w-8 text-ivory" strokeWidth={1.25} />
          </span>
          <span className="sr-only">Play: {title} (loads YouTube)</span>
          <span className="label absolute bottom-4 left-4 text-[0.6rem] text-ivory/70">Loads from YouTube when played</span>
        </button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Participant } from "@/content/people";
import { Frame } from "@/components/cinematic/frame";
import type { Tint } from "@/components/cinematic/scene";

const tints: Tint[] = ["neutral", "crimson", "steel", "gold"];

/**
 * Editorial index of participants. On desktop a portrait follows the
 * pointer over each row; on touch screens portraits sit inline.
 */
export function PeopleIndex({ people }: { people: Participant[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const float = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !float.current) return;
    float.current.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 160}px, 0)`;
  };

  return (
    <div onPointerMove={onMove} className="relative">
      <ol className="border-t border-line">
        {people.map((p, i) => (
          <li key={p.slug} className="border-b border-line">
            <Link
              href={`/stories/${p.slug}`}
              prefetch
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              data-cursor="Read"
              className="gutter group grid items-center gap-6 py-8 transition-colors duration-500 hover:bg-ivory/[0.025] md:grid-cols-12 md:py-10"
            >
              <span className="label text-gold md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative aspect-[4/5] w-full overflow-hidden md:hidden">
                <Frame image={p.portrait} scene={p.scene} tint={tints[i % 4]} seed={60 + i} showLabel={false} className="h-full w-full" />
              </span>
              <span className="display text-[clamp(2.6rem,7vw,7rem)] leading-[0.9] text-ivory transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4 md:col-span-7">
                {p.displayName}
              </span>
              <span className="md:col-span-4 md:text-right">
                <span className="label block text-ash">Chapter · {p.chapter}</span>
                <span className="mt-2 block text-sm text-bone">{p.location ?? "Location withheld"}</span>
                {p.placeholder && <span className="label mt-2 block text-[0.6rem] text-gold/80">Coming soon</span>}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Floating portrait (desktop, fine pointer) */}
      <div
        ref={float}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-30 hidden h-[22rem] w-[17rem] overflow-hidden transition-[opacity,clip-path] duration-500 ease-[var(--ease-out-expo)] [@media(pointer:fine)]:md:block ${
          hover === null ? "opacity-0 [clip-path:inset(50%_0_50%_0)]" : "opacity-100 [clip-path:inset(0_0_0_0)]"
        }`}
      >
        {people.map((p, i) => (
          <div key={p.slug} className={`absolute inset-0 transition-opacity duration-300 ${hover === i ? "opacity-100" : "opacity-0"}`}>
            <Frame image={p.portrait} scene={p.scene} tint={tints[i % 4]} seed={60 + i} showLabel={false} className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

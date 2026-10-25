import { media, placeholderContactSheet } from "@/content/media";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import type { Tint } from "@/components/cinematic/scene";

const tints: Tint[] = ["neutral", "gold", "steel", "neutral", "crimson", "neutral", "steel", "gold"];

/**
 * A photographer's contact sheet: numbered frames on a strip, with a
 * grease-pencil circle drawn around a frame on hover/focus.
 */
export function ContactSheet() {
  const stills = media.interviewStills;
  const frames = stills.length
    ? stills.map((s, i) => ({ image: s, caption: s.caption ?? s.alt, scene: placeholderContactSheet[i % 8].scene, placeholder: false }))
    : placeholderContactSheet.map((p) => ({ image: null, caption: p.caption, scene: p.scene, placeholder: true }));

  return (
    <section aria-labelledby="sheet-title" className="relative overflow-hidden border-t border-line bg-night py-[clamp(6rem,14vh,10rem)]">
      <div className="gutter mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="label mb-6 text-gold">Contact sheet · Roll 01</p>
          <Lines as="h2" lines={["Every vote", "has a story."]} className="display text-[clamp(3rem,8vw,8rem)]" />
          <span id="sheet-title" className="sr-only">
            Every vote has a story
          </span>
        </div>
        <Reveal as="p" className="max-w-sm text-bone">
          Frames from the road, the kitchen table and the morning shift.{" "}
          {!stills.length && (
            <span className="text-ash">These are placeholder frames until production stills are approved for release.</span>
          )}
        </Reveal>
      </div>

      {/* Strip: scrolls horizontally on small screens, grid on large */}
      <div className="relative">
        <div aria-hidden className="sprockets mx-[var(--gutter)] h-3 bg-ivory/10" />
        <ul
          className="gutter flex snap-x snap-mandatory gap-3 overflow-x-auto py-4 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible"
          aria-label="Frames"
        >
          {frames.map((f, i) => (
            <li key={i} className="w-[72vw] shrink-0 snap-center sm:w-[44vw] lg:w-auto">
              <Reveal delay={(i % 4) * 90}>
                <figure tabIndex={0} className="group relative outline-none" data-cursor="Frame">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Frame
                      image={f.image}
                      scene={f.scene}
                      tint={tints[i % tints.length]}
                      seed={i + 11}
                      showLabel={false}
                      sizes="(min-width:1024px) 25vw, 72vw"
                      className="h-full w-full transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] [filter:saturate(0.92)] group-hover:scale-[1.03] group-hover:[filter:none] group-focus-visible:[filter:none]"
                    />
                    {/* Grease-pencil circle */}
                    <svg
                      aria-hidden
                      viewBox="0 0 300 200"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M40 110 C 30 40, 250 20, 268 95 C 285 165, 70 190, 38 120 C 30 98, 60 70, 120 60"
                        fill="none"
                        stroke="#c9a56a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        pathLength={1}
                        className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-[var(--ease-out-expo)] group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]"
                      />
                    </svg>
                  </div>
                  <figcaption className="label mt-3 flex justify-between gap-3 text-[0.6rem] text-ash">
                    <span>
                      {String(i + 1).padStart(2, "0")}A {f.image ? "" : "· Placeholder"}
                    </span>
                    <span className="text-right text-bone">{f.caption}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
        <div aria-hidden className="sprockets mx-[var(--gutter)] h-3 bg-ivory/10" />
      </div>
    </section>
  );
}

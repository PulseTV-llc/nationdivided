import { casting } from "@/content/casting";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { Cta } from "@/components/ui/cta";
import { Frame } from "@/components/cinematic/frame";
import { Timecode } from "@/components/cinematic/timecode";

/** Homepage casting call — the most important invitation on the site. */
export function CastingCall() {
  return (
    <section aria-labelledby="casting-call-title" className="relative overflow-hidden border-t border-line bg-ink">
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <Frame scene="porch" tint="gold" seed={4} showLabel={false} className="h-full w-full" drift />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" aria-hidden />

      <div className="gutter relative grid min-h-[100svh] gap-14 py-[clamp(6rem,14vh,10rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8">
          <p className="label mb-8 flex items-center gap-3 text-gold">
            <span className="h-2 w-2 animate-blink rounded-full bg-crimson-lit" aria-hidden />
            Now casting · <Timecode className="text-ash" />
          </p>
          <Lines
            as="h2"
            lines={casting.headline}
            className="display text-[clamp(2.9rem,7.6vw,8.2rem)]"
            lineClassName="[&:nth-child(1)]:text-ivory"
          />
          <span id="casting-call-title" className="sr-only">
            {casting.headline.join(" ")}
          </span>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Reveal as="p" className="editorial text-3xl italic leading-tight text-ivory">
            {casting.intro[0]}
          </Reveal>
          <Reveal as="p" delay={100} className="leading-relaxed text-bone">
            {casting.intro[1]}
          </Reveal>
          <Reveal as="p" delay={200} className="leading-relaxed text-bone">
            {casting.closer.join(" ")}
          </Reveal>
          <Reveal delay={300} className="flex flex-wrap gap-3 pt-4">
            <Cta href="/casting/apply">Apply to share your story</Cta>
            <Cta href="/casting" variant="outline">
              Learn about participating
            </Cta>
          </Reveal>
          <Reveal as="p" delay={400} className="text-sm text-ash">
            Participation is voluntary and selection isn&rsquo;t guaranteed. Nothing is filmed without a conversation first.
          </Reveal>
        </div>
      </div>
    </section>
  );
}

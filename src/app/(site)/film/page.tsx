import type { Metadata } from "next";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { studio } from "@/content/studio";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { Cta } from "@/components/ui/cta";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { YouTubeIcon } from "@/components/ui/icons";
import { Timecode } from "@/components/cinematic/timecode";
import { StudioLogo } from "@/components/ui/studio-logo";

export const metadata: Metadata = {
  title: "The Film",
  description: `${site.title} — a ${site.studio} documentary. ${site.logline}`,
  alternates: { canonical: "/film" },
};

export default function FilmPage() {
  const trailer = media.trailerYouTubeId;
  const film = media.filmYouTubeId;

  return (
    <>
      {/* Title card */}
      <section aria-labelledby="film-title" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden>
          <Frame scene="road" tint="neutral" seed={31} showLabel={false} className="h-full w-full" drift />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/30" aria-hidden />
        <div className="gutter pb-20 pt-[calc(var(--nav-h)+4rem)] text-center">
          <StudioLogo className="mx-auto mb-6 w-28 text-ivory/90 sm:w-32" />
          <p className="label mb-10 text-ash">A {site.studio} documentary</p>
          <h1 id="film-title" className="display text-[clamp(4.5rem,17vw,17rem)] leading-[0.8]">
            <span className="line-mask">
              <span className="block">Nation</span>
            </span>
            <span className="line-mask">
              <span className="block text-bone">Divided</span>
            </span>
          </h1>
          <p className="editorial mt-8 text-[clamp(1.5rem,2.6vw,2.4rem)] italic text-ivory">{site.tagline}</p>
          <div className="mx-auto mt-14 flex max-w-xl items-center justify-center gap-6">
            <span className="h-px flex-1 bg-gold/50" aria-hidden />
            <p className="label text-gold">Coming soon</p>
            <span className="h-px flex-1 bg-gold/50" aria-hidden />
          </div>
        </div>
      </section>

      {/* Trailer */}
      <section aria-labelledby="trailer-title" className="gutter border-t border-line py-[clamp(5rem,12vh,9rem)]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="trailer-title" className="display text-[clamp(2.6rem,5vw,5rem)]">
            Official trailer
          </h2>
          <p className="label text-ash">{trailer ? "Now playing" : "In production"}</p>
        </div>
        {trailer ? (
          <YouTubeEmbed id={trailer} title={`${site.title} — Official trailer`} />
        ) : (
          <div className="relative aspect-video overflow-hidden border border-line">
            <Frame scene="studio" tint="neutral" seed={33} showLabel={false} className="absolute inset-0 h-full w-full opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-ink/50 p-6 text-center">
              <p className="label flex items-center gap-3 text-ivory">
                <span className="h-2 w-2 animate-blink rounded-full bg-crimson" aria-hidden /> Standby ·{" "}
                <Timecode />
              </p>
              <p className="display text-[clamp(2rem,5vw,4.5rem)]">The trailer is being cut.</p>
              <p className="max-w-md text-bone">
                The official trailer will premiere here and on the StockHouse Films YouTube channel. No release date has been
                set.
              </p>
            </div>
            {/* SMPTE-style bars as a subtle frame */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-2 opacity-60">
              {["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"].map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Full film / premiere */}
      {film && (
        <section aria-labelledby="full-film-title" className="gutter border-t border-line py-[clamp(5rem,12vh,9rem)]">
          <h2 id="full-film-title" className="display mb-10 text-[clamp(2.6rem,5vw,5rem)]">
            Watch the film
          </h2>
          <YouTubeEmbed id={film} title={`${site.title} — Full documentary`} />
        </section>
      )}

      {/* Logline + details */}
      <section aria-labelledby="about-film" className="gutter grid gap-14 border-t border-line py-[clamp(5rem,12vh,9rem)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label mb-6 text-gold">Logline</p>
          <h2 id="about-film" className="sr-only">
            About the film
          </h2>
          <Reveal as="p" className="editorial text-[clamp(1.7rem,3vw,2.8rem)] leading-[1.15] text-ivory">
            {site.logline}
          </Reveal>
        </div>
        <dl className="grid content-start gap-px bg-line lg:col-span-4 lg:col-start-9">
          {[
            ["Format", site.format],
            ["Genre", site.genre],
            ["Production", site.studio],
            ["Status", site.status],
            ["Release", "To be announced"],
          ].map(([k, val]) => (
            <div key={k} className="bg-ink py-4">
              <dt className="label mb-1 text-ash">{k}</dt>
              <dd className="text-ivory">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Behind the scenes */}
      <section aria-labelledby="bts-title" className="border-t border-line bg-night py-[clamp(5rem,12vh,9rem)]">
        <div className="gutter mb-12">
          <p className="label mb-6 text-gold">Behind the scenes</p>
          <Lines as="h2" lines={["From the road"]} className="display text-[clamp(2.6rem,5vw,5rem)]" />
          <span id="bts-title" className="sr-only">
            Behind the scenes
          </span>
        </div>
        <div className="gutter grid gap-3 md:grid-cols-3">
          {(media.behindTheScenes.length ? media.behindTheScenes.slice(0, 3) : [null, null, null]).map((img, i) => (
            <Reveal key={i} mode="mask" delay={i * 120} className="relative aspect-[4/5]">
              <Frame
                image={img}
                scene={(["studio", "road", "diner"] as const)[i]}
                tint={(["gold", "steel", "crimson"] as const)[i]}
                seed={40 + i}
                label="Behind the scenes"
                className="h-full w-full"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section aria-labelledby="credits-title" className="gutter border-t border-line py-[clamp(5rem,12vh,9rem)] text-center">
        <h2 id="credits-title" className="label mb-14 text-gold">
          Credits
        </h2>
        <dl className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
          {studio.credits.map((c) => (
            <div key={c.role}>
              <dt className="label mb-2 text-ash">{c.role}</dt>
              <dd className="display text-3xl text-ivory">{c.name ?? <span className="text-smoke">To be announced</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Follow */}
      <section aria-labelledby="follow-title" className="border-t border-line">
        <div className="gutter flex flex-col items-center gap-8 py-24 text-center">
          <YouTubeIcon className="h-10 w-10 text-ivory" />
          <h2 id="follow-title" className="display max-w-3xl text-[clamp(2.6rem,6vw,6rem)]">
            Be there for the premiere.
          </h2>
          <p className="max-w-md text-bone">
            Subscribe to StockHouse Films on YouTube for the trailer, behind-the-scenes features, and the release.
          </p>
          {site.social.youtubeChannel ? (
            <Cta href={`${site.social.youtubeChannel}?sub_confirmation=1`}>Subscribe on YouTube</Cta>
          ) : (
            <p className="label border border-line px-6 py-4 text-ash">Channel link coming soon</p>
          )}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Cta href="/press" variant="outline">
              Press materials
            </Cta>
            <Cta href="/casting" variant="ghost">
              Share your story
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}

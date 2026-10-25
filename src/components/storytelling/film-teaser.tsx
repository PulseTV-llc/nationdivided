import Link from "next/link";
import { editorialPrinciples, site } from "@/content/site";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { Frame } from "@/components/cinematic/frame";
import { StudioLogo } from "@/components/ui/studio-logo";

/** Closing homepage block: the film card and the editorial promise. */
export function FilmTeaser() {
  return (
    <section aria-labelledby="film-teaser-title" className="relative border-t border-line bg-night">
      <div className="gutter grid gap-16 py-[clamp(6rem,14vh,10rem)] lg:grid-cols-12">
        <Link
          href="/film"
          data-cursor="Watch"
          className="group relative block aspect-[2/3] overflow-hidden lg:col-span-5"
          aria-label="The film: Nation Divided, coming soon"
        >
          <Frame scene="road" tint="neutral" seed={9} label="Poster" className="h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
          <div className="absolute inset-0 flex flex-col justify-between p-[clamp(1.25rem,3vw,2.5rem)]">
            <p className="flex items-center gap-3">
              <StudioLogo className="w-20 text-ivory/90" />
              <span className="label text-ivory/70">presents</span>
            </p>
            <div>
              <p className="display text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.82]">
                Nation
                <br />
                Divided
              </p>
              <p className="editorial mt-4 text-xl italic text-bone">{site.tagline}</p>
              <p className="label mt-8 border-t border-ivory/20 pt-4 text-gold">Coming soon</p>
            </div>
          </div>
        </Link>

        <div className="flex flex-col justify-between gap-14 lg:col-span-6 lg:col-start-7">
          <div>
            <p className="label mb-6 text-gold">Editorial independence</p>
            <Lines as="h2" lines={["Not a campaign.", "A conversation."]} className="display text-[clamp(2.8rem,6vw,6rem)]" />
            <span id="film-teaser-title" className="sr-only">
              Not a campaign. A conversation.
            </span>
            <Reveal as="p" className="mt-8 max-w-xl text-lg leading-relaxed text-bone">
              {site.title} is an independent documentary. It isn&rsquo;t made for a party, a candidate or a cause. It
              doesn&rsquo;t tell you who to vote for. It asks you to listen.
            </Reveal>
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2">
            {editorialPrinciples.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="bg-night p-6">
                <p className="label mb-3 text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mb-2 text-lg text-ivory">{p.title}</h3>
                <p className="text-sm leading-relaxed text-ash">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

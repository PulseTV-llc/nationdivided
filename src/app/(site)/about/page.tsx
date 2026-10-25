import type { Metadata } from "next";
import { StudioLogo } from "@/components/ui/studio-logo";
import { media } from "@/content/media";
import { editorialPrinciples, site } from "@/content/site";
import { studio } from "@/content/studio";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { Frame } from "@/components/cinematic/frame";
import { Cta } from "@/components/ui/cta";

export const metadata: Metadata = {
  title: "About StockHouse Films",
  description: `${site.title} is an independent documentary produced by ${site.studio}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const logo = media.studioLogo;
  return (
    <>
      <section className="gutter grid min-h-[100svh] gap-12 pb-20 pt-[calc(var(--nav-h)+5rem)] lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label mb-8 text-gold">About</p>
          <Lines as="h1" lines={["Independent.", "Human.", "Unhurried."]} className="display text-[clamp(3.6rem,10vw,10rem)]" />
          <Reveal as="p" className="mt-12 max-w-xl text-lg leading-relaxed text-bone">
            {site.title} is an independent documentary produced by {site.studio}. {studio.summary}
          </Reveal>
        </div>

        {/* Logo slot */}
        <Reveal mode="mask" className="lg:col-span-4 lg:col-start-9">
          <div className="relative flex aspect-square items-center justify-center border border-line bg-night">
            {logo ? (
              <div className="flex w-2/3 flex-col items-center gap-6">
                <StudioLogo className="w-full text-ivory" />
                <p className="label tracking-[0.6em] text-gold">Films</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-gold/60">
                  <span className="display text-4xl text-gold">SH</span>
                </div>
                <p className="display text-4xl tracking-[0.04em]">StockHouse</p>
                <p className="label mt-2 tracking-[0.6em] text-ash">Films</p>
                <p className="label mt-8 text-[0.6rem] text-gold/70">Logo placeholder</p>
              </div>
            )}
            <span aria-hidden className="absolute left-3 top-3 h-4 w-4 border-l border-t border-ivory/30" />
            <span aria-hidden className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-ivory/30" />
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="approach-title" className="border-t border-line bg-night py-[clamp(6rem,14vh,10rem)]">
        <div className="gutter mb-16 grid gap-8 lg:grid-cols-12">
          <h2 id="approach-title" className="display text-[clamp(2.6rem,5vw,5rem)] lg:col-span-6">
            How we make films
          </h2>
        </div>
        <ol className="border-t border-line">
          {studio.approach.map((a, i) => (
            <li key={a.title} className="border-b border-line">
              <Reveal className="gutter grid gap-4 py-8 md:grid-cols-12 md:items-baseline">
                <span className="label text-gold md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display text-[clamp(1.9rem,3.6vw,3.4rem)] md:col-span-6">{a.title}</h3>
                <p className="text-bone md:col-span-5">{a.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="principles-title" className="gutter grid gap-14 border-t border-line py-[clamp(6rem,14vh,10rem)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label mb-6 text-gold">Editorial standards</p>
          <h2 id="principles-title" className="display text-[clamp(2.6rem,5vw,5rem)]">
            A film for everyone who disagrees
          </h2>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden">
            <Frame
              image={media.aboutInterview}
              scene="diner"
              tint="neutral"
              seed={70}
              label="Interview"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full w-full"
            />
          </div>
        </div>
        <dl className="space-y-10 lg:col-span-6 lg:col-start-7">
          {editorialPrinciples.map((p, i) => (
            <Reveal key={p.title} delay={i * 80} className="border-t border-line pt-6">
              <dt className="mb-2 text-xl text-ivory">{p.title}</dt>
              <dd className="leading-relaxed text-ash">{p.body}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section aria-labelledby="team-title" className="gutter border-t border-line py-[clamp(6rem,14vh,10rem)]">
        <h2 id="team-title" className="label mb-12 text-gold">
          The team
        </h2>
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {studio.credits.map((c) => (
            <li key={c.role} className="bg-ink p-8">
              <p className="label mb-3 text-ash">{c.role}</p>
              <p className="display text-3xl">{c.name ?? <span className="text-smoke">To be announced</span>}</p>
              {c.bio && <p className="mt-4 text-sm leading-relaxed text-bone">{c.bio}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-16 flex flex-wrap gap-3">
          <Cta href={`mailto:${site.contact.general}`}>Contact {site.studio}</Cta>
          <Cta href="/press" variant="outline">
            Press
          </Cta>
        </div>
      </section>
    </>
  );
}

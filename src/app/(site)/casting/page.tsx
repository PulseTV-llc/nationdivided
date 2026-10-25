import type { Metadata } from "next";
import { casting } from "@/content/casting";
import { site } from "@/content/site";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal, Words } from "@/components/cinematic/reveal";
import { Cta } from "@/components/ui/cta";
import { Timecode } from "@/components/cinematic/timecode";

export const metadata: Metadata = {
  title: "Casting — Share Your Story",
  description:
    "Did you vote for Donald Trump in 2024? Whether you're satisfied, disappointed, or somewhere in between, Nation Divided wants to hear your story.",
  alternates: { canonical: "/casting" },
};

export default function CastingPage() {
  return (
    <>
      {/* ── Opening ─────────────────────────────────────────── */}
      <section aria-labelledby="casting-title" className="relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 -z-10 grid grid-cols-2 opacity-70" aria-hidden>
          <Frame scene="porch" tint="crimson" seed={21} showLabel={false} className="h-full" drift />
          <Frame scene="kitchen" tint="steel" seed={22} showLabel={false} className="h-full" drift />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/40" aria-hidden />
        <div className="absolute inset-y-0 left-1/2 -z-10 w-px bg-gold/50" aria-hidden />

        <div className="gutter flex min-h-[100svh] flex-col justify-end pb-16 pt-[calc(var(--nav-h)+3rem)]">
          <p className="label mb-8 flex items-center gap-3 text-gold">
            <span className="h-2 w-2 animate-blink rounded-full bg-crimson-lit" aria-hidden />
            Casting now · <Timecode className="text-ash" />
          </p>
          <Lines
            as="h1"
            lines={["What happened", "after you voted?"]}
            className="display text-[clamp(3.4rem,11vw,12rem)]"
          />
          <span id="casting-title" className="sr-only">
            Casting: What happened after you voted?
          </span>
          <div className="mt-12 grid gap-10 md:grid-cols-12 md:items-end">
            <Reveal as="p" className="editorial text-[clamp(1.6rem,2.8vw,2.6rem)] italic leading-[1.1] text-ivory md:col-span-6">
              {casting.intro[0]} {casting.intro[1]}
            </Reveal>
            <Reveal delay={150} className="flex flex-wrap gap-3 md:col-span-5 md:col-start-8 md:justify-end">
              <Cta href="/casting/apply">Apply to share your story</Cta>
              <Cta href="#participating" variant="outline">
                Learn about participating
              </Cta>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The invitation ──────────────────────────────────── */}
      <section aria-labelledby="invite-title" className="gutter grid gap-12 border-t border-line py-[clamp(6rem,14vh,10rem)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label mb-8 text-gold">The invitation</p>
          <Lines
            as="h2"
            lines={casting.headline}
            className="display text-[clamp(2.6rem,6.2vw,6.6rem)]"
          />
          <span id="invite-title" className="sr-only">
            {casting.headline.join(" ")}
          </span>
        </div>
        <div className="space-y-6 self-end text-lg leading-relaxed text-bone lg:col-span-4 lg:col-start-9">
          <Reveal as="p">{casting.intro[2]}</Reveal>
          <Reveal as="p" delay={120} className="editorial text-3xl italic leading-tight text-ivory">
            {casting.closer[0]}
            <br />
            <span className="text-gold">{casting.closer[1]}</span>
          </Reveal>
        </div>
      </section>

      {/* ── Who we welcome ──────────────────────────────────── */}
      <section aria-labelledby="welcome-title" className="border-t border-line bg-night py-[clamp(6rem,14vh,10rem)]">
        <div className="gutter mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="welcome-title" className="display text-[clamp(2.4rem,5vw,5rem)]">
            We welcome people who&hellip;
          </h2>
          <p className="max-w-sm text-bone">
            All perspectives are welcome within this casting focus. We&rsquo;re not looking for a predetermined conclusion — we&rsquo;re
            looking for honest stories.
          </p>
        </div>
        <ul className="border-t border-line">
          {casting.welcome.map((w, i) => (
            <li key={w} className="group border-b border-line">
              <Reveal delay={i * 40} className="gutter flex items-baseline gap-6 py-6 transition-colors duration-500 group-hover:bg-ivory/[0.03] md:py-8">
                <span className="label w-8 shrink-0 text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[clamp(1.8rem,4.6vw,4.4rem)] text-ivory/90 transition-[letter-spacing,color] duration-700 ease-[var(--ease-out-expo)] group-hover:tracking-[0.02em] group-hover:text-ivory">
                  {w}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ── What participating involves ─────────────────────── */}
      <section id="participating" aria-labelledby="involves-title" className="scroll-mt-24 border-t border-line py-[clamp(6rem,14vh,10rem)]">
        <div className="gutter grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="label mb-6 text-gold">Our approach</p>
              <h2 id="involves-title" className="display text-[clamp(2.6rem,5vw,5rem)]">
                A day in your life
              </h2>
              <Words
                className="mt-8 text-lg leading-relaxed text-bone"
                text="We want to follow a real person through an ordinary day: not a speech, not a debate, just life as it's actually lived. Here's what that may involve."
              />
              <div className="relative mt-10 aspect-[4/5] overflow-hidden">
                <Frame scene="studio" tint="gold" seed={5} label="Interview setup" className="h-full w-full" />
              </div>
            </div>
          </div>
          <ol className="grid gap-px self-start bg-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {casting.involves.map((item, i) => (
              <Reveal as="li" key={item.title} delay={(i % 2) * 100} className="bg-ink p-8 md:p-10">
                <p className="display mb-8 text-5xl text-gold/80">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mb-3 text-xl text-ivory">{item.title}</h3>
                <p className="leading-relaxed text-ash">{item.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Process ─────────────────────────────────────────── */}
      <section aria-labelledby="process-title" className="border-t border-line bg-night py-[clamp(6rem,14vh,10rem)]">
        <div className="gutter">
          <p className="label mb-6 text-gold">How it works</p>
          <h2 id="process-title" className="display mb-16 text-[clamp(2.6rem,5vw,5rem)]">
            Nothing happens without your say
          </h2>
          <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
            <Reveal mode="rule" className="absolute left-0 right-0 top-[1.1rem] hidden h-px bg-gold/40 md:block" aria-hidden>
              <span />
            </Reveal>
            {casting.process.map((p, i) => (
              <Reveal as="li" key={p.step} delay={i * 150} className="relative">
                <span className="relative z-10 mb-8 flex h-9 w-9 items-center justify-center rounded-full border border-gold bg-night text-sm text-gold">
                  {p.step}
                </span>
                <h3 className="display mb-3 text-3xl">{p.title}</h3>
                <p className="leading-relaxed text-bone">{p.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal as="p" className="mt-16 max-w-3xl border-l border-gold/60 pl-6 text-lg leading-relaxed text-ivory">
            Participation is voluntary. Applying doesn&rsquo;t guarantee you&rsquo;ll be selected or contacted, and it doesn&rsquo;t
            commit you to anything. Filming dates, locations and anything you&rsquo;d rather not discuss are agreed before
            production begins.
          </Reveal>
        </div>
      </section>

      {/* ── Who can apply + privacy ─────────────────────────── */}
      <section aria-label="Eligibility and privacy" className="gutter grid gap-16 border-t border-line py-[clamp(6rem,14vh,10rem)] lg:grid-cols-2">
        <div>
          <p className="label mb-6 text-gold">Who can apply</p>
          <h2 className="display mb-10 text-[clamp(2.4rem,4.4vw,4.4rem)]">Eligibility</h2>
          <ul className="space-y-5">
            {casting.eligibility.map((e, i) => (
              <Reveal as="li" key={e} delay={i * 80} className="flex gap-5 border-b border-line pb-5 text-lg text-bone">
                <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-gold" />
                {e}
              </Reveal>
            ))}
          </ul>
        </div>
        <div id="privacy">
          <p className="label mb-6 text-gold">Your privacy</p>
          <h2 className="display mb-10 text-[clamp(2.4rem,4.4vw,4.4rem)]">Treated with care</h2>
          <dl className="space-y-8">
            {casting.privacy.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <dt className="label mb-2 text-ivory">{p.title}</dt>
                <dd className="leading-relaxed text-ash">{p.body}</dd>
              </Reveal>
            ))}
          </dl>
          <p className="mt-8 text-sm text-ash">
            Read the full{" "}
            <a href="/privacy" className="text-bone underline underline-offset-4">
              privacy notice
            </a>
            . We never ask you to share sensitive information publicly.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section aria-labelledby="faq-title" className="border-t border-line bg-night py-[clamp(6rem,14vh,10rem)]">
        <div className="gutter grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label mb-6 text-gold">Questions</p>
            <h2 id="faq-title" className="display text-[clamp(2.6rem,5vw,5rem)]">
              Before you apply
            </h2>
          </div>
          <div className="lg:col-span-8">
            {casting.faq.map((f) => (
              <details key={f.q} className="group border-b border-line first:border-t">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg text-ivory transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="relative h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                    <span className="absolute left-1/2 top-0 h-4 w-px bg-current transition-transform duration-500 group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 leading-relaxed text-bone">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final call ──────────────────────────────────────── */}
      <section aria-labelledby="apply-cta-title" className="relative overflow-hidden border-t border-line">
        <div className="gutter flex min-h-[80svh] flex-col items-center justify-center py-24 text-center">
          <p className="label mb-8 text-gold">10–15 minutes · video optional</p>
          <h2 id="apply-cta-title" className="display max-w-5xl text-[clamp(3rem,8vw,8rem)]">
            Your story belongs in the record.
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Cta href="/casting/apply">Apply to share your story</Cta>
            <Cta href={`mailto:${site.contact.casting}`} variant="outline">
              Email the casting team
            </Cta>
          </div>
          <p className="mt-8 text-sm text-ash">
            Contact: <a className="text-bone underline underline-offset-4" href={`mailto:${site.contact.casting}`}>{site.contact.casting}</a>
          </p>
        </div>
      </section>
    </>
  );
}

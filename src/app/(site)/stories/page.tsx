import type { Metadata } from "next";
import { people } from "@/content/people";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { PeopleIndex } from "@/components/storytelling/people-index";
import { Cta } from "@/components/ui/cta";

export const metadata: Metadata = {
  title: "The People",
  description: "Behind every opinion is a person. Meet the Americans at the heart of Nation Divided.",
  alternates: { canonical: "/stories" },
};

export default function StoriesPage() {
  const allPlaceholders = people.every((p) => p.placeholder);
  return (
    <>
      <section className="gutter pb-20 pt-[calc(var(--nav-h)+5rem)]">
        <p className="label mb-8 text-gold">The People</p>
        <Lines
          as="h1"
          lines={["Behind every", "opinion is", "a person."]}
          className="display text-[clamp(3.6rem,11vw,11rem)]"
        />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal as="p" className="text-lg leading-relaxed text-bone md:col-span-5 md:col-start-7">
            Nation Divided is built around people, not pundits. Their stories will be published here only after each participant
            has approved how they&rsquo;re presented: their name, their image, their words.
          </Reveal>
        </div>
        {allPlaceholders && (
          <p role="note" className="mt-12 max-w-3xl border-l-2 border-gold/70 py-2 pl-5 text-sm leading-relaxed text-ash">
            <span className="label mb-1 block text-gold">In production</span>
            These stories are still being filmed. Each one will be published here once the participant has reviewed and
            approved it.
          </p>
        )}
      </section>

      <PeopleIndex people={people} />

      <section className="gutter flex flex-col items-start justify-between gap-8 py-24 md:flex-row md:items-end">
        <p className="display max-w-3xl text-[clamp(2.4rem,5vw,5rem)]">Could your story be next?</p>
        <Cta href="/casting">Share your story</Cta>
      </section>
    </>
  );
}

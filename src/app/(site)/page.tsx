import { Intro } from "@/components/cinematic/intro";
import { Hero } from "@/components/storytelling/hero";
import { Statement } from "@/components/storytelling/statement";
import { Divide } from "@/components/storytelling/divide";
import { Chapters } from "@/components/storytelling/chapters";
import { ContactSheet } from "@/components/storytelling/contact-sheet";
import { QuestionsTeaser } from "@/components/storytelling/questions-teaser";
import { Timeline } from "@/components/storytelling/timeline";
import { CastingCall } from "@/components/storytelling/casting-call";
import { FilmTeaser } from "@/components/storytelling/film-teaser";
import { site } from "@/content/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: site.title,
    description: site.description,
    genre: ["Documentary"],
    productionCompany: { "@type": "Organization", name: site.studio },
    url: site.url,
  };

  return (
    <>
      <Intro />
      <Hero />
      <Statement />
      <Divide />
      <Chapters />
      <ContactSheet />
      <QuestionsTeaser />
      <Timeline />
      <CastingCall />
      <FilmTeaser />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

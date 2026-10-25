import type { Metadata } from "next";
import { Download } from "lucide-react";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { press } from "@/content/studio";
import { Frame } from "@/components/cinematic/frame";
import { Lines, Reveal } from "@/components/cinematic/reveal";
import { PressForm } from "@/components/forms/press-form";

export const metadata: Metadata = {
  title: "Press",
  description: `Press information for ${site.title}, a ${site.studio} documentary: synopsis, logline, production notes and media contact.`,
  alternates: { canonical: "/press" },
};

export default function PressPage() {
  const stills = media.pressStills;
  return (
    <>
      <section className="gutter pb-16 pt-[calc(var(--nav-h)+5rem)]">
        <p className="label mb-8 text-gold">Press &amp; media</p>
        <Lines as="h1" lines={["Press room"]} className="display text-[clamp(3.6rem,11vw,11rem)]" />
        <nav aria-label="On this page" className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
          {[
            ["Logline", "#logline"],
            ["Synopsis", "#synopsis"],
            ["Production notes", "#notes"],
            ["Director's statement", "#statement"],
            ["Images", "#images"],
            ["Press kit", "#kit"],
            ["Contact", "#contact"],
          ].map(([l, h]) => (
            <a key={h} href={h} className="label min-h-11 content-center text-ash hover:text-ivory">
              {l}
            </a>
          ))}
        </nav>
      </section>

      <section id="logline" aria-labelledby="logline-h" className="gutter scroll-mt-24 border-t border-line py-20">
        <h2 id="logline-h" className="label mb-6 text-gold">
          Official logline
        </h2>
        <Reveal as="p" className="editorial max-w-5xl text-[clamp(1.7rem,3.2vw,3rem)] leading-[1.15]">
          {site.logline}
        </Reveal>
      </section>

      <section id="synopsis" aria-labelledby="synopsis-h" className="gutter grid scroll-mt-24 gap-12 border-t border-line py-20 lg:grid-cols-12">
        <h2 id="synopsis-h" className="display text-[clamp(2.4rem,4vw,4rem)] lg:col-span-4">
          Synopsis
        </h2>
        <div className="space-y-6 text-lg leading-[1.75] text-bone lg:col-span-7 lg:col-start-6">
          {press.synopsis.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section id="notes" aria-labelledby="notes-h" className="gutter grid scroll-mt-24 gap-12 border-t border-line py-20 lg:grid-cols-12">
        <h2 id="notes-h" className="display text-[clamp(2.4rem,4vw,4rem)] lg:col-span-4">
          Production notes
        </h2>
        <dl className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {press.productionNotes.map((n) => (
            <div key={n.label} className="bg-ink p-5">
              <dt className="label mb-1 text-ash">{n.label}</dt>
              <dd className="text-ivory">{n.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="statement" aria-labelledby="statement-h" className="gutter grid scroll-mt-24 gap-12 border-t border-line py-20 lg:grid-cols-12">
        <h2 id="statement-h" className="display text-[clamp(2.4rem,4vw,4rem)] lg:col-span-4">
          Director&rsquo;s statement
        </h2>
        <div className="lg:col-span-7 lg:col-start-6">
          {press.directorsStatement ? (
            <p className="editorial text-2xl leading-relaxed">{press.directorsStatement}</p>
          ) : (
            <p className="border border-dashed border-line-strong p-8 text-ash">
              The director&rsquo;s statement will be published here. <span className="label text-gold/80">Placeholder</span>
            </p>
          )}
        </div>
      </section>

      <section id="images" aria-labelledby="images-h" className="scroll-mt-24 border-t border-line bg-night py-20">
        <div className="gutter mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 id="images-h" className="display text-[clamp(2.4rem,4vw,4rem)]">
            Approved imagery
          </h2>
          <p className="max-w-sm text-sm text-ash">
            {stills.length
              ? "Images may be used for editorial coverage of the film with credit to StockHouse Films."
              : "Approved stills will be added here. The frames below are placeholders and are not for publication."}
          </p>
        </div>
        <ul className="gutter grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(stills.length ? stills : [null, null, null]).map((img, i) => (
            <li key={i}>
              <figure>
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Frame
                    image={img}
                    scene={(["portrait", "street", "field"] as const)[i % 3]}
                    tint={(["neutral", "steel", "gold"] as const)[i % 3]}
                    seed={80 + i}
                    label="Not for publication"
                    className="h-full w-full"
                  />
                </div>
                {img && (
                  <figcaption className="mt-3 flex justify-between gap-4 text-sm text-ash">
                    <span>{img.alt}</span>
                    <a href={img.src} download className="label text-gold hover:underline">
                      Download
                    </a>
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section id="kit" aria-labelledby="kit-h" className="gutter scroll-mt-24 border-t border-line py-20">
        <h2 id="kit-h" className="label mb-6 text-gold">
          Press kit
        </h2>
        {media.pressKit ? (
          <a
            href={media.pressKit.href}
            download
            className="group inline-flex items-center gap-6 border border-line-strong p-6 transition-colors hover:border-gold"
          >
            <Download aria-hidden className="h-6 w-6 text-gold" />
            <span>
              <span className="display block text-3xl">{media.pressKit.label}</span>
              <span className="label text-ash">{media.pressKit.size}</span>
            </span>
          </a>
        ) : (
          <p className="text-bone">The downloadable press kit will be available closer to release.</p>
        )}
      </section>

      <section id="contact" aria-labelledby="contact-h" className="gutter grid scroll-mt-24 gap-14 border-t border-line py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="contact-h" className="display text-[clamp(2.4rem,4vw,4rem)]">
            Media inquiries
          </h2>
          <p className="mt-6 text-bone">
            For interviews, screeners, festival programming and podcast requests. Or write directly to{" "}
            <a href={`mailto:${site.contact.press}`} className="text-ivory underline underline-offset-4">
              {site.contact.press}
            </a>
            .
          </p>
        </div>
        <div className="relative lg:col-span-7 lg:col-start-6">
          <PressForm />
        </div>
      </section>
    </>
  );
}

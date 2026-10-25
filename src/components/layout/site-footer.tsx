import Link from "next/link";
import { nav, site } from "@/content/site";
import { MotionToggle } from "@/components/cinematic/motion-toggle";
import { AmbientSound } from "@/components/cinematic/ambient-sound";
import { YouTubeIcon } from "@/components/ui/icons";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink pt-20">
      <div className="gutter grid gap-14 pb-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label mb-6 text-gold">A {site.studio} documentary</p>
          <p className="editorial max-w-md text-3xl leading-[1.1] text-ivory md:text-4xl">
            <em>Behind every political opinion is a person.</em>
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2">
            <MotionToggle />
            <AmbientSound />
          </div>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="label mb-5 text-ash">Explore</p>
          <ul className="space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-bone transition-colors hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8 md:col-span-4">
          <div>
            <p className="label mb-3 text-ash">Casting</p>
            <a href={`mailto:${site.contact.casting}`} className="text-bone hover:text-gold">
              {site.contact.casting}
            </a>
          </div>
          <div>
            <p className="label mb-3 text-ash">Press</p>
            <a href={`mailto:${site.contact.press}`} className="text-bone hover:text-gold">
              {site.contact.press}
            </a>
          </div>
          <div>
            <p className="label mb-3 text-ash">Follow the production</p>
            {site.social.youtubeChannel ? (
              <a
                href={site.social.youtubeChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-bone hover:text-gold"
              >
                <YouTubeIcon className="h-4 w-4" /> StockHouse Films on YouTube
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="text-ash">YouTube channel link coming soon.</p>
            )}
          </div>
        </div>
      </div>

      <div className="gutter flex flex-col gap-3 border-t border-line py-6 text-xs text-ash sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {site.studio}. All rights reserved. Nation Divided is an independent production and is not affiliated with any
          political party or campaign.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-ivory">
            Privacy
          </Link>
          <Link href="/press" className="hover:text-ivory">
            Press
          </Link>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="display translate-y-[18%] whitespace-nowrap text-center text-[21vw] leading-none text-transparent [-webkit-text-stroke:1px_rgb(243_240_234/0.14)]">
          Nation Divided
        </p>
      </div>
    </footer>
  );
}

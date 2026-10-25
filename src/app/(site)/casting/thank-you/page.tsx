import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/content/site";
import { Cta } from "@/components/ui/cta";
import { Wordmark } from "@/components/navigation/wordmark";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

async function Receipt({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = typeof sp.ref === "string" ? sp.ref : "";
  const ref = /^ND-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(raw) ? raw : null;
  const emailed = sp.email === "1";
  return (
    <>
      {ref && (
        <p className="label mt-10 inline-flex w-fit flex-wrap items-center gap-3 self-start border border-gold/50 px-5 py-3 text-ivory">
          Reference <span className="tabular-nums tracking-[0.3em] text-gold">{ref}</span>
        </p>
      )}
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone">
        {emailed
          ? "We've sent a confirmation to your email address. If it isn't in your inbox, check your spam folder."
          : "Please keep your reference number. If you need to contact us about your application, include it in your message."}
      </p>
    </>
  );
}

export default function ThankYouPage({ searchParams }: PageProps<"/casting/thank-you">) {
  return (
    <section className="gutter flex min-h-[100svh] flex-col justify-center pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <Wordmark className="mb-14 text-3xl text-ivory/80" />
      <p className="label mb-6 text-gold">Application received</p>
      <h1 className="display text-[clamp(3.4rem,10vw,10rem)]">Thank you.</h1>
      <p className="editorial mt-6 max-w-3xl text-[clamp(1.6rem,3vw,2.6rem)] italic leading-tight text-ivory">
        Your story has reached us, and a real person on our casting team will read it.
      </p>
      <Suspense fallback={<div className="mt-10 h-24" />}>
        <Receipt searchParams={searchParams} />
      </Suspense>
      <div className="mt-6 max-w-xl space-y-4 leading-relaxed text-ash">
        <p>
          We receive more applications than we can film, so we can&rsquo;t promise everyone a reply. If your story may be a fit,
          we&rsquo;ll contact you to talk — no commitment, and nothing is filmed without your agreement and signed releases.
        </p>
        <p>
          To withdraw your application or ask a question, email{" "}
          <a className="text-bone underline underline-offset-4" href={`mailto:${site.contact.casting}`}>
            {site.contact.casting}
          </a>
          .
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <Cta href="/">Return to the film</Cta>
        <Cta href="/questions" variant="outline">
          Explore the questions
        </Cta>
      </div>
    </section>
  );
}

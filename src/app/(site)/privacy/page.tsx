import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Nation Divided and StockHouse Films handle casting applications and visitor data.",
  alternates: { canonical: "/privacy" },
};

/**
 * Plain-language privacy notice. Have it reviewed by counsel before launch,
 * and update the retention period to match CASTING_RETENTION_DAYS.
 */
export default function PrivacyPage() {
  const sections = [
    {
      h: "Who we are",
      p: [
        `This website is operated by ${site.studio}, the producer of ${site.title}. Questions about privacy can be sent to ${site.contact.general}.`,
      ],
    },
    {
      h: "Browsing the site",
      p: [
        "We do not use advertising trackers or analytics on this website. Our hosting provider keeps standard server logs (such as IP address and request time) for security and reliability.",
        "Some preferences — such as turning motion off, or reflections you write on The Questions page — are stored only in your own browser and are never sent to us.",
        "Videos from YouTube load only when you press play, using YouTube's privacy-enhanced mode.",
      ],
    },
    {
      h: "Casting applications",
      p: [
        "When you apply, we collect the details you give us: your name, contact details, city and state, your answers, and an optional video. We use them only to consider you for the film and to contact you about casting.",
        "Some answers relate to your political views. We collect them because they are the subject of the documentary, we treat them as sensitive, and we never publish or share them without your separate, written agreement.",
        "Applications are stored in a secured database and private file storage. Only authorized StockHouse Films casting staff can access them, through an authenticated review system that records who viewed or changed an application.",
        "To prevent abuse, we keep a short-lived, scrambled (hashed) version of your network address for rate limiting. It is not linked to your application.",
      ],
    },
    {
      h: "What applying does not mean",
      p: [
        "Applying does not give us permission to film you or to publish your name, image, voice or likeness. Any filming requires a separate conversation and signed release forms.",
      ],
    },
    {
      h: "How long we keep it",
      p: [
        "Applications that are not selected are deleted after the casting period ends. You can ask us to delete your application at any time.",
      ],
    },
    {
      h: "Your choices",
      p: [
        `To access, correct or delete your application, or to withdraw from consideration, email ${site.contact.casting} and include your reference number if you have it.`,
      ],
    },
    {
      h: "Service providers",
      p: [
        "We use trusted providers for website hosting, database and file storage, email delivery and bot protection. They process data only on our instructions.",
      ],
    },
  ];
  return (
    <article className="gutter pb-24 pt-[calc(var(--nav-h)+5rem)]">
      <p className="label mb-8 text-gold">Privacy notice</p>
      <h1 className="display mb-16 text-[clamp(3rem,8vw,8rem)]">Your privacy</h1>
      <div className="max-w-3xl space-y-14">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-4 text-2xl text-ivory">{s.h}</h2>
            <div className="space-y-4 leading-relaxed text-bone">
              {s.p.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="border-t border-line pt-8 text-sm text-ash">This notice should be reviewed by legal counsel before launch.</p>
      </div>
    </article>
  );
}

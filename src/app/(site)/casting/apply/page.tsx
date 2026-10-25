import type { Metadata } from "next";
import { ApplicationForm } from "@/components/casting/application-form";
import { storageDriver } from "@/lib/server/storage";

export const metadata: Metadata = {
  title: "Apply — Casting",
  description: "Apply to share your story in Nation Divided, a StockHouse Films documentary.",
  alternates: { canonical: "/casting/apply" },
  robots: { index: true, follow: true },
};

export default function ApplyPage() {
  const uploadsEnabled = storageDriver() !== "none";
  return (
    <div className="gutter pb-24 pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <header className="mb-16 max-w-4xl">
        <p className="label mb-6 text-gold">Casting application · Nation Divided</p>
        <h1 className="editorial text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1.05] text-ivory">
          Tell us your story, <em className="text-gold">in your own words.</em>
        </h1>
        <p className="mt-6 max-w-2xl leading-relaxed text-bone">
          It takes about 10–15 minutes. There are no right answers, and you don&rsquo;t have to share anything you&rsquo;re
          not comfortable with. Fields marked optional can be left blank.
        </p>
      </header>
      <ApplicationForm uploadsEnabled={uploadsEnabled} />
    </div>
  );
}

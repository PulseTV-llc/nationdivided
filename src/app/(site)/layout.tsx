import { ViewTransition } from "react";
import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/cinematic/smooth-scroll";
import { Cursor } from "@/components/cinematic/cursor";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <ViewTransition default="page">
        <main id="main" tabIndex={-1} className="relative outline-none">
          {children}
        </main>
      </ViewTransition>
      <SiteFooter />
      <div aria-hidden className="grain" />
      <Cursor />
    </>
  );
}

import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import NotFound from "./(site)/not-found";

/** 404 for URLs outside any route — reuses the site chrome. */
export default function RootNotFound() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <NotFound />
      </main>
      <SiteFooter />
      <div aria-hidden className="grain" />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import { Wordmark } from "./wordmark";
import { Timecode } from "@/components/cinematic/timecode";

const desktopLinks = nav.filter((n) => n.href !== "/" && n.href !== "/stories");

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Menu: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current!;
    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.__lenis?.start();
    };
  }, [open, close]);

  // Close the menu after navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && !href.includes("#"));

  return (
    <>
      <a
        href="#main"
        className="label fixed left-4 top-4 z-[90] -translate-y-24 bg-gold px-4 py-3 text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] duration-700 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${scrolled && !open ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="gutter flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/" className="relative z-10 flex items-center gap-4 text-[1.05rem] text-ivory" aria-label="Nation Divided — home">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {desktopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="label group relative inline-flex min-h-11 items-center text-ivory/75 transition-colors hover:text-ivory aria-[current=page]:text-ivory"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="absolute -bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/casting"
              className="label hidden min-h-11 items-center gap-2 rounded-full border border-gold/60 px-5 text-gold transition-colors hover:bg-gold hover:text-ink sm:inline-flex"
            >
              <span aria-hidden className="h-1.5 w-1.5 animate-blink rounded-full bg-crimson-lit" />
              Share your story
            </Link>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="label flex min-h-11 min-w-11 items-center justify-center gap-3 text-ivory lg:hidden"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="relative block h-3 w-7">
                <span
                  className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${open ? "translate-y-1.5 rotate-[20deg]" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "-translate-y-1.5 -rotate-[20deg]" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="site-menu"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col bg-ink pt-[var(--nav-h)] lg:hidden"
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-line" aria-hidden />
        <nav aria-label="Menu" className="gutter flex flex-1 flex-col justify-center">
          <ul className="space-y-1">
            {nav.map((item, i) => (
              <li
                key={item.href}
                className="overflow-hidden"
                style={{ animation: open ? `menu-in 0.9s var(--ease-out-expo) ${0.05 * i}s both` : undefined }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group flex items-baseline gap-4 py-1"
                >
                  <span className="label w-6 text-gold/80">{item.index}</span>
                  <span className="display text-[clamp(2.6rem,12vw,4.5rem)] text-ivory transition-colors group-hover:text-gold group-aria-[current=page]:text-gold">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="gutter flex items-end justify-between border-t border-line py-6">
          <div className="space-y-1">
            <p className="label text-ash">Casting</p>
            <a className="text-sm text-ivory underline-offset-4 hover:underline" href={`mailto:${site.contact.casting}`}>
              {site.contact.casting}
            </a>
          </div>
          <Timecode className="label text-ash" />
        </div>
      </div>
    </>
  );
}

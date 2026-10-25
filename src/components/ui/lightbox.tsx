"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ImageAsset } from "@/content/media";

type Ctx = { open: (index: number, trigger: HTMLElement) => void };
const LightboxContext = createContext<Ctx | null>(null);

/**
 * A full-screen image viewer for a group of images. Wrap the group in
 * <Lightbox items={…}> and each clickable image in <LightboxTrigger index={…}>.
 */
export function Lightbox({ items, children }: { items: ImageAsset[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setIndex(i);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  const isOpen = index !== null;

  // Lock scroll, trap focus, keyboard controls.
  useEffect(() => {
    if (!isOpen) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current!;
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    dialog.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
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
  }, [isOpen, close, step]);

  const item = index === null ? null : items[index];
  const many = items.length > 1;

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {item && index !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${index + 1} of ${items.length}`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="gutter flex h-[var(--nav-h)] shrink-0 items-center justify-between gap-4">
            <span className="label text-ash" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              data-close
              onClick={close}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <X aria-hidden className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              unoptimized
              className="h-auto max-h-full w-auto max-w-full object-contain shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
            />
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/30 bg-ink/60 text-ivory transition-colors hover:border-gold hover:text-gold sm:left-6"
                >
                  <ChevronLeft aria-hidden className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/30 bg-ink/60 text-ivory transition-colors hover:border-gold hover:text-gold sm:right-6"
                >
                  <ChevronRight aria-hidden className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </button>
              </>
            )}
          </div>

          <div className="gutter flex shrink-0 flex-wrap items-center justify-between gap-4 py-5">
            <p className="text-sm text-bone">{item.caption ?? item.alt}</p>
            <a
              href={item.src}
              download
              className="label inline-flex min-h-11 items-center gap-3 rounded-full border border-ivory/40 px-5 text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <Download aria-hidden className="h-4 w-4" /> Download
            </a>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}

/** Makes its children open the surrounding <Lightbox> at `index`. */
export function LightboxTrigger({
  index,
  label,
  className = "",
  children,
}: {
  index: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(LightboxContext);
  return (
    <button
      type="button"
      data-cursor="View"
      aria-label={`View larger: ${label}`}
      onClick={(e) => ctx?.open(index, e.currentTarget)}
      className={`block w-full cursor-zoom-in text-left ${className}`}
    >
      {children}
    </button>
  );
}

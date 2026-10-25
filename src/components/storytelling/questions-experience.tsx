"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { questions, type Question } from "@/content/questions";

const THEMES = ["All", ...Array.from(new Set(questions.map((q) => q.theme)))] as const;
const NOTE_KEY = (id: string) => `nd-reflection-${id}`;
const NOTE_EVENT = "nd-reflection";

// Reflections live only in this browser's localStorage.
function readNote(id: string) {
  try {
    return localStorage.getItem(NOTE_KEY(id)) ?? "";
  } catch {
    return "";
  }
}
function subscribeNotes(cb: () => void) {
  window.addEventListener(NOTE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(NOTE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * THE QUESTIONS — one question at a time. Arrow keys, swipe, or buttons to
 * move. Visitors can write a private reflection that is stored only in this
 * browser (never sent anywhere). No polls, no affiliation, no tracking.
 */
export function QuestionsExperience() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>("All");
  const [order, setOrder] = useState<Question[]>(questions);
  const [i, setI] = useState(0);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const touch = useRef<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (theme === "All" ? order : order.filter((q) => q.theme === theme)), [order, theme]);
  const q = list[Math.min(i, list.length - 1)];

  const go = useCallback((d: number) => setI((v) => (v + d + list.length) % list.length), [list.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const note = useSyncExternalStore(subscribeNotes, () => readNote(q.id), () => "");
  const showNote = openFor === q.id || note !== "";

  const saveNote = (v: string) => {
    try {
      if (v) localStorage.setItem(NOTE_KEY(q.id), v);
      else localStorage.removeItem(NOTE_KEY(q.id));
    } catch {}
    window.dispatchEvent(new Event(NOTE_EVENT));
  };

  const shuffle = () => {
    const a = [...questions];
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    setOrder(a);
    setI(0);
  };

  return (
    <section aria-labelledby="questions-heading" className="relative">
      <h1 id="questions-heading" className="sr-only">
        The Questions
      </h1>

      {/* Stage */}
      <div
        ref={stage}
        className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-10 pt-[calc(var(--nav-h)+2rem)]"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(201_165_106/0.12),transparent_65%)]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
        </div>

        <div className="gutter relative flex flex-wrap items-center justify-between gap-4">
          <p className="label text-gold">The Questions</p>
          <div role="group" aria-label="Filter by theme" className="flex flex-wrap gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={theme === t}
                onClick={() => {
                  setTheme(t);
                  setI(0);
                }}
                className="label min-h-10 rounded-full border border-transparent px-3 text-[0.62rem] text-ash transition-colors hover:text-ivory aria-pressed:border-gold/60 aria-pressed:text-gold"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="gutter relative mx-auto w-full max-w-6xl py-10 text-center">
          <p className="label mb-10 text-ash">
            <span className="tabular-nums text-ivory">{String(i + 1).padStart(2, "0")}</span> /{" "}
            {String(list.length).padStart(2, "0")} · {q.theme}
          </p>
          <p aria-live="polite" className="sr-only">
            Question {i + 1} of {list.length}: {q.text}
          </p>
          <blockquote key={q.id} aria-hidden className="editorial text-[clamp(2.3rem,6.4vw,6.6rem)] leading-[1.02] text-ivory">
            {q.text.split(" ").map((w, wi) => (
              <span
                key={wi}
                className="inline-block animate-[q-in_1.1s_var(--ease-out-expo)_both]"
                style={{ animationDelay: `${wi * 50}ms` }}
              >
                {w}&nbsp;
              </span>
            ))}
          </blockquote>

          <div className="mx-auto mt-12 max-w-2xl">
            {!showNote ? (
              <button
                type="button"
                onClick={() => setOpenFor(q.id)}
                className="label min-h-11 border-b border-ivory/30 px-1 text-bone transition-colors hover:border-gold hover:text-gold"
              >
                Sit with this question
              </button>
            ) : (
              <div className="text-left">
                <label htmlFor="reflection" className="label mb-2 block text-ash">
                  Your private reflection
                </label>
                <textarea
                  id="reflection"
                  value={note}
                  onChange={(e) => saveNote(e.target.value.slice(0, 2000))}
                  rows={3}
                  data-lenis-prevent
                  className="field text-lg"
                  placeholder="Write as much or as little as you like…"
                  aria-describedby="reflection-hint"
                />
                <p id="reflection-hint" className="mt-2 text-xs text-ash">
                  Saved only in this browser on this device. Nothing you write is sent to us or anyone else.
                  {note && (
                    <button type="button" onClick={() => saveNote("")} className="ml-3 underline underline-offset-2 hover:text-ivory">
                      Clear
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="gutter relative flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="label inline-flex min-h-12 items-center gap-3 text-ash transition-colors hover:text-ivory"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" /> Previous
          </button>
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
            {list.map((item, k) => (
              <span
                key={item.id}
                className={`h-px transition-all duration-500 ${k === i ? "w-10 bg-gold" : "w-4 bg-ivory/25"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={shuffle}
              className="label inline-flex min-h-12 items-center gap-2 text-ash transition-colors hover:text-ivory"
            >
              <Shuffle aria-hidden className="h-4 w-4" /> Shuffle
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="label inline-flex min-h-12 items-center gap-3 rounded-full border border-ivory/30 px-5 text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              Next <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Index */}
      <div className="gutter border-t border-line py-20">
        <h2 className="label mb-8 text-ash">All questions</h2>
        <ol className="grid gap-x-10 md:grid-cols-2">
          {questions.map((item, k) => (
            <li key={item.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => {
                  setTheme("All");
                  setOrder(questions);
                  setI(k);
                  stage.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span className="label w-6 shrink-0 text-gold">{String(k + 1).padStart(2, "0")}</span>
                <span className="editorial text-xl leading-snug text-bone transition-colors group-hover:text-ivory">{item.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-xl text-sm text-ash">
          These questions are the ones we ask the people in the film. We don&rsquo;t ask how you vote, and we don&rsquo;t keep
          anything you write here.
        </p>
      </div>
    </section>
  );
}

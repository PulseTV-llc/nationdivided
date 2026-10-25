"use client";

import { useEffect, useState } from "react";
import { questions } from "@/content/questions";
import { Cta } from "@/components/ui/cta";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** A single question at a time, slowly cycling. Pauses on hover/focus. */
export function QuestionsTeaser() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % questions.length), 6500);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  const q = questions[i];

  return (
    <section
      aria-labelledby="questions-title"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(201_165_106/0.08),transparent_70%)]" />
      <div className="gutter flex items-center justify-between">
        <h2 id="questions-title" className="label text-gold">
          The Questions
        </h2>
        <p className="label tabular-nums text-ash">
          {String(i + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        </p>
      </div>

      <div className="gutter relative">
        <p aria-live="polite" className="sr-only">
          {q.text}
        </p>
        <blockquote
          key={q.id}
          aria-hidden
          className="editorial mx-auto max-w-5xl text-center text-[clamp(2.2rem,6vw,6rem)] leading-[1.02] text-ivory"
        >
          {q.text.split(" ").map((w, wi) => (
            <span
              key={wi}
              className="inline-block animate-[q-in_1.1s_var(--ease-out-expo)_both]"
              style={{ animationDelay: `${wi * 45}ms` }}
            >
              {w}&nbsp;
            </span>
          ))}
        </blockquote>
        <p className="label mt-8 text-center text-ash">Theme · {q.theme}</p>
      </div>

      <div className="gutter flex flex-col items-center gap-6">
        <p className="max-w-md text-center text-sm text-ash">
          No sign-up. No poll. Nothing you think is recorded. Just questions worth sitting with.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setI((v) => (v + 1) % questions.length)}
            className="label min-h-11 rounded-full border border-ivory/25 px-6 text-ivory transition-colors hover:border-gold hover:text-gold"
          >
            Next question
          </button>
          <Cta href="/questions" variant="ghost">
            Explore all
          </Cta>
        </div>
      </div>
    </section>
  );
}

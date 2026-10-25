"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Optional ambient "room tone", synthesised in the browser (no audio file).
 * Always off until the visitor turns it on. Nothing autoplays.
 */
export function AmbientSound({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);

  const start = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Brown noise → low-pass: distant traffic / wind.
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.2;
      }
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(lp.frequency);
    noise.connect(lp).connect(noiseGain).connect(master);

    // A low, unresolved drone: two tones a fifth apart, gently detuned.
    [55, 82.41, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.012 : 0.03;
      o.connect(g).connect(master);
      o.start();
    });

    noise.start();
    lfo.start();
    master.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 2.5);
    ctxRef.current = { ctx, master };
  };

  const toggle = () => {
    if (!on) {
      if (!ctxRef.current) start();
      else {
        void ctxRef.current.ctx.resume();
        ctxRef.current.master.gain.linearRampToValueAtTime(0.32, ctxRef.current.ctx.currentTime + 1.5);
      }
      setOn(true);
    } else if (ctxRef.current) {
      const { ctx, master } = ctxRef.current;
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => void ctx.suspend(), 900);
      setOn(false);
    }
  };

  useEffect(() => () => void ctxRef.current?.ctx.close(), []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={`label group inline-flex min-h-11 items-center gap-3 text-ash transition-colors hover:text-ivory ${className}`}
    >
      <span aria-hidden className="flex h-3 items-end gap-[3px]">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className={`w-[2px] origin-bottom bg-current transition-transform ${on ? "animate-[eq_0.9s_ease-in-out_infinite_alternate]" : ""}`}
            style={{ height: "100%", transform: on ? undefined : "scaleY(0.25)", animationDelay: `${i * 0.15}s`, ["--h" as string]: h }}
          />
        ))}
      </span>
      Sound {on ? "on" : "off"}
    </button>
  );
}

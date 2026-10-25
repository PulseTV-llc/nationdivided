import type { PlaceholderScene } from "@/content/media";

/**
 * Original generative "frames" used wherever cleared documentary media
 * hasn't been supplied yet. They are abstract silhouettes, not photographs,
 * and are always labelled as placeholders by <Frame>.
 */

export type Tint = "crimson" | "steel" | "gold" | "neutral";

const TINTS: Record<Tint, { sky: [string, string, string]; glow: string; ink: string; lit: string }> = {
  crimson: { sky: ["#0d0a0d", "#2a1216", "#6e2a30"], glow: "#e08a6a", ink: "#08080b", lit: "#f0c48a" },
  steel: { sky: ["#070b11", "#14263a", "#3b6684"], glow: "#9fc4dc", ink: "#06080c", lit: "#d6e6ef" },
  gold: { sky: ["#0b0a08", "#2b2114", "#8c6a3c"], glow: "#f1cf8f", ink: "#080706", lit: "#ffe2a8" },
  neutral: { sky: ["#08090d", "#171b25", "#4a4a4f"], glow: "#d9d4ca", ink: "#060709", lit: "#efe6d3" },
};

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function Scene({
  scene,
  tint = "neutral",
  seed = 7,
  className,
  title,
}: {
  scene: PlaceholderScene;
  tint?: Tint;
  seed?: number;
  className?: string;
  title?: string;
}) {
  const t = TINTS[tint];
  const r = rand(seed * 97 + scene.length * 13);
  const id = `${scene}-${tint}-${seed}`;

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.sky[0]} />
          <stop offset="0.55" stopColor={t.sky[1]} />
          <stop offset="1" stopColor={t.sky[2]} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={t.glow} stopOpacity="0.9" />
          <stop offset="0.35" stopColor={t.glow} stopOpacity="0.25" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.ink} stopOpacity="0.6" />
          <stop offset="1" stopColor={t.ink} />
        </linearGradient>
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.glow} stopOpacity="0" />
          <stop offset="0.8" stopColor={t.glow} stopOpacity="0.15" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill={`url(#sky-${id})`} />
      {renderScene(scene, t, r, id)}
    </svg>
  );
}

function renderScene(scene: PlaceholderScene, t: (typeof TINTS)[Tint], r: () => number, id: string) {
  switch (scene) {
    case "street": {
      const buildings = Array.from({ length: 9 }, (_, i) => {
        const w = 70 + r() * 80;
        const h = 220 + r() * 320;
        return { x: i * 92 - 20, w, h };
      });
      return (
        <g>
          <circle cx="620" cy="560" r="260" fill={`url(#glow-${id})`} opacity="0.55" />
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={760 - b.h} width={b.w} height={b.h + 240} fill={t.ink} />
              {Array.from({ length: Math.floor(b.h / 46) }, (_, row) =>
                Array.from({ length: Math.floor(b.w / 26) }, (_, col) =>
                  r() > 0.72 ? (
                    <rect
                      key={`${row}-${col}`}
                      x={b.x + 10 + col * 24}
                      y={760 - b.h + 18 + row * 44}
                      width="10"
                      height="16"
                      fill={t.lit}
                      opacity={0.35 + r() * 0.6}
                    />
                  ) : null,
                ),
              )}
            </g>
          ))}
          <rect x="0" y="760" width="800" height="240" fill={`url(#floor-${id})`} />
          <line x1="560" y1="420" x2="560" y2="900" stroke={t.ink} strokeWidth="7" />
          <circle cx="560" cy="420" r="70" fill={`url(#glow-${id})`} />
          <path d="M0 300 Q400 360 800 290" stroke={t.ink} strokeWidth="2" fill="none" opacity="0.8" />
        </g>
      );
    }
    case "field":
      return (
        <g>
          <circle cx="260" cy="640" r="320" fill={`url(#glow-${id})`} opacity="0.8" />
          <rect x="0" y="660" width="800" height="340" fill={t.ink} />
          <rect x="560" y="470" width="44" height="190" fill={t.ink} />
          <path d="M560 470 Q582 440 604 470 Z" fill={t.ink} />
          <rect x="612" y="560" width="70" height="100" fill={t.ink} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={i * 60 + 10} y={672 + (i % 2) * 2} width="4" height={40 + i * 3} fill={t.sky[2]} opacity="0.5" />
          ))}
          <line x1="0" y1="690" x2="800" y2="700" stroke={t.sky[2]} strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case "porch":
      return (
        <g>
          <rect x="0" y="0" width="800" height="1000" fill={t.ink} opacity="0.55" />
          <polygon points="80,260 520,140 520,1000 80,1000" fill={t.ink} />
          <rect x="250" y="430" width="150" height="330" fill={t.lit} opacity="0.75" />
          <rect x="262" y="442" width="126" height="306" fill={t.glow} opacity="0.35" />
          <circle cx="440" cy="400" r="150" fill={`url(#glow-${id})`} />
          <circle cx="440" cy="400" r="9" fill={t.lit} />
          <rect x="0" y="760" width="800" height="16" fill={t.ink} />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={i * 50} y="776" width="6" height="140" fill={t.ink} />
          ))}
          <rect x="0" y="900" width="800" height="100" fill={t.ink} />
        </g>
      );
    case "diner":
      return (
        <g>
          {Array.from({ length: 3 }, (_, i) => (
            <rect key={i} x={40 + i * 250} y="180" width="220" height="420" fill={t.glow} opacity={0.12 + i * 0.05} />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <g key={i}>
              <line x1={150 + i * 250} y1="0" x2={150 + i * 250} y2="250" stroke={t.ink} strokeWidth="3" />
              <circle cx={150 + i * 250} cy="270" r="110" fill={`url(#glow-${id})`} opacity="0.7" />
              <path d={`M${120 + i * 250} 270 L${180 + i * 250} 270 L${165 + i * 250} 248 L${135 + i * 250} 248 Z`} fill={t.ink} />
            </g>
          ))}
          <rect x="0" y="640" width="800" height="26" fill={t.lit} opacity="0.25" />
          <rect x="0" y="666" width="800" height="334" fill={t.ink} />
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <rect x={70 + i * 160} y="560" width="70" height="20" rx="6" fill={t.ink} />
              <rect x={100 + i * 160} y="580" width="10" height="60" fill={t.ink} />
            </g>
          ))}
          <path d="M520 640 q30 -120 60 -40 q20 -60 40 0 Z" fill={t.ink} opacity="0.9" />
        </g>
      );
    case "portrait":
      return (
        <g>
          <rect width="800" height="1000" fill={`url(#rim-${id})`} />
          <circle cx="640" cy="260" r="360" fill={`url(#glow-${id})`} opacity="0.35" />
          <ellipse cx="400" cy="430" rx="120" ry="150" fill={t.ink} />
          <path d="M150 1000 C160 760 260 650 400 640 C540 650 640 760 650 1000 Z" fill={t.ink} />
          <rect x="350" y="560" width="100" height="100" fill={t.ink} />
          <path d="M516 360 C540 420 536 500 500 560" stroke={t.glow} strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M610 760 C630 820 640 900 646 1000" stroke={t.glow} strokeWidth="3" fill="none" opacity="0.4" />
        </g>
      );
    case "crowd":
      return (
        <g>
          {Array.from({ length: 5 }, (_, i) => (
            <polygon
              key={i}
              points={`${120 + i * 140},0 ${60 + i * 160},700 ${200 + i * 140},700`}
              fill={t.glow}
              opacity={0.05 + r() * 0.06}
            />
          ))}
          <circle cx="400" cy="120" r="240" fill={`url(#glow-${id})`} opacity="0.5" />
          {Array.from({ length: 34 }, (_, i) => {
            const x = (i % 12) * 72 + (Math.floor(i / 12) % 2) * 36 - 20 + r() * 14;
            const y = 620 + Math.floor(i / 12) * 110 + r() * 20;
            const s = 0.8 + Math.floor(i / 12) * 0.25;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <circle cx="0" cy="0" r="26" fill={t.ink} />
                <path d="M-48 120 C-44 48 -26 30 0 30 C26 30 44 48 48 120 Z" fill={t.ink} />
              </g>
            );
          })}
          <rect x="0" y="900" width="800" height="100" fill={t.ink} />
        </g>
      );
    case "road":
      return (
        <g>
          <circle cx="400" cy="520" r="300" fill={`url(#glow-${id})`} opacity="0.7" />
          <rect x="0" y="520" width="800" height="480" fill={t.ink} />
          <polygon points="384,520 416,520 760,1000 40,1000" fill={t.sky[1]} opacity="0.5" />
          {Array.from({ length: 7 }, (_, i) => {
            const p = i / 7;
            const y = 530 + p * p * 470;
            const h = 6 + p * 60;
            const w = 2 + p * 16;
            return <rect key={i} x={400 - w / 2} y={y} width={w} height={h} fill={t.lit} opacity={0.4 + p * 0.5} />;
          })}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={40 + i * 6} y1={420 - i * 4} x2={40 + i * 6} y2="560" stroke={t.ink} strokeWidth="3" />
          ))}
          <path d="M40 430 L800 470" stroke={t.ink} strokeWidth="1.5" />
        </g>
      );
    case "kitchen":
      return (
        <g>
          <rect x="430" y="140" width="260" height="360" fill={t.glow} opacity="0.4" />
          <line x1="560" y1="140" x2="560" y2="500" stroke={t.ink} strokeWidth="8" />
          <line x1="430" y1="320" x2="690" y2="320" stroke={t.ink} strokeWidth="8" />
          <polygon points="430,500 690,500 520,1000 120,1000" fill={t.glow} opacity="0.12" />
          <rect x="0" y="660" width="800" height="340" fill={t.ink} />
          <rect x="0" y="640" width="800" height="22" fill={t.sky[2]} opacity="0.35" />
          <path d="M210 640 L210 560 Q210 548 222 548 L278 548 Q290 548 290 560 L290 640 Z" fill={t.ink} />
          <path d="M290 572 q34 4 30 34 q-4 22 -30 22" stroke={t.ink} strokeWidth="9" fill="none" />
          <path d="M240 520 q-14 -24 6 -48 q18 -22 2 -48" stroke={t.lit} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
    case "flag":
      return (
        <g>
          <circle cx="600" cy="300" r="380" fill={`url(#glow-${id})`} opacity="0.4" />
          {Array.from({ length: 13 }, (_, i) => (
            <path
              key={i}
              d={`M-20 ${180 + i * 52} C200 ${150 + i * 52} 420 ${230 + i * 52} 820 ${170 + i * 52}`}
              stroke={i % 2 ? t.ink : t.lit}
              strokeWidth="26"
              fill="none"
              opacity={i % 2 ? 0.9 : 0.12}
            />
          ))}
        </g>
      );
    case "studio":
    default:
      return (
        <g>
          <circle cx="400" cy="380" r="340" fill={`url(#glow-${id})`} opacity="0.45" />
          <rect x="0" y="760" width="800" height="240" fill={t.ink} />
          <path d="M330 760 L330 560 L470 560 L470 760" stroke={t.ink} strokeWidth="14" fill="none" />
          <rect x="320" y="620" width="160" height="22" fill={t.ink} />
          <line x1="640" y1="300" x2="640" y2="900" stroke={t.ink} strokeWidth="6" />
          <polygon points="600,250 700,230 700,330 600,310" fill={t.ink} />
          <polygon points="600,260 230,620 400,700" fill={t.glow} opacity="0.08" />
        </g>
      );
  }
}

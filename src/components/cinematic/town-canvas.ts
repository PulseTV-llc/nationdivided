/**
 * Procedurally paints a wide nocturnal American town: hills, gabled houses,
 * lit windows, a water tower, a steeple, streetlights and power lines.
 * Monochrome on purpose — tints are applied with CSS so the same picture
 * can be seen "through" different perspectives.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function paintTown(canvas: HTMLCanvasElement, seed = 2024) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const r = rng(seed);
  const u = H / 1000; // unit scale

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#07080b");
  sky.addColorStop(0.55, "#121722");
  sky.addColorStop(0.72, "#2a2c31");
  sky.addColorStop(1, "#08090d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (sparse)
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(243,240,234,${0.15 + r() * 0.5})`;
    const s = r() * 1.4 * u + 0.4;
    ctx.fillRect(r() * W, r() * H * 0.45, s, s);
  }

  // Horizon glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.66, 0, W * 0.5, H * 0.66, W * 0.6);
  glow.addColorStop(0, "rgba(217,212,202,0.22)");
  glow.addColorStop(1, "rgba(217,212,202,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Distant hills
  const hill = (base: number, amp: number, color: string, freq: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = base + Math.sin(x * freq + seed) * amp + Math.sin(x * freq * 2.7 + seed * 2) * amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.fill();
  };
  hill(H * 0.6, 22 * u, "#15171d", 0.0021);
  hill(H * 0.645, 14 * u, "#101217", 0.0037);

  // Water tower
  const tx = W * (0.18 + r() * 0.1);
  ctx.fillStyle = "#0b0c10";
  ctx.fillRect(tx - 3 * u, H * 0.5, 6 * u, H * 0.18);
  ctx.fillRect(tx - 34 * u, H * 0.55, 4 * u, H * 0.13);
  ctx.fillRect(tx + 30 * u, H * 0.55, 4 * u, H * 0.13);
  ctx.beginPath();
  ctx.ellipse(tx, H * 0.5, 46 * u, 30 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steeple
  const sx = W * (0.7 + r() * 0.08);
  ctx.fillRect(sx - 22 * u, H * 0.55, 44 * u, H * 0.15);
  ctx.beginPath();
  ctx.moveTo(sx - 26 * u, H * 0.55);
  ctx.lineTo(sx, H * 0.41);
  ctx.lineTo(sx + 26 * u, H * 0.55);
  ctx.fill();
  ctx.fillStyle = "rgba(255,226,168,0.55)";
  ctx.fillRect(sx - 4 * u, H * 0.58, 8 * u, 18 * u);

  // Rows of houses
  const rows = [
    { y: H * 0.69, scale: 0.55, dark: "#0d0e12" },
    { y: H * 0.76, scale: 0.8, dark: "#0a0b0e" },
    { y: H * 0.86, scale: 1.15, dark: "#07080a" },
  ];
  for (const row of rows) {
    let x = -40 * u;
    while (x < W + 40 * u) {
      const w = (90 + r() * 120) * u * row.scale;
      const h = (70 + r() * 70) * u * row.scale;
      const roof = (30 + r() * 30) * u * row.scale;
      ctx.fillStyle = row.dark;
      ctx.fillRect(x, row.y - h, w, h + H);
      ctx.beginPath();
      ctx.moveTo(x - 6 * u * row.scale, row.y - h);
      ctx.lineTo(x + w / 2, row.y - h - roof);
      ctx.lineTo(x + w + 6 * u * row.scale, row.y - h);
      ctx.fill();
      // windows
      const cols = Math.max(1, Math.floor(w / (34 * u * row.scale)));
      const floors = Math.max(1, Math.floor(h / (40 * u * row.scale)));
      for (let c = 0; c < cols; c++) {
        for (let f = 0; f < floors; f++) {
          if (r() > 0.55) {
            const ww = 13 * u * row.scale;
            const wh = 17 * u * row.scale;
            const wx = x + (w / cols) * (c + 0.5) - ww / 2;
            const wy = row.y - h + (h / floors) * (f + 0.5) - wh / 2;
            const warm = r();
            ctx.fillStyle =
              warm > 0.82 ? `rgba(160,190,215,${0.5 + r() * 0.4})` : `rgba(255,${200 + Math.floor(r() * 30)},140,${0.45 + r() * 0.5})`;
            ctx.fillRect(wx, wy, ww, wh);
            // soft spill
            const g = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, 40 * u * row.scale);
            g.addColorStop(0, "rgba(255,214,150,0.08)");
            g.addColorStop(1, "rgba(255,214,150,0)");
            ctx.fillStyle = g;
            ctx.fillRect(wx - 40 * u, wy - 40 * u, ww + 80 * u, wh + 80 * u);
          }
        }
      }
      // porch light
      if (r() > 0.6) {
        const px = x + w * (0.2 + r() * 0.6);
        const g = ctx.createRadialGradient(px, row.y - 10 * u, 0, px, row.y - 10 * u, 60 * u * row.scale);
        g.addColorStop(0, "rgba(255,220,160,0.35)");
        g.addColorStop(1, "rgba(255,220,160,0)");
        ctx.fillStyle = g;
        ctx.fillRect(px - 70 * u, row.y - 80 * u, 140 * u, 140 * u);
      }
      x += w + (8 + r() * 40) * u * row.scale;
    }
  }

  // Street
  ctx.fillStyle = "#050608";
  ctx.fillRect(0, H * 0.88, W, H * 0.12);

  // Streetlights + power line
  ctx.strokeStyle = "rgba(8,9,13,0.95)";
  ctx.lineWidth = 2 * u;
  const poles: number[] = [];
  for (let px = W * 0.06; px < W; px += W * (0.16 + r() * 0.06)) poles.push(px);
  for (const px of poles) {
    ctx.fillStyle = "#040507";
    ctx.fillRect(px - 3 * u, H * 0.56, 6 * u, H * 0.34);
    ctx.fillRect(px - 26 * u, H * 0.58, 52 * u, 3 * u);
    const g = ctx.createRadialGradient(px + 18 * u, H * 0.6, 0, px + 18 * u, H * 0.6, 160 * u);
    g.addColorStop(0, "rgba(255,215,150,0.32)");
    g.addColorStop(0.3, "rgba(255,215,150,0.08)");
    g.addColorStop(1, "rgba(255,215,150,0)");
    ctx.fillStyle = g;
    ctx.fillRect(px - 160 * u, H * 0.45, 340 * u, H * 0.5);
  }
  ctx.beginPath();
  for (let i = 0; i < poles.length - 1; i++) {
    const a = poles[i];
    const b = poles[i + 1];
    ctx.moveTo(a - 24 * u, H * 0.585);
    ctx.quadraticCurveTo((a + b) / 2, H * 0.62, b - 24 * u, H * 0.585);
    ctx.moveTo(a + 24 * u, H * 0.585);
    ctx.quadraticCurveTo((a + b) / 2, H * 0.625, b + 24 * u, H * 0.585);
  }
  ctx.stroke();

  // Film-ish noise
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

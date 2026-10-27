"use client";

import { useEffect, useRef } from "react";

type Glow = { x: number; y: number; r: number };
type Rect = { left: number; right: number; top: number; bottom: number };
export type Boundary =
  /** Desktop: a wavy S through anchor points [t, x], t a fraction of the height, x in pixels. */
  | {
      axis: "x";
      points: [number, number][];
      softTop: number;
      softBottom: number;
      /** Where the card row starts, as a fraction of the height. */
      rowTop: number;
      glow: Glow | null;
      avoid: Rect[];
      margin: number;
    }
  /** Phone: the seam runs across at height y. */
  | { axis: "y"; at: number; glow: Glow | null; avoid: Rect[] };

const PAPER = [246, 246, 243];
const NIGHT = [10, 10, 10];
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/* A smooth curve through the anchors: cubic Hermite with central-difference slopes, upright at both ends. */
function curveAt(points: [number, number][], t: number) {
  const n = points.length;
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[n - 1][0]) return points[n - 1][1];
  const slope = (i: number) =>
    i === 0 || i === n - 1 ? 0 : (points[i + 1][1] - points[i - 1][1]) / (points[i + 1][0] - points[i - 1][0]);
  let i = 0;
  while (t > points[i + 1][0]) i++;
  const [t0, x0] = points[i];
  const [t1, x1] = points[i + 1];
  const h = t1 - t0;
  const u = (t - t0) / h;
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * x0 + (u3 - 2 * u2 + u) * h * slope(i) + (-2 * u3 + 3 * u2) * x1 + (u3 - u2) * h * slope(i + 1);
}
const mix = (d: number) => PAPER.map((p, i) => Math.round(p + (NIGHT[i] - p) * d));

// A small value noise, so pixels gather in clusters instead of spreading evenly.
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
};

/* The split behind the hero: paper on one side, night on the other. Where they meet the edge dissolves into
   pixels, clustered and in mixed greys, and a fine dust gathers around the drawing on the dark side. The seam
   is measured from the layout, so copy never sits on its grey at any width. */
export function SplitField({ boundary, paused }: { boundary: () => Boundary | null; paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const kick = useRef<() => void>(() => {});
  useEffect(() => {
    pausedRef.current = paused;
    kick.current();
  }, [paused]);

  useEffect(() => {
    const element = canvas.current;
    const host = element?.parentElement;
    if (!element || !host) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    const base = document.createElement("canvas");
    const baseCtx = base.getContext("2d");
    if (!baseCtx) return;
    let width = 0;
    let height = 0;
    let edge: Boundary | null = null;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let visible = true;
    const pointer = { x: -999, y: -999 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    type Pixel = { x: number; y: number; size: number; tone: string; alpha: number; phase: number };
    type Mote = { x: number; y: number; size: number; alpha: number; phase: number; speed: number };
    let pixels: Pixel[] = [];
    let dust: Mote[] = [];

    const seamAt = (y: number) => {
      if (!edge || edge.axis !== "x") return { at: 0, soft: 1 };
      const t = clamp01(y / height);
      return { at: curveAt(edge.points, t), soft: edge.softTop + (edge.softBottom - edge.softTop) * t };
    };
    const darkness = (x: number, y: number, spread = 1) => {
      if (!edge) return 0;
      if (edge.axis === "y") {
        const at = edge.at + Math.sin((x / width) * 3.4) * 22;
        const soft = Math.max(60, height * 0.04) * spread;
        return smooth((y - at + soft) / (soft * 2));
      }
      const { at, soft } = seamAt(y);
      return smooth((x - at + soft * spread) / (soft * spread * 2));
    };

    const paint = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      base.width = element.width = Math.round(width * dpr);
      base.height = element.height = Math.round(height * dpr);
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The ground, a band at a time, so the seam can bend.
      const row = 4;
      for (let y = 0; y < height; y += row) {
        const mid = y + row / 2;
        if (edge?.axis === "y") {
          const c = mix(darkness(width / 2, mid));
          baseCtx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        } else {
          const { at, soft } = seamAt(mid);
          const gradient = baseCtx.createLinearGradient(0, 0, width, 0);
          const from = Math.max(0, at - soft * 1.3);
          const to = Math.min(width, at + soft * 1.3);
          gradient.addColorStop(0, `rgb(${PAPER.join(",")})`);
          for (let s = 0; s <= 14; s++) {
            const x = from + ((to - from) * s) / 14;
            const c = mix(darkness(x, mid));
            gradient.addColorStop(clamp01(x / width), `rgb(${c[0]},${c[1]},${c[2]})`);
          }
          gradient.addColorStop(1, `rgb(${NIGHT.join(",")})`);
          baseCtx.fillStyle = gradient;
        }
        baseCtx.fillRect(0, y, width, row + 0.5);
      }
      // A faint light behind the drawing.
      const glow = edge?.glow;
      if (glow) {
        const light = baseCtx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.r * 1.1);
        light.addColorStop(0, "rgba(255,255,255,0.075)");
        light.addColorStop(0.55, "rgba(255,255,255,0.025)");
        light.addColorStop(1, "rgba(255,255,255,0)");
        baseCtx.fillStyle = light;
        baseCtx.fillRect(glow.x - glow.r * 1.2, glow.y - glow.r * 1.2, glow.r * 2.4, glow.r * 2.4);
      }

      let seed = 917;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      pixels = [];
      const phone = edge?.axis === "y";
      const blocked = (x: number, y: number, size: number, pad = 8) =>
        (edge?.avoid ?? []).some((r) => x + size > r.left - pad && x < r.right + pad && y + size > r.top - pad && y < r.bottom + pad) ||
        (glow ? Math.hypot(x - glow.x, y - glow.y) < glow.r * 0.55 : false);
      const grid = phone ? 13 : 16;
      for (let x = 0; x < width; x += grid)
        for (let y = 0; y < height; y += grid) {
          const d = darkness(x + grid / 2, y + grid / 2);
          const wide = darkness(x + grid / 2, y + grid / 2, edge?.axis === "y" ? 1.5 : 2.4);
          const t = y / height;
          // The dissolve gathers where the seam sweeps out, as on the reference, and thins toward the top.
          const along = phone ? 1 : 0.16 + 1.25 * Math.exp(-Math.pow((t - 0.6) / 0.17, 2));
          const cluster = noise(x / 86, y / 86);
          const seam = Math.pow(4 * d * (1 - d), 0.8) * 0.85 + 4 * wide * (1 - wide) * 0.22;
          // A drift in the left margin, as on the reference. It stops short of the copy.
          const margin = edge?.axis === "x" ? edge.margin : 0;
          const corner = phone || x + grid > margin ? 0 : Math.max(0, 1 - x / margin) * Math.max(0, 1 - y / (height * 0.62)) * 0.7;
          // Fewer under the header and in the card row, so the text over the seam stays legible.
          const header = y < 84 || (edge?.axis === "x" && t > edge.rowTop) ? 0.25 : 1;
          const chance = seam * along * (0.2 + cluster * 1.0) * header + corner * (0.3 + cluster);
          if (random() > chance) continue;
          const dark = d > 0.5;
          const big = random();
          const size = Math.max(3, Math.round(grid * (0.25 + 0.5 * Math.pow(big, 1.1 + (1 - cluster) * 0.6))));
          if (blocked(x, y, size)) continue;
          // Light squares break up the night side, mid greys the paper side, as on the reference.
          const level = dark ? 0.55 + random() * 0.45 : corner > seam ? 0.6 + random() * 0.3 : 0.25 + random() * 0.5;
          const v = Math.round(10 + level * 236);
          pixels.push({ x, y, size, tone: `${v},${v},${Math.max(0, v - 3)}`, alpha: 0.28 + random() * 0.62, phase: random() * Math.PI * 2 });
        }

      // Dust on the night side, thickest around the drawing.
      dust = [];
      if (glow) {
        for (let i = 0; i < (phone ? 90 : 170); i++) {
          const near = random() < 0.68;
          const angle = random() * Math.PI * 2;
          const reach = near ? glow.r * Math.sqrt(random()) * 1.05 : 0;
          const x = near ? glow.x + Math.cos(angle) * reach : random() * width;
          const y = near ? glow.y + Math.sin(angle) * reach * 0.86 : random() * height;
          if (darkness(x, y) < 0.9 || blocked(x, y, 2, 4)) continue;
          dust.push({ x, y, size: random() < 0.12 ? 2 : random() < 0.5 ? 1.4 : 1, alpha: 0.15 + random() * 0.45, phase: random() * Math.PI * 2, speed: 0.4 + random() * 1.2 });
        }
      }
      draw(0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(base, 0, 0, width, height);
      const still = reduce.matches || pausedRef.current;
      for (const p of pixels) {
        const twinkle = still ? 0.85 : 0.72 + Math.sin(time * 0.55 + p.phase) * 0.28;
        let { x, y } = p;
        if (!still) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 150) {
            const push = (1 - distance / 150) * 16;
            x += (dx / (distance || 1)) * push;
            y += (dy / (distance || 1)) * push;
          }
        }
        ctx.fillStyle = `rgba(${p.tone},${(p.alpha * twinkle).toFixed(3)})`;
        ctx.fillRect(x, y, p.size, p.size);
      }
      for (const m of dust) {
        const twinkle = still ? 0.8 : 0.45 + Math.sin(time * m.speed + m.phase) * 0.55;
        if (twinkle <= 0.02) continue;
        ctx.fillStyle = `rgba(250,250,246,${(m.alpha * twinkle).toFixed(3)})`;
        ctx.fillRect(m.x, m.y, m.size, m.size);
      }
    };

    const tick = (time: number) => {
      raf = 0;
      if (!visible || document.hidden || pausedRef.current || reduce.matches) return;
      if (time - last > 40) {
        clock += Math.min(time - last, 80) / 1000;
        last = time;
        draw(clock);
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && visible && !document.hidden && !pausedRef.current && !reduce.matches) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
      if (pausedRef.current || reduce.matches) draw(clock);
    };
    kick.current = start;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      edge = boundary();
      paint();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    seen.observe(host);
    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const leave = () => {
      pointer.x = -999;
      pointer.y = -999;
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", start);
    reduce.addEventListener("change", start);
    resize();
    start();
    // Text widths change once the web font arrives, and the seam is measured from them.
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) resize();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      seen.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", start);
      reduce.removeEventListener("change", start);
      kick.current = () => {};
    };
  }, [boundary]);

  return <canvas ref={canvas} className="split-field" aria-hidden="true" />;
}

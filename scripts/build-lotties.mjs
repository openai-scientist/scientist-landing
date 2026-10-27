import { mkdirSync, writeFileSync } from "node:fs";

/* Four line-art Lottie animations for the workflow cards, authored here so their licence is the project's own.
   Strokes are plain black; the page recolours them with currentColor, so one file serves light and dark cards.
   Each loops seamlessly: every keyframed value returns to its first value on the last frame. */

const FR = 30;
const OP = 240;
const SIZE = 400;

const round = (n) => Math.round(n * 100) / 100;
const shape = (points, closed = true) => ({
  ty: "sh",
  ks: { a: 0, k: { c: closed, v: points.map(([x, y]) => [round(x), round(y)]), i: points.map(() => [0, 0]), o: points.map(() => [0, 0]) } },
});
const smooth = (points, closed = true) => {
  // Catmull-Rom to Bezier tangents, so sampled curves render as one smooth stroke.
  const n = points.length;
  const at = (i) => points[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const i = [];
  const o = [];
  for (let p = 0; p < n; p++) {
    const prev = at(p - 1);
    const next = at(p + 1);
    const t = [(next[0] - prev[0]) / 6, (next[1] - prev[1]) / 6];
    i.push([round(-t[0]), round(-t[1])]);
    o.push([round(t[0]), round(t[1])]);
  }
  return { ty: "sh", ks: { a: 0, k: { c: closed, v: points.map(([x, y]) => [round(x), round(y)]), i, o } } };
};
const stroke = (width = 1, opacity = 100) => ({ ty: "st", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: opacity }, w: { a: 0, k: width }, lc: 2, lj: 2 });
const loop = (values, ease = true) => ({
  a: 1,
  k: values.map(([t, v], index) => ({
    t,
    s: Array.isArray(v) ? v : [v],
    ...(index < values.length - 1 ? { i: { x: [ease ? 0.45 : 1], y: [ease ? 1 : 1] }, o: { x: [ease ? 0.55 : 0], y: [ease ? 0 : 0] } } : {}),
  })),
});
const tr = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: "tr",
  p: Array.isArray(p) ? { a: 0, k: p } : p,
  a: { a: 0, k: a },
  s: Array.isArray(s) ? { a: 0, k: s } : s,
  r: typeof r === "number" ? { a: 0, k: r } : r,
  o: typeof o === "number" ? { a: 0, k: o } : o,
  sk: { a: 0, k: 0 },
  sa: { a: 0, k: 0 },
});
const group = (items, transform = {}) => ({ ty: "gr", it: [...items, tr(transform)] });
const trim = (start, end, offset = { a: 0, k: 0 }) => ({ ty: "tm", s: start, e: end, o: offset, m: 1 });
const layer = (name, shapes, index) => ({
  ddd: 0,
  ind: index,
  ty: 4,
  nm: name,
  sr: 1,
  ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [SIZE / 2, SIZE / 2, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
  ao: 0,
  shapes,
  ip: 0,
  op: OP,
  st: 0,
  bm: 0,
});
const animation = (name, layers) => ({ v: "5.7.4", fr: FR, ip: 0, op: OP, w: SIZE, h: SIZE, nm: name, ddd: 0, assets: [], layers: layers.map((l, i) => ({ ...l, ind: i + 1 })) });

// Understand: a loose question tightens. Contour rings breathe in toward one focus and out again.
function understand() {
  const rings = [];
  for (let n = 0; n < 22; n++) {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const r = 34 + n * 6.2;
      const wobble = 1 + 0.2 * Math.cos(3 * t + n * 0.16) + 0.05 * Math.sin(5 * t - n * 0.2);
      pts.push([Math.cos(t) * r * wobble, Math.sin(t) * r * wobble * 0.82]);
    }
    const phase = n * 4;
    rings.push(
      group([smooth(pts), stroke(0.9, 30 + n * 3)], {
        s: loop([
          [0, [100, 100]],
          [60 + phase / 2, [88 - n * 0.4, 88 - n * 0.4]],
          [150 + phase / 2, [100, 100]],
          [OP, [100, 100]],
        ]),
        r: loop([
          [0, 0],
          [120, n % 2 ? 8 : -8],
          [OP, 0],
        ]),
      }),
    );
  }
  const focus = group([{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [6, 6] } }, { ty: "fl", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 } }], {
    o: loop([
      [0, 30],
      [80, 100],
      [160, 30],
      [OP, 30],
    ]),
  });
  return animation("understand", [layer("focus", [focus], 1), layer("rings", rings, 2)]);
}

// Explore: sheets of literature stacked in depth. Their surfaces ripple, and a reading pass draws across one sheet
// after another.
function explore() {
  const sheets = [];
  const corner = (u, v, lift) => [-140 + u * 150 + v * 110, 20 - u * 75 + v * 55 - lift];
  for (let n = 0; n < 6; n++) {
    const items = [];
    const lift = n * 26 - 60;
    items.push(shape([corner(0, 0, lift), corner(1, 0, lift), corner(1, 1, lift), corner(0, 1, lift)]));
    const rows = [];
    for (let row = 1; row < 10; row++) {
      const v = row / 10;
      const wave = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        const [x, y] = corner(u, v, lift);
        wave.push([x, y - Math.sin(u * Math.PI * 2.2 + v * 3 + n * 0.9) * (6 + n)]);
      }
      rows.push(smooth(wave, false));
    }
    const delay = 20 + n * 26;
    sheets.push(group([...items, stroke(0.8, 26 + n * 8)]));
    sheets.push(
      group([...rows, stroke(0.8, 40 + n * 10), trim({ a: 0, k: 0 }, loop([[0, 0], [delay, 0], [delay + 40, 100], [200, 100], [225, 0], [OP, 0]]))], {
        p: loop([
          [0, [0, 0]],
          [delay + 20, [0, -5]],
          [delay + 80, [0, 0]],
          [OP, [0, 0]],
        ]),
      }),
    );
  }
  return animation("explore", [layer("sheets", sheets.reverse(), 1)]);
}

// Reason: two competing orbits around one claim, they tilt and settle into agreement.
function reason() {
  const orbits = [];
  for (let n = 0; n < 16; n++) {
    const rx = 150 - n * 3;
    const ry = 40 + n * 1.5;
    orbits.push(
      group([{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [rx * 2, ry * 2] } }, stroke(0.8, 25 + n * 4)], {
        r: loop([
          [0, -28 + n * 1.5],
          [120, 28 - n * 1.5],
          [OP, -28 + n * 1.5],
        ]),
      }),
    );
  }
  const sphere = [];
  for (let n = 0; n < 9; n++) {
    const ry = 70 - n * 0;
    sphere.push(
      group([{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [140, ry * 2] } }, stroke(0.8, 60)], {
        s: loop([
          [0, [Math.cos((n / 9) * Math.PI) * 100, 100]],
          [120, [Math.cos((n / 9) * Math.PI + Math.PI) * 100, 100]],
          [OP, [Math.cos((n / 9) * Math.PI) * 100, 100]],
        ]),
      }),
    );
  }
  for (let n = 1; n < 6; n++) {
    const y = -70 + (140 * n) / 6;
    const w = Math.sqrt(70 * 70 - y * y) * 2;
    sphere.push(group([{ ty: "el", p: { a: 0, k: [0, y] }, s: { a: 0, k: [w, w * 0.22] } }, stroke(0.7, 45)]));
  }
  return animation("reason", [layer("sphere", sphere, 1), layer("orbits", orbits, 2)]);
}

// Plan: layered plates lift apart into a stack, each carrying the contour of the one below.
function plan() {
  const plates = [];
  for (let n = 0; n < 5; n++) {
    const items = [];
    const plate = [
      [-110, 0],
      [0, -55],
      [110, 0],
      [0, 55],
    ];
    items.push(shape(plate));
    for (let c = 0; c < 3; c++) {
      const pts = [];
      for (let i = 0; i < 40; i++) {
        const t = (i / 40) * Math.PI * 2;
        const r = 16 + c * 15;
        const w = 1 + 0.25 * Math.cos(3 * t + n * 0.6);
        pts.push([Math.cos(t) * r * w * 1.5, Math.sin(t) * r * w * 0.75]);
      }
      items.push(smooth(pts));
    }
    const rest = 50 - n * 22;
    const open = 80 - n * 40;
    plates.push(
      group([...items, stroke(0.9, 30 + n * 12)], {
        p: loop([
          [0, [0, rest]],
          [70 + n * 6, [0, open]],
          [170 + n * 6, [0, open]],
          [OP, [0, rest]],
        ]),
      }),
    );
  }
  return animation("plan", [layer("plates", plates.reverse(), 1)]);
}

mkdirSync("public/animations", { recursive: true });
for (const anim of [understand(), explore(), reason(), plan()]) writeFileSync(`public/animations/${anim.nm}.json`, JSON.stringify(anim));
console.log("Lottie: understand, explore, reason, plan");

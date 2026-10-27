import { mkdirSync, writeFileSync } from "node:fs";
import * as k from "./vendor/iso-kit.mjs";

/* Two Anatomy figures, built once. The browser only moves groups and toggles lit parts.

   Fig 1, the research line: a run is a carriage holding the research case. It rides a rail past one bench
   instrument per engine. Each engine has two heads on its arm (the stage model drafts, a different review model
   checks), a row of step lamps and a row of loop pips (bounded send-backs). Between engines stands a gate: the
   stage is accepted there, by your lever in light mode or by the PI in auto mode, under the Critic's loupe.
   Open findings clip onto the carriage as tags (obligations). A dial gauge reads the token budget, and the
   closing report lands in the tray at the end.

   Fig 2, the dispatch rack: the system. A browser terminal talks only to the Platform cabinet; the Platform
   drives three engine bays and the oversight bay over HTTP, and the bays answer back through callbacks. */

const parts = { count: 0 };
const S = (paths, style = {}) => {
  parts.count++;
  return k.solidSvg(paths, style);
};
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const G = (children, attrs) => k.groupSvg(children, attrs);

/* ---------------------------------------------------------------- Fig 1 */

const W1 = 1040;
const H1 = 500;
const BENCH = { x: -316, y: -100, w: 652, d: 186, r: 9 };
const BENCH_H = 12;
const FOOT_H = 6;
const RAIL = [-284, 254];
const RAILS_Y = [-17, 12];
const CAR = { x: -24, y: -22, w: 48, d: 44, r: 3 };
const CAR_Z = 4;
const CAR_TOP = 10;
const CARD_TOP = 11.6;
const GATE_TOP = 60;
const GATES = [-100, 44, 170];
const STATIONS = [
  { id: "dataset", plan: { x: -192, y: -92, w: 82, d: 56, r: 3 }, h: 36, lamps: 6, pips: 2 },
  { id: "hypothesis", plan: { x: -82, y: -94, w: 118, d: 58, r: 3 }, h: 48, lamps: 9, pips: 2 },
  { id: "design", plan: { x: 62, y: -94, w: 94, d: 58, r: 3 }, h: 42, lamps: 6, pips: 2 },
];
const INTAKE = { x: -300, y: -88, w: 62, d: 50, r: 3 };
const TRAY = { x: 266, y: -34, w: 54, d: 64, r: 3 };
const DIAL = [262, 56];
const DIAL_R = 19;
const DIAL_Z = 12;
const DIAL_TOP = DIAL_Z + 7;
const STOPS = { intake: -252, dataset: -151, hypothesis: -23, design: 109, close: 230 };

const P1 = k.fitProjection(
  [
    ...k.boxCorners(BENCH, -BENCH_H - FOOT_H, 0),
    ...GATES.flatMap((gx) => [
      [gx, -38, GATE_TOP + 6],
      [gx, 34, GATE_TOP + 6],
    ]),
    ...STATIONS.flatMap((st) => [
      [st.plan.x, st.plan.y, st.h + 6],
      [st.plan.x + st.plan.w, st.plan.y, st.h + 6],
    ]),
    [INTAKE.x, INTAKE.y, 34],
  ],
  W1,
  H1,
  { pad: 14, azimuth: 58, elevation: 32 },
);
const at1 = (point) => k.iso(point, P1);
const byDepth1 = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P1) - k.depthOf([b[0], b[1], 0], P1));

function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BENCH, -BENCH_H - FOOT_H, BENCH_H, P1)}"/>`];
  for (const [x, y] of byDepth1(k.corners(BENCH, 26))) {
    out.push(S(k.cylinder(x, y, 9, -BENCH_H - FOOT_H, 2, P1, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -BENCH_H - FOOT_H + 2, FOOT_H - 2, P1, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BENCH, -BENCH_H, BENCH_H, P1, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(BENCH, -5, P1, 8), { tone: "lo" }) }));
  out.push(L(k.planOutline(k.insetPlan(BENCH, 6), 0, P1), { tone: "lo" }));
  const screws = k.corners(BENCH, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P1, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at1([x, y, 0])), { size: 0.55 }));
  // A ruler along the front edge: the run's distance travelled, a tick every 4 units.
  const strip = { x: -214, y: BENCH.y + BENCH.d - 20, w: 420, d: 8, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P1, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2.2, 4], P1);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at1([strip.x + 2, strip.y + 4, 0.6]), at1([strip.x + strip.w - 2, strip.y + 4, 0.6])], { size: 0.45 }));
  // The mode plate: a two-position switch, LIGHT toward the back, AUTO toward the front.
  const plate = { x: -296, y: 30, w: 64, d: 34, r: 2 };
  out.push(S(k.slabOf(plate, 0, 1.4, P1, 3, 0.4), { tone: "mid" }));
  out.push(D(k.corners(plate, 3.5).map(([x, y]) => at1([x, y, 1.4])), { size: 0.45, tone: "mid" }));
  for (let row = 0; row < 3; row++)
    out.push(L(k.lineOnTop([plate.x + 8, plate.y + 8 + row * 5], [plate.x + 30 - row * 6, plate.y + 8 + row * 5], 1.4, P1), { tone: "lo", free: true }));
  const slot = { x: plate.x + 44, y: plate.y + 7, w: 8, d: 20, r: 3 };
  out.push(S(k.slabOf(slot, 1.4, 0.3, P1, 4), { tone: "lo", crease: "none" }));
  return out.join("");
}

function modeLever(auto) {
  const y = auto ? 55 : 41;
  return G(
    [
      S(k.cylinder(-248, y, 2.6, 1.7, 1.2, P1, 18), { tone: "mid" }),
      S(k.cylinder(-248, y, 1.1, 2.9, 9, P1, 14), { tone: "hi", crease: "none" }),
      S(k.cylinder(-248, y, 2.4, 11.9, 3, P1, 18), { tone: "hi" }),
      L(k.knurl(-248, y, 2.4, 11.9, 14.9, 14, P1), { tone: "lo" }),
    ],
    { "data-mode-lever": auto ? "auto" : "light", "data-term": "mode" },
  );
}

function intake() {
  const out = [];
  out.push(S(k.slabOf(INTAKE, 0, 26, P1, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(INTAKE, 9, P1, 4), { tone: "lo" }) }));
  const mouth = k.insetPlan(INTAKE, 7);
  out.push(S(k.slabOf(mouth, 26, 1, P1, 3), { tone: "lo", crease: "none" }));
  // A stack of blank case cards waiting in the hopper.
  for (let card = 0; card < 5; card++) {
    const plan = { x: mouth.x + 4 + card * 0.4, y: mouth.y + 4, w: 34, d: 28, r: 1.2 };
    out.push(S(k.slabOf(plan, 27 + card * 1.2, 1.2, P1, 3), { tone: card === 4 ? "hi" : "lo", crease: "none" }));
  }
  out.push(D(k.corners(INTAKE, 4).map(([x, y]) => at1([x, y, 26])), { size: 0.5, tone: "mid" }));
  // A push rod reaches from the hopper toward the rail head.
  out.push(S(k.slabOf({ x: INTAKE.x + 22, y: INTAKE.y + INTAKE.d, w: 10, d: 14, r: 1.5 }, 4, 6, P1, 3, 0.4), { tone: "mid" }));
  out.push(D([at1([INTAKE.x + 27, INTAKE.y + INTAKE.d + 7, 10])], { size: 0.5, tone: "mid" }));
  return G(out, { "data-term": "case" });
}

function station(st, index) {
  const { plan, h, lamps, pips, id } = st;
  const out = [];
  out.push(S(k.slabOf(plan, 0, h, P1, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(plan, 6, P1, 4), { tone: "lo" }) }));
  // A shallow top deck with vents along the back, then the lamp rail along the front.
  const deck = { x: plan.x + 5, y: plan.y + 5, w: plan.w - 10, d: plan.d - 22, r: 2 };
  out.push(S(k.slabOf(deck, h, 1.6, P1, 3, 0.4), { tone: "lo" }));
  const vents = Math.floor((deck.w - 16) / 7);
  for (let v = 0; v < vents; v++) {
    const vx = deck.x + 8 + v * 7;
    out.push(S(k.slabOf({ x: vx, y: deck.y + 5, w: 3, d: deck.d - 14, r: 1.4 }, h + 1.6, 0.2, P1, 3), { tone: "faint", crease: "none", flat: true }));
  }
  if (id === "hypothesis") {
    // Two literature drawers on the front face: the two indexes the search reads.
    const fy = plan.y + plan.d;
    for (let drawer = 0; drawer < 2; drawer++) {
      const x0 = plan.x + 8 + drawer * 30;
      const box = [
        [x0, fy, 12],
        [x0 + 26, fy, 12],
        [x0 + 26, fy, 34],
        [x0, fy, 34],
      ];
      out.push(L(k.pathOf(box.map(at1), true), { tone: "lo" }));
      out.push(L(k.segment([x0 + 8, fy, 28], [x0 + 18, fy, 28], P1), { tone: "mid" }));
    }
  }
  if (id === "design") {
    // A calculator keypad: statistics come from code, never from model text.
    const pad = { x: deck.x + deck.w - 34, y: deck.y + 3, w: 30, d: deck.d - 6, r: 1.5 };
    out.push(S(k.slabOf(pad, h + 1.6, 1.2, P1, 3, 0.3), { tone: "mid" }));
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++)
        out.push(S(k.slabOf({ x: pad.x + 3 + c * 6.6, y: pad.y + 3 + r * 7, w: 4.6, d: 4.6, r: 0.8 }, h + 2.8, 0.8, P1, 2), { tone: "lo", crease: "none" }));
  }
  if (id === "dataset") {
    // A data card feeding out of a printer slot.
    const slot = { x: deck.x + 10, y: deck.y + 4, w: 40, d: 6, r: 1 };
    out.push(S(k.slabOf(slot, h + 1.6, 3, P1, 3, 0.3), { tone: "mid" }));
    out.push(S(k.slabOf({ x: slot.x + 4, y: slot.y - 12, w: 32, d: 13, r: 0.6 }, h + 4.6, 0.6, P1, 2), { tone: "hi", crease: "none" }));
    for (let row = 0; row < 3; row++)
      out.push(L(k.lineOnTop([slot.x + 8, slot.y - 9 + row * 3.2], [slot.x + 30 - row * 5, slot.y - 9 + row * 3.2], h + 5.2, P1), { tone: "lo", free: true }));
  }
  const screws = k.corners(plan, 3.5).map(([x, y]) => at1([x, y, h]));
  out.push(D(screws, { size: 0.5, tone: "mid" }));
  const base = G(out, { "data-term": `${id} engine` });

  const lampsOut = [];
  const lampY = plan.y + plan.d - 9;
  const span = plan.w - 24 - pips * 8;
  for (let lamp = 0; lamp < lamps; lamp++) {
    const lx = plan.x + 12 + (span * (lamp + 0.5)) / lamps;
    lampsOut.push(
      G(
        [S(k.cylinder(lx, lampY, 2.6, h, 1, P1, 18), { tone: "lo", crease: "none" }), S(k.cylinder(lx, lampY, 1.9, h + 1, 1.4, P1, 18), { tone: "mid" })],
        { "data-lamp": `${index}-${lamp}` },
      ),
    );
  }
  for (let pip = 0; pip < pips; pip++) {
    const px = plan.x + plan.w - 10 - pip * 7;
    lampsOut.push(
      G([S(k.slabOf({ x: px - 2.4, y: lampY - 2.4, w: 4.8, d: 4.8, r: 0.6 }, h, 1.6, P1, 2), { tone: "mid" })], { "data-pip": `${index}-${pip}`, "data-term": "loop" }),
    );
  }
  return { base, lamps: G(lampsOut, {}) };
}

// The arm stands between the instrument and the rail and reaches over it with two heads: the stage model and,
// a hand's width on, the review model. The post is drawn behind the carriage, the beam and heads in front.
const armX = (st) => st.plan.x + st.plan.w / 2;
function armPost(st) {
  const cx = armX(st);
  return G(
    [
      S(k.cylinder(cx, -29, 5, 0, 4, P1, 24, 0.4), { tone: "lo" }),
      S(k.cylinder(cx, -29, 3, 4, 47, P1, 22), { tone: "mid", crease: "none" }),
      L(k.sideArc(cx, -29, 3, 20, P1, 14) + k.sideArc(cx, -29, 3, 36, P1, 14), { tone: "lo" }),
    ],
    { "data-term": `${st.id} engine` },
  );
}
function arm(st) {
  const { id } = st;
  const cx = armX(st);
  const out = [];
  const beam = { x: cx - 16, y: -34, w: 32, d: 40, r: 2 };
  out.push(S(k.slabOf(beam, 51, 5, P1, 3, 0.5), { tone: "mid" }));
  out.push(D([at1([cx, -29, 56]), at1([beam.x + 4, 2, 56]), at1([beam.x + beam.w - 4, 2, 56])], { size: 0.45, tone: "mid" }));
  const heads = [];
  for (const [n, hx] of [
    [0, cx - 8],
    [1, cx + 8],
  ]) {
    heads.push(
      G(
        [
          S(k.cylinder(hx, 0, 4.2, 41, 10, P1, 24, 0.4), { tone: "mid" }),
          L(k.knurl(hx, 0, 4.2, 46, 51, 18, P1), { tone: "lo" }),
          S(k.cylinder(hx, 0, 2.2, 24, 17, P1, 18), { tone: "hi", crease: "none" }),
          S(k.cylinder(hx, 0, 3, 21, 3, P1, 18), { tone: "hi" }),
        ],
        { "data-head": `${id}-${n ? "review" : "stage"}`, "data-term": n ? "review" : "stage" },
      ),
    );
  }
  return G([...out, ...heads], { "data-term": `${id} engine` });
}

function gateBack(gx) {
  return G([S(k.slabOf({ x: gx - 3, y: -38, w: 6, d: 6, r: 1.2 }, 0, GATE_TOP, P1, 3, 0.5), { tone: "mid" })], { "data-term": "gate" });
}
function gatePlate(gx, index) {
  const plate = { x: gx - 1.6, y: -20, w: 3.2, d: 40, r: 0.6 };
  const out = [S(k.slabOf(plate, CAR_TOP + 22 - 26 - 2, 28, P1, 2, 0.3), { tone: "hi" })];
  for (let row = 0; row < 3; row++)
    out.push(L(k.segment([gx + 1.6, -14 + row * 14, 8], [gx + 1.6, -14 + row * 14, 30], P1), { tone: "lo" }));
  return G(out, { "data-gate": String(index), "data-term": "gate" });
}
function gateFront(gx, index) {
  const out = [];
  out.push(S(k.slabOf({ x: gx - 3, y: -38, w: 6, d: 72, r: 1.2 }, GATE_TOP, 5, P1, 3, 0.5), { tone: "mid" }));
  out.push(D([at1([gx, -35, GATE_TOP + 5]), at1([gx, 31, GATE_TOP + 5])], { size: 0.5, tone: "mid" }));
  // The Critic's loupe hangs from the crossbar, looking down at the case.
  const loupe = [
    S(k.cylinder(gx, 0, 5.6, GATE_TOP - 6, 6, P1, 32, 0.5), { tone: "mid" }),
    L(k.ring(gx, 0, 3.8, GATE_TOP, P1, 28), { tone: "lo" }),
  ];
  out.push(G(loupe, { "data-loupe": String(index), "data-term": "critic" }));
  out.push(S(k.slabOf({ x: gx - 3, y: 28, w: 6, d: 6, r: 1.2 }, 0, GATE_TOP, P1, 3, 0.5), { tone: "mid" }));
  // The lever on the front post: your hand on the gate in light mode.
  const lever = [
    S(k.slabOf({ x: gx - 2, y: 34, w: 4, d: 4, r: 0.8 }, 30, 4, P1, 2), { tone: "mid", crease: "none" }),
    S(k.cylinder(gx, 41, 3.2, 28, 8, P1, 20), { tone: "hi" }),
    L(k.knurl(gx, 41, 3.2, 28, 36, 16, P1), { tone: "lo" }),
  ];
  out.push(G(lever, { "data-lever": String(index), "data-term": "you" }));
  return G(out, { "data-term": "gate" });
}

function rails() {
  const out = [];
  for (const y of RAILS_Y) {
    out.push(S(k.slabOf({ x: RAIL[0], y, w: RAIL[1] - RAIL[0], d: 5, r: 1 }, 0, 3, P1, 3, 0.4), { tone: "mid" }));
    out.push(D([RAIL[0] + 6, -110, 30, RAIL[1] - 6].map((x) => at1([x, y + 2.5, 3])), { size: 0.4 }));
  }
  for (const x of [RAIL[0] - 6, RAIL[1]]) {
    out.push(S(k.slabOf({ x, y: -21, w: 6, d: 42, r: 1.2 }, 0, 8, P1, 3, 0.5), { tone: "mid" }));
    out.push(D([at1([x + 3, -17, 8]), at1([x + 3, 17, 8])], { size: 0.45 }));
  }
  return G(out, { "data-term": "pipeline" });
}

function carriage() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 3), CAR_Z, 0.1, P1)}" style="filter:blur(4px)"/>`];
  for (const [x, y] of byDepth1([
    [-15, -14.5],
    [15, -14.5],
    [-15, 14.5],
    [15, 14.5],
  ]))
    out.push(S(k.slabOf({ x: x - 5, y: y - 3.5, w: 10, d: 7, r: 1 }, 3, 1.4, P1, 2), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf(CAR, CAR_Z, CAR_TOP - CAR_Z, P1, 5, 0.6), { tone: "mid", inner: L(k.sideSeam(CAR, 7, P1, 5), { tone: "lo" }) }));
  out.push(D(k.corners(CAR, 3).map(([x, y]) => at1([x, y, CAR_TOP])), { size: 0.45, tone: "lo" }));
  // The research case itself: the one lit part, a card held by two clips.
  const card = { x: -18, y: -16, w: 32, d: 32, r: 1.2 };
  const cardOut = [S(k.slabOf(card, CAR_TOP, CARD_TOP - CAR_TOP, P1, 3, 0.3), { tone: "hi", lit: true, crease: "lo" })];
  for (let row = 0; row < 4; row++)
    cardOut.push(L(k.lineOnTop([card.x + 5, card.y + 7 + row * 5.5], [card.x + card.w - 6 - (row % 2) * 8, card.y + 7 + row * 5.5], CARD_TOP, P1), { tone: "mid", free: true }));
  cardOut.push(S(k.slabOf({ x: card.x + 4, y: card.y - 1, w: 7, d: 3, r: 0.6 }, CARD_TOP, 0.8, P1, 2), { tone: "mid" }));
  cardOut.push(S(k.slabOf({ x: card.x + card.w - 11, y: card.y - 1, w: 7, d: 3, r: 0.6 }, CARD_TOP, 0.8, P1, 2), { tone: "mid" }));
  out.push(G(cardOut, { "data-term": "case" }));
  // Three tag slots on the right edge: an obligation clips on when a stage is accepted with an open finding.
  for (let tag = 0; tag < 3; tag++) {
    const ty = -14 + tag * 10;
    out.push(S(k.slabOf({ x: 17, y: ty, w: 4, d: 5, r: 0.6 }, CAR_TOP, 0.6, P1, 2), { tone: "lo", crease: "none" }));
    out.push(
      G([S(k.slabOf({ x: 18, y: ty + 0.6, w: 2, d: 3.8, r: 0.4 }, CAR_TOP + 0.6, 8, P1, 2), { tone: "hi" })], {
        "data-tag": String(tag),
        "data-term": "obligation",
      }),
    );
  }
  const handle = [CAR.x + CAR.w - 10, CAR.y + CAR.d + 3];
  out.push(S(k.slabOf({ x: handle[0] - 2, y: CAR.y + CAR.d - 1, w: 4, d: 4, r: 1 }, CAR_Z + 1, 3, P1, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(handle[0], handle[1] + 1, 3, CAR_Z, 5, P1, 20), { tone: "mid" }));
  out.push(L(k.knurl(handle[0], handle[1] + 1, 3, CAR_Z, CAR_Z + 5, 18, P1), { tone: "lo" }));
  return out.join("");
}

function tray() {
  const out = [];
  out.push(S(k.slabOf(TRAY, 0, 3, P1, 4, 0.5), { tone: "mid" }));
  const walls = [
    { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: 3, r: 0.8 },
    { x: TRAY.x + TRAY.w - 3, y: TRAY.y, w: 3, d: TRAY.d, r: 0.8 },
  ];
  for (const wall of walls) out.push(S(k.slabOf(wall, 3, 7, P1, 2, 0.3), { tone: "mid" }));
  const sheets = [];
  for (let sheet = 0; sheet < 4; sheet++) {
    const plan = { x: TRAY.x + 8 - sheet * 0.6, y: TRAY.y + 10 + sheet * 0.5, w: 36, d: 44, r: 0.8 };
    const z = 3 + sheet * 1.1;
    const lines = sheet === 3 ? [0, 1, 2, 3, 4].map((row) => L(k.lineOnTop([plan.x + 6, plan.y + 8 + row * 6], [plan.x + plan.w - 7 - (row % 2) * 9, plan.y + 8 + row * 6], z + 1.1, P1), { tone: "mid", free: true })) : [];
    sheets.push(G([S(k.slabOf(plan, z, 1.1, P1, 2), { tone: sheet === 3 ? "hi" : "lo", crease: "none", lit: sheet === 3 }), ...lines], { "data-sheet": String(sheet) }));
  }
  out.push(G(sheets, { "data-term": "report" }));
  const wallFront = { x: TRAY.x, y: TRAY.y + TRAY.d - 3, w: TRAY.w, d: 3, r: 0.8 };
  out.push(S(k.slabOf(wallFront, 3, 4, P1, 2, 0.3), { tone: "mid" }));
  return G(out, { "data-term": "report" });
}

function dial() {
  const [x, y] = DIAL;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - DIAL_R, y: y - DIAL_R, w: DIAL_R * 2, d: DIAL_R * 2, r: DIAL_R }, 0, DIAL_Z, P1)}"/>`];
  out.push(S(k.cylinder(x, y, DIAL_R + 3, 0, 3, P1, 56), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 5, 3, DIAL_Z - 3, P1, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, P1, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 84, P1, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 2.4, DIAL_TOP, P1, 64), { tone: "lo" }));
  // Three quarters of a turn is the whole budget; the last tenth is marked.
  const span = Math.PI * 1.5;
  const from = -span / 2;
  const ticks = k.radialTicks(x, y, DIAL_R - 3.2, 30, 5, DIAL_TOP, [1.4, 3], P1, from, span);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const red = k.radialTicks(x, y, DIAL_R - 3.2, 3, 1, DIAL_TOP, [3, 3], P1, from + span * 0.9, span * 0.1);
  out.push(L(red.minor + red.major, { tone: "hi" }));
  out.push(L(k.ring(x, y, 1.8, DIAL_TOP, P1, 16), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 9], DIAL_TOP, P1, "x"), "TOKENS", { size: 2.6, tone: "lo", anchor: "middle" }));
  return G(out, { "data-term": "budget" });
}

const needle1 = { center: DIAL, r: DIAL_R - 4.5, z: DIAL_TOP + 0.2, from: -Math.PI * 0.75, span: Math.PI * 1.5 };

function figure1() {
  const st = STATIONS.map(station);
  const back = [bench(), intake(), ...STATIONS.map((s, i) => st[i].base + st[i].lamps), rails(), ...STATIONS.map(armPost), ...GATES.map(gateBack)];
  const svg = k.figureSvg({
    width: W1,
    height: H1,
    label:
      "The research line: a carriage holding the research case rides a rail past the dataset, hypothesis and experiment design instruments. Each instrument reaches over the rail with two heads, one for the stage model and one for a different review model. Gates between the instruments open when a stage is accepted, under the Critic's loupe. Tags clip onto the carriage for open findings, a dial reads the token budget and the closing report lands in a tray at the end.",
    body: [
      G(back.join(""), {}),
      modeLever(false),
      modeLever(true),
      `<g data-slot="passed"></g>`,
      `<g data-part="carriage" transform="${k.translateAlong(P1, [STOPS.intake, 0, 0])}">${carriage()}</g>`,
      `<g data-slot="ahead">${GATES.map(gatePlate).join("")}</g>`,
      ...STATIONS.map(arm),
      ...GATES.map(gateFront),
      tray(),
      dial(),
      `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="" style="stroke-width:1.2"/>`,
    ],
  });
  return {
    svg,
    P: P1,
    stops: STOPS,
    gates: GATES,
    carHalf: CAR.w / 2,
    lamps: STATIONS.map((s) => s.lamps),
    needle: needle1,
    lift: k.axisVector(P1, [0, 0, 1]),
    along: k.axisVector(P1, [1, 0, 0]),
  };
}

/* ---------------------------------------------------------------- Fig 2 */

const W2 = 900;
const H2 = 600;
const DESK = { x: -214, y: -146, w: 428, d: 282, r: 10 };
const CAB = { x: -52, y: -34, w: 86, d: 74, r: 4 };
const CAB_H = 68;
const TERM = { x: -170, y: 66, w: 78, d: 40, r: 4 };
const BAYS = [
  { id: "dataset", plan: { x: -200, y: -132, w: 80, d: 60, r: 3 } },
  { id: "hypothesis", plan: { x: -88, y: -134, w: 92, d: 62, r: 3 } },
  { id: "design", plan: { x: 36, y: -132, w: 80, d: 60, r: 3 } },
];
const OVERSIGHT = { x: 128, y: -32, w: 70, d: 96, r: 3 };
const BAY_H = 30;

const P2 = k.fitProjection([...k.boxCorners(DESK, -14, 0), [CAB.x, CAB.y, CAB_H + 40], [BAYS[1].plan.x, BAYS[1].plan.y, BAY_H + 50]], W2, H2, { pad: 22, azimuth: 40, elevation: 32 });
const at2 = (point) => k.iso(point, P2);
const JACK_Y = CAB.y + 14;
const jacks = { dataset: [CAB.x + 14, JACK_Y], hypothesis: [CAB.x + 32, JACK_Y], design: [CAB.x + 50, JACK_Y], oversight: [CAB.x + 68, JACK_Y] };
const bayJack = (plan) => [plan.x + plan.w - 12, plan.y + plan.d - 12];

function desk() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DESK, -14, 14, P2)}"/>`];
  out.push(S(k.slabOf(DESK, -14, 14, P2, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(DESK, -6, P2, 8), { tone: "lo" }) }));
  out.push(L(k.planOutline(k.insetPlan(DESK, 7), 0, P2), { tone: "lo" }));
  const screws = k.corners(DESK, 13);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P2, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at2([x, y, 0])), { size: 0.55 }));
  return out.join("");
}

function jack(x, y, z) {
  return [S(k.cylinder(x, y, 4.2, z, 2, P2, 24, 0.3), { tone: "mid" }), S(k.cylinder(x, y, 2.4, z + 2, 3, P2, 18), { tone: "hi" }), L(k.ring(x, y, 1, z + 5, P2, 12), { tone: "lo" })];
}

function cabinet() {
  const out = [];
  out.push(S(k.slabOf(CAB, 0, CAB_H, P2, 5, 1), { tone: "mid" }));
  // Six drawers on the front face: projects, data, runs, gates, budget, audit.
  const faceY = CAB.y + CAB.d;
  for (let row = 0; row < 6; row++) {
    const z0 = 5 + row * 10.4;
    const box = [
      [CAB.x + 6, faceY, z0],
      [CAB.x + CAB.w - 6, faceY, z0],
      [CAB.x + CAB.w - 6, faceY, z0 + 8.6],
      [CAB.x + 6, faceY, z0 + 8.6],
    ];
    out.push(G([L(k.pathOf(box.map(at2), true), { tone: "lo" }), L(k.segment([CAB.x + CAB.w / 2 - 8, faceY, z0 + 4.3], [CAB.x + CAB.w / 2 + 8, faceY, z0 + 4.3], P2), { tone: "mid" })], { "data-drawer": String(5 - row) }));
  }
  // The side carries a token meter: a budget covers every stage and every PI consultation.
  const sideX = CAB.x + CAB.w;
  const meter = [
    [sideX, CAB.y + 12, 30],
    [sideX, CAB.y + CAB.d - 12, 30],
    [sideX, CAB.y + CAB.d - 12, 52],
    [sideX, CAB.y + 12, 52],
  ];
  out.push(L(k.pathOf(meter.map(at2), true), { tone: "mid" }));
  for (let t = 0; t <= 10; t++) {
    const y = CAB.y + 16 + t * ((CAB.d - 32) / 10);
    out.push(L(k.segment([sideX, y, 46], [sideX, y, t % 5 ? 43.5 : 41], P2), { tone: t % 5 ? "lo" : "mid" }));
  }
  out.push(L(k.segment([sideX, CAB.y + 16 + (CAB.d - 32) * 0.62, 34], [sideX, CAB.y + 16 + (CAB.d - 32) * 0.62, 47], P2), { tone: "hi" }));
  // The roof: an audit tape spool, and a patch strip with one jack per bay.
  out.push(S(k.slabOf({ x: CAB.x + 6, y: CAB.y + 6, w: CAB.w - 12, d: 16, r: 2 }, CAB_H, 2, P2, 3, 0.4), { tone: "lo" }));
  for (const [x, y] of Object.values(jacks)) out.push(...jack(x, y, CAB_H + 2));
  out.push(S(k.cylinder(CAB.x + 24, CAB.y + 50, 12, CAB_H, 6, P2, 40, 0.5), { tone: "mid" }));
  out.push(L(k.ring(CAB.x + 24, CAB.y + 50, 6, CAB_H + 6, P2, 24), { tone: "lo" }));
  out.push(S(k.cylinder(CAB.x + 24, CAB.y + 50, 2.4, CAB_H + 6, 2, P2, 16), { tone: "hi" }));
  out.push(S(k.slabOf({ x: CAB.x + 40, y: CAB.y + 44, w: 4, d: 12, r: 0.6 }, CAB_H, 3, P2, 2), { tone: "mid" }));
  out.push(D(k.corners(CAB, 4).map(([x, y]) => at2([x, y, CAB_H])), { size: 0.5, tone: "mid" }));
  return G(out, { "data-node": "platform" });
}

function bayTop(id, deck, h) {
  const out = [];
  if (id === "dataset") {
    // A data card: a grid of profiled columns.
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++) out.push(S(k.slabOf({ x: deck.x + 6 + c * 12, y: deck.y + 6 + r * 11, w: 10, d: 9, r: 0.8 }, h, 0.8 + ((r + c) % 3) * 1.2, P2, 2), { tone: (r + c) % 4 ? "lo" : "mid", crease: "none" }));
  }
  if (id === "hypothesis") {
    // A card file: evidence cards standing in a tray, a few pulled up.
    out.push(S(k.slabOf({ x: deck.x + 6, y: deck.y + 6, w: 50, d: 30, r: 1.5 }, h, 3, P2, 3, 0.4), { tone: "mid" }));
    for (let c = 0; c < 9; c++) out.push(S(k.slabOf({ x: deck.x + 9 + c * 5, y: deck.y + 9, w: 1.4, d: 24, r: 0.3 }, h + 3, c % 3 === 1 ? 9 : 5, P2, 2), { tone: c % 3 === 1 ? "hi" : "lo", crease: "none" }));
  }
  if (id === "design") {
    // The plan sheet and a calculator keypad.
    out.push(S(k.slabOf({ x: deck.x + 6, y: deck.y + 6, w: 28, d: 34, r: 0.8 }, h, 0.8, P2, 2), { tone: "hi", crease: "none" }));
    for (let r = 0; r < 4; r++) out.push(L(k.lineOnTop([deck.x + 10, deck.y + 12 + r * 6], [deck.x + 30 - (r % 2) * 7, deck.y + 12 + r * 6], h + 0.8, P2), { tone: "mid", free: true }));
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) out.push(S(k.slabOf({ x: deck.x + 40 + c * 6.4, y: deck.y + 8 + r * 7, w: 4.6, d: 4.6, r: 0.8 }, h, 1.2, P2, 2), { tone: "lo", crease: "none" }));
  }
  if (id === "oversight") {
    // Two seats: the PI decides, the Critic reviews on another model.
    for (let i = 0; i < 2; i++) {
      const cy = deck.y + 20 + i * 38;
      out.push(G([S(k.cylinder(deck.x + 24, cy, 11, h, 4, P2, 36, 0.5), { tone: "mid" }), L(k.ring(deck.x + 24, cy, 6, h + 4, P2, 28), { tone: "lo" }), S(k.cylinder(deck.x + 24, cy, 2.6, h + 4, 3, P2, 18), { tone: "hi" })], { "data-seat": i ? "critic" : "pi" }));
    }
  }
  return out;
}

function bay(plan, id, h = BAY_H) {
  const out = [S(k.slabOf(plan, 0, h, P2, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(plan, 8, P2, 4), { tone: "lo" }) })];
  const deck = k.insetPlan(plan, 5);
  out.push(S(k.slabOf(deck, h, 1.4, P2, 3, 0.4), { tone: "lo" }));
  out.push(...bayTop(id, deck, h + 1.4));
  // A label plate on the front face, three rules standing for the bay's name.
  const fy = plan.y + plan.d;
  for (let r = 0; r < 3; r++) out.push(L(k.segment([plan.x + 10, fy, 18 - r * 4], [plan.x + 34 - r * 6, fy, 18 - r * 4], P2), { tone: r ? "lo" : "mid", free: true }));
  const [jx, jy] = bayJack(plan);
  out.push(...jack(jx, jy, h + 1.4));
  out.push(D(k.corners(plan, 3.5).map(([x, y]) => at2([x, y, h])), { size: 0.5, tone: "mid" }));
  return G(out, { "data-node": id });
}

function terminal() {
  const out = [S(k.slabOf(TERM, 0, 5, P2, 4, 0.6), { tone: "mid" })];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 10; c++) out.push(S(k.slabOf({ x: TERM.x + 6 + c * 6.8, y: TERM.y + 18 + r * 6.5, w: 5, d: 4.6, r: 0.8 }, 5, 1, P2, 2), { tone: "lo", crease: "none" }));
  const screen = { x: TERM.x + 6, y: TERM.y + 2, w: TERM.w - 12, d: 5, r: 1 };
  out.push(S(k.slabOf(screen, 5, 34, P2, 3, 0.5), { tone: "hi", lit: true }));
  for (let row = 0; row < 4; row++) out.push(L(k.segment([screen.x + 7, screen.y + screen.d, 14 + row * 6], [screen.x + screen.w - 14 - (row % 2) * 12, screen.y + screen.d, 14 + row * 6], P2), { tone: "mid", free: true }));
  return G(out, { "data-node": "browser" });
}

// A cable leaves a jack straight up, arcs over and lands straight down on the other jack.
function hang(a, b, lift) {
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const ease = t * t * (3 - 2 * t);
    pts.push([a[0] + (b[0] - a[0]) * ease, a[1] + (b[1] - a[1]) * ease, a[2] + (b[2] - a[2]) * t + lift * Math.sin(Math.PI * t)]);
  }
  return pts.map(at2);
}

function cables() {
  const out = [];
  const links = [
    ...BAYS.map((b) => ({ id: b.id, from: jacks[b.id], to: bayJack(b.plan), toZ: BAY_H + 6.4 })),
    { id: "oversight", from: jacks.oversight, to: bayJack(OVERSIGHT), toZ: 40 + 6.4 },
  ];
  for (const link of links) {
    const a = [link.from[0], link.from[1], CAB_H + 7];
    const b = [link.to[0], link.to[1], link.toZ];
    const call = hang(a, b, 30);
    const back = hang(a, b, 22);
    out.push(G([k.lineSvg(k.pathOf(call), { tone: "mid" }), k.lineSvg(k.pathOf(back), { tone: "lit", flow: true })], { "data-link": link.id }));
  }
  return out.join("");
}

function browserLink() {
  // Browser to Platform: HTTP requests, and the run events streamed back over SSE.
  const out = [];
  const tx = TERM.x + TERM.w / 2;
  const fy = CAB.y + CAB.d;
  const route = (dx, dy) => [
    [tx + dx, TERM.y, 0.4],
    [tx + dx, 56 + dy, 0.4],
    [CAB.x + 20 + dx, 56 + dy, 0.4],
    [CAB.x + 20 + dx, fy, 0.4],
    [CAB.x + 20 + dx, fy, 3],
  ];
  out.push(k.lineSvg(k.pathOf(route(-4, 4).map(at2)), { tone: "mid" }));
  out.push(k.lineSvg(k.pathOf(route(4, -4).map(at2).reverse()), { tone: "lit", flow: true }));
  out.push(D([at2([CAB.x + 16, fy, 3]), at2([CAB.x + 24, fy, 3])], { size: 1, tone: "hi" }));
  return G(out, { "data-link": "browser" });
}

function figure2() {
  const svg = k.figureSvg({
    width: W2,
    height: H2,
    label:
      "The dispatch rack: a browser terminal connects only to the Platform cabinet in the middle. The cabinet drives three engine bays, dataset, hypothesis and experiment design, and the oversight bay with the PI and the Critic. Every bay answers back to the cabinet through its own callback line.",
    body: [desk(), ...BAYS.map((b) => bay(b.plan, b.id)), cabinet(), bay(OVERSIGHT, "oversight", 40), browserLink(), terminal(), cables()],
  });
  return { svg };
}

/* ---------------------------------------------------------------- Fig 3 */

/* Fig 3, the report: one page of the closing report, standing like a printed PDF page, with two more leaves
   behind it. Every part of the page is written by something a person did; until then the part is a dashed box
   that says what it needs. Leaders run from the parts to six callouts, three on each side.
   Page content is drawn flat in page units (420 by 594) and mapped onto the page's front face. */

const W3 = 880;
const H3 = 760;
const LABEL3 = 166;
const PAGE = { w: 420, h: 594, t: 5 };
const page3Corners = [
  ...k.boxCorners({ x: 0, y: 0, w: PAGE.w, d: PAGE.t }, 0, PAGE.h),
  ...k.boxCorners({ x: 16, y: -26, w: PAGE.w, d: PAGE.t }, 0, PAGE.h),
];
const P3 = (() => {
  const fit = k.fitProjection(page3Corners, W3 - LABEL3 * 2, H3, { pad: 16, azimuth: 82, elevation: 9 });
  return { ...fit, origin: [fit.origin[0] + LABEL3, fit.origin[1]] };
})();
// A point on the front face, in page units: u to the right, v down from the top edge.
const onPage = (u, v) => k.iso([u, PAGE.t, PAGE.h - v], P3);

const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = (x, y, text, cls, extra = "") => `<text class="pp ${cls}" x="${x}" y="${y}"${extra}>${esc(text)}</text>`;
const R = (x0, y0, x1, y1, cls = "pp-rule") => `<path class="${cls} draw" d="M${x0} ${y0}L${x1} ${y1}"/>`;
const lines = (x, y, rows, cls = "pp-body", lead = 10.6) => rows.map((row, i) => T(x, y + i * lead, row, cls)).join("");
const need = (x, y, w, h, text) =>
  `<g data-ghost=""><rect class="pp-need" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>${T(x + w / 2, y + h / 2 + 2.4, text.toUpperCase(), "pp-need-text", ' text-anchor="middle"')}</g>`;
const regions3 = [];
const region = (act, box, body) => {
  regions3.push({ act, box });
  return `<g data-at="${act}">${need(...box)}<g data-ink="">${body}</g></g>`;
};

function powerCurve(x0, y0, w, h) {
  const phi = (z) => 0.5 * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z ** 3)));
  const pts = [];
  for (let n = 4; n <= 200; n += 4) pts.push([x0 + (n / 200) * w, y0 + h - phi(0.4 * Math.sqrt(n / 2) - 1.96) * h]);
  const mark = [x0 + 0.5 * w, y0 + h - phi(0.4 * Math.sqrt(50) - 1.96) * h];
  return [
    `<path class="pp-axis draw" d="M${x0} ${y0}V${y0 + h}H${x0 + w}"/>`,
    `<path class="pp-curve draw" d="M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}"/>`,
    `<path class="pp-guide" d="M${x0} ${mark[1].toFixed(1)}H${mark[0]}V${y0 + h}"/>`,
    `<circle class="pp-dot" cx="${mark[0]}" cy="${mark[1].toFixed(1)}" r="2.2"/>`,
    T(x0 - 4, y0 + 3, "1.0", "pp-tick", ' text-anchor="end"'),
    T(x0 - 4, mark[1] + 2, "0.8", "pp-tick", ' text-anchor="end"'),
    T(mark[0], y0 + h + 9, "100", "pp-tick", ' text-anchor="middle"'),
    T(x0 + w, y0 + h + 9, "200 per group", "pp-tick", ' text-anchor="end"'),
  ].join("");
}

function page3() {
  const L = 30;
  const C2 = 218;
  const out = [`<rect class="pp-sheet" width="${PAGE.w}" height="${PAGE.h}"/>`];
  out.push(T(L, 26, "OPENAI SCIENTIST · EXAMPLE RUN", "pp-head"), T(352, 26, "CLOSING REPORT · CASE V1 ·", "pp-head", ' text-anchor="end"'));
  out.push(`<g class="pp-accepted">${T(390, 26, "ACCEPTED", "pp-head pp-strong", ' text-anchor="end"')}</g>`);
  out.push(`<path class="pp-rule-strong" d="M${L} 33H390"/>`);
  out.push(region(2, [L - 4, 42, 368, 50, "Needs your question"], T(L, 62, "Does more sleep go with higher exam", "pp-title") + T(L, 82, "scores among our undergraduates?", "pp-title")));
  out.push(region(0, [L - 4, 100, 368, 28, "Needs a project and its people"], T(L, 112, "Ana López (PM), Minh Nguyen, Tom Hale", "pp-authors") + T(L, 123, "Sleep and grades project · Project Manager, Researcher, Reviewer", "pp-small")));
  const meta = [
    ["INTENT", "Test a claim"],
    ["MODE", "Light · 3 gates"],
    ["PIPELINE", "dataset_first"],
    ["REVIEW", "Second model"],
  ];
  out.push(
    region(
      3,
      [L - 4, 134, 368, 34, "Needs a mode"],
      R(L, 136, 390, 136) +
        R(L, 166, 390, 166) +
        meta.map(([k1, v], i) => T(L + i * 90 + (i ? 8 : 0), 147, k1, "pp-label") + T(L + i * 90 + (i ? 8 : 0), 160, v, "pp-meta") + (i ? R(L + i * 90, 138, L + i * 90, 164) : "")).join(""),
    ),
  );
  out.push(`<path class="pp-rule" d="M210 178V462"/>`);
  out.push(
    region(
      1,
      [L - 4, 176, 180, 96, "Needs data, if you have it"],
      T(L, 188, "1  Data", "pp-h") +
        lines(L, 202, ["enrolment.csv, version 3: 4,212 rows and", "9 columns, profiled in code. Models read", "this data card, never a single row."]) +
        [
          ["sleep_hours", "float", "mean 6.8"],
          ["exam_score", "int", "mean 71.4"],
          ["cohort", "category", "4 levels"],
        ]
          .map(([c, t, m], i) => R(L, 236 + i * 11.5, 202, 236 + i * 11.5) + T(L, 244.5 + i * 11.5, c, "pp-mono") + T(L + 70, 244.5 + i * 11.5, t, "pp-small") + T(L + 118, 244.5 + i * 11.5, m, "pp-small"))
          .join(""),
    ),
  );
  out.push(
    region(
      4,
      [L - 4, 280, 180, 66, "Needs your approved reading list"],
      T(L, 292, "2  Evidence", "pp-h") +
        lines(L, 306, ["186 papers screened in Semantic Scholar", "and OpenAlex; you approved 24. Short", "sleep goes with lower grades [1, 2];", "trading sleep for study backfires [3]."]),
    ),
  );
  out.push(
    region(
      4,
      [L - 4, 354, 180, 70, "Needs your pick of hypotheses"],
      T(L, 366, "3  Hypotheses", "pp-h") +
        T(L, 380, "H1", "pp-strong-body") +
        T(L + 14, 380, "Seven hours or more goes with higher", "pp-body") +
        T(L + 14, 390.6, "final exam scores.", "pp-body") +
        T(L, 404, "H2", "pp-strong-body") +
        T(L + 14, 404, "The link holds within each cohort.", "pp-body") +
        `<g class="pp-dropped">${T(L, 418, "H3", "pp-strong-body")}${T(L + 14, 418, "Later bedtimes alone predict lower scores.", "pp-body")}</g>` +
        `<path class="pp-strike" d="M${L} 415.4H198"/>`,
    ),
  );
  out.push(
    region(
      5,
      [C2 - 4, 176, 180, 158, "Needs the plan to pass review"],
      T(C2, 188, "4  Experiment plan", "pp-h") +
        lines(C2, 202, ["An observational cohort comparing short", "and adequate sleepers. 100 per group", "detect d = 0.4 at 80% power, α = .05."]) +
        powerCurve(C2 + 16, 240, 150, 62) +
        T(C2, 328, "Fig. 1  Power by group size, computed in code.", "pp-caption"),
    ),
  );
  out.push(
    region(
      5,
      [C2 - 4, 340, 180, 50, "Needs the review to finish"],
      T(C2, 352, "5  Open obligations", "pp-h") +
        T(C2, 367, "Sleep hours are self-reported.", "pp-body pp-ink") +
        `<path class="pp-mark" d="M${C2} 370H${C2 + 112}"/>` +
        T(C2, 381, "Course load may confound the link.", "pp-body pp-ink") +
        `<path class="pp-mark" d="M${C2} 384H${C2 + 128}"/>`,
    ),
  );
  out.push(
    region(
      4,
      [C2 - 4, 398, 180, 64, "Needs sources"],
      T(C2, 410, "References", "pp-h") +
        lines(C2, 424, ["[1] Okano K. et al. 2019. npj Sci. Learn.", "[2] Hershner S., Chervin R. 2014. Nat. Sci. Sleep.", "[3] Gillen-O'Neel C. et al. 2013. Child Dev."], "pp-small", 10.4),
    ),
  );
  out.push(
    region(
      4,
      [L - 4, 470, 368, 66, "Needs your answers at the gates"],
      R(L, 472, 390, 472) +
        T(L, 486, "6  Decision record", "pp-h") +
        [
          ["GATE 1", "Reading list approved", "Minh Nguyen"],
          ["GATE 2", "H1 and H2 kept, H3 set aside", "Ana López"],
          ["GATE 3", "Plan accepted after a second review", "Tom Hale"],
        ]
          .map(([g, what, who], i) => T(L, 501 + i * 11.5, g, "pp-mono") + T(L + 44, 501 + i * 11.5, what, "pp-body") + T(390, 501 + i * 11.5, who, "pp-small", ' text-anchor="end"'))
          .join(""),
    ),
  );
  out.push(`<path class="pp-rule" d="M${L} 560H390"/>`, T(L, 574, "Statistics computed in code, never written by a model.", "pp-small"), T(390, 574, "1 / 9", "pp-head", ' text-anchor="end"'));
  return out.join("");
}

// Six callouts. Each act's leader starts at the edge of the first part it writes.
const callouts3 = [
  { side: "left", at: [22, 109], label: "Project", text: "Its members become the authors" },
  { side: "left", at: [22, 185], label: "Data", text: "Profiled in code, never row by row" },
  { side: "right", at: [398, 70], label: "Case", text: "Your question, case v1" },
  { side: "right", at: [398, 151], label: "Mode", text: "Light: three gates" },
  { side: "left", at: [22, 377], label: "Gates", text: "24 papers in, H1 and H2 kept" },
  { side: "right", at: [398, 185], label: "Review", text: "Second model, then the PI" },
];

function callout3(c, index, y) {
  const [ax, ay] = onPage(c.at[0], c.at[1]);
  const left = c.side === "left";
  const tx = left ? LABEL3 - 20 : W3 - LABEL3 + 20;
  const bend = left ? tx + 14 : tx - 14;
  const words = c.text.split(" ");
  const rows = [""];
  for (const word of words) {
    if (`${rows[rows.length - 1]} ${word}`.trim().length > 19) rows.push(word);
    else rows[rows.length - 1] = `${rows[rows.length - 1]} ${word}`.trim();
  }
  const anchor = left ? "end" : "start";
  const textX = left ? tx - 6 : tx + 6;
  return `<g data-callout="${index}"><path class="pp-leader draw" d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${bend} ${y}H${tx}"/><circle class="pp-dot" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.4"/>${T(textX, y - 4, `0${index + 1}  ${c.label.toUpperCase()}`, "pp-callout-head", ` text-anchor="${anchor}"`)}${rows.map((row, i) => T(textX, y + 10 + i * 13, row, "pp-callout", ` text-anchor="${anchor}"`)).join("")}</g>`;
}

function figure3() {
  const back = [2, 1].map((i) =>
    S(k.slabOf({ x: i * 8, y: -i * 13, w: PAGE.w, d: PAGE.t, r: 0.5 }, 0, PAGE.h, P3, 2), { tone: "lo" }),
  );
  const front = S(k.slabOf({ x: 0, y: 0, w: PAGE.w, d: PAGE.t, r: 0.5 }, 0, PAGE.h, P3, 2), { tone: "mid" });
  const face = `<g class="pp-page" transform="${k.sideMatrix([0, PAGE.t], PAGE.h, P3, "left")}">${page3()}</g>`;
  // Callouts on each side are spaced so their text never collides.
  const ys = {};
  for (const side of ["left", "right"]) {
    let floor = 0;
    callouts3
      .map((c, i) => ({ c, i, y: onPage(c.at[0], c.at[1])[1] }))
      .filter(({ c }) => c.side === side)
      .sort((a, b) => a.y - b.y)
      .forEach(({ i, y }) => {
        ys[i] = Math.max(y, floor);
        floor = ys[i] + 58;
      });
  }
  const shadow = `<path class="iso-halo" d="${k.haloOf({ x: 0, y: -26, w: PAGE.w + 16, d: PAGE.t + 26, r: 1 }, 0, 2, P3)}"/>`;
  const svg = k.figureSvg({
    width: W3,
    height: H3,
    label:
      "One page of the closing report, set like a printed paper: the question as its title, the project members as authors, the run's mode, then data, evidence, hypotheses, the experiment plan with a power curve computed in code, the open obligations, references and the decision record. Six callouts say which of your steps wrote each part.",
    body: [shadow, ...back, front, face, ...callouts3.map((c, i) => callout3(c, i, ys[i]))],
  });
  // Camera frames, one per act: the parts that act writes plus its callout, held to the figure's aspect ratio.
  const frames = callouts3.map((c, act) => {
    const pts = regions3.filter((r) => r.act === act).flatMap(({ box: [x, y, w, h] }) => [onPage(x, y), onPage(x + w, y + h), onPage(x + w, y), onPage(x, y + h)]);
    const tx = c.side === "left" ? 4 : W3 - 4;
    pts.push([tx, ys[act] - 20], [tx, ys[act] + 40]);
    const xs = pts.map(([x]) => x);
    const yv = pts.map(([, y]) => y);
    let w = Math.max(...xs) - Math.min(...xs) + 40;
    let h = Math.max(...yv) - Math.min(...yv) + 40;
    w = Math.max(w, W3 * 0.56);
    if (w / h > W3 / H3) h = (w * H3) / W3;
    else w = (h * W3) / H3;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...yv) + Math.min(...yv)) / 2;
    const x = Math.min(Math.max(cx - w / 2, 0), W3 - w);
    const y = Math.min(Math.max(cy - h / 2, 0), H3 - h);
    return [x, y, w, h].map((v) => Math.round(v * 10) / 10);
  });
  return { svg, frames, view: [0, 0, W3, H3] };
}

const f1 = figure1();
const f2 = figure2();
const f3 = figure3();
mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/figures.json", JSON.stringify({ line: f1, rack: f2, report: f3, parts: parts.count }));
writeFileSync("src/app/anatomy.css", k.ISO_CSS);
console.log(`Anatomy: research line, dispatch rack and report, ${parts.count} shaded parts.`);

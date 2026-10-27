"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import figures from "@/generated/figures.json";
import { useSwap } from "./swap";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const F = figures.line;
type Mode = "light" | "auto";

export const lineSteps = [
  {
    name: "Research case",
    code: "ResearchCase",
    term: "case",
    what: "Your question, the kind of answer you want, what you will do with it, plus context, constraints and papers you already know. Every stage reads this one case. Nothing else carries the aim.",
    use: "Write it once in the composer. Change it later only by amending it: the version rises, and engines and the PI never edit it.",
  },
  {
    name: "Pipeline",
    code: "dataset_first · default",
    term: "pipeline",
    what: "The route the case takes along the rail. With a dataset, the run starts at the dataset engine. Without one, it goes straight to hypotheses.",
    use: "Attach a dataset to the project before you start, or leave it out. The route follows on its own.",
  },
  {
    name: "Dataset engine",
    code: "dataset.brief/v1",
    term: "dataset",
    what: "Profiles every column in code and publishes a data card and a research brief. A model sees the card, never a data row.",
    use: "Check the data card, then choose which candidate question the brief should answer.",
  },
  {
    name: "Gate",
    code: "light · auto",
    term: "gate",
    what: {
      light: "Light mode: the run stops at the gate and waits for you. You approve the reading list, pick hypotheses and accept each stage.",
      auto: "Auto mode: nothing stops. Review gates are answered by rule and the AI Principal Investigator decides the rest.",
    },
    use: "Choose the mode before the run starts. The lever on each gate is yours in light mode.",
  },
  {
    name: "Hypothesis engine",
    code: "hypothesis.hypotheses/v1",
    term: "hypothesis",
    what: "Plans searches across Semantic Scholar and OpenAlex, screens and shortlists papers, reads them into evidence cards, finds gaps, then generates and debates hypotheses. Nine steps, one lamp each.",
    use: "Approve the shortlist. Later, pick the hypotheses worth testing and read the argument map behind them.",
  },
  {
    name: "Independent review",
    code: "models.stage ≠ models.review",
    term: "review",
    what: "The second head is a different model. It reviews the stage's output; a blocking finding sends the work back for revision a bounded number of times. Each pip counts one send-back.",
    use: "Read findings next to the draft. Nothing is published as reviewed while a blocking finding is open.",
  },
  {
    name: "Critic, PI and obligations",
    code: "accept · send back · escalate",
    term: "critic obligation",
    what: "The Critic checks the finished stage against the charter and your directives. The PI accepts it, sends it back or asks you. A finding still open becomes an obligation and clips onto the case.",
    use: "Answer an escalation when the PI asks. Read the obligations before you rely on a result.",
  },
  {
    name: "Experiment design",
    code: "experiment_design.exp_plan/v1",
    term: "design",
    what: "Grounds the plan in real datasets, baselines and code, then a Methodologist and a Skeptic critique it. Statistics come from calculators, never from model text.",
    use: "Review the resources it found, then the plan. It designs the experiment; it does not run it.",
  },
  {
    name: "Closing report and budget",
    code: "budget_exceeded",
    term: "report budget",
    what: "The PI writes the closing report, which must name every open obligation. One token budget covers every stage and every PI consultation.",
    use: "Read the report with its obligations. If the dial runs out, the run waits until a member raises the budget.",
  },
];

/* ------------------------------------------------------------ the choreography: a pure function of progress */

const keys = (points: [number, number][], p: number) => {
  if (p <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t1, v1] = points[i];
    const [t0, v0] = points[i - 1];
    if (p <= t1) {
      const t = (p - t0) / (t1 - t0 || 1);
      const eased = t * t * (3 - 2 * t);
      return v0 + (v1 - v0) * eased;
    }
  }
  return points[points.length - 1][1];
};
const within = (p: number, from: number, to: number) => p >= from && p < to;
const share = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
const S = F.stops;

const carPath: [number, number][] = [
  [0, S.intake],
  [0.13, S.intake],
  [0.21, S.dataset],
  [0.35, S.dataset],
  [0.43, S.hypothesis],
  [0.6, S.hypothesis],
  [0.615, S.hypothesis - 34],
  [0.64, S.hypothesis - 34],
  [0.655, S.hypothesis],
  [0.7, S.hypothesis],
  [0.77, S.design],
  [0.9, S.design],
  [0.97, S.close],
  [1, S.close],
];
const lampWindows: [number, number][] = [
  [0.225, 0.32],
  [0.45, 0.6],
  [0.785, 0.88],
];
const reviewWindows: [number, number][] = [
  [0.3, 0.345],
  [0.556, 0.67],
  [0.86, 0.9],
];
const gateWindows: [number, number][] = [
  [0.333, 0.37],
  [0.667, 0.705],
  [0.889, 0.925],
];

export function stateAt(p: number) {
  const car = keys(carPath, p);
  return {
    step: Math.min(lineSteps.length - 1, Math.floor(p * lineSteps.length)),
    car,
    gates: F.gates.map((gx) => {
      const near = Math.abs(car - gx) - (F.carHalf + 6);
      return 1 - Math.min(1, Math.max(0, near / 16));
    }),
    passed: F.gates.map((gx) => car - F.carHalf > gx + 2),
    lamps: lampWindows.map(([from, to], s) => Math.floor(share(p, from, to) * F.lamps[s] + 0.0001)),
    drafting: lampWindows.map(([from, to]) => within(p, from, to)),
    reviewing: reviewWindows.map(([from, to]) => within(p, from, to)),
    deciding: gateWindows.map(([from, to]) => within(p, from, to)),
    pips: [0, p > 0.62 ? 1 : 0, 0],
    tags: [p > 0.7, p > 0.93, false],
    report: share(p, 0.955, 0.99),
    budget: 0.04 + 0.86 * keys([[0, 0], [0.13, 0.04], [0.35, 0.22], [0.66, 0.62], [0.9, 0.86], [1, 0.92]], p),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------ the figure: writes attributes, never re-renders */

type Handle = { apply: (p: number) => void };

const RigFigure = forwardRef<Handle, { mode: Mode; focus: string | null }>(function RigFigure({ mode, focus }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const last = useRef<ReturnType<typeof stateAt> | null>(null);

  const iso = useCallback(([x, y, z]: number[]) => {
    const { origin, scale, azimuth = 45, elevation = 30 } = F.P;
    const a = (azimuth * Math.PI) / 180;
    const e = (elevation * Math.PI) / 180;
    // The Anatomy kit's world unit: one unit spans sqrt(1.6) screen units at scale 1.
    const k = scale * Math.sqrt(1.6);
    return [origin[0] + (x * Math.sin(a) - y * Math.cos(a)) * k, origin[1] + ((x * Math.cos(a) + y * Math.sin(a)) * Math.sin(e) - z * Math.cos(e)) * k];
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      apply(p: number) {
        const root = host.current;
        if (!root) return;
        const s = stateAt(p);
        const prev = last.current;
        last.current = s;
        const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
        const flag = (selector: string, on: boolean) => {
          const el = q(selector);
          if (el && el.hasAttribute("data-on") !== on) el.toggleAttribute("data-on", on);
        };
        const car = q<SVGGElement>('[data-part="carriage"]');
        if (car && prev?.car !== s.car) car.setAttribute("transform", `translate(${(F.along[0] * s.car).toFixed(2)} ${(F.along[1] * s.car).toFixed(2)})`);
        const passedSlot = q('[data-slot="passed"]');
        const aheadSlot = q('[data-slot="ahead"]');
        F.gates.forEach((_, i) => {
          const plate = q<SVGGElement>(`[data-gate="${i}"]`);
          if (!plate) return;
          const lift = s.gates[i] * 26;
          plate.setAttribute("transform", `translate(${(F.lift[0] * lift).toFixed(2)} ${(F.lift[1] * lift).toFixed(2)})`);
          // A plate the carriage has passed is behind it; one still ahead is in front.
          const slot = s.passed[i] ? passedSlot : aheadSlot;
          if (slot && plate.parentNode !== slot) slot.appendChild(plate);
          flag(`[data-loupe="${i}"]`, s.deciding[i]);
          flag(`[data-lever="${i}"]`, s.deciding[i] && root.dataset.mode === "light");
        });
        s.lamps.forEach((count, station) => {
          for (let lamp = 0; lamp < F.lamps[station]; lamp++) flag(`[data-lamp="${station}-${lamp}"]`, lamp < count);
        });
        ["dataset", "hypothesis", "design"].forEach((id, station) => {
          flag(`[data-head="${id}-stage"]`, s.drafting[station]);
          flag(`[data-head="${id}-review"]`, s.reviewing[station]);
          flag(`[data-pip="${station}-0"]`, s.pips[station] > 0);
        });
        s.tags.forEach((on, i) => flag(`[data-tag="${i}"]`, on));
        const sheet = q<SVGGElement>('[data-sheet="3"]');
        if (sheet) {
          sheet.style.opacity = String(s.report);
          sheet.setAttribute("transform", `translate(${(F.lift[0] * (1 - s.report) * 10).toFixed(2)} ${(F.lift[1] * (1 - s.report) * 10).toFixed(2)})`);
        }
        const needle = q<SVGPathElement>('[data-part="needle"]');
        if (needle && prev?.budget !== s.budget) {
          const { center, r, z, from, span } = F.needle;
          const angle = from + span * s.budget;
          const tip = iso([center[0] + Math.sin(angle) * r, center[1] - Math.cos(angle) * r, z]);
          const tail = iso([center[0] - Math.sin(angle) * 3, center[1] + Math.cos(angle) * 3, z]);
          needle.setAttribute("d", `M${tail[0].toFixed(1)} ${tail[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`);
        }
        const section = root.closest(".line");
        const write = (selector: string, text: string) => {
          const el = section?.querySelector(selector);
          if (el && el.textContent !== text) el.textContent = text;
        };
        write("[data-readout]", `Step ${pad(s.step + 1)} of ${pad(lineSteps.length)}`);
        write("[data-budget]", `${Math.round(s.budget * 100)}%`);
        section?.querySelector<HTMLElement>("[data-budget-fill]")?.style.setProperty("transform", `scaleX(${s.budget.toFixed(3)})`);
        section?.querySelector<HTMLElement>("[data-line-fill]")?.style.setProperty("transform", `scaleX(${p.toFixed(4)})`);
      },
    }),
    [iso],
  );

  return (
    <div
      ref={host}
      className="line-figure iso"
      data-mode={mode}
      data-focus={focus ?? undefined}
      // The figure is built once at build time from the Anatomy kit; it holds no user content.
      dangerouslySetInnerHTML={{ __html: F.svg }}
    />
  );
});

/* ------------------------------------------------------------ the section */

export type LineHandle = { goTo: (step: number) => void };

export const ResearchLine = forwardRef<LineHandle>(function ResearchLine(_, ref) {
  const root = useRef<HTMLElement>(null);
  const figure = useRef<Handle>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("light");
  const [focus, setFocus] = useState<string | null>(null);
  const progress = useRef(0);
  const stepRef = useRef(0);

  const show = useCallback((p: number) => {
    progress.current = p;
    figure.current?.apply(p);
    const next = stateAt(p).step;
    if (next !== stepRef.current) {
      stepRef.current = next;
      setStep(next);
    }
  }, []);

  useEffect(() => show(0), [show]);
  // Re-apply after a mode change, so the levers follow the switch.
  useEffect(() => {
    figure.current?.apply(progress.current);
  }, [mode]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pin = root.current?.querySelector<HTMLElement>(".line-stage");
        trigger.current = ScrollTrigger.create({
          trigger: root.current,
          pin,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 900 ? 3.4 : 4.6))}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => show(self.progress),
        });
        return () => {
          trigger.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const goTo = useCallback(
    (index: number) => {
      const p = (index + 0.55) / lineSteps.length;
      const st = trigger.current;
      if (st) window.scrollTo({ top: st.start + (st.end - st.start) * p, behavior: "smooth" });
      else {
        show(p);
        root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [show],
  );
  useImperativeHandle(ref, () => ({ goTo }), [goTo]);

  const current = lineSteps[step];
  const what = typeof current.what === "string" ? current.what : current.what[mode];
  const detail = useRef<HTMLDivElement>(null);
  useSwap(detail, step, current.code);

  return (
    <section id="line" ref={root} className="line" aria-labelledby="line-title">
      <div className="line-stage">
        <div className="line-head wrap">
          <div className="section-title">
            <p className="section-mark label">
              <span>01</span>How a run moves
            </p>
            <h2 id="line-title">
              Follow one run
              <br />
              <span>down the line.</span>
            </h2>
          </div>
          <p>
            A run is a carriage that holds your research case. It rides past one instrument per engine, stops at a gate after each stage and
            collects tags for whatever is still open. Scroll to run it, or pick a part.
          </p>
        </div>
        <div className="line-body wrap">
          <figure className="line-plate">
            <div className="plate-corners" aria-hidden="true">
              <span data-corner="fig">Fig 1</span>
              <span data-corner="title">The research line</span>
              <span data-corner="hint">Scroll to run · select a step</span>
              <span data-corner="readout" data-readout="">
                Step 01 of 09
              </span>
            </div>
            {/* With nothing hovered, the drawing outlines the parts the panel is describing. */}
            <RigFigure ref={figure} mode={mode} focus={focus ?? current.term} />
            <figcaption className="sr-only">
              An isometric drawing of the research line. The carriage holding the research case is at step {step + 1}: {current.name}.
            </figcaption>
          </figure>
          <div className="line-steps">
            <span className="line-track" aria-hidden="true">
              <span data-line-fill="" />
            </span>
            <ol aria-label="Steps of a run">
            {lineSteps.map((item, index) => (
              <li key={item.name}>
                <button
                  type="button"
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => goTo(index)}
                  onPointerEnter={() => setFocus(item.term)}
                  onPointerLeave={() => setFocus(null)}
                  onFocus={() => setFocus(item.term)}
                  onBlur={() => setFocus(null)}
                >
                  <span className="line-step-index">{pad(index + 1)}</span>
                  <span className="line-step-name">{item.name}</span>
                </button>
              </li>
            ))}
            </ol>
          </div>
          <div className="line-panel">
            <div className="mode-block">
              <div className="mode-switch" role="radiogroup" aria-label="Run mode" data-mode={mode}>
                {(["light", "auto"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
                    {m === "light" ? "Light mode" : "Auto mode"}
                  </button>
                ))}
              </div>
              <p className="mode-note">{mode === "light" ? "Stops at every gate and waits for you." : "Runs through. Rules and the PI answer the gates."}</p>
            </div>
            <div ref={detail} className="line-detail" aria-live="polite">
              <div className="line-count">
                <span className="line-count-now">
                  <span key={step} data-swap="count">
                    {pad(step + 1)}
                  </span>
                </span>
                <span className="line-count-of">/ {pad(lineSteps.length)}</span>
              </div>
              <h3 key={current.name} data-swap="title">
                {current.name}
              </h3>
              <code key={current.code} className="line-code" data-swap="code">
                {current.code}
              </code>
              <dl className="line-spec">
                <div data-swap="text">
                  <dt>What it is</dt>
                  <dd>{what}</dd>
                </div>
                <div data-swap="text">
                  <dt>How you use it</dt>
                  <dd>{current.use}</dd>
                </div>
              </dl>
            </div>
            <div className="line-budget">
              <span className="label">Token budget</span>
              <span className="line-budget-value" data-budget="">
                4%
              </span>
              <span className="line-budget-track" aria-hidden="true">
                <span data-budget-fill="" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

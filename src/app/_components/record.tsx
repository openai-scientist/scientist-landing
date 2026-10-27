"use client";

import { type CSSProperties, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

/*
 * The example record behind the product's writing preview: a dropout study run on UCI dataset 697.
 * Every figure below is copied from that record's out/analysis.json and out/results.csv; do not round them anew.
 */
const log = [
  { time: "10:50:10", title: "Plan locked", ref: "plan.md" },
  { time: "10:51:26", title: "15 runs", ref: "t01–t15" },
  { time: "10:53:15", title: "Deviation declared", ref: "D1" },
  { time: "Review", title: "Rerun asked", ref: "R1" },
  { time: "Writing", title: "Fake DOI planted", ref: "refs.bib 17" },
];

const STUDENTS = 4424;
const outcome = [
  { name: "Graduated", count: 2209 },
  { name: "Dropped out", count: 1421, key: true },
  { name: "Enrolled, left out", count: 794, out: true },
];

const CEILING = 0.511;
const models = [
  { name: "Enrolment · regression", value: 0.392 },
  { name: "Enrolment · boosting", value: 0.396 },
  { name: "+ first semester", value: 0.507, key: true },
];

const tests = [
  { key: "H1", name: "First semester adds", estimate: 0.1113, low: 0.0921, high: 0.1291, verdict: "Supported" },
  { key: "R1", name: "Never-assessed removed", estimate: 0.1216, low: 0.1003, high: 0.1433, verdict: "Holds" },
  { key: "H1", name: "Courses resampled", estimate: 0.1113, low: 0.0811, high: 0.1457, verdict: "Holds" },
  { key: "H2", name: "Bigger gain, low admission", estimate: -0.0311, low: -0.1086, high: 0.027, verdict: "Unclear" },
  { key: "H4", name: "Boosting beats regression", estimate: 0.0042, low: -0.0065, high: 0.0215, verdict: "Unclear" },
  { key: "S", name: "Undated columns added", estimate: 0.0021, low: -0.0014, high: 0.0076, verdict: "Barely moves" },
];

const MIN = -0.12;
const MAX = 0.16;
const ticks = [-0.1, -0.05, 0, 0.05, 0.1, 0.15];
const x = (value: number) => `${(((value - MIN) / (MAX - MIN)) * 100).toFixed(3)}%`;
const signed = (value: number, digits = 3) => `${value < 0 ? "−" : value > 0 ? "+" : ""}${Math.abs(value).toFixed(digits)}`;
// Fig 4b runs from 0 to 0.6, so the ceiling sits inside the plot with room for its label.
const share = (value: number) => `${((value / 0.6) * 100).toFixed(2)}%`;

export function Record() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const once = (trigger: string) => ({ trigger, start: "top 80%", once: true });
        // The log is ruled across and each moment lands on it in order; clock times tick into place.
        gsap
          .timeline({ scrollTrigger: once(".rec-log-wrap"), defaults: { ease: "power3.out" } })
          .from(".rec-log-rule", { scaleX: 0, transformOrigin: "0 50%", duration: 1.2, ease: "power2.inOut" })
          .from(".rec-log li", { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.16 }, 0.15);
        gsap.utils.toArray<HTMLElement>(".rec-time[data-clock]").forEach((time, index) => {
          gsap.from(time, {
            duration: 0.9,
            delay: 0.15 + index * 0.16,
            scrambleText: { text: time.textContent ?? "", chars: "0123456789:", speed: 0.5 },
            scrollTrigger: once(".rec-log-wrap"),
          });
        });
        // Bars grow from their baseline and their numbers count up with them.
        gsap
          .timeline({ scrollTrigger: once(".rec-charts"), defaults: { ease: "power3.out" } })
          .from(".rec-outcome-bar span", { scaleX: 0, transformOrigin: "0 50%", duration: 0.8, stagger: 0.12 })
          .from(".rec-bar-fill", { scaleX: 0, transformOrigin: "0 50%", duration: 1, stagger: 0.12 }, 0.3)
          .from(".rec-ceiling", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.6 }, 0.5);
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((node) => {
          const end = Number(node.dataset.count);
          const digits = Number(node.dataset.digits ?? 0);
          const state = { value: 0 };
          gsap.to(state, {
            value: end,
            duration: 1.1,
            ease: "power3.out",
            delay: 0.3,
            scrollTrigger: once(".rec-charts"),
            onUpdate: () => {
              node.textContent = digits ? state.value.toFixed(digits) : Math.round(state.value).toLocaleString("en-US");
            },
          });
        });
        // The forest plot: the axis is ruled, then each interval grows out from its estimate.
        gsap
          .timeline({ scrollTrigger: once(".fp"), defaults: { ease: "power3.out" } })
          .from(".fp-guide", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.05 })
          .from(".fp-ci", { scaleX: 0, duration: 0.9, stagger: 0.08 }, 0.25)
          .from(".fp-dot", { scale: 0, duration: 0.5, ease: "back.out(2.4)", stagger: 0.08 }, 0.4);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="record" className="rec" aria-labelledby="record-title">
      <div className="wrap">
        <div className="rec-head">
          <div>
            <p className="section-mark label" data-sc-in>
              <span>04</span>An example record
            </p>
            <h2 id="record-title" data-sc-in>
              One real study. <span>Every number rebuilds.</span>
            </h2>
          </div>
          <p className="rec-intro" data-sc-in>
            Who drops out after the first semester? Public data, and a plan locked before any model was fit.
          </p>
        </div>

        <div className="rec-log-wrap">
          <p className="label rec-log-head">27 Oct 2026 · UTC</p>
          <div className="rec-log-rule" aria-hidden="true" />
          <ol className="rec-log">
            {log.map((item) => (
              <li key={item.title}>
                <span className="rec-time" data-clock={item.time.includes(":") || undefined}>
                  {item.time}
                </span>
                <strong>{item.title}</strong>
                <code>{item.ref}</code>
              </li>
            ))}
          </ol>
        </div>

        <div className="rec-charts">
          <figure className="rec-plate">
            <figcaption className="rec-plate-top">
              <span>Fig 4a</span>
              <span>The data</span>
            </figcaption>
            <p className="rec-big">
              <span data-count={STUDENTS}>{STUDENTS.toLocaleString("en-US")}</span>
              <small>students</small>
            </p>
            <div className="rec-outcome-bar" aria-hidden="true">
              {outcome.map((part) => (
                <span key={part.name} data-key={part.key || undefined} data-out={part.out || undefined} style={{ flexGrow: part.count }} />
              ))}
            </div>
            <ul className="rec-outcome-key">
              {outcome.map((part) => (
                <li key={part.name} data-key={part.key || undefined} data-out={part.out || undefined}>
                  <strong>{part.count.toLocaleString("en-US")}</strong>
                  <span>{part.name}</span>
                </li>
              ))}
            </ul>

            <figcaption className="rec-plate-top rec-plate-sub">
              <span>Fig 4b</span>
              <span>Dropouts found in the 20% flagged</span>
            </figcaption>
            <div className="rec-bars">
              <div className="rec-bars-guides" aria-hidden="true">
                <span />
                <span>
                  <span className="rec-ceiling" style={{ left: share(CEILING) }}>
                    <em>Best possible {CEILING}</em>
                  </span>
                </span>
                <span />
              </div>
              {models.map((model) => (
                <div key={model.name} className="rec-bar" data-key={model.key || undefined}>
                  <span className="rec-bar-name">{model.name}</span>
                  <span className="rec-bar-track" aria-hidden="true">
                    <span className="rec-bar-fill" style={{ width: share(model.value) }} />
                  </span>
                  <span className="rec-bar-value" data-count={model.value} data-digits={3}>
                    {model.value.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
            <p className="rec-bars-note" aria-hidden="true">
              Dashed: best possible, {CEILING}
            </p>
          </figure>

          <figure className="rec-plate">
            <figcaption className="rec-plate-top">
              <span>Fig 4c</span>
              <span>Gain in dropouts found · 95% interval</span>
            </figcaption>
            <div className="fp" style={{ "--zero": x(0), "--floor": x(0.05) } as CSSProperties}>
              <div className="fp-guides" aria-hidden="true">
                <span />
                <span className="fp-scale">
                  {ticks.map((tick) => (
                    <span key={tick} className="fp-guide" data-zero={tick === 0 || undefined} style={{ left: x(tick) }} />
                  ))}
                  <span className="fp-guide fp-floor" style={{ left: x(0.05) }}>
                    <em>H1 needs 0.05</em>
                  </span>
                </span>
                <span />
              </div>
              <ul className="fp-rows">
                {tests.map((test) => (
                  <li key={`${test.key}-${test.name}`} className="fp-row" data-verdict={test.verdict}>
                    <span className="fp-name">
                      <span className="fp-key">{test.key}</span>
                      <strong>{test.name}</strong>
                    </span>
                    <span className="fp-track" aria-hidden="true">
                      <span
                        className="fp-ci"
                        style={{
                          left: x(test.low),
                          width: `calc(${x(test.high)} - ${x(test.low)})`,
                          transformOrigin: `${(((test.estimate - test.low) / (test.high - test.low)) * 100).toFixed(1)}% 50%`,
                        }}
                      />
                      <span className="fp-dot" style={{ left: x(test.estimate) }} />
                    </span>
                    <span className="fp-value">
                      <span>{signed(test.estimate)}</span>
                      <small>{test.verdict}</small>
                    </span>
                    <span className="sr-only">
                      95% interval {signed(test.low)} to {signed(test.high)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="fp-axis" aria-hidden="true">
                <span />
                <span className="fp-scale">
                  {ticks.map((tick) => (
                    <span key={tick} style={{ left: x(tick) }}>
                      {tick === 0 ? "0" : signed(tick, 2)}
                    </span>
                  ))}
                </span>
                <span />
              </div>
            </div>
          </figure>
        </div>

        <p className="rec-cite">
          Data: Realinho et al. (2022), <em>Predict Students’ Dropout and Academic Success</em>, UCI dataset 697, CC BY 4.0. The study team in the
          preview is illustrative; the data, plan, runs and numbers are real.
        </p>
      </div>
    </section>
  );
}

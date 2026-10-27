"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import figures from "@/generated/figures.json";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const F = figures.report;

/* Six things a person does. Each one writes parts of the report page drawn in Fig 3. */
const acts = [
  {
    title: "Start a project",
    text: "Create a project and invite people. Each member has one role: Project Manager, Researcher or Reviewer.",
    wrote: "Authors · three members, three roles",
  },
  {
    title: "Bring data, if you have it",
    text: "Upload CSV or XLSX, or import from PostgreSQL, MySQL, BigQuery or Google Sheets. Datasets are versioned, never overwritten.",
    wrote: "§1 Data · enrolment.csv v3, profiled in code",
  },
  {
    title: "Write the case",
    text: "One question, the kind of answer you want, and what you will do with the result. Context and constraints are optional.",
    wrote: "Title · your question, case version 1",
  },
  {
    title: "Choose how involved you are",
    text: "Light mode stops at each gate for you. Auto mode lets the PI decide while you read the record as it grows.",
    wrote: "Run details · light mode, three gates",
  },
  {
    title: "Answer the stops",
    text: "Approve the reading list, pick hypotheses, accept a stage or send it back. Every decision is logged with who made it.",
    wrote: "§2, §3, §6 · evidence, hypotheses, decisions",
  },
  {
    title: "Read what it made",
    text: "A second model reviewed each stage. The closing report names every finding that is still open.",
    wrote: "§4, §5 · reviewed plan, two obligations open",
  },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

export function Manuscript() {
  const root = useRef<HTMLElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const [act, setAct] = useState(-1);
  const [live, setLive] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const host = figure.current;
        if (!host) return;
        setLive(true);
        // Rules and curves are traced in, so each needs a unit length to dash against.
        host.querySelectorAll(".draw, .pp-strike, .pp-mark").forEach((line) => line.setAttribute("pathLength", "1"));
        const svg = host.querySelector("svg");
        const view = (frame: number[]) => ({ attr: { viewBox: frame.join(" ") } });
        // The page opens whole, every part a dashed box saying what it needs. The camera then moves to the parts
        // each step writes, and pulls back at the end to the finished page.
        const START = 0.6;
        const tl = gsap.timeline({ defaults: { ease: "none" } });
        acts.forEach((_, index) => {
          const at = START + index;
          const parts = `[data-at="${index}"]`;
          if (svg) tl.to(svg, { ...view(F.frames[index]), duration: index ? 0.35 : 0.5, ease: "power2.inOut" }, at - (index ? 0.15 : 0.45));
          tl.to(`${parts} [data-ghost]`, { autoAlpha: 0, duration: 0.2 }, at);
          tl.fromTo(`${parts} [data-ink]`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at + 0.1);
          // Set like type: each line is wiped in from the left, in reading order.
          tl.fromTo(`${parts} [data-ink] text`, { clipPath: "inset(-40% 100% -40% 0)" }, { clipPath: "inset(-40% 0% -40% 0)", duration: 0.3, stagger: 0.025 }, at + 0.1);
          tl.fromTo(`${parts} [data-ink] .draw`, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.35, stagger: 0.02 }, at + 0.1);
          tl.fromTo(`${parts} [data-ink] circle`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, at + 0.4);
          tl.fromTo(`[data-callout="${index}"]`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, at + 0.15);
          tl.fromTo(`[data-callout="${index}"] .pp-leader`, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, at + 0.15);
        });
        tl.fromTo(".pp-strike", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25 }, START + 4.75);
        tl.fromTo(".pp-mark", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, stagger: 0.12 }, START + 5.5);
        tl.fromTo(".pp-accepted", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, START + 5.7);
        if (svg) tl.to(svg, { ...view(F.view), duration: 0.6, ease: "power2.inOut" }, START + 6);
        tl.to({}, { duration: 0.5 });

        ScrollTrigger.create({
          trigger: root.current,
          pin: ".ms-stage",
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 6)}`,
          scrub: 0.6,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: () => setAct(tl.time() < START ? -1 : Math.min(acts.length - 1, Math.floor(tl.time() - START))),
        });
        return () => {
          svg?.setAttribute("viewBox", F.view.join(" "));
          setLive(false);
          setAct(-1);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const readout = act >= 0 ? acts[act].wrote : live ? "Every part still needs you" : "Every part written by your six steps";

  return (
    <section ref={root} id="using" className="ms" aria-labelledby="using-title" data-live={live || undefined}>
      <div className="ms-stage wrap">
        <div className="ms-guide">
          <h2 id="using-title">
            Six things you do. <span>Each one writes part of the report.</span>
          </h2>
          <ol className="ms-acts">
            {acts.map((item, index) => (
              <li key={item.title} data-state={index === act ? "on" : index < act ? "done" : undefined}>
                <span className="ms-act-number">{pad(index)}</span>
                <div>
                  <strong>{item.title}</strong>
                  <div className="ms-act-text">
                    <p>{item.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <figure className="ms-plate">
          <div className="plate-corners" aria-hidden="true">
            <span data-corner="fig">Fig 3</span>
            <span data-corner="title">The closing report, page 1</span>
            <span data-corner="hint">Dashed: still waiting on you</span>
            <span data-corner="readout">{readout}</span>
          </div>
          <div
            ref={figure}
            className="ms-figure iso"
            data-theme="light"
            data-act={act >= 0 ? act : undefined}
            // Built once at build time from the Anatomy kit; it holds no user content.
            dangerouslySetInnerHTML={{ __html: F.svg }}
          />
        </figure>
      </div>
    </section>
  );
}

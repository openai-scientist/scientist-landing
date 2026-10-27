"use client";

import { Fragment, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Arrow } from "./icons";
import { useSwap } from "./swap";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Entry = { term: string; kind: string; meaning: string; step: number; see: string[] };

/* In the order a run meets them. `step` is where the term is drawn on the research line. */
const lexicon: Entry[] = [
  { term: "Research case", kind: "Object", step: 0, see: ["Charter", "Pipeline", "Token budget"], meaning: "Your question, intent, context, constraints and references. Versioned; only you amend it." },
  { term: "Charter", kind: "Document", step: 6, see: ["Research case", "Principal Investigator", "Critic"], meaning: "The PI's reading of the case: what the run is for and how it will be judged." },
  { term: "Pipeline", kind: "Route", step: 1, see: ["Stage", "Engine", "Data card"], meaning: "The order of stages. dataset_first with a dataset, default without one." },
  { term: "Stage", kind: "Unit of work", step: 4, see: ["Engine", "Review model", "Gate"], meaning: "One engine's part of a run: draft, independent review, revise." },
  { term: "Engine", kind: "Service", step: 2, see: ["Stage", "Data card", "Evidence card"], meaning: "A service that does the science of one stage. It has no screen of its own." },
  { term: "Data card", kind: "Artifact", step: 2, see: ["Engine", "Pipeline"], meaning: "A profile of every column, computed in code. Models see this, never the rows." },
  { term: "Evidence card", kind: "Artifact", step: 4, see: ["Argument map", "Engine"], meaning: "What a paper says, extracted from its abstract and linked to its source." },
  { term: "Argument map", kind: "Artifact", step: 4, see: ["Evidence card", "Stage"], meaning: "How hypotheses, evidence and objections connect." },
  { term: "Gate", kind: "Stop", step: 3, see: ["Light mode", "Auto mode", "Principal Investigator"], meaning: "A point where a run waits for a decision: yours in light mode, a rule's or the PI's in auto." },
  { term: "Light mode", kind: "Setting", step: 3, see: ["Gate", "Auto mode"], meaning: "You answer the gates and accept each stage." },
  { term: "Auto mode", kind: "Setting", step: 3, see: ["Gate", "Principal Investigator", "Light mode"], meaning: "The PI decides. You read the record and can step in." },
  { term: "Review model", kind: "Role", step: 5, see: ["Finding", "Send back", "Stage"], meaning: "A different model from the one that drafted. It reviews the stage's output." },
  { term: "Finding", kind: "Flag", step: 5, see: ["Review model", "Obligation", "Send back"], meaning: "Something a reviewer flags. A blocking finding stops a stage being published as reviewed." },
  { term: "Send back", kind: "Decision", step: 5, see: ["Finding", "Review model"], meaning: "Returning work for revision. Bounded, so a run always ends." },
  { term: "Critic", kind: "Role", step: 6, see: ["Charter", "Principal Investigator", "Finding"], meaning: "Reviews each finished stage against the charter, accepted risks and your directives." },
  { term: "Principal Investigator", kind: "Role", step: 6, see: ["Charter", "Critic", "Auto mode"], meaning: "The AI PI. Writes the charter, accepts or sends back stages, writes the closing report." },
  { term: "Obligation", kind: "Open risk", step: 6, see: ["Finding", "Principal Investigator"], meaning: "A finding still open when a stage is accepted. It travels with the run as a known risk." },
  { term: "Token budget", kind: "Limit", step: 8, see: ["Research case", "Principal Investigator"], meaning: "One limit for a run, covering every stage and PI consultation." },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

export function Lexicon({ onJump }: { onJump: (step: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const entry = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState("Gate");
  const [hover, setHover] = useState<string | null>(null);
  const current = lexicon.find((item) => item.term === (hover ?? pick)) ?? lexicon[8];
  useSwap(entry, current.term, current.kind);

  // The words set themselves like a poster as the section arrives, in the order a run meets them.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".lex-word > span", {
          yPercent: 105,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.035,
          scrollTrigger: { trigger: ".lex-cloud", start: "top 78%", once: true },
        });
        gsap.from(".lex-entry", {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".lex-entry", start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const state = (term: string) => (term === current.term ? "on" : current.see.includes(term) ? "near" : undefined);

  return (
    <section ref={root} id="terms" className="lexicon" aria-labelledby="terms-title">
      <div className="wrap">
        <div className="lex-head">
          <h2 id="terms-title" className="label">
            The words, plainly
          </h2>
          <p>Eighteen terms the product uses everywhere. Pick one and its relatives light up.</p>
        </div>
        <div className="lex-cloud" role="group" aria-label="Terms">
          {lexicon.map((item, index) => (
            <Fragment key={item.term}>
              <button
                type="button"
                className="lex-word"
                data-state={state(item.term)}
                aria-pressed={pick === item.term}
                onClick={() => setPick(item.term)}
                onPointerEnter={() => setHover(item.term)}
                onPointerLeave={() => setHover(null)}
              >
                <span>{item.term}</span>
              </button>
              {index < lexicon.length - 1 && (
                <span className="lex-sep" aria-hidden="true">
                  /
                </span>
              )}
            </Fragment>
          ))}
        </div>
        <div ref={entry} className="lex-entry" aria-live="polite">
          <div className="lex-name">
            <span key={current.kind} className="lex-kind" data-swap="code">
              {current.kind}
            </span>
            <h3 key={current.term} data-swap="title">
              {current.term}
            </h3>
          </div>
          <p className="lex-meaning" data-swap="text">
            {current.meaning}
          </p>
          <div className="lex-see" data-swap="text">
            <span>See also</span>
            {current.see.map((term) => (
              <button key={term} type="button" onClick={() => setPick(term)}>
                {term}
              </button>
            ))}
          </div>
          <button type="button" className="lex-fig" onClick={() => onJump(current.step)}>
            <span>Drawn on Fig 1</span>
            Step {pad(current.step)}
            <Arrow diagonal />
          </button>
        </div>
      </div>
    </section>
  );
}

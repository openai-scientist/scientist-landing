"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Each line is checked against the services: rows stay out of model prompts unless the experimental
   explore step is switched on, and data-connection credentials are sealed with Fernet before storage. */
const lines = [
  { topic: "Your experiment", does: "Designed, then reviewed", never: "Run or judged for you" },
  { topic: "Statistics", does: "Computed in code", never: "Written by a model" },
  { topic: "Your rows", does: "Turned into a data card", never: "Sent to a model", note: "Unless you switch on the experimental explore step." },
  { topic: "Credentials", does: "Encrypted before storage", never: "Kept in plain text" },
  { topic: "Open findings", does: "Sent back, a bounded number of times", never: "Left out of the report" },
];

export function Limits() {
  const root = useRef<HTMLElement>(null);

  // Each refusal is struck through as its line scrolls in, like an editor's pen.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".lim-row").forEach((row) => {
          const trigger = { trigger: row, start: "top 82%", once: true };
          gsap.from(row, { autoAlpha: 0, y: 16, duration: 0.6, ease: "power3.out", scrollTrigger: trigger });
          gsap.from(row.querySelector(".lim-strike"), {
            backgroundSize: "0% 1.5px",
            duration: 0.8,
            delay: 0.25,
            ease: "power2.inOut",
            scrollTrigger: trigger,
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="limits" className="lim" aria-labelledby="limits-title">
      <div className="wrap">
        <div className="lim-head">
          <p className="section-mark label" data-sc-in>
            <span>05</span>Where it stops
          </p>
          <h2 id="limits-title" data-sc-in>
            What it always does. <span>What it never does.</span>
          </h2>
        </div>
        <div className="lim-table" role="table" aria-label="What it does and what it never does">
          <div className="lim-row lim-cols" role="row">
            <span className="label" role="columnheader">
              Part
            </span>
            <span className="label" role="columnheader">
              Always
            </span>
            <span className="label" role="columnheader">
              Never
            </span>
          </div>
          {lines.map((line) => (
            <div key={line.topic} className="lim-row" role="row">
              <span className="lim-topic" role="rowheader">
                {line.topic}
              </span>
              <p role="cell">
                <span className="lim-tag label" aria-hidden="true">
                  Always
                </span>
                <span>{line.does}</span>
              </p>
              <p role="cell" className="lim-never">
                <span className="lim-tag label" aria-hidden="true">
                  Never
                </span>
                <span>
                  <span className="lim-strike">{line.never}</span>
                </span>
                {line.note && <small>{line.note}</small>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

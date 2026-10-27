"use client";

import { useEffect, useRef, useState } from "react";
import figures from "@/generated/figures.json";
import { useSwap } from "./swap";

const nodes = [
  {
    id: "browser",
    kind: "Browser",
    name: "Workspace",
    role: "In your browser",
    owns: "Projects, datasets, the research flow and the run studio.",
    talks: "Only to the Platform: HTTP for every action, a server-sent event stream for the live run.",
  },
  {
    id: "platform",
    kind: "Door",
    name: "Platform",
    role: "The only service a person talks to",
    owns: "Users, projects, data, runs, gates, the token budget, model keys and an audit log of every change. It never reads or judges the science.",
    talks: "Drives each engine over HTTP and consults the oversight service. They answer through callbacks with events and artifacts.",
  },
  {
    id: "dataset",
    kind: "Engine",
    name: "Dataset engine",
    role: "Stage engine",
    owns: "The data card and the research brief. Numbers come from code; no data row reaches a model or an artifact.",
    talks: "Started by the Platform with the case and keys. Uploads its artifacts back, then the next stage reads them.",
  },
  {
    id: "hypothesis",
    kind: "Engine",
    name: "Hypothesis engine",
    role: "Stage engine",
    owns: "Searches, the shortlist, evidence cards, gaps, the hypotheses and their argument map.",
    talks: "Reads Semantic Scholar and OpenAlex. Sends events and artifacts to the Platform as it goes.",
  },
  {
    id: "design",
    kind: "Engine",
    name: "Experiment design engine",
    role: "Stage engine",
    owns: "A reviewed, researcher-readable experiment plan grounded in real datasets, baselines and code.",
    talks: "Reads the hypotheses as its input artifacts. Publishes the exact reviewed plan.",
  },
  {
    id: "oversight",
    kind: "PI · Critic",
    name: "Oversight",
    role: "The AI PI and the Critic",
    owns: "The charter, each stage's outcome, the response to a failure and the closing report.",
    talks: "Consulted by the Platform at each decision point. The Critic reviews on a different model, with read-only tools.",
  },
];

const rules = [
  "No service imports another. They talk only over HTTP.",
  "Model keys arrive with each request and are never written to disk, logs or events.",
  "A new stage is configuration on the Platform, not new Platform code.",
];

export function SystemRack() {
  const figure = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState("platform");
  const current = nodes.find((node) => node.id === pick) ?? nodes[1];
  const detail = useRef<HTMLDivElement>(null);
  useSwap(detail, pick, current.role);

  useEffect(() => {
    const root = figure.current;
    if (!root) return;
    root.querySelectorAll("[data-node], [data-link]").forEach((el) => {
      const id = el.getAttribute("data-node") ?? el.getAttribute("data-link");
      // The Platform lights every line, since every line runs through it.
      const on = id === pick || (el.hasAttribute("data-link") && pick === "platform");
      el.toggleAttribute("data-on", on);
    });
  }, [pick]);

  return (
    <section id="system" className="rack" aria-labelledby="rack-title" data-sc-act="flow">
      <div className="wrap rack-grid">
        <div className="rack-copy">
          <p className="section-mark label" data-sc-in>
            <span>02</span>How it is built
          </p>
          <h2 id="rack-title" data-sc-in>
            One door in.
            <br />
            <span>Engines behind it.</span>
          </h2>
          <p className="rack-intro" data-sc-in>
            You only ever talk to the Platform. It keeps the record and the budget; the science happens in engines it starts and the PI it
            consults. Pick a part to see what it owns.
          </p>
          <div className="rack-key" role="tablist" aria-label="Parts of the system">
            {nodes.map((node, index) => (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={pick === node.id}
                aria-controls="rack-detail"
                onClick={() => setPick(node.id)}
                onPointerEnter={() => setPick(node.id)}
              >
                <span className="rack-key-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="rack-key-name">{node.name}</span>
                <span className="rack-key-kind">{node.kind}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="rack-side">
        <figure className="rack-plate" data-sc-in>
          <div className="plate-corners" aria-hidden="true">
            <span data-corner="fig">Fig 2</span>
            <span data-corner="title">The dispatch rack</span>
            <span data-corner="hint">Solid line: request · dashed: callback</span>
            <span data-corner="readout">{current.name}</span>
          </div>
          <div
            ref={figure}
            className="rack-figure iso"
            data-theme="light"
            data-pick={pick}
            // Built once at build time from the Anatomy kit; it holds no user content.
            dangerouslySetInnerHTML={{ __html: figures.rack.svg }}
          />
        </figure>
          <div ref={detail} id="rack-detail" className="rack-detail" role="tabpanel" aria-live="polite">
            <div className="rack-name">
              <p key={current.role} className="rack-role" data-swap="code">
                {current.role}
              </p>
              <h3 key={current.name} data-swap="title">
                {current.name}
              </h3>
            </div>
            <dl className="rack-spec">
              <div data-swap="text">
                <dt>Owns</dt>
                <dd>{current.owns}</dd>
              </div>
              <div data-swap="text">
                <dt>Talks to</dt>
                <dd>{current.talks}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className="wrap rack-rules">
        <p className="label">Three rules it keeps</p>
        <ol data-sc-in data-sc-stagger="70">
          {rules.map((rule, index) => (
            <li key={rule}>
              <span className="label">Rule {String(index + 1).padStart(2, "0")}</span>
              {rule}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

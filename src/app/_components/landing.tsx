"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APP_LOGIN_URL, BRAND } from "@/config/brand";
import { Hero } from "./hero";
import { Arrow, BrandMark } from "./icons";
import { Lottie } from "./lottie";
import { type LineHandle, ResearchLine } from "./research-line";
import { SystemRack } from "./system-rack";

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root: Element, options?: { lerp: number }) => { destroy: () => void };
      instances: unknown[];
    };
  }
}

const sections = [
  { title: "How a run works", subtitle: "Follow one run down the research line", href: "#line" },
  { title: "The system", subtitle: "The Platform, the engines and oversight", href: "#system" },
  { title: "Using it", subtitle: "From a new project to the closing report", href: "#using" },
  { title: "Terms", subtitle: "Every word the product uses, in one line each", href: "#terms" },
  { title: "Questions", subtitle: "Control, sources, disagreements and limits", href: "#questions" },
];

const usage = [
  {
    title: "Start a project",
    text: "Create a project and invite people. Each member has one role: Project Manager, Researcher or Reviewer.",
    specimen: (
      <ul className="spec-rows">
        <li>
          <span className="spec-avatar">AL</span>Project Manager
        </li>
        <li>
          <span className="spec-avatar">MN</span>Researcher
        </li>
        <li>
          <span className="spec-avatar">TH</span>Reviewer
        </li>
      </ul>
    ),
  },
  {
    title: "Bring data, if you have it",
    text: "Upload CSV or XLSX, or import from PostgreSQL, MySQL, BigQuery, Google Sheets and more. Datasets are versioned, never overwritten.",
    specimen: (
      <ul className="spec-rows">
        <li>
          <span className="spec-file" />
          enrolment.csv<span className="spec-chip">v3</span>
        </li>
        <li>
          <span className="spec-file" />
          BigQuery · cohorts<span className="spec-chip">v1</span>
        </li>
      </ul>
    ),
  },
  {
    title: "Write the case",
    text: "One question, the kind of answer you want, and what you will do with the result. Context and constraints are optional.",
    specimen: (
      <div className="spec-case">
        <p>Does more sleep go with higher exam scores among our undergraduates?</p>
        <div>
          <span className="spec-chip is-on">Test a claim</span>
          <span className="spec-chip">Compare</span>
          <span className="spec-chip">Explain</span>
        </div>
      </div>
    ),
  },
  {
    title: "Choose how involved you are",
    text: "Light mode stops at each gate for you. Auto mode lets the PI decide while you read the record as it grows.",
    specimen: (
      <div className="spec-toggle">
        <span className="is-on">Light</span>
        <span>Auto</span>
      </div>
    ),
  },
  {
    title: "Answer the stops",
    text: "Approve the reading list, pick hypotheses, accept a stage or send it back. Every decision is logged with who made it.",
    specimen: (
      <div className="spec-gate">
        <p>Shortlist ready · 24 papers</p>
        <div>
          <span className="spec-button is-on">Approve</span>
          <span className="spec-button">Send back</span>
        </div>
      </div>
    ),
  },
  {
    title: "Read what it made",
    text: "Hypotheses with their evidence, the argument map, the reviewed plan and a closing report that names what is still open.",
    specimen: (
      <ul className="spec-rows">
        <li>
          <span className="spec-file" />
          hypotheses<span className="spec-chip">reviewed</span>
        </li>
        <li>
          <span className="spec-file" />
          argument map
        </li>
        <li>
          <span className="spec-file" />
          closing report<span className="spec-chip">2 open</span>
        </li>
      </ul>
    ),
  },
];

const terms = [
  ["Research case", "Your question, intent, context, constraints and references. Versioned; only you amend it."],
  ["Charter", "The PI's reading of the case: what the run is for and how it will be judged."],
  ["Pipeline", "The order of stages. dataset_first with a dataset, default without one."],
  ["Stage", "One engine's part of a run: draft, independent review, revise."],
  ["Engine", "A service that does the science of one stage. It has no screen of its own."],
  ["Gate", "A point where a run waits for a decision: yours in light mode, a rule's or the PI's in auto."],
  ["Light mode", "You answer the gates and accept each stage."],
  ["Auto mode", "The PI decides. You read the record and can step in."],
  ["Review model", "A different model from the one that drafted. It reviews the stage's output."],
  ["Finding", "Something a reviewer flags. A blocking finding stops a stage being published as reviewed."],
  ["Send back", "Returning work for revision. Bounded, so a run always ends."],
  ["Critic", "Reviews each finished stage against the charter, accepted risks and your directives."],
  ["Principal Investigator", "The AI PI. Writes the charter, accepts or sends back stages, writes the closing report."],
  ["Obligation", "A finding still open when a stage is accepted. It travels with the run as a known risk."],
  ["Evidence card", "What a paper says, extracted from its abstract and linked to its source."],
  ["Argument map", "How hypotheses, evidence and objections connect."],
  ["Data card", "A profile of every column, computed in code. Models see this, never the rows."],
  ["Token budget", "One limit for a run, covering every stage and PI consultation."],
];

const questions = [
  {
    q: "What does a run produce?",
    a: "Evidence-linked hypotheses with their argument map and an independently reviewed experiment plan. With a dataset, a data card and research brief come first. The closing report records the outcome and every open obligation.",
  },
  {
    q: "Does it run my experiment?",
    a: "No. It designs the experiment and reviews the plan. Running the study, and the scientific judgment about its results, stay with you.",
  },
  {
    q: "Can I stay in control of the decisions?",
    a: "Yes. In light mode the run stops at each gate for you. In auto mode the PI decides, and every decision, finding and artifact stays visible in the record.",
  },
  {
    q: "Where do the evidence and the data come from?",
    a: "Literature comes from Semantic Scholar and OpenAlex, plus papers you add yourself. Data comes from your uploads or your data connections. Statistics are computed by code, never written by a model.",
  },
  {
    q: "What happens when the reviewers disagree?",
    a: "A blocking finding sends work back for revision a bounded number of times. If it is still open when the stage is accepted, it becomes an obligation and the closing report must name it.",
  },
  {
    q: "Is this affiliated with OpenAI?",
    a: `No. ${BRAND.independence} ${BRAND.name} is the name of this research platform.`,
  },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const search = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const line = useRef<LineHandle>(null);
  const scrollcraft = useRef<{ destroy: () => void } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");

  const mountScrollCraft = useCallback(() => {
    if (!root.current || !window.ScrollCraft || scrollcraft.current) return;
    // A phone reads the usage steps as a list; the sideways pan is for wide screens.
    const pan = root.current.querySelector("#using");
    if (pan && window.matchMedia("(max-width: 860px)").matches) pan.setAttribute("data-sc-act", "flow");
    scrollcraft.current = window.ScrollCraft.mount(root.current, { lerp: 0.15 });
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    mountScrollCraft();
    const onScroll = () => header.current?.classList.toggle("is-scrolled", window.scrollY > 40);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        search.current?.showModal();
        searchInput.current?.focus();
      }
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      scrollcraft.current?.destroy();
      scrollcraft.current = null;
    };
  }, [mountScrollCraft]);

  useEffect(() => {
    if (!root.current) return;
    let timer: ReturnType<typeof setTimeout>;
    let height = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (Math.abs(entry.contentRect.height - height) < 1) return;
      height = entry.contentRect.height;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(root.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const openSearch = () => {
    search.current?.showModal();
    searchInput.current?.focus();
  };
  const found = sections.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={root} className="landing">
      <Script src="/vendor/scrollcraft.js" strategy="afterInteractive" onReady={mountScrollCraft} />
      <header ref={header} className="site-header">
        <div className="header-inner wrap">
          <a className="wordmark" href="#main" aria-label={`${BRAND.name}, back to top`} onClick={() => setMenuOpen(false)}>
            <BrandMark />
            <span>{BRAND.name}</span>
          </a>
          <nav className="desktop-nav" aria-label="Main">
            {sections.map((item) => (
              <a key={item.href} href={item.href}>
                {item.title === "How a run works" ? "How it runs" : item.title}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button type="button" className="icon-button" aria-label="Search this page" aria-keyshortcuts="Meta+K" onClick={openSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <a className="button button-outline header-sign-in" href={APP_LOGIN_URL}>
              Sign in
            </a>
            <a className="button button-paper header-cta" href={APP_LOGIN_URL}>
              Get started
            </a>
            <button
              type="button"
              className={`menu-button ${menuOpen ? "is-open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close the menu" : "Open the menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          {sections.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>
                {item.title}
                <small>{item.subtitle}</small>
              </span>
              <Arrow />
            </a>
          ))}
          <a className="button button-ink" href={APP_LOGIN_URL}>
            Get started <Arrow />
          </a>
        </nav>
      )}

      <main id="main">
        <Hero paused={paused} onPause={() => setPaused(!paused)} onStep={(step) => line.current?.goTo(step)} />

        <section className="statement wrap" aria-labelledby="statement-title" data-sc-act="flow">
          <h2 id="statement-title">An answer is not a study.</h2>
          <p data-sc-kinetic="words" data-sc-cue="0.22">
            A chat window gives you an answer. A study needs a trail: where each claim came from, who checked it, and what is still open.{" "}
            <strong>{BRAND.name} builds that trail while it works.</strong>
          </p>
        </section>

        <ResearchLine ref={line} />

        <SystemRack />

        <section id="using" className="using" aria-labelledby="using-title" data-sc-act="pan" data-sc-span="2.6">
          <div className="using-stage" data-sc-stage>
            <div className="using-head wrap">
              <h2 id="using-title">Using it, start to finish.</h2>
              <p>Six things you do. The rest is the run.</p>
            </div>
            <ol className="using-rail" data-sc-pan="0">
              {usage.map((item, index) => (
                <li key={item.title} className="using-card">
                  <span className="using-index">{index + 1}</span>
                  <div className="using-specimen" aria-hidden="true">
                    {item.specimen}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="terms" className="terms wrap" aria-labelledby="terms-title" data-sc-act="flow">
          <div className="terms-head">
            <h2 id="terms-title">The words, plainly.</h2>
            <p>The product uses these terms everywhere: on the research line, in the run studio and in every report.</p>
          </div>
          <dl className="terms-list" data-sc-in data-sc-stagger="30">
            {terms.map(([term, meaning]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="questions" className="questions wrap" aria-labelledby="questions-title">
          <h2 id="questions-title">Questions people ask first.</h2>
          <div className="faq">
            {questions.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span className="faq-icon" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="wrap closing-inner">
            <div className="closing-copy">
              <h2 id="closing-title">
                Bring a question.
                <br />
                Leave with the trail.
              </h2>
              <p>Start with one question. The run keeps every source, decision and open risk next to the answer.</p>
              <div className="closing-actions">
                <a className="button button-paper" href={APP_LOGIN_URL}>
                  Get started <Arrow />
                </a>
                <a className="button button-outline" href={APP_LOGIN_URL}>
                  Sign in
                </a>
              </div>
            </div>
            <Lottie src="/animations/line-bloom.json" speed={0.45} paused={paused} still={0.6} className="closing-bloom" />
          </div>
          <footer className="site-footer wrap">
            <a href="#main" className="wordmark">
              <BrandMark />
              <span>{BRAND.name}</span>
            </a>
            <p>{BRAND.independence}</p>
            <p>
              © {new Date().getFullYear()} {BRAND.name}
            </p>
          </footer>
        </section>
      </main>

      <dialog
        ref={search}
        className="search-dialog"
        aria-label="Search this page"
        onClick={(event) => {
          if (event.target === event.currentTarget) search.current?.close();
        }}
      >
        <div className="search-inner">
          <div className="search-top">
            <label htmlFor="site-search">Jump to a section</label>
            <button type="button" onClick={() => search.current?.close()} aria-label="Close search">
              Esc
            </button>
          </div>
          <input
            ref={searchInput}
            id="site-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “gate”, “system” or “terms”"
            autoComplete="off"
          />
          <div className="search-results">
            {found.length ? (
              found.map((item) => (
                <a href={item.href} key={item.href} onClick={() => search.current?.close()}>
                  <span>
                    {item.title}
                    <small>{item.subtitle}</small>
                  </span>
                  <Arrow />
                </a>
              ))
            ) : (
              <p>No section matches. Try “run”, “system” or “terms”.</p>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}

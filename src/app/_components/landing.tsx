"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APP_LOGIN_URL, BRAND } from "@/config/brand";
import { Hero } from "./hero";
import { Lexicon } from "./lexicon";
import { Arrow, BrandMark } from "./icons";
import { Lottie } from "./lottie";
import { Manuscript } from "./manuscript";
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
    // In-page links scroll to their section without writing a #fragment into the address bar.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      if (!link || !id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // To the section's very top: every section clears the header with its own padding, and the pinned ones
      // only lock in place from there.
      const top = id === "main" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
      // Keyboard and screen reader users land where the link points, as a real jump would take them.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
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

        <Manuscript />

        <Lexicon onJump={(step) => line.current?.goTo(step)} />

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

"use client";

import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APP_LOGIN_URL, BRAND } from "@/config/brand";
import { Arrow, Play } from "./icons";
import { Lottie } from "./lottie";
import { type Boundary, SplitField } from "./split-field";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const facts = [
  { value: "3", label: "research engines" },
  { value: "2", label: "models on each stage" },
  { value: "2", label: "literature indexes" },
  { value: "0", label: "statistics written by a model" },
];

export const steps = [
  {
    name: "Understand",
    title: "Turn a question into a research case",
    text: "Say what you want to find out and what you will do with the answer.",
    art: "/animations/understand.json",
    target: 0,
  },
  {
    name: "Explore",
    title: "Search and screen the literature",
    text: "Semantic Scholar and OpenAlex, searched, scored and read into evidence cards.",
    art: "/animations/explore.json",
    target: 4,
  },
  {
    name: "Reason",
    title: "Hypotheses that argue with each other",
    text: "Gaps become hypotheses, debated and then checked by a second model.",
    art: "/animations/reason.json",
    target: 5,
  },
  {
    name: "Plan",
    title: "A reviewed plan with its risks named",
    text: "A critiqued design, numbers from code, every open finding carried forward.",
    art: "/animations/plan.json",
    target: 7,
  },
];

const formations = [
  { name: "Bloom", src: "/animations/line-bloom.json", speed: 0.5 },
  { name: "Focus", src: "/animations/understand.json", speed: 0.8 },
  { name: "Orbit", src: "/animations/reason.json", speed: 0.7 },
];

const outputs = ["Research case", "Evidence", "Hypotheses", "Experiment plan", "Closing report"];

export function Hero({ paused, onPause, onStep }: { paused: boolean; onPause: () => void; onStep: (step: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLOListElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [formation, setFormation] = useState(0);

  // The seam starts after the copy and the menu, then crosses the card row inside the third card, between its
  // text and its drawing, as on the reference: the third card's words sit on paper, its drawing on night.
  const boundary = useCallback((): Boundary | null => {
    const hero = root.current;
    if (!hero || !copy.current || !cards.current || !art.current) return null;
    const box = hero.getBoundingClientRect();
    const local = (r: DOMRect) => ({ left: r.left - box.left, right: r.right - box.left, top: r.top - box.top, bottom: r.bottom - box.top });
    const rects = (selector: string, scope: ParentNode = hero) =>
      Array.from(scope.querySelectorAll(selector))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0)
        .map(local);
    // Pixels never land on words, controls or the drawing.
    const avoid = [
      ...rects(".hero-copy > *"),
      ...rects(".hero-index, .hero-thumbs, .motion-toggle"),
      ...rects(".hero-steps h2, .hero-steps p, .hero-steps .step-name, .hero-steps .round-link, .hero-steps .step-art"),
      ...rects(".wordmark, .desktop-nav, .header-actions", document),
    ];
    const bloom = art.current.querySelector(".hero-pointer")?.getBoundingClientRect();
    const glow = bloom ? { x: local(bloom).left + bloom.width / 2, y: local(bloom).top + bloom.height / 2, r: bloom.width * 0.42 } : null;
    if (box.width < 900) return { axis: "y", at: local(art.current.getBoundingClientRect()).top + 24, glow, avoid };
    const W = box.width;
    const H = box.height;
    let right = 0;
    for (const child of Array.from(copy.current.children)) {
      if (child.classList.contains("hero-facts")) continue;
      right = Math.max(right, local(child.getBoundingClientRect()).right);
    }
    const nav = rects(".desktop-nav", document)[0];
    const third = cards.current.children[2];
    if (!third) return null;
    // Where the words actually end, not the boxes: block labels run the full card width.
    const inked = (el: Element) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return Math.max(...Array.from(range.getClientRects()).map((r) => r.right - box.left));
    };
    const textRight = Math.max(...Array.from(third.querySelectorAll("h2, p")).map(inked));
    const row = local(third.getBoundingClientRect());
    const facts = rects(".hero-facts")[0];
    // As soft at the bottom as at the top: the reference fades over a wide band all the way down.
    const softTop = W * 0.085;
    const softBottom = W * 0.06;
    // Darkness stays under a quarter at the end of the copy and of the menu, so both read as ink on paper.
    const top = Math.max(right + softTop * 0.4, nav ? nav.right + softTop * 0.45 : 0);
    // A wavy S through anchors, each set by what must stay legible beside it: out to the right above the
    // copy, close past the title, curling back in toward the stats, then swinging out through the cards so
    // the third card's words stay on paper while its drawing, its arrow and the fourth card go to night.
    const softAt = (t: number) => softTop + (softBottom - softTop) * t;
    const title = rects(".hero-title")[0];
    const titleT = title ? (title.top + title.bottom) / 2 / H : 0.3;
    const factsT = facts ? (facts.top + facts.bottom) / 2 / H : 0.6;
    const inner = Math.max(facts ? facts.right + softAt(factsT) * 0.5 : 0, top - W * 0.05);
    const cardT = (row.top + 60) / H;
    const out = textRight + softAt(cardT) * 0.35;
    const points: [number, number][] = [
      [0, top + W * 0.035],
      [titleT, top],
      [factsT, inner],
      [cardT, out],
      [1, out + W * 0.012],
    ];
    return {
      axis: "x",
      points,
      softTop,
      softBottom,
      rowTop: row.top / H,
      glow,
      avoid,
      margin: local(copy.current.getBoundingClientRect()).left - 14,
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero-eyebrow", { y: 12, autoAlpha: 0, duration: 0.7 }, 0.1)
          .from(".hero-title > span", { yPercent: 108, duration: 1.15 }, 0.15)
          .from(".hero-lede, .hero-body, .hero-actions", { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.45)
          .from(".hero-facts > div", { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 0.7)
          .from(".hero-bloom", { scale: 0.86, rotation: -8, autoAlpha: 0, duration: 1.6 }, 0.1)
          .from(".hero-index li, .hero-thumbs button", { autoAlpha: 0, x: 10, duration: 0.8, stagger: 0.05 }, 0.8)
          .from(".hero-steps > li", { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.85);

        // Three planes leave at different rates: the bloom sinks, the index drifts, the copy stays put.
        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(".hero-depth", { yPercent: 14, scale: 1.06, ease: "none", scrollTrigger: scroll });
        gsap.to(".hero-index, .hero-thumbs", { yPercent: -30, ease: "none", scrollTrigger: scroll });
        gsap.to(".split-field", { yPercent: 8, ease: "none", scrollTrigger: scroll });

        const fine = window.matchMedia("(pointer: fine)");
        const target = root.current?.querySelector<HTMLElement>(".hero-pointer");
        if (!fine.matches || !target || !root.current) return;
        const xTo = gsap.quickTo(target, "x", { duration: 1.3, ease: "power3.out" });
        const yTo = gsap.quickTo(target, "y", { duration: 1.3, ease: "power3.out" });
        const host = root.current;
        const move = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          xTo((event.clientX / rect.width - 0.5) * 28);
          yTo(((event.clientY - rect.top) / rect.height - 0.5) * 22);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        host.addEventListener("pointermove", move);
        host.addEventListener("pointerleave", leave);
        return () => {
          host.removeEventListener("pointermove", move);
          host.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const current = formations[formation];

  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <SplitField boundary={boundary} paused={paused} />
      <div className="hero-main wrap">
        <div ref={copy} className="hero-copy">
          <p className="hero-eyebrow label">From a question to a reviewed research plan</p>
          <h1 id="hero-title" className="hero-title">
            <span>{BRAND.name}</span>
          </h1>
          <p className="hero-lede">A research AI that turns your question into evidence-linked hypotheses and a reviewed experiment plan.</p>
          <p className="hero-body">
            It searches the literature, ties every claim to a source and has a second model check each stage. You make the calls that need judgment.
          </p>
          <div className="hero-actions">
            <a className="button button-ink" href={APP_LOGIN_URL}>
              Get started <Arrow />
            </a>
            <a className="watch-link" href="#line">
              <span className="watch-icon">
                <Play paused />
              </span>
              <span>
                Watch a run
                <small>Scroll the research line</small>
              </span>
            </a>
          </div>
          <dl className="hero-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd data-sc-count={`0 ${fact.value}`} data-sc-count-ms="1100">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div ref={art} className="hero-art">
          <span className="hero-axis hero-axis-x" aria-hidden="true" />
          <span className="hero-axis hero-axis-y" aria-hidden="true" />
          <div className="hero-depth">
            <div className="hero-pointer">
              <Lottie
                key={current.src}
                src={current.src}
                speed={current.speed}
                paused={paused}
                still={0.48}
                className={`hero-bloom formation-${formation}`}
                label={`${current.name}: an animated line drawing`}
              />
            </div>
          </div>
          <ol className="hero-index label" aria-label="What a run produces">
            {outputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className="hero-thumbs" role="group" aria-label="Choose the drawing">
            {formations.map((item, index) => (
              <button key={item.name} type="button" aria-pressed={formation === index} aria-label={`Show ${item.name.toLowerCase()}`} onClick={() => setFormation(index)}>
                <Lottie src={item.src} still={0.48} paused className="thumb-art" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="motion-toggle label"
            aria-pressed={paused}
            aria-label={paused ? "Play the animations" : "Pause the animations"}
            onClick={onPause}
          >
            <Play paused={paused} />
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
      <ol ref={cards} className="hero-steps wrap" aria-label="How a run works">
        {steps.map((step, index) => (
          <li key={step.name} className={index > 2 ? "on-dark" : ""}>
            <span className="step-name label">
              <span>0{index + 1}</span>
              {step.name}
            </span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
            <Lottie src={step.art} paused={paused} still={0.35} className="step-art" />
            <button type="button" className="round-link" aria-label={`See ${step.name.toLowerCase()} on the research line`} onClick={() => onStep(step.target)}>
              <Arrow />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

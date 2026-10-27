"use client";

import { type RefObject, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

/**
 * Plays the swap when a detail panel changes what it shows. Marked children:
 * [data-swap="title"] rises line by line out of a mask, [data-swap="count"] rolls up,
 * [data-swap="code"] decodes from the previous value, [data-swap="text"] fades up.
 * Keyed elements are remounted by React, so splitting them never fights a re-render.
 */
export function useSwap(scope: RefObject<HTMLElement | null>, key: string | number, code?: string) {
  const first = useRef(true);
  const previous = useRef(code);

  useGSAP(
    () => {
      const from = previous.current;
      previous.current = code;
      if (first.current) {
        first.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;
        const ease = "power3.out";
        const title = root.querySelector<HTMLElement>('[data-swap="title"]');
        const split = title ? SplitText.create(title, { type: "lines", mask: "lines" }) : null;
        if (split) gsap.from(split.lines, { yPercent: 110, duration: 0.7, ease, stagger: 0.07 });
        gsap.from('[data-swap="count"]', { yPercent: 100, duration: 0.6, ease });
        gsap.from('[data-swap="text"]', { y: 10, autoAlpha: 0, duration: 0.55, ease, stagger: 0.06, delay: 0.08 });
        const target = root.querySelector<HTMLElement>('[data-swap="code"]');
        if (target && code && from && from !== code) {
          target.textContent = from;
          gsap.to(target, { duration: 0.7, ease: "none", scrambleText: { text: code, chars: "abcdefghijklmnopqrstuvwxyz_./·", speed: 0.6 } });
        }
        return () => {
          split?.revert();
          // Reverting the decode would leave the old value showing; put the current one back after it.
          queueMicrotask(() => {
            if (target?.isConnected && code) target.textContent = code;
          });
        };
      });
      return () => mm.revert();
    },
    { dependencies: [key], scope, revertOnUpdate: true },
  );
}

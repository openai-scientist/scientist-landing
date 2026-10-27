"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

/* A lazy, looping Lottie. It loads only when it nears the viewport, plays only while visible, and holds one
   frame under reduced motion or when the visitor pauses ambient motion. Strokes take currentColor from CSS. */
export function Lottie({
  src,
  className = "",
  paused = false,
  speed = 1,
  still = 0.4,
  label,
}: {
  src: string;
  className?: string;
  paused?: boolean;
  speed?: number;
  /** The share of the loop shown as a still frame. */
  still?: number;
  label?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<AnimationItem | null>(null);
  const pausedRef = useRef(paused);
  const sync = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let cancelled = false;
    let inView = false;
    let requested = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const anim = player.current;
      if (!anim) return;
      if (reduce.matches || pausedRef.current) {
        anim.goToAndStop(Math.round(anim.totalFrames * still), true);
        return;
      }
      if (inView && !document.hidden) anim.play();
      else anim.pause();
    };
    sync.current = update;
    const controller = new AbortController();
    const load = () => {
      requested = true;
      void Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch(src, { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("Animation unavailable");
          return response.json();
        }),
      ])
        .then(([{ default: lottie }, data]) => {
          if (cancelled) return;
          const anim = lottie.loadAnimation({
            container: element,
            renderer: "svg",
            loop: true,
            autoplay: false,
            animationData: data,
            rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
          });
          anim.setSpeed(speed);
          player.current = anim;
          anim.addEventListener("DOMLoaded", () => {
            if (cancelled) return;
            anim.goToAndStop(Math.round(anim.totalFrames * still), true);
            setReady(true);
            update();
          });
        })
        .catch(() => {
          /* The fallback stays when the optional animation cannot load. */
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !requested) load();
        update();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    reduce.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelled = true;
      controller.abort();
      observer.disconnect();
      reduce.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      player.current?.destroy();
      player.current = null;
    };
  }, [src, speed, still]);

  useEffect(() => {
    pausedRef.current = paused;
    sync.current();
  }, [paused]);

  return (
    <div
      className={`lottie ${ready ? "is-ready" : ""} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div ref={container} className="lottie-surface" />
    </div>
  );
}

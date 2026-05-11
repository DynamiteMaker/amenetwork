"use client";

import { useEffect, useRef } from "react";

interface TiltOptions {
  max?: number;
  scale?: number;
  perspective?: number;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(opts: TiltOptions = {}) {
  const { max = 6, scale = 1.02, perspective = 900 } = opts;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let targetRX = 0;
    let targetRY = 0;
    let curRX = 0;
    let curRY = 0;
    let active = false;

    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";
    el.style.transition = "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)";

    const apply = () => {
      curRX += (targetRX - curRX) * 0.18;
      curRY += (targetRY - curRY) * 0.18;
      const s = active ? scale : 1;
      el.style.transform = `perspective(${perspective}px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg) scale(${s})`;
      if (Math.abs(curRX - targetRX) > 0.01 || Math.abs(curRY - targetRY) > 0.01) {
        raf = requestAnimationFrame(apply);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * max * 2;
      targetRX = -py * max * 2;
      el.style.transition = "transform 80ms linear";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    const onEnter = () => { active = true; };
    const onLeave = () => {
      active = false;
      targetRX = 0;
      targetRY = 0;
      el.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, scale, perspective]);

  return ref;
}

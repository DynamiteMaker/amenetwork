"use client";

import { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

type Variant = "fade-up" | "fade-scale" | "slide-left" | "slide-right" | "blur";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  variant?: Variant;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "aside";
}

const hiddenStyles: Record<Variant, string> = {
  "fade-up": "opacity-0 translate-y-4",
  "fade-scale": "opacity-0 scale-[0.96]",
  "slide-left": "opacity-0 -translate-x-6",
  "slide-right": "opacity-0 translate-x-6",
  blur: "opacity-0 blur-md",
};

const shownStyles: Record<Variant, string> = {
  "fade-up": "opacity-100 translate-y-0",
  "fade-scale": "opacity-100 scale-100",
  "slide-left": "opacity-100 translate-x-0",
  "slide-right": "opacity-100 translate-x-0",
  blur: "opacity-100 blur-0",
};

export function Reveal({
  children,
  delay = 0,
  duration = 700,
  variant = "fade-up",
  className,
  as: Tag = "div",
}: RevealProps) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      style={{
        transitionDelay: shown ? `${delay}ms` : "0ms",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={cn(
        "transition-all will-change-[opacity,transform,filter] motion-reduce:transition-none",
        shown ? shownStyles[variant] : hiddenStyles[variant],
        className
      )}
    >
      {children}
    </Tag>
  );
}

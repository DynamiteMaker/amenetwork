"use client";

import { ReactNode, ElementType } from "react";
import { useTilt } from "@/hooks/use-tilt";
import { cn } from "@/lib/utils";

interface TiltProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  max?: number;
  scale?: number;
}

export function Tilt({ children, className, as: Tag = "div", max = 6, scale = 1.02 }: TiltProps) {
  const ref = useTilt<HTMLElement>({ max, scale });
  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}

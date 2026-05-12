"use client";

import { useTranslations } from "next-intl";
import { Ear, Target, MagicWand, Gauge } from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";

const ICONS = [Ear, Target, MagicWand, Gauge];

const STEP_COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--peach))",
  "hsl(var(--lilac))",
  "hsl(var(--champagne))",
];

export function ProcessSection() {
  const t = useTranslations("home");
  const steps = t.raw("processSteps") as { title: string; desc: string }[];

  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">{t("processEyebrow")}</span>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="display-lg mt-4">{t("processTitle")}</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={step.title} delay={i * 100}>
                <div className="relative p-6 rounded-2xl bg-bg border border-line hover:shadow-md transition-shadow">
                  {/* Step number */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-bg mb-4"
                    style={{ backgroundColor: STEP_COLORS[i] }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <Icon
                    size={28}
                    weight="duotone"
                    aria-hidden="true"
                    className="mb-3"
                    style={{ color: STEP_COLORS[i] }}
                  />

                  <h3 className="font-display text-lg mb-1.5">{step.title}</h3>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Connecting line (hidden on last item and mobile) */}
                  {i < steps.length - 1 && (
                    <div
                      aria-hidden
                      className="hidden lg:block absolute top-11 -right-3 w-6 h-px bg-line"
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

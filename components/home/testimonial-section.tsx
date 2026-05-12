"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";

export function TestimonialSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-24 bg-bg-2/60">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            {/* Decorative quote mark */}
            <div
              aria-hidden
              className="quote-mark-bg text-brand-soft select-none mb-4"
            >
              &ldquo;
            </div>

            <blockquote className="relative z-10 font-display text-xl md:text-2xl leading-relaxed text-ink">
              {t("quote")}
              <span className="italic-accent">{t("quoteAccent")}</span>
            </blockquote>

            <div className="mt-6 relative z-10">
              <div className="font-display text-ink">{t("quoteAuthor")}</div>
              <div className="text-sm text-ink-2 mt-0.5">
                {t("quoteRole")}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

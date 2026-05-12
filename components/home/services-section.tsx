"use client";

import { useTranslations } from "next-intl";
import { Compass, PenNib, ChartLineUp } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/reveal";
import { Tilt } from "@/components/tilt";

const ICONS = [Compass, PenNib, ChartLineUp];

const CARD_ACCENTS = [
  { bg: "hsl(var(--brand-soft))", color: "hsl(var(--brand))" },
  { bg: "hsl(var(--peach) / 0.15)", color: "hsl(var(--peach))" },
  { bg: "hsl(var(--lilac) / 0.18)", color: "hsl(var(--lilac))" },
];

export function ServicesSection() {
  const t = useTranslations("home");
  const services = t.raw("services") as { title: string; desc: string }[];

  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">{t("servicesEyebrow")}</span>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="display-lg mt-4">
            {t("servicesTitle")}
            <span className="italic-accent">{t("servicesTitleAccent")}</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = ICONS[i];
            const accent = CARD_ACCENTS[i];
            return (
              <Reveal key={service.title} delay={i * 100}>
                <Tilt>
                  <div className="card-soft p-8 h-full">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: accent.bg }}
                    >
                      <Icon
                        size={24}
                        weight="duotone"
                        aria-hidden="true"
                        style={{ color: accent.color }}
                      />
                    </div>
                    <h3 className="font-display text-xl mb-2">
                      {service.title}
                    </h3>
                    <p className="text-ink-2 text-sm leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </Tilt>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={300}>
          <div className="mt-10 text-center">
            <Link href="/services" className="link-arrow">
              {t("seeAllServices")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/reveal";

export function HeroSection() {
  const t = useTranslations("home");
  const common = useTranslations("common");

  const stats = [t("metaYears"), t("metaProjects"), t("metaMarkets")];

  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-16 md:pb-20">
      {/* Background decoration */}
      <div aria-hidden className="absolute top-0 -left-40 w-80 h-80 rounded-full bg-brand-soft/30 blur-3xl" />
      <div aria-hidden className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-peach/15 blur-3xl" />

      <div className="container-page relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        {/* Text content */}
        <div>
          <Reveal>
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="pulse-dot" />
              {t("eyebrow")}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="display-xl mt-5">
              {t("h1a")}
              <br />
              {t("h1b")}{" "}
              <span className="text-gradient-brand italic-accent">
                {t("h1cAccent")}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="lead mt-6 max-w-lg">{t("lead")}</p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary-soft">
                {common("startProject")}
              </Link>
              <Link href="/services" className="btn-ghost-soft">
                {t("seeAllServices")}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
              {stats.map((stat) => {
                const [num, ...rest] = stat.split(" ");
                return (
                  <div key={stat} className="flex items-baseline gap-1.5">
                    <span className="font-display text-2xl text-brand">
                      {num}
                    </span>
                    <span className="text-sm text-ink-2">{rest.join(" ")}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Hero image */}
        <Reveal variant="fade-scale" delay={200} className="relative">
          <div
            aria-hidden
            className="absolute -inset-10 soft-blob opacity-40 hidden lg:block"
          />
          <div className="relative max-w-sm mx-auto lg:max-w-none">
            <Image
              src="/assets/hero-person.png"
              alt="AME Marketing team"
              width={560}
              height={640}
              className="rounded-3xl shadow-2xl object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute -top-6 -right-6 float-slow hidden md:block"
            >
              <Image
                src="/assets/decor-vector.svg"
                alt=""
                width={64}
                height={64}
                style={{ width: "auto", height: "auto" }}
                className="opacity-50 w-16 h-16"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/reveal";

interface FeaturedCaseData {
  slug: string;
  thumbnail: string | null;
  client: string;
  title: string;
  desc: string;
  stats: { value: string; label: string }[];
  ctaLabel: string;
}

export function FeaturedCaseSection({ data }: { data: FeaturedCaseData | null }) {
  const t = useTranslations("home");

  // Fallback to i18n data if no DB case
  const stats = data?.stats ?? (t.raw("featuredStats") as { value: string; label: string }[]);

  return (
    <section className="py-16 md:py-24 bg-bg-2/60">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">{t("featuredEyebrow")}</span>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="display-lg mt-4">
            {data ? data.title : t("featuredTitle")}
            <span className="italic-accent">{data ? data.client : t("featuredTitleAccent")}</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Case image */}
          <Reveal variant="slide-left" delay={100}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 soft-blob opacity-30"
              />
              <div className="relative aspect-[640/440]">
                <Image
                  src={data?.thumbnail || "/assets/hero-laptop.webp"}
                  alt={data?.client || "AME Marketing case study"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="rounded-2xl shadow-xl object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Case details */}
          <div>
            <Reveal variant="slide-right" delay={160}>
              <p className="text-ink-2 leading-relaxed max-w-lg">
                {data?.desc || t("featuredDesc")}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-3xl md:text-4xl text-brand">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-ink-2">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8">
                <Link href={data ? `/cases/${data.slug}` : "/cases"} className="link-arrow">
                  {data?.ctaLabel || t("featuredCta")}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";

const VISUALS = [
  "/cases/vinfast.jpg", "/cases/bizfly.jpg", "/cases/clb-ban-sung.jpg",
  "/cases/honya.jpg", "/cases/an-dien.jpg", "/cases/shinbi.jpg",
  "/cases/koolsoft.jpg", "/cases/homegy.jpg", "/cases/csm.jpg",
];
const SLUGS = ["vinfast", "bizfly", "clb-ban-sung", "honya", "an-dien", "shinbi", "koolsoft", "homegy", "csm-hospital"];

interface CaseItem {
  client: string;
  title: string;
  tag: string;
  metric: string;
  metricLabel: string;
}

export function CasesGrid() {
  const t = useTranslations("cases");
  const [active, setActive] = useState("all");

  const items: (CaseItem & { slug: string; visual: string })[] = useMemo(() => {
    const raw: CaseItem[] = t.raw("items") as never;
    const all = raw.map((it, idx) => ({ ...it, slug: SLUGS[idx], visual: VISUALS[idx] }));
    return active === "all" ? all : all.filter((i) => i.tag === active);
  }, [active, t]);

  const filters: { id: string; label: string }[] = t.raw("filters") as never;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === f.id
                ? "bg-peach text-ink"
                : "bg-surface border border-line text-ink-2 hover:border-line-2"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        {items.map((c, i) => {
          const tagLabel = filters.find((f) => f.id === c.tag)?.label ?? c.tag;
          return (
            <Reveal key={c.title} as="article" delay={(i % 4) * 80} className="card-soft overflow-hidden group">
              <Link href={`/cases/${c.slug}`} className="block">
                <div className="aspect-[16/10] relative overflow-hidden bg-bg-2">
                  <img
                    src={c.visual}
                    alt={c.client}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 40%, hsl(var(--ink) / 0.55) 100%)" }}
                  />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-white/95 uppercase">
                      {c.client}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    <span className="px-2 py-0.5 rounded-full bg-bg-2 border border-line">{tagLabel}</span>
                    <span>·</span>
                    <span>{c.client}</span>
                  </div>
                  <h3 className="font-display text-2xl mt-3 group-hover:text-brand transition-colors">{c.title}</h3>
                  <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-5">
                    <span className="font-display text-3xl text-ink">{c.metric}</span>
                    <span className="text-sm text-ink-3">{c.metricLabel}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

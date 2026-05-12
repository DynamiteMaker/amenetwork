"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/reveal";

interface CaseCard {
  id: string;
  slug: string;
  tag: string;
  thumbnail: string | null;
  metricValue: string | null;
  metricLabel: string | null;
  client: string;
  title: string;
}

interface CasesGridProps {
  cases: CaseCard[];
  filters: { id: string; label: string }[];
}

export function CasesGrid({ cases, filters }: CasesGridProps) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () => (active === "all" ? cases : cases.filter((c) => c.tag === active)),
    [active, cases]
  );

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
        {filtered.map((c, i) => {
          const tagLabel = filters.find((f) => f.id === c.tag)?.label ?? c.tag;
          return (
            <Reveal key={c.id} as="article" delay={(i % 4) * 80} className="card-soft overflow-hidden group">
              <Link href={`/cases/${c.slug}`} className="block">
                <div className="aspect-[16/10] relative overflow-hidden bg-bg-2">
                  {c.thumbnail && (
                    <img
                      src={c.thumbnail}
                      alt={c.client}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
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
                  {c.metricValue && (
                    <div className="mt-5 flex items-baseline gap-2 border-t border-line pt-5">
                      <span className="font-display text-3xl text-ink">{c.metricValue}</span>
                      <span className="text-sm text-ink-3">{c.metricLabel}</span>
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

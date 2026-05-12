import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

interface CaseRow {
  id: string;
  slug: string;
  tag: string;
  thumbnail: string | null;
  metric_value: string | null;
  metric_label: string | null;
  results: { value: string; label: string }[];
  solution: string[];
  testimonial: { quote: string; author: string; role: string } | null;
  translations: { locale: string; client: string; title: string; context: string; challenge: string }[];
}

async function getCase(slug: string, locale: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select(`id,slug,tag,thumbnail,metric_value,metric_label,results,solution,testimonial,
      translations:case_translations!left(locale,client,title,context,challenge)`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as CaseRow;
  const tr = row.translations.find((t) => t.locale === locale)
    ?? row.translations.find((t) => t.locale === "en");
  if (!tr) return null;
  return { ...row, tr };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const c = await getCase(slug, locale);
  if (!c) return {};
  return {
    title: `${c.tr.title} | AME Case Study`,
    description: c.tr.context || undefined,
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const c = await getCase(slug, locale);
  if (!c) notFound();

  const common = await getTranslations({ locale, namespace: "common" });
  const casesT = await getTranslations({ locale, namespace: "cases" });
  const filters: { id: string; label: string }[] = casesT.raw("filters") as never;
  const tagLabel = filters.find((f) => f.id === c.tag)?.label ?? c.tag;

  return (
    <>
      <PageHero
        eyebrow={`${c.tr.client.toUpperCase()} · ${tagLabel.toUpperCase()}`}
        title={c.tr.title}
        sub={c.tr.context}
      >
        {c.metric_value && (
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="font-display text-4xl md:text-5xl text-ink">{c.metric_value}</span>
            <span className="text-ink-3">{c.metric_label}</span>
          </div>
        )}
      </PageHero>

      <section className="pb-16 md:pb-24">
        <div className="container-page grid gap-10 md:grid-cols-5">
          <Reveal className="md:col-span-2">
            <span className="eyebrow">01 · {common("caseChallenge")}</span>
          </Reveal>
          <Reveal className="md:col-span-3" delay={80}>
            <p className="text-lg text-ink-2 leading-relaxed">{c.tr.challenge}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-2 py-16 md:py-24">
        <div className="container-page grid gap-10 md:grid-cols-5">
          <Reveal className="md:col-span-2">
            <span className="eyebrow">02 · {common("caseSolution")}</span>
          </Reveal>
          <Reveal className="md:col-span-3" delay={80}>
            <ul className="space-y-3">
              {c.solution.map((s) => (
                <li key={s} className="flex items-start gap-3 card-soft p-5">
                  <Check size={18} className="mt-0.5 text-brand shrink-0" />
                  <span className="text-ink">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-page">
          <span className="eyebrow">03 · {common("caseResults")}</span>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {c.results.map((r, i) => (
              <Reveal key={r.label} delay={i * 90} className="card-soft p-8 text-center">
                <div className="font-display text-4xl md:text-5xl text-ink">{r.value}</div>
                <div className="text-sm text-ink-3 mt-2">{r.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {c.testimonial && (
        <section className="pb-16 md:pb-24">
          <div className="container-page">
            <Reveal className="card-soft p-10 md:p-14">
              <p className="font-display text-2xl md:text-3xl leading-snug text-ink">
                &ldquo;{c.testimonial.quote}&rdquo;
              </p>
              <p className="mt-6 text-ink-2">
                <span className="font-semibold text-ink">{c.testimonial.author}</span> · {c.testimonial.role}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="container-page">
          <Link href="/cases" className="btn-ghost-soft">← {common("allCases")}</Link>
        </div>
      </section>

      <CTABand />
    </>
  );
}

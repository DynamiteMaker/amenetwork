import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

const CASE_SLUGS = ["vinfast", "bizfly", "clb-ban-sung", "honya", "an-dien", "shinbi", "koolsoft", "homegy", "csm-hospital"];

export async function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "seo.cases" });
  const cases = await getTranslations({ locale, namespace: "cases" });
  const caseData = cases.raw(slug) as Record<string, unknown> | undefined;
  if (!caseData) return {};
  return {
    title: `${caseData.title} - ${t("description").includes("AME") ? "AME Case Study" : "Case Study"}`,
    description: (caseData.context as string) || t("description"),
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "cases" });
  const common = await getTranslations({ locale, namespace: "common" });
  const caseData = t.raw(slug) as {
    title: string;
    client: string;
    tag: string;
    context: string;
    metric: string;
    metricLabel: string;
    challenge: string;
    solution: string[];
    results: { value: string; label: string }[];
    testimonial?: { quote: string; author: string; role: string };
  } | null;

  if (!caseData) notFound();

  const filters: { id: string; label: string }[] = t.raw("filters") as never;
  const tagLabel = filters.find((f) => f.id === caseData.tag)?.label ?? caseData.tag;

  return (
    <>
      <PageHero
        eyebrow={`${caseData.client.toUpperCase()} · ${tagLabel.toUpperCase()}`}
        title={caseData.title}
        sub={caseData.context}
      >
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="font-display text-4xl md:text-5xl text-ink">{caseData.metric}</span>
          <span className="text-ink-3">{caseData.metricLabel}</span>
        </div>
      </PageHero>

      <section className="pb-16 md:pb-24">
        <div className="container-page grid gap-10 md:grid-cols-5">
          <Reveal className="md:col-span-2">
            <span className="eyebrow">01 · {common("caseChallenge")}</span>
          </Reveal>
          <Reveal className="md:col-span-3" delay={80}>
            <p className="text-lg text-ink-2 leading-relaxed">{caseData.challenge}</p>
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
              {caseData.solution.map((s) => (
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
            {caseData.results.map((r, i) => (
              <Reveal key={r.label} delay={i * 90} className="card-soft p-8 text-center">
                <div className="font-display text-4xl md:text-5xl text-ink">{r.value}</div>
                <div className="text-sm text-ink-3 mt-2">{r.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {caseData.testimonial && (
        <section className="pb-16 md:pb-24">
          <div className="container-page">
            <Reveal className="card-soft p-10 md:p-14">
              <p className="font-display text-2xl md:text-3xl leading-snug text-ink">
                &ldquo;{caseData.testimonial.quote}&rdquo;
              </p>
              <p className="mt-6 text-ink-2">
                <span className="font-semibold text-ink">{caseData.testimonial.author}</span> · {caseData.testimonial.role}
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

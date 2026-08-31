import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

const SERVICE_SLUGS = [
  "branding", "digital-marketing", "performance", "social-content",
  "web", "production", "pr-imc", "market-expansion",
];

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "servicesDetail" });
  if (!t.has(slug as never)) return {};
  const detail = t.raw(slug) as Record<string, unknown>;
  return {
    title: `${detail.title} | AME Services`,
    description: detail.sub as string,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "servicesDetail" });
  // `t.raw` throws on a missing key, so an unknown slug must be rejected first
  // (otherwise /services/<bad-slug> returns 500 instead of 404).
  if (!t.has(slug as never)) notFound();

  const detail = t.raw(slug) as {
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    sub?: string;
    why?: { heading: string; body: string };
    scope?: { heading: string; bullets: string[] };
    process?: { heading: string; steps: { label: string; desc: string }[] };
    cta?: { heading: string; body: string };
  };

  return (
    <>
      <PageHero
        eyebrow={detail.eyebrow ?? ""}
        title={
          <>
            {detail.title}
            {detail.titleAccent && <span className="italic-accent">{detail.titleAccent}</span>}
          </>
        }
        sub={detail.sub}
      />

      {detail.why && (
        <section className="pb-16 md:pb-24">
          <div className="container-page grid gap-10 md:grid-cols-5">
            <Reveal className="md:col-span-2">
              <span className="eyebrow">{detail.why.heading}</span>
            </Reveal>
            <Reveal className="md:col-span-3" delay={80}>
              <p className="text-lg text-ink-2 leading-relaxed">{detail.why.body}</p>
            </Reveal>
          </div>
        </section>
      )}

      {detail.scope && (
        <section className="bg-bg-2 py-16 md:py-24">
          <div className="container-page">
            <span className="eyebrow">{detail.scope.heading}</span>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detail.scope.bullets.map((b, i) => (
                <Reveal key={b} delay={i * 60} className="card-soft px-5 py-4 text-ink">
                  {b}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {detail.process && (
        <section className="py-16 md:py-24">
          <div className="container-page">
            <span className="eyebrow">{detail.process.heading}</span>
            <div className="mt-8 space-y-6">
              {detail.process.steps.map((s, i) => (
                <Reveal key={i} delay={i * 80} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center font-display shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-display text-xl">{s.label}</h3>
                    <p className="mt-1 text-ink-2">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {detail.cta && (
        <section className="pb-16">
          <div className="container-page">
            <Reveal className="card-soft p-10 text-center">
              <h2 className="font-display text-2xl md:text-3xl">{detail.cta.heading}</h2>
              <p className="mt-3 text-ink-2 max-w-xl mx-auto">{detail.cta.body}</p>
              <Link href="/contact" className="btn-primary-soft mt-6 inline-flex">
                Get started
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="container-page">
          <Link href="/services" className="btn-ghost-soft">← All services</Link>
        </div>
      </section>

      <CTABand />
    </>
  );
}

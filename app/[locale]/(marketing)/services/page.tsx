import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

const tones = ["brand", "peach", "lilac", "champagne", "brand", "peach", "lilac", "champagne"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.services" });
  return { title: t("title"), description: t("description") };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const o = await getTranslations({ locale, namespace: "servicesOverview" });
  const cards: { slug: string; title: string; desc: string }[] = o.raw("cards") as never;

  return (
    <>
      <PageHero
        eyebrow={o("eyebrow")}
        title={
          <>
            {o("title")}
            <span className="italic-accent">{o("titleAccent")}</span>
          </>
        }
        sub={o("sub")}
      />

      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {cards.map((s, i) => (
            <Reveal
              key={s.slug}
              as="article"
              delay={(i % 4) * 80}
              className="card-soft p-8 md:p-10 group"
            >
              <Link href={`/services/${s.slug}`} className="block">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${tones[i]}-soft flex items-center justify-center font-display text-lg text-ink ring-1 ring-line`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="h-px flex-1 bg-line" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl mt-5 group-hover:text-brand transition-colors">
                  {s.title}
                </h3>
                <p className="mt-3 text-ink-2">{s.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand mt-6 group-hover:gap-2.5 transition-all">
                  {t("common.learnMore")} <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}

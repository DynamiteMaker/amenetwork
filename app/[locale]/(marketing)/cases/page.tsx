import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { CasesGrid } from "./cases-client";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.cases" });
  return { title: t("title"), description: t("description") };
}

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cases" });

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("cases")
    .select(`id,slug,tag,thumbnail,metric_value,metric_label,
      translations:case_translations!left(client,title,locale)`)
    .eq("status", "published")
    .order("sort_order");

  const cases = (rows ?? []).map((c: any) => {
    const tr = (c.translations as any[])?.find((t: any) => t.locale === locale)
      ?? (c.translations as any[])?.find((t: any) => t.locale === "en");
    return {
      id: c.id,
      slug: c.slug,
      tag: c.tag,
      thumbnail: c.thumbnail,
      metricValue: c.metric_value,
      metricLabel: c.metric_label,
      client: tr?.client ?? "",
      title: tr?.title ?? "",
    };
  });

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={
          <>
            {t("title")}
            <span className="italic-accent">{t("titleAccent")}</span>
          </>
        }
        sub={t("sub")}
      />

      <section className="pb-20 md:pb-28">
        <div className="container-page">
          <CasesGrid cases={cases} filters={t.raw("filters") as { id: string; label: string }[]} />
        </div>
      </section>

      <CTABand />
    </>
  );
}

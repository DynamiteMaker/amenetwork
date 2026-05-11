import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { CasesGrid } from "./cases-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.cases" });
  return { title: t("title"), description: t("description") };
}

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cases" });

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
      >
        {/* Filter buttons rendered by client component */}
      </PageHero>

      <section className="pb-20 md:pb-28">
        <div className="container-page">
          <CasesGrid />
        </div>
      </section>

      <CTABand />
    </>
  );
}

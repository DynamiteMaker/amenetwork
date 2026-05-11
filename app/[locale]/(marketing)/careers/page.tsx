import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.careers" });
  return { title: t("title"), description: t("description") };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "careers" });
  const culture: { title: string; desc: string }[] = t.raw("culture") as never;
  const openings: { role: string; team: string; location: string; type: string }[] = t.raw("openings") as never;

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

      <section className="pb-16 md:pb-24">
        <div className="container-page">
          <h2 className="display-md">{t("cultureHeading")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {culture.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="card-soft p-7">
                <div className="font-display text-3xl text-brand">{String(i + 1).padStart(2, "0")}</div>
                <h4 className="font-display text-xl mt-4">{v.title}</h4>
                <p className="text-[15px] text-ink-2 mt-2">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-2 py-16 md:py-24">
        <div className="container-page">
          <h2 className="display-md">{t("openingsHeading")}</h2>
          <div className="mt-10 space-y-4">
            {openings.map((o, i) => (
              <Reveal
                key={o.role}
                delay={i * 60}
                className="card-soft p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-display text-xl">{o.role}</h3>
                  <p className="text-sm text-ink-3 mt-1">
                    {o.team} · {o.location} · {o.type}
                  </p>
                </div>
                <a
                  href={`mailto:careers@amemartech.com?subject=Ứng%20tuyển%20${encodeURIComponent(o.role)}`}
                  className="btn-primary-soft text-sm self-start md:self-auto"
                >
                  {t("applyLabel")}
                </a>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-ink-2 italic">{t("emptyNote")}</p>
        </div>
      </section>

      <CTABand />
    </>
  );
}

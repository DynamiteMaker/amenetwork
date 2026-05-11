import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Download } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.capability" });
  return { title: t("title"), description: t("description") };
}

export default async function CapabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "capability" });
  const sections: { heading: string; body: string; bullets?: string[] }[] = t.raw("sections") as never;

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
        <a
          href="mailto:amemartech@gmail.com?subject=Yêu%20cầu%20company%20profile"
          className="btn-primary-soft inline-flex items-center gap-2"
        >
          <Download size={16} /> {t("downloadLabel")}
        </a>
        <p className="mt-3 text-sm text-ink-3">{t("downloadNote")}</p>
      </PageHero>

      <section className="pb-20">
        <div className="container-page space-y-12">
          {sections.map((sec, i) => (
            <Reveal key={sec.heading} delay={i * 80} className="grid gap-8 md:grid-cols-5 border-t border-line pt-10">
              <h2 className="md:col-span-2 font-display text-2xl md:text-3xl">{sec.heading}</h2>
              <div className="md:col-span-3 space-y-4">
                <p className="text-lg text-ink-2 leading-relaxed">{sec.body}</p>
                {sec.bullets && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {sec.bullets.map((b) => (
                      <li key={b} className="text-ink card-soft px-4 py-2.5 text-[15px]">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}

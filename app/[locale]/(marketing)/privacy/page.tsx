import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.privacy" });
  return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  const sections: { heading: string; body: string }[] = t.raw("sections") as never;

  return (
    <>
      <PageHero eyebrow="LEGAL" title={t("title")} sub={t("updated")} />
      <section className="pb-24">
        <div className="container-page max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 60}>
              <h2 className="font-display text-2xl">{s.heading}</h2>
              <p className="mt-3 text-ink-2 leading-relaxed">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

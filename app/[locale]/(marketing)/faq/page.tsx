import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { FAQJsonLd } from "@/components/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.faq" });
  return { title: t("title"), description: t("description") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });
  const items: { q: string; a: string }[] = t.raw("items") as never;

  return (
    <>
      <FAQJsonLd faqs={items.map((it) => ({ question: it.q, answer: it.a }))} />
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

      <section className="pb-20">
        <div className="container-page max-w-3xl">
          <Reveal>
            <ul className="w-full">
              {items.map((it) => (
                <li key={it.q} className="border-b border-line">
                  <details className="group py-6">
                    <summary className="flex items-center justify-between gap-6 cursor-pointer list-none font-display text-lg md:text-xl text-ink">
                      <span>{it.q}</span>
                      <ChevronDown
                        size={20}
                        className="shrink-0 text-ink-2 transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-4 text-ink-2 text-[15px] leading-relaxed">{it.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}

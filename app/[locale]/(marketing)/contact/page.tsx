import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { MapEmbed } from "@/components/map-embed";
import { WhatsappIcon } from "@/components/social-icons";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT } from "@/data/offices";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.contact" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  const quickCards = [
    { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, tone: "peach" },
    { label: "Hotline", value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phoneTel}`, tone: "brand" },
    { label: "WhatsApp", value: CONTACT.phoneDisplay, href: CONTACT.whatsappUrl, tone: "lilac", external: true },
  ];

  const toneClass: Record<string, string> = {
    peach: "from-peach-soft to-champagne-soft text-peach",
    brand: "from-brand-soft to-lilac-soft text-brand",
    lilac: "from-lilac-soft to-brand-soft text-lilac",
  };

  const infoTagline = t("info.tagline");
  const infoBusinessLines: string[] = t.raw("info.businessLines") as never;
  const infoOfficeLines: string[] = t.raw("info.officeLines") as never;

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

      <section className="pb-12 md:pb-16">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          {quickCards.map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener" : undefined}
                className="card-soft p-5 flex items-center gap-4 group h-full"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${toneClass[c.tone]} flex items-center justify-center shrink-0 ring-1 ring-line`}>
                  <WhatsappIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-3 font-semibold">{c.label}</p>
                  <p className="font-display text-base mt-0.5 truncate">{c.value}</p>
                </div>
                <ArrowUpRight size={18} className="text-ink-3 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="relative rounded-3xl overflow-hidden border border-line shadow-warmLg">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--peach-soft)) 0%, hsl(var(--lilac-soft)) 60%, hsl(var(--brand-soft)) 100%)",
                  }}
                />
                <div className="relative aspect-[4/5]">
                  <img
                    src="/hero-pointing.png"
                    alt=""
                    className="absolute inset-x-0 bottom-0 w-full h-full object-contain object-bottom"
                  />
                </div>
                <div className="absolute top-5 left-5 right-5">
                  <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-line px-4 py-3 shadow-soft">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ink-3 font-semibold">
                      {t("eyebrow")}
                    </p>
                    <p className="font-display italic text-lg mt-0.5 leading-tight">
                      {infoTagline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-soft p-7 hover:translate-y-0">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-3 font-semibold">
                    {t("info.businessTitle")}
                  </p>
                  {infoBusinessLines.map((l) => (
                    <p key={l} className="text-[15px] text-ink-2">{l}</p>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-line space-y-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-3 font-semibold">
                    {t("info.officeTitle")}
                  </p>
                  {infoOfficeLines.map((l) => (
                    <div key={l} className="text-[15px] text-ink-2">{l}</div>
                  ))}
                </div>
              </div>
            </aside>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <MapEmbed
        eyebrow={t("mapEyebrow")}
        title={t("mapTitle")}
        sub={t("mapSub")}
        cta={t("mapCta")}
      />
    </>
  );
}

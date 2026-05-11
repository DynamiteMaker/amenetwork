import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { MapPin, Compass, Gem, Handshake, Rocket } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const valueIcons = [Compass, Gem, Handshake, Rocket];
const valueTones = ["brand", "peach", "lilac", "champagne"] as const;

const toneStyles: Record<string, string> = {
  brand: "bg-[linear-gradient(135deg,hsl(var(--brand-soft)),hsl(var(--lilac-soft)))] text-brand ring-brand/20",
  peach: "bg-[linear-gradient(135deg,hsl(var(--peach-soft)),hsl(var(--champagne-soft)))] text-peach ring-peach/25",
  lilac: "bg-[linear-gradient(135deg,hsl(var(--lilac-soft)),hsl(var(--brand-soft)))] text-lilac ring-lilac/25",
  champagne: "bg-[linear-gradient(135deg,hsl(var(--champagne-soft)),hsl(var(--peach-soft)))] text-champagne ring-champagne/30",
};

const teamPortraits = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&auto=format&fit=crop",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.about" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const story: string[] = t.raw("story") as never;
  const values: { title: string; desc: string }[] = t.raw("values") as never;
  const team: { name: string; role: string }[] = t.raw("team") as never;
  const offices: { city: string; address: string; meta: string }[] = t.raw("offices") as never;

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
      />

      <section className="pb-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="max-w-[60ch] space-y-5 text-lg text-ink-2">
            {story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="relative">
            <div className="soft-blob rounded-[2rem]" />
            <div className="relative card-soft overflow-hidden p-0 hover:translate-y-0">
              <img src="/team-group.png" alt="AME team" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-2 py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">{t("valuesEyebrow")}</span>
            <h2 className="display-lg mt-5">{t("valuesTitle")}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <Reveal key={v.title} delay={i * 80} className="card-soft p-7">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_rgba(20,22,40,0.05)]", toneStyles[valueTones[i]])}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-display text-xl mt-5">{v.title}</h3>
                  <p className="mt-2 text-[15px] text-ink-2">{v.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">{t("teamEyebrow")}</span>
            <h2 className="display-lg mt-5">{t("teamTitle")}</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className="aspect-square rounded-2xl overflow-hidden bg-bg-2 border border-line">
                  <img
                    src={teamPortraits[i % teamPortraits.length]}
                    alt={m.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <h4 className="font-display text-xl mt-4">{m.name}</h4>
                <p className="text-sm text-ink-3 mt-1">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-2 py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow">{t("officesEyebrow")}</span>
            <h2 className="display-lg mt-5">{t("officesTitle")}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offices.map((o, i) => (
              <Reveal key={o.city} delay={i * 100} className="card-soft p-7">
                <MapPin size={22} className="text-peach" />
                <h3 className="font-display text-2xl mt-4">{o.city}</h3>
                <p className="mt-2 text-[15px] text-ink-2">{o.address}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-3">{o.meta}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}

import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { offices } from "@/data/offices";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.offices" });
  return { title: t("title"), description: t("description") };
}

export default async function OfficesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow="OUR OFFICES"
        title={<span className="uppercase">OUR OFFICES</span>}
        sub="AME Marketing operates across four locations in Asia, with the head office based in Hanoi, Viet Nam."
      />

      <section className="pb-24">
        <div className="container-page grid gap-6 sm:grid-cols-2">
          {offices.map((o, i) => (
            <Reveal key={o.id} delay={i * 80}>
              <article className="card-soft p-7 h-full flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl bg-peach-soft flex items-center justify-center text-peach shrink-0">
                    <MapPin size={22} />
                  </div>
                  {o.isHeadOffice && (
                    <span className="text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-brand text-white">
                      HEAD OFFICE
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl mt-5 uppercase">{o.city}</h2>
                <p className="mt-2 text-[15px] text-ink-2 flex-1">{o.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${o.mapsQuery}`}
                  target="_blank"
                  rel="noopener"
                  className="link-arrow mt-5 text-ink uppercase text-sm"
                >
                  OPEN IN MAPS <ArrowUpRight size={14} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}

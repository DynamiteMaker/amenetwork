"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Reveal } from "@/components/reveal";

const CLIENTS = [
  { name: "KAISHI Travel", logo: "/assets/clients/kaishi-travel.webp" },
  { name: "CAMON Group", logo: "/assets/clients/camon-group.webp" },
  { name: "SHINBI", logo: "/assets/clients/shinbi.webp" },
  { name: "JVC Medical", logo: "/assets/clients/jvc-medical.webp" },
  { name: "Nhà Đẹp", logo: "/assets/clients/nha-dep.webp" },
];

const LOGO_ITEMS = [...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS];

export function ClientsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-12 md:py-16 border-y border-line bg-bg-2/50 overflow-hidden">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-ink-2 uppercase tracking-widest">
              {t("trust")}
            </span>
            <p className="text-center text-ink">
              {t("trustHeadline")}{" "}
              <span className="italic-accent">{t("trustHeadlineAccent")}</span>
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mt-8 relative">
          {/* Fade edges */}
          <div aria-hidden className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-bg-2/80 to-transparent z-10 pointer-events-none" />
          <div aria-hidden className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-bg-2/80 to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-[marquee_40s_linear_infinite]">
            {LOGO_ITEMS.map((client, i) => (
              <div key={`${client.name}-${i}`} className="flex-shrink-0 mx-6 md:mx-10">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={120}
                  height={40}
                  style={{ width: "auto", height: "auto" }}
                  className="h-8 md:h-10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

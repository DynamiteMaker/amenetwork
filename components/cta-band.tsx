import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CONTACT } from "@/data/offices";
import { WhatsappIcon } from "@/components/social-icons";

export async function CTABand() {
  const t = await getTranslations("home");
  const common = await getTranslations("common");

  return (
    <section className="px-4 md:px-8 pb-20 md:pb-28">
      <div className="container-page">
        <div
          className="relative overflow-hidden rounded-[2rem] p-10 md:p-16"
          style={{
            background:
              "linear-gradient(120deg, hsl(14 100% 92%), hsl(40 80% 92%) 45%, hsl(218 70% 94%))",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(var(--peach) / 0.55), transparent)" }}
          />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="display-lg uppercase">
                {t("ctaTitle")}
                <span className="italic-accent normal-case">{t("ctaTitleAccent")}</span>
              </h2>
              <p className="mt-4 text-ink-2 max-w-xl">{t("ctaSub")}</p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:items-end">
              <Link href="/contact" className="btn-primary-soft w-full sm:w-auto justify-center uppercase">
                {common("startProject")}
              </Link>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="btn-ghost-soft w-full sm:w-auto justify-center uppercase"
              >
                <WhatsappIcon className="w-4 h-4" />
                {CONTACT.whatsappLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

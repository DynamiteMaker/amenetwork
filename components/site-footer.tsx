"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  WhatsappIcon,
} from "@/components/social-icons";
import { offices, CONTACT } from "@/data/offices";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const fe = useTranslations("footerExtra");

  const aux: { label: string; href: string }[] = fe.raw("aux") as never;

  const company = [
    { label: nav("about"), href: "/about" },
    { label: aux[0]?.label ?? "Capability", href: "/capability" },
    { label: aux[1]?.label ?? "Careers", href: "/careers" },
    { label: aux[2]?.label ?? "FAQ", href: "/faq" },
  ];
  const servicesLinks = [
    { label: nav("services"), href: "/services" },
    { label: nav("cases"), href: "/cases" },
  ];

  return (
    <footer className="bg-ink text-white/85 mt-24">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <img src="/ame-logo.webp" alt="AME Marketing" className="h-11 w-auto brightness-0 invert" />
            </div>
            <p className="mt-4 font-display italic text-white/85 text-lg leading-snug">
              {t("tagline")}
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/80">
              <p className="font-semibold tracking-[0.16em] uppercase text-white/55 text-xs">
                HEAD OFFICE
              </p>
              <p>{offices[0].address}</p>
              <p>
                <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener" className="hover:text-peach">
                  {CONTACT.phoneDisplay} (WHATSAPP)
                </a>
              </p>
              <p>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-peach">
                  {CONTACT.email}
                </a>
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <FooterTitle>COMPANY</FooterTitle>
            <FooterLinks items={company} />
          </div>

          <div className="md:col-span-2">
            <FooterTitle>SERVICES</FooterTitle>
            <FooterLinks items={servicesLinks} />
          </div>

          <div className="md:col-span-2">
            <FooterTitle>OFFICES</FooterTitle>
            <ul className="mt-4 space-y-2 text-sm">
              {offices.map((o) => (
                <li key={o.id}>
                  <Link href="/offices" className="text-white/80 hover:text-peach transition-colors uppercase">
                    {o.city}
                    {o.isHeadOffice && <span className="ml-1 text-[10px] text-peach">(HQ)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <FooterTitle>CONTACT</FooterTitle>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-white/80 hover:text-peach transition-colors">
                  {nav("contact")}
                </Link>
              </li>
              {aux.slice(3).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/80 hover:text-peach transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 md:items-center border-t border-white/10 pt-8">
          <div>
            <h4 className="font-body text-xs font-semibold tracking-[0.16em] text-white/55 uppercase">
              {t("newsletterTitle")}
            </h4>
            <p className="mt-2 text-sm text-white/70">{t("newsletterSub")}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email");
              window.location.href = `mailto:${CONTACT.email}?subject=Newsletter%20signup&body=Please%20subscribe%20me:%20${encodeURIComponent(String(email ?? ""))}`;
            }}
            className="flex gap-2 md:justify-end"
          >
            <input
              type="email"
              name="email"
              required
              placeholder={t("newsletterPlaceholder")}
              className="flex-1 md:max-w-xs min-w-0 px-3 py-2 rounded-full bg-white/8 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-peach/60"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
            <button type="submit" className="btn-peach !py-2 !px-4 text-sm uppercase">
              {t("newsletterCta")}
            </button>
          </form>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-white/55">
          <p>{t("rights")}</p>
          <div className="flex items-center gap-3">
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener" aria-label="WhatsApp" className="footer-social">
              <WhatsappIcon />
            </a>
            <a href="#" aria-label="Facebook" className="footer-social"><FacebookIcon /></a>
            <a href="#" aria-label="Instagram" className="footer-social"><InstagramIcon /></a>
            <a href="#" aria-label="LinkedIn" className="footer-social"><LinkedinIcon /></a>
            <a href="#" aria-label="YouTube" className="footer-social"><YoutubeIcon /></a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-social {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.75);
          font-weight: 600; transition: all 0.2s ease;
        }
        .footer-social:hover {
          background: hsl(var(--peach)); color: hsl(var(--ink));
          border-color: hsl(var(--peach));
        }
      `}</style>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-body text-xs font-semibold tracking-[0.16em] text-white/55 uppercase">
      {children}
    </h4>
  );
}

function FooterLinks({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {items.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-white/80 hover:text-peach transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

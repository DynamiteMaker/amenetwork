"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X, Globe, ChevronDown, Check } from "lucide-react";
import { CONTACT } from "@/data/offices";
import { WhatsappIcon } from "@/components/social-icons";

const LANG_FULL: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

const LOCALE_LIST = [
  { code: "en", flag: "🇬🇧" },
  { code: "vi", flag: "🇻🇳" },
  { code: "ja", flag: "🇯🇵" },
  { code: "zh", flag: "🇨🇳" },
];

function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = LOCALE_LIST.find((l) => l.code === currentLocale)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 backdrop-blur transition-all hover:border-brand/40 hover:shadow-soft ${
          compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe size={14} className="text-brand" strokeWidth={2.2} />
        <span className="font-semibold text-ink">{current.flag} {LANG_FULL[current.code]}</span>
        <ChevronDown
          size={14}
          className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-line bg-surface shadow-warmLg py-1.5 z-50 animate-fade-up"
        >
          {LOCALE_LIST.map((l) => {
            const active = l.code === currentLocale;
            return (
              <Link
                key={l.code}
                href="/"
                locale={l.code}
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  active ? "text-brand font-semibold bg-brand-soft/60" : "text-ink hover:bg-bg-2"
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1 text-left">{LANG_FULL[l.code]}</span>
                {active && <Check size={14} className="text-brand" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ServicesMenu() {
  const t = useTranslations("nav");
  const ns = useTranslations("navServices");
  const so = useTranslations("servicesOverview");
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const isActive = pathname.startsWith("/services");
  // Open state is scoped to the route it was opened on, so navigating closes the menu.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenForPath(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Back/forward can land on the very route the menu was opened on, which the
  // route-scoped state would read as "still open".
  useEffect(() => {
    const onPopState = () => setOpenForPath(null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenForPath(pathname);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpenForPath(null), 120);
  };

  const cards: { slug: string; title: string; desc: string }[] = so.raw("cards") as never;

  return (
    <div className="relative" ref={ref} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpenForPath((v) => (v === pathname ? null : pathname))}
        className={`inline-flex items-center gap-1 text-[15px] font-medium hover:text-brand transition-colors ${
          isActive ? "link-underline text-ink" : "text-ink"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {t("services")}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50" onClick={() => setOpenForPath(null)}>
          <div className="w-[640px] rounded-2xl border border-line bg-surface shadow-warmLg p-4 animate-fade-up">
            <Link
              href="/services"
              className="flex items-baseline justify-between px-3 py-2.5 rounded-xl hover:bg-bg-2 transition-colors"
            >
              <span className="font-display text-base text-ink">{ns("overviewLabel")}</span>
              <span className="text-xs text-ink-3">{ns("overviewDesc")}</span>
            </Link>
            <div className="h-px bg-line my-2" />
            <div className="grid grid-cols-2 gap-1">
              {cards.map((c) => (
                <Link
                  key={c.slug}
                  href={`/services/${c.slug}`}
                  className="px-3 py-2.5 rounded-xl hover:bg-bg-2 transition-colors group"
                >
                  <div className="font-medium text-sm text-ink group-hover:text-brand">{c.title}</div>
                  <div className="text-xs text-ink-3 mt-0.5 line-clamp-1">{c.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Both menus are scoped to the route they were opened on, so navigating closes them.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const [servicesOpenForPath, setServicesOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;
  const mobileServicesOpen = servicesOpenForPath === pathname;
  const ns = useTranslations("navServices");
  const so = useTranslations("servicesOverview");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setOpenForPath(null);
      setServicesOpenForPath(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { to: "/cases", label: t("cases") },
    { to: "/about", label: t("about") },
    { to: "/blog", label: t("insights") },
    { to: "/offices", label: t("offices") },
    { to: "/contact", label: t("contact") },
  ] as const;

  const cards: { slug: string; title: string }[] = so.raw("cards") as never;

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-bg/85 backdrop-blur-md border-b border-line shadow-soft"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-page flex items-center justify-between h-24 md:h-28 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="AME Marketing">
          <img src="/ame-logo.webp" alt="AME Marketing" className="h-16 md:h-20 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          <ServicesMenu />
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`text-[15px] font-medium text-ink hover:text-brand transition-colors ${
                pathname === l.to ? "link-underline text-ink" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LangSwitcher />
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener"
            className="btn-primary-soft !py-2 !px-5 text-sm uppercase inline-flex items-center gap-2"
          >
            <WhatsappIcon className="w-4 h-4" />
            {CONTACT.whatsappLabel}
          </a>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <LangSwitcher compact />
          <button
            className="text-ink p-2 -mr-2 rounded-full hover:bg-bg-2 transition-colors"
            onClick={() => setOpenForPath((v) => (v === pathname ? null : pathname))}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-x-0 top-24 bottom-0 bg-bg overflow-y-auto animate-fade-up"
          // Following a link inside the overlay closes it. Deriving `open` from
          // the route alone would leave the old path stored, so coming back to
          // that same route later would pop the overlay open again.
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) {
              setOpenForPath(null);
              setServicesOpenForPath(null);
            }
          }}
        >
          <div className="container-page py-8 space-y-6">
            <nav className="flex flex-col">
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setServicesOpenForPath((v) => (v === pathname ? null : pathname))}
                  className="w-full flex items-center justify-between text-xl font-medium py-3 text-ink"
                  aria-expanded={mobileServicesOpen}
                >
                  {t("services")}
                  <ChevronDown size={18} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileServicesOpen && (
                  <div className="pb-4 space-y-1">
                    <Link href="/services" className="block py-2 text-base text-ink-2 hover:text-brand">
                      → {ns("overviewLabel")}
                    </Link>
                    {cards.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/services/${c.slug}`}
                        className="block py-2 text-base text-ink-2 hover:text-brand"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {links.map((l) => (
                <Link
                  key={l.to}
                  href={l.to}
                  className={`text-xl font-medium py-3 border-b border-line ${
                    pathname === l.to ? "text-brand" : "text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener"
              className="btn-primary-soft w-full !py-3 uppercase inline-flex items-center justify-center gap-2"
            >
              <WhatsappIcon className="w-4 h-4" />
              {CONTACT.whatsappLabel}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

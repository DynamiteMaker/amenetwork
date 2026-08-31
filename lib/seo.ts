import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://amenetwork.vn";

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  /** Locales this URL actually exists in; defaults to every locale. */
  availableLocales?: string[];
}): Metadata {
  const url = `${BASE_URL}/${opts.locale === "en" ? "" : opts.locale + "/"}${opts.path}`.replace(/\/+/g, "/");
  const available = opts.availableLocales ?? ["en", "vi", "ja", "zh"];
  const localeUrl = (locale: string) =>
    `${BASE_URL}/${locale === "en" ? "" : locale + "/"}${opts.path}`.replace(/\/+/g, "/");

  const languages: Record<string, string> = {};
  for (const locale of available) languages[locale] = localeUrl(locale);
  if (available.includes("en")) languages["x-default"] = localeUrl("en");

  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "AME Marketing",
      locale: opts.locale,
      type: opts.type ?? "website",
      ...(opts.image && { images: [{ url: opts.image }] }),
      ...(opts.publishedTime && { publishedTime: opts.publishedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}

export { BASE_URL };

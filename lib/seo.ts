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
}): Metadata {
  const url = `${BASE_URL}/${opts.locale === "en" ? "" : opts.locale + "/"}${opts.path}`.replace(/\/+/g, "/");

  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/${opts.path}`.replace(/\/+/g, "/"),
        vi: `${BASE_URL}/vi/${opts.path}`.replace(/\/+/g, "/"),
        ja: `${BASE_URL}/ja/${opts.path}`.replace(/\/+/g, "/"),
        zh: `${BASE_URL}/zh/${opts.path}`.replace(/\/+/g, "/"),
        "x-default": `${BASE_URL}/${opts.path}`.replace(/\/+/g, "/"),
      },
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

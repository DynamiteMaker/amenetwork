import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://amenetwork.vn";
const locales = ["en", "vi", "ja", "zh"];
const staticRoutes = [
  "",
  "/services",
  "/cases",
  "/about",
  "/blog",
  "/contact",
  "/capability",
  "/careers",
  "/faq",
  "/offices",
  "/privacy",
  "/terms",
];
const serviceSlugs = [
  "branding",
  "digital-marketing",
  "performance",
  "social-content",
  "web",
  "production",
  "pr-imc",
  "market-expansion",
];
const caseSlugs = [
  "vinfast",
  "bizfly",
  "clb-ban-sung",
  "honya",
  "an-dien",
  "shinbi",
  "koolsoft",
  "homegy",
  "csm-hospital",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === "en" ? "" : `/${locale}`;

    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}${prefix}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "/blog" ? "daily" : route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route === "/services" || route === "/cases" ? 0.9 : 0.8,
      });
    }

    for (const slug of serviceSlugs) {
      entries.push({
        url: `${BASE_URL}${prefix}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const slug of caseSlugs) {
      entries.push({
        url: `${BASE_URL}${prefix}/cases/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: rows } = await supabase
      .from("post_translations")
      .select("locale, posts!inner(slug, updated_at, status)")
      .eq("posts.status", "published");

    const translations = (rows ?? []) as unknown as {
      locale: string;
      posts: { slug: string; updated_at: string };
    }[];

    for (const tr of translations) {
      const prefix = tr.locale === "en" ? "" : `/${tr.locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}/blog/${tr.posts.slug}`,
        lastModified: new Date(tr.posts.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}

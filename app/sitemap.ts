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
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published");

    for (const locale of locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      for (const post of posts ?? []) {
        entries.push({
          url: `${BASE_URL}${prefix}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/hero-section";
import { ClientsSection } from "@/components/home/clients-section";
import { ServicesSection } from "@/components/home/services-section";
import { FeaturedCaseSection } from "@/components/home/featured-case-section";
import { ProcessSection } from "@/components/home/process-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { CTABand } from "@/components/cta-band";

export const revalidate = 3600;

/** Columns selected by the featured-case queries below. */
interface FeaturedCaseRow {
  id: string;
  slug: string;
  thumbnail: string | null;
  results: { value: string; label: string }[] | null;
  translations: { locale: string; client: string; title: string; context: string }[] | null;
}

async function getFeaturedCase(locale: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select(`id,slug,thumbnail,results,
      translations:case_translations!left(locale,client,title,context)`)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  if (!data) {
    // Fallback: most recent published case
    const { data: fallback } = await supabase
      .from("cases")
      .select(`id,slug,thumbnail,results,
        translations:case_translations!left(locale,client,title,context)`)
      .eq("status", "published")
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (!fallback) return null;
    return mapCase(fallback, locale);
  }
  return mapCase(data, locale);
}

function mapCase(raw: FeaturedCaseRow, locale: string) {
  const tr = raw.translations?.find((t) => t.locale === locale)
    ?? raw.translations?.find((t) => t.locale === "en");
  if (!tr) return null;
  return {
    slug: raw.slug,
    thumbnail: raw.thumbnail,
    client: tr.client,
    title: tr.title,
    desc: tr.context || "",
    stats: raw.results ?? [],
    ctaLabel: `View ${tr.client} case`,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featuredData = await getFeaturedCase(locale);

  return (
    <>
      <HeroSection />
      <ClientsSection />
      <ServicesSection />
      <FeaturedCaseSection data={featuredData} />
      <ProcessSection />
      <TestimonialSection />
      <CTABand />
    </>
  );
}

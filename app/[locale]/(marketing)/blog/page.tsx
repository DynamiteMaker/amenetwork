import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Tag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/page-hero";
import { CTABand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.insights" });
  return { title: t("title"), description: t("description") };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,featured_image,category,published_at,is_featured")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const allPosts = posts ?? [];
  const featured = allPosts.find((p) => p.is_featured) ?? allPosts[0];
  const rest = allPosts.filter((p) => p.id !== featured?.id);

  return (
    <>
      <PageHero
        eyebrow={t("insights.eyebrow")}
        title={
          <>
            {t("insights.title")}
            <span className="italic-accent">{t("insights.titleAccent")}</span>
          </>
        }
        sub={t("insights.sub")}
      />

      <section className="pb-24 md:pb-28">
        <div className="container-page">
          {allPosts.length === 0 ? (
            <div className="card-soft p-10 text-center hover:translate-y-0">
              <p className="text-ink-2">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {featured && (
                <Reveal>
                  <Link href={`/blog/${featured.slug}`} className="card-soft overflow-hidden flex flex-col md:flex-row mb-10 group">
                    {featured.featured_image && (
                      <div className="md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden">
                        <img src={featured.featured_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-7 md:p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-peach-soft text-ink font-semibold tracking-wide uppercase">FEATURED</span>
                        {featured.category && <span className="text-ink-3">{featured.category}</span>}
                        {featured.published_at && <><span className="text-ink-3">·</span><span className="text-ink-3">{new Date(featured.published_at).toLocaleDateString()}</span></>}
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl mt-4 leading-tight uppercase">{featured.title}</h2>
                      {featured.excerpt && <p className="mt-4 text-ink-2 text-[15px] line-clamp-3">{featured.excerpt}</p>}
                      <span className="mt-6 inline-flex items-center gap-2 text-brand font-semibold group-hover:gap-3 transition-all">
                        {t("common.readMore")} <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )}

              <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p.id} as="article" delay={(i % 3) * 80} className="card-soft overflow-hidden flex flex-col">
                    <Link href={`/blog/${p.slug}`} className="contents">
                      {p.featured_image && (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={p.featured_image} alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-ink-3">
                          {p.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft text-brand font-semibold">
                              <Tag size={11} /> {p.category}
                            </span>
                          )}
                          {p.published_at && <span>{new Date(p.published_at).toLocaleDateString()}</span>}
                        </div>
                        <h3 className="font-display text-xl mt-3 leading-snug uppercase">{p.title}</h3>
                        {p.excerpt && <p className="mt-2 text-[15px] text-ink-2 flex-1 line-clamp-3">{p.excerpt}</p>}
                        <span className="mt-5 inline-flex items-center gap-2 text-ink font-semibold hover:gap-3 hover:text-brand transition-all self-start">
                          {t("common.readMore")} <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTABand />
    </>
  );
}

import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { buildMetadata } from "@/lib/seo";
import { CTABand } from "@/components/cta-band";
import { ArticleJsonLd } from "@/components/structured-data";

export const revalidate = 3600;

interface PostDetailRow {
  id: string;
  slug: string;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string | null;
  translations: {
    title: string;
    excerpt: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
  }[];
}

async function getPost(slug: string, locale: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(`id,slug,featured_image,category,tags,published_at,
      translations:post_translations!inner(title,excerpt,content,meta_title,meta_description)`)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as PostDetailRow;
  const tr = row.translations[0];
  if (!tr) return null;

  // Only advertise hreflang for locales this post is actually translated into.
  const { data: localeRows } = await supabase
    .from("post_translations")
    .select("locale")
    .eq("post_id", row.id);
  const availableLocales = (localeRows ?? []).map((r) => r.locale);

  return { ...row, tr, availableLocales };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);
  if (!post) return {};
  return buildMetadata({
    title: post.tr.meta_title ?? post.tr.title,
    description: post.tr.meta_description ?? post.tr.excerpt ?? "",
    path: `blog/${slug}`,
    locale,
    image: post.featured_image ?? undefined,
    type: "article",
    publishedTime: post.published_at ?? undefined,
    availableLocales: post.availableLocales,
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost(slug, locale);
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd
        title={post.tr.title}
        slug={post.slug}
        publishedAt={post.published_at ?? ""}
        excerpt={post.tr.excerpt || undefined}
        image={post.featured_image ?? undefined}
      />

      <article className="pt-12 md:pt-20 pb-20">
        <div className="container-page max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-brand mb-6">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <div className="flex items-center gap-3 text-xs text-ink-3 mb-4">
            {post.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft text-brand font-semibold">
                <Tag size={11} /> {post.category}
              </span>
            )}
            {post.published_at && (
              <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString()}</span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-5xl leading-tight uppercase">{post.tr.title}</h1>
          {post.tr.excerpt && <p className="mt-4 text-lg text-ink-2">{post.tr.excerpt}</p>}

          {post.featured_image && (
            <img src={post.featured_image} alt="" className="mt-8 rounded-2xl border border-line w-full" />
          )}

          <div
            className="prose prose-lg max-w-none mt-8 prose-headings:font-display prose-headings:uppercase prose-a:text-brand"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.tr.content) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-line flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-bg-2 text-ink-3">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      <CTABand />
    </>
  );
}

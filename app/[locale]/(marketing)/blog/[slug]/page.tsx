import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { CTABand } from "@/components/cta-band";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return {};
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,featured_image,category,tags,meta_title,meta_description,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.meta_description ?? undefined,
    image: post.featured_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    author: { "@type": "Organization", name: "AME Marketing" },
    publisher: { "@type": "Organization", name: "AME Marketing" },
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

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

          <h1 className="font-display text-3xl md:text-5xl leading-tight uppercase">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-ink-2">{post.excerpt}</p>}

          {post.featured_image && (
            <img src={post.featured_image} alt="" className="mt-8 rounded-2xl border border-line w-full" />
          )}

          <div
            className="prose prose-lg max-w-none mt-8 prose-headings:font-display prose-headings:uppercase prose-a:text-brand"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
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

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s*on\w+\s*=\s*'[^']*'/gi, "");
}

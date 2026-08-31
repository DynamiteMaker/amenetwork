"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { slugify } from "@/lib/slug";
import { TipTapEditor } from "@/components/admin/tiptap-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminField } from "@/components/admin/admin-field";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { savePost } from "@/app/[locale]/admin/(dashboard)/actions";

const LOCALES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

interface TranslationForm {
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

const emptyTr = (): TranslationForm => ({
  title: "",
  excerpt: "",
  content: "",
  meta_title: "",
  meta_description: "",
});

const sharedSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  category: z.string().max(80).optional().nullable(),
});

const translationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500),
  content: z.string().max(100000),
  meta_title: z.string().max(120),
  meta_description: z.string().max(300),
});

export function PostEditor({ type, id }: { type: "post" | "news"; id?: string }) {
  const isNew = !id;
  const { feedback, show } = useFeedback();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeLocale, setActiveLocale] = useState<string>("vi");

  const [form, setForm] = useState({
    slug: "",
    featured_image: null as string | null,
    is_featured: false,
    category: "",
    tags: "",
  });
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({
    en: emptyTr(),
    vi: emptyTr(),
    ja: emptyTr(),
    zh: emptyTr(),
  });

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*,translations:post_translations!left(locale,title,excerpt,content,meta_title,meta_description)",
        )
        .eq("id", id!)
        .maybeSingle();
      setLoading(false);
      if (error || !data) {
        show("error", "Not found");
        return;
      }

      const d = data as typeof data & {
        translations: {
          locale: string;
          title: string;
          excerpt: string | null;
          content: string | null;
          meta_title: string | null;
          meta_description: string | null;
        }[];
      };
      setSlugTouched(true);
      setForm({
        slug: d.slug,
        featured_image: d.featured_image,
        is_featured: d.is_featured,
        category: d.category ?? "",
        tags: (d.tags ?? []).join(", "),
      });

      const trs: Record<string, TranslationForm> = {};
      for (const loc of LOCALES) trs[loc.code] = emptyTr();
      for (const tr of d.translations ?? []) {
        trs[tr.locale] = {
          title: tr.title,
          excerpt: tr.excerpt ?? "",
          content: tr.content ?? "",
          meta_title: tr.meta_title ?? "",
          meta_description: tr.meta_description ?? "",
        };
      }
      setTranslations(trs);
      setActiveLocale(LOCALES.find((l) => trs[l.code].title)?.code ?? "vi");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const switchLocale = (code: string) => {
    // Freeze the auto-slug once a first title exists, so switching tabs never
    // rewrites a slug that is already published.
    if (form.slug) setSlugTouched(true);
    setActiveLocale(code);
  };

  const updateTr = (locale: string, field: keyof TranslationForm, value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    if (field === "title" && !slugTouched) setForm((f) => ({ ...f, slug: slugify(value) }));
  };

  const save = async (publish: boolean) => {
    const status = publish ? "published" : "draft";

    const shared = sharedSchema.safeParse({ slug: form.slug, category: form.category || null });
    if (!shared.success) {
      show("error", shared.error.issues[0].message);
      return;
    }

    const filled = LOCALES.filter((loc) => translations[loc.code].title.trim());
    if (filled.length === 0) {
      show("error", "At least one language needs a title");
      return;
    }
    for (const loc of filled) {
      const parsed = translationSchema.safeParse(translations[loc.code]);
      if (!parsed.success) {
        show("error", `${loc.label}: ${parsed.error.issues[0].message}`);
        return;
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      if (id) fd.set("id", id);
      fd.set("type", type);
      fd.set("status", status);
      fd.set("slug", form.slug);
      if (form.featured_image) fd.set("featured_image", form.featured_image);
      fd.set("is_featured", form.is_featured ? "on" : "off");
      fd.set("category", form.category);
      fd.set("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));

      for (const loc of LOCALES) {
        const tr = translations[loc.code];
        fd.set(`tr_${loc.code}_title`, tr.title);
        fd.set(`tr_${loc.code}_excerpt`, tr.excerpt);
        fd.set(`tr_${loc.code}_content`, tr.content);
        fd.set(`tr_${loc.code}_meta_title`, tr.meta_title);
        fd.set(`tr_${loc.code}_meta_description`, tr.meta_description);
      }
      await savePost(fd);
    } catch (e: unknown) {
      setSaving(false);
      show("error", e instanceof Error ? e.message : "Save failed");
    }
  };

  if (loading) return <div className="text-ink-3 text-sm">Loading...</div>;

  const backTo = type === "news" ? "/admin/news" : "/admin/posts";
  const tr = translations[activeLocale];
  const activeLabel = LOCALES.find((l) => l.code === activeLocale)?.label ?? activeLocale;

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={backTo} className="text-ink-3 hover:text-ink">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-2xl uppercase">
            {isNew ? "NEW" : "EDIT"} {type === "news" ? "NEWS" : "POST"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="btn-ghost-soft">
            <Save size={14} /> SAVE DRAFT
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-peach">
            {saving ? "..." : "PUBLISH"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 min-w-0">
          <div className="flex gap-1 border-b border-line pb-0">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLocale === loc.code
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-3 hover:text-ink"
                }`}
              >
                {loc.label}
                {translations[loc.code].title.trim() && <span className="ml-1.5 text-brand">•</span>}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-3">
            A post is only shown in a language that has a title here. Leave a tab empty to hide the
            post in that language.
          </p>

          <AdminField label={`Title (${activeLabel})`}>
            <input
              value={tr.title}
              onChange={(e) => updateTr(activeLocale, "title", e.target.value)}
              className="admin-input text-lg font-display"
              maxLength={200}
            />
          </AdminField>
          <AdminField label="Slug (shared by every language)">
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value });
              }}
              className="admin-input font-mono text-sm"
              maxLength={120}
            />
          </AdminField>
          <AdminField label={`Excerpt (${activeLabel})`}>
            <textarea
              value={tr.excerpt}
              onChange={(e) => updateTr(activeLocale, "excerpt", e.target.value)}
              className="admin-input"
              rows={3}
              maxLength={500}
            />
          </AdminField>
          <AdminField label={`Content (${activeLabel})`}>
            <TipTapEditor
              key={activeLocale}
              value={tr.content}
              onChange={(html) => updateTr(activeLocale, "content", html)}
            />
          </AdminField>
        </div>

        <aside className="space-y-5">
          <div className="card-soft p-4 hover:translate-y-0 space-y-4">
            <AdminField label="Featured Image">
              <ImageUpload
                value={form.featured_image}
                onChange={(url) => setForm({ ...form, featured_image: url })}
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              Show as featured on homepage
            </label>
            <AdminField label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="admin-input"
                maxLength={80}
              />
            </AdminField>
            <AdminField label="Tags (comma separated)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="admin-input"
              />
            </AdminField>
          </div>

          <div className="card-soft p-4 hover:translate-y-0 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              SEO ({activeLabel})
            </h3>
            <AdminField label="Meta title">
              <input
                value={tr.meta_title}
                onChange={(e) => updateTr(activeLocale, "meta_title", e.target.value)}
                className="admin-input"
                maxLength={120}
              />
            </AdminField>
            <AdminField label="Meta description">
              <textarea
                value={tr.meta_description}
                onChange={(e) => updateTr(activeLocale, "meta_description", e.target.value)}
                className="admin-input"
                rows={3}
                maxLength={300}
              />
            </AdminField>
          </div>
        </aside>
      </div>
    </div>
  );
}

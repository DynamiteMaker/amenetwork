"use client";

import { useEffect, useState, useRef } from "react";
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

const schema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  slug: z.string().trim().min(1, "Slug required").max(120).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().max(100000).optional().nullable(),
  meta_title: z.string().max(120).optional().nullable(),
  meta_description: z.string().max(300).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
});

export function PostEditor({ type, id }: { type: "post" | "news"; id?: string }) {
  const isNew = !id;
  const formRef = useRef<HTMLFormElement>(null);
  const { feedback, show } = useFeedback();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: null as string | null,
    status: "draft" as "draft" | "published",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    category: "",
    tags: "",
  });

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id!).maybeSingle();
      setLoading(false);
      if (error || !data) {
        show("error", "Not found");
        return;
      }
      setSlugTouched(true);
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        featured_image: data.featured_image,
        status: data.status as "draft" | "published",
        is_featured: data.is_featured,
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        category: data.category ?? "",
        tags: (data.tags ?? []).join(", "),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  const save = async (publish: boolean) => {
    const status = publish ? "published" : "draft";
    const parsed = schema.safeParse({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      category: form.category || null,
    });
    if (!parsed.success) {
      show("error", parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (id) fd.set("id", id);
      fd.set("type", type);
      fd.set("status", status);
      fd.set("title", form.title);
      fd.set("slug", form.slug);
      fd.set("excerpt", form.excerpt);
      fd.set("content", form.content);
      if (form.featured_image) fd.set("featured_image", form.featured_image);
      fd.set("is_featured", form.is_featured ? "on" : "off");
      fd.set("meta_title", form.meta_title);
      fd.set("meta_description", form.meta_description);
      fd.set("category", form.category);
      fd.set("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
      await savePost(fd);
    } catch (e: any) {
      setSaving(false);
      show("error", e.message || "Save failed");
    }
  };

  if (loading) return <div className="text-ink-3 text-sm">Loading...</div>;

  const backTo = type === "news" ? "/admin/news" : "/admin/posts";

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={backTo as any} className="text-ink-3 hover:text-ink">
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
          <AdminField label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="admin-input text-lg font-display"
              maxLength={200}
            />
          </AdminField>
          <AdminField label="Slug">
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
          <AdminField label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="admin-input"
              rows={3}
              maxLength={500}
            />
          </AdminField>
          <AdminField label="Content">
            <TipTapEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">SEO</h3>
            <AdminField label="Meta title">
              <input
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                className="admin-input"
                maxLength={120}
              />
            </AdminField>
            <AdminField label="Meta description">
              <textarea
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
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

"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Clock, ClipboardCopy, ClipboardPaste, Copy, FileCode2, Save } from "lucide-react";
import { dump, load } from "js-yaml";
import { z } from "zod";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { slugify } from "@/lib/slug";
import { TipTapEditor } from "@/components/admin/tiptap-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminField } from "@/components/admin/admin-field";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { SchedulePicker } from "@/components/admin/schedule-picker";
import { formatVnDateTime, isoToVnInput, vnLocalToIso } from "@/lib/vn-time";
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
// Marks clipboard JSON as a copied translation so PASTE can tell it apart
// from anything else the user has copied.
const TR_CLIPBOARD_KEY = "__ame_translation__";

const sharedSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  category: z.string().max(80).optional().nullable(),
});

// No length caps on purpose: the DB columns are TEXT and the admin decides
// how long titles and meta text run. Only a title is required.
const translationSchema = z.object({
  title: z.string().trim().min(1),
  excerpt: z.string().trim(),
  content: z.string(),
  meta_title: z.string(),
  meta_description: z.string(),
});

export function PostEditor({ type, id }: { type: "post" | "news"; id?: string }) {
  const isNew = !id;
  const { feedback, show } = useFeedback();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeLocale, setActiveLocale] = useState<string>("vi");
  const [copySource, setCopySource] = useState<string | null>(null);

  const [form, setForm] = useState({
    slug: "",
    featured_image: null as string | null,
    is_featured: false,
    category: "",
    tags: "",
    status: "draft" as "draft" | "scheduled" | "published",
    published_at: null as string | null,
  });
  const [scheduleAt, setScheduleAt] = useState("");
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({
    en: emptyTr(),
    vi: emptyTr(),
    ja: emptyTr(),
    zh: emptyTr(),
  });
  const [yamlMode, setYamlMode] = useState(false);
  const [yamlText, setYamlText] = useState("");

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
      setForm({
        slug: d.slug,
        featured_image: d.featured_image,
        is_featured: d.is_featured,
        category: d.category ?? "",
        tags: (d.tags ?? []).join(", "),
        status: d.status as "draft" | "scheduled" | "published",
        published_at: d.published_at,
      });
      setScheduleAt(isoToVnInput(d.published_at));

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
    // Entering another tab in YAML view re-serializes that tab's fields.
    if (yamlMode) {
      setYamlText(dump(translations[code], { styles: { "!!str": "literal" }, lineWidth: 0 }));
    }
  };

  const toggleYamlMode = () => {
    if (yamlMode) {
      setYamlMode(false);
      return;
    }
    // Multiline strings as literal blocks keep the HTML readable for an LLM.
    setYamlText(dump(translations[activeLocale], { styles: { "!!str": "literal" }, lineWidth: 0 }));
    setYamlMode(true);
  };

  const updateTr = (locale: string, field: keyof TranslationForm, value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    if (field === "title" && !slugTouched) setForm((f) => ({ ...f, slug: slugify(value) }));
  };

  const save = async (status: "draft" | "scheduled" | "published") => {
    // The picked wall time means Vietnam time (GMT+7), whatever the device says.
    const publishIso = status === "scheduled" ? vnLocalToIso(scheduleAt) : null;
    if (status === "scheduled") {
      if (!publishIso) {
        show("error", "Pick a date and time to schedule");
        return;
      }
      if (new Date(publishIso).getTime() <= Date.now()) {
        show("error", "Scheduled time must be in the future");
        return;
      }
    }

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
      if (publishIso) fd.set("publish_at", publishIso);

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

  const filledSources = LOCALES.filter(
    (l) => l.code !== activeLocale && translations[l.code].title.trim(),
  );
  const effectiveSource = filledSources.some((l) => l.code === copySource)
    ? copySource
    : filledSources[0]?.code;

  const copyIntoActive = () => {
    const src = filledSources.find((l) => l.code === effectiveSource);
    if (!src) return;
    const dst = translations[activeLocale];
    const hasAny =
      dst.title.trim() ||
      dst.excerpt.trim() ||
      dst.content.trim() ||
      dst.meta_title.trim() ||
      dst.meta_description.trim();
    if (
      hasAny &&
      !confirm(`Replace all ${activeLabel} fields with the ${src.label} ones?`)
    ) {
      return;
    }
    setTranslations((prev) => ({ ...prev, [activeLocale]: { ...translations[src.code] } }));
    show("success", `Copied ${src.label} → ${activeLabel}`);
  };

  // Clipboard round-trip of the whole per-locale structure: copy on one tab
  // (or even in another post's editor), paste into any tab in one action.
  const copyTabToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ [TR_CLIPBOARD_KEY]: 1, ...translations[activeLocale] }),
      );
      show("success", `Copied all ${activeLabel} fields to clipboard`);
    } catch {
      show("error", "Could not write to the clipboard");
    }
  };

  const pasteTabFromClipboard = async () => {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      show("error", "Could not read the clipboard");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      show("error", "Clipboard has no copied fields");
      return;
    }
    if (!parsed || typeof parsed !== "object" || !(TR_CLIPBOARD_KEY in parsed)) {
      show("error", "Clipboard has no copied fields");
      return;
    }
    const raw = parsed as Record<string, unknown>;
    const incoming: TranslationForm = {
      title: typeof raw.title === "string" ? raw.title : "",
      excerpt: typeof raw.excerpt === "string" ? raw.excerpt : "",
      content: typeof raw.content === "string" ? raw.content : "",
      meta_title: typeof raw.meta_title === "string" ? raw.meta_title : "",
      meta_description: typeof raw.meta_description === "string" ? raw.meta_description : "",
    };
    const dst = translations[activeLocale];
    if (
      (dst.title.trim() ||
        dst.excerpt.trim() ||
        dst.content.trim() ||
        dst.meta_title.trim() ||
        dst.meta_description.trim()) &&
      !confirm(`Replace all ${activeLabel} fields with the clipboard ones?`)
    ) {
      return;
    }
    setTranslations((prev) => ({ ...prev, [activeLocale]: incoming }));
    show("success", `Pasted all fields into ${activeLabel}`);
  };

  // YAML view: serialize the active tab for machine translation (e.g. paste
  // into ChatGPT), then paste the translated YAML back and apply in one go.
  const applyYaml = () => {
    let text = yamlText.trim();
    // ChatGPT often wraps the answer in a code fence; strip it.
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/i, "");
    }
    let parsed: unknown;
    try {
      parsed = load(text);
    } catch (e) {
      const reason = e instanceof Error ? e.message.split("\n")[0] : "parse error";
      show("error", `Invalid YAML: ${reason}`);
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      show("error", "YAML must be the 5 translation fields");
      return;
    }
    const raw = parsed as Record<string, unknown>;
    const incoming: TranslationForm = {
      title: typeof raw.title === "string" ? raw.title : "",
      excerpt: typeof raw.excerpt === "string" ? raw.excerpt : "",
      content: typeof raw.content === "string" ? raw.content : "",
      meta_title: typeof raw.meta_title === "string" ? raw.meta_title : "",
      meta_description: typeof raw.meta_description === "string" ? raw.meta_description : "",
    };
    const dst = translations[activeLocale];
    if (
      (dst.title.trim() ||
        dst.excerpt.trim() ||
        dst.content.trim() ||
        dst.meta_title.trim() ||
        dst.meta_description.trim()) &&
      !confirm(`Replace all ${activeLabel} fields with the YAML content?`)
    ) {
      return;
    }
    setTranslations((prev) => ({ ...prev, [activeLocale]: incoming }));
    setYamlMode(false);
    show("success", `Applied YAML to ${activeLabel}`);
  };

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
      show("success", "YAML copied");
    } catch {
      show("error", "Could not write to the clipboard");
    }
  };

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
          {form.status === "scheduled" && form.published_at && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-peach-soft text-peach text-xs font-semibold">
              <Clock size={12} />
              Scheduled {formatVnDateTime(form.published_at)} (GMT+7)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SchedulePicker value={scheduleAt} onChange={setScheduleAt} />
          <button
            onClick={() => save("scheduled")}
            disabled={saving}
            className="btn-ghost-soft"
            title="Publish automatically at the chosen time"
          >
            <Clock size={14} /> SCHEDULE
          </button>
          <button onClick={() => save("draft")} disabled={saving} className="btn-ghost-soft">
            <Save size={14} /> SAVE DRAFT
          </button>
          <button onClick={() => save("published")} disabled={saving} className="btn-peach">
            {saving ? "..." : "PUBLISH"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 min-w-0">
          <div className="flex items-end justify-between gap-3 flex-wrap border-b border-line">
            <div className="flex gap-1">
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
                  {translations[loc.code].title.trim() && (
                    <span className="ml-1.5 text-brand">•</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-2 text-xs text-ink-3">
              {filledSources.length > 0 && (
                <>
                  <span className="whitespace-nowrap">Copy all fields from</span>
                  <select
                    value={effectiveSource ?? ""}
                    onChange={(e) => setCopySource(e.target.value)}
                    className="admin-input w-auto py-1 text-xs"
                    aria-label="Source language to copy from"
                  >
                    {filledSources.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={copyIntoActive}
                    className="btn-ghost-soft px-2.5 py-1 text-xs"
                  >
                    <Copy size={12} /> COPY
                  </button>
                  <span className="h-4 w-px bg-line" aria-hidden="true" />
                </>
              )}
              <button
                type="button"
                onClick={copyTabToClipboard}
                className="btn-ghost-soft px-2.5 py-1 text-xs"
                title="Copy all 5 fields of this tab to the clipboard"
              >
                <ClipboardCopy size={12} /> COPY TAB
              </button>
              <button
                type="button"
                onClick={pasteTabFromClipboard}
                className="btn-ghost-soft px-2.5 py-1 text-xs"
                title="Paste all 5 fields from the clipboard into this tab"
              >
                <ClipboardPaste size={12} /> PASTE
              </button>
              <button
                type="button"
                className="btn-ghost-soft px-2.5 py-1 text-xs"
                title="Switch between the form and a YAML view of this tab"
                onClick={toggleYamlMode}
              >
                <FileCode2 size={12} /> {yamlMode ? "FORM" : "YAML"}
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-3">
            A post is only shown in a language that has a title here. Leave a tab empty to hide the
            post in that language.
          </p>

          {yamlMode ? (
            <div className="card-soft p-4 hover:translate-y-0 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  YAML — {activeLabel}
                </h3>
                <div className="flex gap-2">
                  <button type="button" onClick={copyYaml} className="btn-ghost-soft px-2.5 py-1 text-xs">
                    <ClipboardCopy size={12} /> COPY YAML
                  </button>
                  <button type="button" onClick={applyYaml} className="btn-peach px-3 py-1 text-xs">
                    APPLY YAML
                  </button>
                </div>
              </div>
              <textarea
                value={yamlText}
                onChange={(e) => setYamlText(e.target.value)}
                spellCheck={false}
                className="admin-input font-mono text-xs leading-relaxed"
                rows={24}
                aria-label="YAML fields"
              />
              <p className="text-xs text-ink-3">
                Copy this YAML, have it translated (e.g. by ChatGPT), switch to the target
                language tab, paste the result here and click APPLY YAML. A code fence around
                the answer is stripped automatically.
              </p>
            </div>
          ) : (
            <>
          <AdminField label={`Title (${activeLabel})`}>
            <input
              value={tr.title}
              onChange={(e) => updateTr(activeLocale, "title", e.target.value)}
              className="admin-input text-lg font-display"
            />
          </AdminField>
          <AdminField label={`Excerpt (${activeLabel})`}>
            <textarea
              value={tr.excerpt}
              onChange={(e) => updateTr(activeLocale, "excerpt", e.target.value)}
              className="admin-input"
              rows={3}
            />
          </AdminField>
          <AdminField label={`Content (${activeLabel})`}>
            <TipTapEditor
              key={activeLocale}
              value={tr.content}
              onChange={(html) => updateTr(activeLocale, "content", html)}
            />
          </AdminField>
            </>
          )}
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
          {!yamlMode && (
          <div className="card-soft p-4 hover:translate-y-0 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              SEO ({activeLabel})
            </h3>
            <AdminField label="Meta title">
              <input
                value={tr.meta_title}
                onChange={(e) => updateTr(activeLocale, "meta_title", e.target.value)}
                className="admin-input"
              />
            </AdminField>
            <AdminField label="Meta description">
              <textarea
                value={tr.meta_description}
                onChange={(e) => updateTr(activeLocale, "meta_description", e.target.value)}
                className="admin-input"
                rows={3}
              />
            </AdminField>
          </div>
          )}
        </aside>
      </div>
    </div>
  );
}

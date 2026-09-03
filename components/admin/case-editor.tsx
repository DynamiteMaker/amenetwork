"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { slugify } from "@/lib/slug";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminField } from "@/components/admin/admin-field";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { saveCase } from "@/app/[locale]/admin/(dashboard)/actions";

const TAGS = ["branding", "digital", "growth", "healthcare", "apac"];
const LOCALES = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

interface TranslationForm {
  client: string;
  title: string;
  context: string;
  challenge: string;
}

interface CaseTranslationRow {
  locale: string;
  client: string;
  title: string;
  context: string | null;
  challenge: string | null;
}

const emptyTr = (): TranslationForm => ({ client: "", title: "", context: "", challenge: "" });

export function CaseEditor({ id }: { id?: string }) {
  const isNew = !id;
  const { feedback, show } = useFeedback();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugInput, setSlugInput] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string>("en");

  const [tag, setTag] = useState("branding");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [metricValue, setMetricValue] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [results, setResults] = useState<{ value: string; label: string }[]>([]);
  const [solution, setSolution] = useState<string[]>([""]);
  const [hasTestimonial, setHasTestimonial] = useState(false);
  const [testimonial, setTestimonial] = useState({ quote: "", author: "", role: "" });
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({
    en: emptyTr(),
    vi: emptyTr(),
    ja: emptyTr(),
    zh: emptyTr(),
  });

  // Auto-slug from EN title until the slug is edited manually
  const slug = slugInput ?? slugify(translations.en.title);

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`*,translations:case_translations!left(locale,client,title,context,challenge)`)
        .eq("id", id!)
        .maybeSingle();
      setLoading(false);
      if (error || !data) { show("error", "Not found"); return; }

      const d = data as typeof data & { translations: CaseTranslationRow[] };
      setSlugInput(d.slug);
      setTag(d.tag);
      setStatus(d.status === "published" ? "published" : "draft");
      setIsFeatured(d.is_featured);
      setSortOrder(d.sort_order);
      setThumbnail(d.thumbnail);
      setMetricValue(d.metric_value ?? "");
      setMetricLabel(d.metric_label ?? "");
      setResults((d.results as { value: string; label: string }[] | null) ?? []);
      setSolution(d.solution?.length ? d.solution : [""]);
      const loaded = d.testimonial as { quote: string; author: string; role: string } | null;
      if (loaded) { setHasTestimonial(true); setTestimonial(loaded); }

      const trs: Record<string, TranslationForm> = {};
      for (const loc of LOCALES) trs[loc.code] = emptyTr();
      for (const tr of d.translations ?? []) {
        trs[tr.locale] = { client: tr.client, title: tr.title, context: tr.context ?? "", challenge: tr.challenge ?? "" };
      }
      setTranslations(trs);
    })();
  }, [id, isNew]);

  const updateTr = (locale: string, field: keyof TranslationForm, value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const save = async (publish: boolean) => {
    const finalStatus = publish ? "published" : "draft";
    const enTr = translations.en;
    if (!enTr.client.trim()) { show("error", "English client name required"); return; }
    if (!enTr.title.trim()) { show("error", "English title required"); return; }
    if (!slug.trim()) { show("error", "Slug required"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      if (id) fd.set("id", id);
      fd.set("status", finalStatus);
      fd.set("slug", slug);
      fd.set("tag", tag);
      fd.set("is_featured", isFeatured ? "on" : "off");
      fd.set("sort_order", String(sortOrder));
      if (thumbnail) fd.set("thumbnail", thumbnail);
      fd.set("metric_value", metricValue);
      fd.set("metric_label", metricLabel);
      fd.set("results", JSON.stringify(results.filter((r) => r.value || r.label)));
      fd.set("solution", JSON.stringify(solution.filter((s) => s.trim())));
      fd.set("testimonial", hasTestimonial ? JSON.stringify(testimonial) : "");

      for (const loc of LOCALES) {
        const tr = translations[loc.code];
        fd.set(`tr_${loc.code}_client`, tr.client);
        fd.set(`tr_${loc.code}_title`, tr.title);
        fd.set(`tr_${loc.code}_context`, tr.context);
        fd.set(`tr_${loc.code}_challenge`, tr.challenge);
      }
      await saveCase(fd);
    } catch (e: unknown) {
      setSaving(false);
      show("error", e instanceof Error ? e.message : "Save failed");
    }
  };

  if (loading) return <div className="text-ink-3 text-sm">Loading…</div>;

  const tr = translations[activeLocale];

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/cases" as="/admin/cases" className="text-ink-3 hover:text-ink">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-2xl uppercase">{isNew ? "NEW" : "EDIT"} CASE</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="btn-ghost-soft">
            <Save size={14} /> SAVE DRAFT
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-peach">
            {saving ? "…" : "PUBLISH"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-5 min-w-0">
          {/* Locale tabs */}
          <div className="flex gap-1 border-b border-line pb-0">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setActiveLocale(loc.code)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLocale === loc.code
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-3 hover:text-ink"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          <AdminField label={`Client (${activeLocale.toUpperCase()})`}>
            <input
              value={tr.client}
              onChange={(e) => updateTr(activeLocale, "client", e.target.value)}
              className="admin-input text-lg font-display"
              maxLength={120}
            />
          </AdminField>
          <AdminField label={`Title (${activeLocale.toUpperCase()})`}>
            <input
              value={tr.title}
              onChange={(e) => updateTr(activeLocale, "title", e.target.value)}
              className="admin-input text-lg font-display"
              maxLength={200}
            />
          </AdminField>
          <AdminField label={`Context / Background (${activeLocale.toUpperCase()})`}>
            <textarea
              value={tr.context}
              onChange={(e) => updateTr(activeLocale, "context", e.target.value)}
              className="admin-input"
              rows={3}
            />
          </AdminField>
          <AdminField label={`Challenge (${activeLocale.toUpperCase()})`}>
            <textarea
              value={tr.challenge}
              onChange={(e) => updateTr(activeLocale, "challenge", e.target.value)}
              className="admin-input"
              rows={3}
            />
          </AdminField>

          {/* Solution bullets (shared) */}
          <AdminField label="Solution bullets (shared across locales)">
            <div className="space-y-2">
              {solution.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s}
                    onChange={(e) => {
                      const next = [...solution];
                      next[i] = e.target.value;
                      setSolution(next);
                    }}
                    className="admin-input flex-1"
                    placeholder="Solution point…"
                  />
                  <button
                    type="button"
                    onClick={() => setSolution(solution.filter((_, idx) => idx !== i))}
                    className="p-2 text-ink-3 hover:text-destructive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSolution([...solution, ""])}
                className="text-sm text-brand hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add bullet
              </button>
            </div>
          </AdminField>

          {/* Results (shared) */}
          <AdminField label="Results (shared)">
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={r.value}
                    onChange={(e) => {
                      const next = [...results];
                      next[i] = { ...next[i], value: e.target.value };
                      setResults(next);
                    }}
                    className="admin-input w-28"
                    placeholder="Value"
                  />
                  <input
                    value={r.label}
                    onChange={(e) => {
                      const next = [...results];
                      next[i] = { ...next[i], label: e.target.value };
                      setResults(next);
                    }}
                    className="admin-input flex-1"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={() => setResults(results.filter((_, idx) => idx !== i))}
                    className="p-2 text-ink-3 hover:text-destructive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setResults([...results, { value: "", label: "" }])}
                className="text-sm text-brand hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add result
              </button>
            </div>
          </AdminField>

          {/* Testimonial */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasTestimonial}
              onChange={(e) => setHasTestimonial(e.target.checked)}
            />
            Include testimonial
          </label>
          {hasTestimonial && (
            <div className="space-y-3 card-soft p-4 hover:translate-y-0">
              <AdminField label="Quote">
                <textarea
                  value={testimonial.quote}
                  onChange={(e) => setTestimonial({ ...testimonial, quote: e.target.value })}
                  className="admin-input"
                  rows={2}
                />
              </AdminField>
              <div className="grid grid-cols-2 gap-3">
                <AdminField label="Author">
                  <input
                    value={testimonial.author}
                    onChange={(e) => setTestimonial({ ...testimonial, author: e.target.value })}
                    className="admin-input"
                  />
                </AdminField>
                <AdminField label="Role">
                  <input
                    value={testimonial.role}
                    onChange={(e) => setTestimonial({ ...testimonial, role: e.target.value })}
                    className="admin-input"
                  />
                </AdminField>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="card-soft p-4 hover:translate-y-0 space-y-4">
            <AdminField label="Slug">
              <input
                value={slug}
                onChange={(e) => setSlugInput(e.target.value)}
                className="admin-input font-mono text-sm"
                maxLength={120}
              />
            </AdminField>
            <AdminField label="Tag">
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="admin-input"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Sort order">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="admin-input"
              />
            </AdminField>
            <AdminField label="Metric value">
              <input
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                className="admin-input"
                placeholder="e.g. 20M"
              />
            </AdminField>
            <AdminField label="Metric label">
              <input
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                className="admin-input"
                placeholder="e.g. reach"
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured on homepage
            </label>
          </div>

          <div className="card-soft p-4 hover:translate-y-0 space-y-4">
            <AdminField label="Thumbnail">
              <ImageUpload value={thumbnail} onChange={(url) => setThumbnail(url)} />
            </AdminField>
          </div>
        </aside>
      </div>
    </div>
  );
}

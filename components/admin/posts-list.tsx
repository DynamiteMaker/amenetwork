"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { deletePost } from "@/app/[locale]/admin/(dashboard)/actions";

const LOCALE_ORDER = ["vi", "en", "ja", "zh"] as const;

interface PostRow {
  id: string;
  slug: string;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
  translations: { locale: string; title: string }[];
}

function displayTitle(row: PostRow): string {
  for (const locale of LOCALE_ORDER) {
    const tr = row.translations.find((t) => t.locale === locale);
    if (tr?.title) return tr.title;
  }
  return row.translations[0]?.title ?? "(untitled)";
}

export function PostsList({ type }: { type: "post" | "news" }) {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { feedback, show } = useFeedback();

  const supabase = useSupabaseBrowser();

  const load = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id,slug,status,is_featured,published_at,updated_at,translations:post_translations!left(locale,title)")
      .eq("type", type)
      .order("updated_at", { ascending: false });
    setLoading(false);
    if (error) show("error", error.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    void (async () => { await load(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deletePost(id, type);
      show("success", "Deleted");
      setLoading(true);
      load();
    } catch (e: unknown) {
      show("error", e instanceof Error ? e.message : "Delete failed");
    }
  };

  const newPath = type === "news" ? "/admin/news/new" : "/admin/posts/new";
  const editBase = type === "news" ? "/admin/news" : "/admin/posts";

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl uppercase">{type === "news" ? "NEWS" : "POSTS"}</h1>
        <Link href={newPath} className="btn-peach">
          <Plus size={16} /> NEW
        </Link>
      </header>

      <div className="card-soft hover:translate-y-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-3 text-sm">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-ink-3 text-sm">No entries yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Languages</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Updated</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    <div className="font-medium">
                      {displayTitle(p)}
                      {p.is_featured && (
                        <span className="ml-2 text-xs text-peach font-semibold">★ FEATURED</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-3 mt-0.5">/{p.slug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {LOCALE_ORDER.filter((locale) =>
                        p.translations.some((t) => t.locale === locale && t.title),
                      ).map((locale) => (
                        <span
                          key={locale}
                          className="px-1.5 py-0.5 rounded bg-brand-soft text-brand text-[11px] font-semibold uppercase"
                        >
                          {locale}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === "published" ? "bg-brand-soft text-brand" : "bg-bg-2 text-ink-3"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-3 text-xs">{new Date(p.updated_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {p.status === "published" && (
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="p-1.5 rounded hover:bg-bg-2 text-ink-3"
                          title="View"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <Link
                        href={`${editBase}/${p.id}/edit`}
                        className="p-1.5 rounded hover:bg-bg-2 text-ink-2"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 rounded hover:bg-bg-2 text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

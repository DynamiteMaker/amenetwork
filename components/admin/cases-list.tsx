"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { deleteCase } from "@/app/[locale]/admin/(dashboard)/actions";

interface CaseRow {
  id: string;
  slug: string;
  tag: string;
  status: string;
  is_featured: boolean;
  thumbnail: string | null;
  sort_order: number;
  updated_at: string;
  translations: { locale: string; client: string; title: string }[];
}

export function CasesList() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { feedback, show } = useFeedback();

  const supabase = useSupabaseBrowser();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cases")
      .select(`id,slug,tag,status,is_featured,thumbnail,sort_order,updated_at,
        translations:case_translations!left(locale,client,title)`)
      .order("sort_order");
    setLoading(false);
    if (error) show("error", error.message);
    else setRows((data as unknown as CaseRow[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this case?")) return;
    try {
      await deleteCase(id);
      show("success", "Deleted");
      load();
    } catch (e: any) {
      show("error", e.message);
    }
  };

  const getTr = (row: CaseRow) =>
    row.translations?.find((t) => t.locale === "en") ?? row.translations?.[0];

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl uppercase">CASES</h1>
        <Link href="/admin/cases/new" as="/admin/cases/new" className="btn-peach">
          <Plus size={16} /> NEW CASE
        </Link>
      </header>

      <div className="card-soft hover:translate-y-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-3 text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-ink-3 text-sm">No cases yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="text-left px-5 py-3">Case</th>
                <th className="text-left px-5 py-3">Tag</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {rows.map((c) => {
                const tr = getTr(c);
                return (
                  <tr key={c.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.thumbnail && (
                          <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <div className="font-medium">
                            {tr?.client ?? "—"}
                            {c.is_featured && (
                              <span className="ml-2 text-xs text-peach font-semibold">★ FEATURED</span>
                            )}
                          </div>
                          <div className="text-xs text-ink-3 mt-0.5">{tr?.title ?? c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-bg-2 border border-line text-xs capitalize">
                        {c.tag}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === "published" ? "bg-brand-soft text-brand" : "bg-bg-2 text-ink-3"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-3">{c.sort_order}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {c.status === "published" && (
                          <a
                            href={`/cases/${c.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="p-1.5 rounded hover:bg-bg-2 text-ink-3"
                            title="View"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link
                          href={`/admin/cases/${c.id}/edit` as any}
                          className="p-1.5 rounded hover:bg-bg-2 text-ink-2"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="p-1.5 rounded hover:bg-bg-2 text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

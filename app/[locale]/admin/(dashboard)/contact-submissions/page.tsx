"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail } from "lucide-react";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { deleteSubmission } from "@/app/[locale]/admin/(dashboard)/actions";

interface Submission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  created_at: string;
}

export default function ContactSubmissionsPage() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { feedback, show } = useFeedback();

  const supabase = useSupabaseBrowser();

  const query = () =>
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

  const applyResult = ({ data, error }: Awaited<ReturnType<typeof query>>) => {
    setLoading(false);
    if (error) show("error", error.message);
    else setRows(data ?? []);
  };

  const load = async () => {
    setLoading(true);
    applyResult(await query());
  };

  useEffect(() => {
    void query().then(applyResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await deleteSubmission(id);
      show("success", "Deleted");
      load();
    } catch (e: unknown) {
      show("error", e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <h1 className="font-display text-3xl uppercase">CONTACT SUBMISSIONS</h1>

      <div className="card-soft hover:translate-y-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-3 text-sm">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-ink-3 text-sm">No submissions yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {r.full_name}{" "}
                      <span className="text-ink-3 text-xs ml-2">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-ink-2 mt-0.5">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-brand hover:underline inline-flex items-center gap-1"
                      >
                        <Mail size={12} /> {r.email}
                      </a>
                      {r.phone && <span className="ml-3 text-ink-3">{r.phone}</span>}
                      {r.company && <span className="ml-3 text-ink-3">{r.company}</span>}
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{r.message}</p>
                  </div>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="p-1.5 rounded hover:bg-bg-2 text-destructive shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

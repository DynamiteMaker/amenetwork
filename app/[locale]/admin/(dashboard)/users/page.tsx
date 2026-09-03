"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { grantRole, revokeRole } from "@/app/[locale]/admin/(dashboard)/actions";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [rows, setRows] = useState<UserRole[]>([]);
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const { feedback, show } = useFeedback();

  const supabase = useSupabaseBrowser();

  const query = () =>
    supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

  const applyResult = ({ data, error }: Awaited<ReturnType<typeof query>>) => {
    if (error) show("error", error.message);
    else setRows(data ?? []);
  };

  const load = async () => applyResult(await query());

  useEffect(() => {
    void query().then(applyResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) return;
    try {
      await grantRole(uid.trim(), role);
      show("success", "Role granted");
      setUid("");
      load();
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Could not grant role");
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm("Revoke role?")) return;
    try {
      await revokeRole(id);
      show("success", "Revoked");
      load();
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Could not revoke role");
    }
  };

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <h1 className="font-display text-3xl uppercase">USERS &amp; ROLES</h1>

      <div className="card-soft p-5 hover:translate-y-0 space-y-3">
        <p className="text-xs text-ink-3">
          New users sign up at <span className="font-mono">/admin/login</span>. Get their user_id from Supabase
          Dashboard → Users, then grant a role here.
        </p>
        <form onSubmit={onGrant} className="flex flex-wrap items-center gap-2">
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="user_id (uuid)"
            className="admin-input flex-1 min-w-[260px] font-mono text-xs"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "editor")}
            className="admin-input w-32"
          >
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
          <button className="btn-peach">GRANT</button>
        </form>
      </div>

      <div className="card-soft hover:translate-y-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th className="text-left px-5 py-3">User ID</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Granted</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-mono text-xs">{r.user_id}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand text-xs font-semibold">
                    {r.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-3 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => onRevoke(r.id)}
                    className="p-1.5 rounded hover:bg-bg-2 text-destructive"
                    title="Revoke"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-ink-3">
                  No roles granted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

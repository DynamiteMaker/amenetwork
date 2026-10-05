"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Power, Trash2, UserPlus } from "lucide-react";
import { useFeedback, FeedbackMessage } from "@/components/admin/feedback-message";
import { formatVnDateTime } from "@/lib/vn-time";
import type { AccountRecord, AccountRole } from "@/lib/accounts";
import {
  createAccount,
  setAccountRole,
  resetAccountPassword,
  setAccountActive,
  removeAccount,
} from "@/app/[locale]/admin/(dashboard)/actions";

const ROLE_OPTIONS: { value: AccountRole; label: string }[] = [
  { value: "admin", label: "admin" },
  { value: "editor", label: "editor" },
  { value: "user", label: "user (no access)" },
];

const MIN_PASSWORD_LENGTH = 8;

export function AccountsManager({
  accounts,
  currentUserId,
}: {
  accounts: AccountRecord[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { feedback, show } = useFeedback();
  const [busy, setBusy] = useState(false);

  // "Add account" form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("editor");

  // Inline "reset password" row
  const [resetFor, setResetFor] = useState<AccountRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Bumped to remount the role selects after a cancelled change so the DOM
  // snaps back to the server-rendered value.
  const [selectEpoch, setSelectEpoch] = useState(0);

  const run = async (fn: () => Promise<unknown>, successMessage: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      show("success", successMessage);
      router.refresh();
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await run(async () => {
      await createAccount(email, name, password, role);
      setEmail("");
      setName("");
      setPassword("");
      setRole("editor");
    }, "Account created");
  };

  const onRoleChange = async (account: AccountRecord, nextRole: string) => {
    if (nextRole === account.role) return;
    if (!confirm(`Change ${account.email} to "${nextRole}"?`)) {
      setSelectEpoch((n) => n + 1);
      return;
    }
    await run(() => setAccountRole(account.id, nextRole as AccountRole), "Role updated");
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetFor) return;
    await run(async () => {
      await resetAccountPassword(resetFor.id, newPassword);
      setResetFor(null);
      setNewPassword("");
    }, "Password updated");
  };

  const onToggleActive = async (account: AccountRecord) => {
    const verb = account.active ? "Deactivate" : "Reactivate";
    if (!confirm(`${verb} ${account.email}?`)) return;
    await run(() => setAccountActive(account.id, !account.active), `${verb}d`);
  };

  const onRemove = async (account: AccountRecord) => {
    if (!confirm(`Permanently remove ${account.email}? This cannot be undone.`)) return;
    await run(() => removeAccount(account.id), "Account removed");
  };

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} />
      <div>
        <h1 className="font-display text-3xl uppercase">ACCOUNTS</h1>
        <p className="mt-1 text-xs text-ink-3">
          One admin manages every account: create sign-ins, set roles, reset passwords,
          disable or remove access. Accounts sign in at <span className="font-mono">/admin/login</span>.
        </p>
      </div>

      <form onSubmit={onAdd} className="card-soft hover:translate-y-0 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="email@company.com"
            className="admin-input flex-[2] min-w-[220px]"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name (optional)"
            className="admin-input flex-[2] min-w-[200px]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`Password (min ${MIN_PASSWORD_LENGTH} chars)`}
            className="admin-input flex-[2] min-w-[200px]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AccountRole)}
            className="admin-input w-40"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button disabled={busy} className="btn-peach inline-flex items-center gap-1.5">
            <UserPlus size={15} /> ADD
          </button>
        </div>
      </form>

      <div className="card-soft hover:translate-y-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th className="text-left px-5 py-3">Account</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Last sign-in</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {accounts.map((r) => {
              const isSelf = r.id === currentUserId;
              return (
<Fragment key={r.id}>
                  <tr key={r.id}>
                    <td className="px-5 py-3">
                      <div className="font-medium">{r.email}</div>
                      {r.name && <div className="text-xs text-ink-3">{r.name}</div>}
                    </td>
                    <td className="px-5 py-3">
                      {isSelf ? (
                        <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand text-xs font-semibold">
                          {r.role}
                        </span>
                      ) : (
                        <select
                          key={`${selectEpoch}-${r.id}`}
                          defaultValue={r.role}
                          onChange={(e) => void onRoleChange(r, e.target.value)}
                          disabled={busy}
                          className="admin-input w-36 py-1.5 text-xs"
                        >
                          {ROLE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.active
                            ? "bg-brand-soft text-brand"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {r.active ? "active" : "disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-3 text-xs">
                      {r.lastSignInAt ? formatVnDateTime(r.lastSignInAt) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {isSelf ? (
                        <span className="text-xs font-semibold text-ink-3">YOU</span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setResetFor(resetFor?.id === r.id ? null : r);
                              setNewPassword("");
                            }}
                            disabled={busy}
                            className="p-1.5 rounded hover:bg-bg-2 text-ink-2"
                            title="Reset password"
                          >
                            <KeyRound size={14} />
                          </button>
                          <button
                            onClick={() => void onToggleActive(r)}
                            disabled={busy}
                            className={`p-1.5 rounded hover:bg-bg-2 ${
                              r.active ? "text-ink-2" : "text-brand"
                            }`}
                            title={r.active ? "Deactivate" : "Reactivate"}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => void onRemove(r)}
                            disabled={busy}
                            className="p-1.5 rounded hover:bg-bg-2 text-destructive"
                            title="Remove account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {resetFor?.id === r.id && (
                    <tr key={`${r.id}-reset`}>
                      <td colSpan={5} className="bg-bg-2/60 px-5 py-3">
                        <form onSubmit={onResetPassword} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-ink-3">
                            New password for <span className="font-medium text-ink-2">{r.email}</span>:
                          </span>
                          <input
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type="password"
                            required
                            minLength={MIN_PASSWORD_LENGTH}
                            placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
                            className="admin-input w-56"
                          />
                          <button disabled={busy} className="btn-peach">
                            SET PASSWORD
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetFor(null);
                              setNewPassword("");
                            }}
                            className="text-xs text-ink-3 hover:text-ink px-2 py-1"
                          >
                            CANCEL
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
</Fragment>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink-3">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

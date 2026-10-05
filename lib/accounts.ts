import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AccountRole = "admin" | "editor" | "user";

export interface AccountRecord {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
  active: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

/**
 * An account is disabled while its ban window covers "now". Supabase stores
 * `banned_until` (null when active); a permanent ban uses a far-future date.
 */
export function isAccountDisabled(bannedUntil: string | null | undefined): boolean {
  if (!bannedUntil) return false;
  const ts = Date.parse(bannedUntil);
  return !Number.isNaN(ts) && ts > Date.now();
}

/**
 * `user_roles` allows several rows per user (UNIQUE(user_id, role)), so fold
 * them into one effective role. Admin wins over editor, anything else means
 * plain "user" (no dashboard access).
 */
export function effectiveRole(roles: string[]): AccountRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("editor")) return "editor";
  return "user";
}

/**
 * Rules every destructive account mutation must pass:
 * - the admin never mutates their own account from here (lockout protection);
 * - the last active admin cannot be demoted, disabled or removed.
 * Returns an error message, or null when the mutation is allowed.
 */
export function checkAccountMutation(
  actorId: string,
  target: Pick<AccountRecord, "id" | "role">,
  otherActiveAdmins: number,
): string | null {
  if (actorId === target.id) {
    return "You cannot modify your own account here.";
  }
  if (target.role === "admin" && otherActiveAdmins === 0) {
    return "Cannot change the last active admin. Promote another admin first.";
  }
  return null;
}

export function toAccountRecord(user: User, roles: string[]): AccountRecord {
  return {
    id: user.id,
    email: user.email ?? "(no email)",
    name: (user.user_metadata?.name as string | undefined) ?? "",
    role: effectiveRole(roles),
    active: !isAccountDisabled(user.banned_until),
    createdAt: user.created_at ?? "",
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

const ROLE_RANK: Record<AccountRole, number> = { admin: 0, editor: 1, user: 2 };

function accountSort(a: AccountRecord, b: AccountRecord): number {
  const byRole = ROLE_RANK[a.role] - ROLE_RANK[b.role];
  if (byRole !== 0) return byRole;
  return a.email.localeCompare(b.email);
}

/** Every auth user merged with their effective role, admins first. */
export async function listAccounts(admin: SupabaseClient): Promise<AccountRecord[]> {
  const users: User[] = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (!data.next_page) break;
    page = data.next_page;
  }

  const { data: roleRows, error } = await admin.from("user_roles").select("user_id, role");
  if (error) throw new Error(error.message);
  const rolesByUser = new Map<string, string[]>();
  for (const row of roleRows ?? []) {
    const list = rolesByUser.get(row.user_id) ?? [];
    list.push(row.role);
    rolesByUser.set(row.user_id, list);
  }

  return users
    .map((u) => toAccountRecord(u, rolesByUser.get(u.id) ?? []))
    .sort(accountSort);
}

export async function getAccountRecord(
  admin: SupabaseClient,
  userId: string,
): Promise<AccountRecord | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  const { data: roleRows } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return toAccountRecord(
    data.user,
    (roleRows ?? []).map((r: { role: string }) => r.role),
  );
}

/** Active admins other than `excludeUserId` — used by the last-admin guard. */
export async function countOtherActiveAdmins(
  admin: SupabaseClient,
  excludeUserId: string,
): Promise<number> {
  const { data } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .neq("user_id", excludeUserId);
  if (!data) return 0;

  let count = 0;
  for (const row of data) {
    const { data: res } = await admin.auth.admin.getUserById(row.user_id);
    if (res?.user && !isAccountDisabled(res.user.banned_until)) count++;
  }
  return count;
}

import { createClient } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data?.role ?? "user";
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { user: null, role: null, authorized: false };
  const role = await getUserRole(user.id);
  return { user, role, authorized: role === "admin" || role === "editor" };
}

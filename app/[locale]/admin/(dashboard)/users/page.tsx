import { redirect } from "next/navigation";
import { getCurrentUser, getUserRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAccounts } from "@/lib/accounts";
import { AccountsManager } from "@/components/admin/accounts-manager";

// The dashboard layout guarantees a signed-in admin/editor; only the admin
// may manage accounts, so editors hitting this URL directly bounce out.
export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const role = user ? await getUserRole(user.id) : null;
  if (!user || role !== "admin") redirect(`/${locale}/admin`);

  const accounts = await listAccounts(createAdminClient());

  return <AccountsManager accounts={accounts} currentUserId={user.id} />;
}

import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser, getUserRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/admin/login`);

  const role = await getUserRole(user.id);
  if (role !== "admin" && role !== "editor") redirect(`/${locale}/admin/login`);

  return (
    <AdminShell role={role} email={user.email}>
      {children}
    </AdminShell>
  );
}

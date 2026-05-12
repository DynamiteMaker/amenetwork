"use client";

import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({
  children,
  role,
  email,
}: {
  children: React.ReactNode;
  role: string | null;
  email?: string;
}) {
  return (
    <div className="min-h-screen flex bg-bg-2">
      <AdminSidebar role={role} email={email} />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}

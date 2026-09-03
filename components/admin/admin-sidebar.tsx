"use client";

import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, FileText, Newspaper, Inbox, LogOut, Users, Briefcase } from "lucide-react";
import { logout } from "@/app/[locale]/admin/login/actions";

const items = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard, end: true },
  { href: "/admin/posts", label: "POSTS", icon: FileText },
  { href: "/admin/news", label: "NEWS", icon: Newspaper },
  { href: "/admin/cases", label: "CASES", icon: Briefcase },
  { href: "/admin/contact-submissions", label: "SUBMISSIONS", icon: Inbox },
  { href: "/admin/users", label: "USERS", icon: Users, adminOnly: true },
];

export function AdminSidebar({ role, email }: { role: string | null; email?: string }) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <aside className="w-60 bg-surface border-r border-line flex flex-col shrink-0">
      <div className="p-5 border-b border-line">
        <Link href="/" className="font-display text-lg tracking-tight">
          AME ADMIN
        </Link>
        {email && <p className="text-xs text-ink-3 mt-1 truncate">{email}</p>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items
          .filter((i) => !i.adminOnly || isAdmin)
          .map((it) => {
            const active = it.end ? pathname === it.href : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-bg-2"
                }`}
              >
                <it.icon size={16} />
                {it.label}
              </Link>
            );
          })}
      </nav>
      <form action={logout} className="m-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-2 hover:bg-bg-2"
        >
          <LogOut size={16} /> SIGN OUT
        </button>
      </form>
    </aside>
  );
}

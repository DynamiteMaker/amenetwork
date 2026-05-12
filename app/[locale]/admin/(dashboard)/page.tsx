"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { FileText, Newspaper, Inbox, ShieldAlert } from "lucide-react";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";

interface Stats {
  posts: number;
  news: number;
  drafts: number;
  published: number;
  submissions: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ posts: 0, news: 0, drafts: 0, published: 0, submissions: 0 });
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    (async () => {
      const [posts, news, drafts, published, recentRows] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("type", "post"),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("type", "news"),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("posts").select("id,title,type,status,updated_at").order("updated_at", { ascending: false }).limit(8),
      ]);
      const { count: subCount } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true });

      setStats({
        posts: posts.count ?? 0,
        news: news.count ?? 0,
        drafts: drafts.count ?? 0,
        published: published.count ?? 0,
        submissions: subCount ?? 0,
      });
      setRecent(recentRows.data ?? []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl uppercase">DASHBOARD</h1>
        <p className="text-ink-3 text-sm mt-1">Overview of your content.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="POSTS" value={stats.posts} icon={FileText} />
        <StatCard label="NEWS" value={stats.news} icon={Newspaper} />
        <StatCard label="PUBLISHED" value={stats.published} />
        <StatCard label="DRAFTS" value={stats.drafts} />
        <StatCard label="SUBMISSIONS" value={stats.submissions} icon={Inbox} />
      </div>

      <div className="card-soft p-6 hover:translate-y-0">
        <h2 className="font-display text-lg uppercase mb-4">RECENT</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-3">
            No content yet.{" "}
            <Link href="/admin/posts/new" className="text-brand underline">
              Create your first post
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/${p.type === "news" ? "news" : "posts"}/${p.id}/edit` as any}
                    className="text-sm font-medium hover:text-brand truncate block"
                  >
                    {p.title}
                  </Link>
                  <div className="text-xs text-ink-3 mt-0.5">
                    {p.type.toUpperCase()} · {p.status} · {new Date(p.updated_at).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon?: any }) {
  return (
    <div className="card-soft p-5 hover:translate-y-0">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ink-3">
        {Icon && <Icon size={14} />} {label}
      </div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}

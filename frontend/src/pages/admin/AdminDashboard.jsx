import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FileText, Users, Heart, Mail, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/admin/blogs").then(({ data }) => setRecent(data.slice(0, 5)));
  }, []);

  const cards = [
    { label: "Total Articles", value: stats?.total_blogs, icon: FileText },
    { label: "Published", value: stats?.published, icon: FileText },
    { label: "Subscribers", value: stats?.subscribers, icon: Mail },
    { label: "Total Likes", value: stats?.total_likes, icon: Heart },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Control Room</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Dashboard.</h1>
        </div>
        <Link to="/admin/blogs/new" data-testid="new-blog-cta" className="btn-pill bg-[var(--text)] text-[var(--bg)] px-6 h-11 text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity">
          New Article <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" data-testid="admin-stats">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-[var(--border)] p-6">
            <c.icon size={18} className="text-[var(--accent)] mb-4" />
            <div className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-1">{c.value ?? "—"}</div>
            <div className="text-xs font-medium text-[var(--text-sec)]">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-display font-semibold text-2xl tracking-tight">Recent Articles</h2>
          <Link to="/admin/blogs" className="text-sm font-medium hover-line">All →</Link>
        </div>
        <div>
          {recent.map((b) => (
            <Link key={b.id} to={`/admin/blogs/edit/${b.id}`} className="p-6 border-b border-[var(--border)] last:border-0 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors" data-testid={`admin-blog-${b.slug}`}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[var(--accent)] mb-1">{b.category} · {b.published ? "Published" : "Draft"}</div>
                <div className="font-display font-semibold text-lg truncate">{b.title}</div>
              </div>
              <div className="text-xs font-medium text-[var(--text-sec)] ml-4">
                {b.likes} ♡
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

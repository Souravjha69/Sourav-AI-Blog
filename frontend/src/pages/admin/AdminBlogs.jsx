import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit3, Plus, Eye } from "lucide-react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/blogs");
    setBlogs(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      toast.success("Deleted");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Content</div>
          <h1 className="font-display font-bold text-4xl tracking-tight">Articles.</h1>
        </div>
        <Link to="/admin/blogs/new" className="btn-pill bg-[var(--text)] text-[var(--bg)] px-6 h-11 text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity" data-testid="admin-new-btn">
          <Plus size={14} /> New
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--text-sec)]">Loading…</div>
      ) : (
        <>
          {/* Desktop/tablet table */}
          <div className="hidden md:block rounded-3xl border border-[var(--border)] overflow-hidden" data-testid="admin-blogs-table">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] text-xs font-medium uppercase tracking-widest text-[var(--text-sec)]">
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Likes</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {blogs.map((b) => (
              <div key={b.id} className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] last:border-0 items-center hover:bg-[var(--surface-2)] transition-colors" data-testid={`row-${b.slug}`}>
                <div className="col-span-6 font-display font-semibold truncate">{b.title}</div>
                <div className="col-span-2 text-sm">{b.category}</div>
                <div className="col-span-1 text-xs font-medium">
                  <span className={b.published ? "text-[var(--accent)]" : "text-[var(--text-sec)]"}>
                    {b.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="col-span-1 text-sm">{b.likes}</div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Link to={`/blog/${b.slug}`} target="_blank" className="p-2 rounded-full border border-[var(--border)] hover:border-[var(--text)]" title="View"><Eye size={13} /></Link>
                  <Link to={`/admin/blogs/edit/${b.id}`} data-testid={`edit-${b.slug}`} className="p-2 rounded-full border border-[var(--border)] hover:border-[var(--text)]"><Edit3 size={13} /></Link>
                  <button onClick={() => del(b.id)} data-testid={`delete-${b.slug}`} className="p-2 rounded-full border border-[var(--border)] hover:border-[var(--danger)] hover:text-[var(--danger)]"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3" data-testid="admin-blogs-table-mobile">
            {blogs.map((b) => (
              <div key={b.id} className="rounded-2xl border border-[var(--border)] p-4" data-testid={`row-${b.slug}`}>
                <div className="font-display font-semibold text-base mb-2">{b.title}</div>
                <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-sec)] mb-4">
                  <span>{b.category}</span>
                  <span className={b.published ? "text-[var(--accent)]" : "text-[var(--text-sec)]"}>
                    {b.published ? "Live" : "Draft"}
                  </span>
                  <span>{b.likes} likes</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/blog/${b.slug}`} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full border border-[var(--border)] text-xs font-medium">
                    <Eye size={13} /> View
                  </Link>
                  <Link to={`/admin/blogs/edit/${b.id}`} data-testid={`edit-${b.slug}`} className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full border border-[var(--border)] text-xs font-medium">
                    <Edit3 size={13} /> Edit
                  </Link>
                  <button onClick={() => del(b.id)} data-testid={`delete-${b.slug}`} className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full border border-[var(--border)] text-xs font-medium text-[var(--danger)]">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

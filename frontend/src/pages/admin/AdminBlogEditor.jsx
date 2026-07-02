import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT = {
  title: "", excerpt: "", content: "", category: "Tech",
  tags: [], cover_image: "", author_id: "a1", read_time: 5, published: true,
};

export default function AdminBlogEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(DEFAULT);
  const [authors, setAuthors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { api.get("/authors").then(({ data }) => setAuthors(data)); }, []);
  useEffect(() => {
    if (!id) return;
    api.get("/admin/blogs").then(({ data }) => {
      const b = data.find((x) => x.id === id);
      if (b) setForm({ ...b });
    });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = { ...form };
    delete payload.id; delete payload.slug; delete payload.likes; delete payload.comments;
    delete payload.created_at; delete payload.updated_at;
    try {
      if (id) await api.put(`/admin/blogs/${id}`, payload);
      else await api.post("/admin/blogs", payload);
      toast.success(id ? "Updated" : "Published");
      nav("/admin/blogs");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed");
    } finally { setBusy(false); }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    set("tags", [...(form.tags || []), tagInput.trim()]);
    setTagInput("");
  };

  return (
    <div className="max-w-4xl">
      <Link to="/admin/blogs" className="text-sm font-medium mb-6 inline-flex items-center gap-2 hover-line"><ArrowLeft size={13} /> Back</Link>
      <div className="mb-10">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-3">{id ? "Editor" : "New"}</div>
        <h1 className="font-display font-bold text-4xl tracking-tight">{id ? "Edit article." : "New article."}</h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Field label="Title">
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="editor-title"
                 className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] h-12 px-4 font-display font-bold text-2xl outline-none transition-colors" />
        </Field>
        <Field label="Excerpt">
          <textarea required rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} data-testid="editor-excerpt"
                    className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] p-4 text-base outline-none resize-none transition-colors" />
        </Field>
        <Field label="Content (Markdown-ish. Use ## for headings, double newline for paragraphs)">
          <textarea required rows={16} value={form.content} onChange={(e) => set("content", e.target.value)} data-testid="editor-content"
                    className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] p-4 font-body text-base outline-none resize-none leading-relaxed transition-colors" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="editor-category"
                    className="w-full bg-transparent rounded-2xl border border-[var(--border)] h-12 px-4 text-sm outline-none">
              <option>Tech</option>
              <option>AI</option>
            </select>
          </Field>
          <Field label="Author">
            <select value={form.author_id} onChange={(e) => set("author_id", e.target.value)} data-testid="editor-author"
                    className="w-full bg-transparent rounded-2xl border border-[var(--border)] h-12 px-4 text-sm outline-none">
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Read time (min)">
            <input type="number" min="1" value={form.read_time} onChange={(e) => set("read_time", parseInt(e.target.value) || 1)} data-testid="editor-readtime"
                   className="w-full bg-transparent rounded-2xl border border-[var(--border)] h-12 px-4 text-sm outline-none" />
          </Field>
        </div>
        <Field label="Cover Image URL">
          <input value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} data-testid="editor-cover"
                 className="w-full bg-transparent rounded-2xl border border-[var(--border)] h-12 px-4 text-sm outline-none" placeholder="https://..." />
          {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 h-40 object-cover rounded-2xl" />}
        </Field>
        <Field label="Tags">
          <div className="flex gap-2 mb-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" data-testid="editor-tag-input"
                   className="flex-1 bg-transparent rounded-full border border-[var(--border)] h-10 px-4 text-xs outline-none" />
            <button onClick={addTag} data-testid="editor-tag-add" className="btn-pill bg-[var(--text)] text-[var(--bg)] px-4 text-xs font-medium">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.tags || []).map((t) => (
              <button key={t} type="button" onClick={() => set("tags", form.tags.filter((x) => x !== t))} className="text-xs rounded-full border border-[var(--border)] px-3 py-1 hover:border-[var(--danger)]">
                #{t} ✕
              </button>
            ))}
          </div>
        </Field>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="published" checked={form.published} onChange={(e) => set("published", e.target.checked)} data-testid="editor-published" />
          <label htmlFor="published" className="text-sm font-medium">Published</label>
        </div>
        <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-3">
          <Link to="/admin/blogs" className="btn-pill border border-[var(--border)] px-6 h-12 text-sm font-medium flex items-center hover:border-[var(--text)]">Cancel</Link>
          <button type="submit" disabled={busy} data-testid="editor-save"
                  className="btn-pill bg-[var(--text)] text-[var(--bg)] px-8 h-12 text-sm font-medium flex items-center gap-2 hover:opacity-85 transition-opacity disabled:opacity-50">
            <Save size={14} /> {busy ? "Saving…" : id ? "Save" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-[0.15em] text-[var(--text-sec)] mb-2">{label}</label>
      {children}
    </div>
  );
}

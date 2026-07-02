import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { BlogCard } from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";

const CATEGORIES = ["All", "Tech", "AI"];

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category") || "All";

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (q) params.set("search", q);
    const { data } = await api.get(`/blogs?${params.toString()}`);
    setBlogs(data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const setCategory = (c) => {
    const next = new URLSearchParams(searchParams);
    if (c === "All") next.delete("category"); else next.set("category", c);
    setSearchParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  return (
    <>
      <section className="pt-32 md:pt-40 pb-14 max-w-[1400px] mx-auto px-6 md:px-12">
        <Reveal>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-5">The Archive</div>
        </Reveal>
        <SplitHeading
          text="Every article, all in one place."
          as="h1"
          className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 max-w-3xl"
        />
        <Reveal delay={0.3}>
          <p className="text-lg text-[var(--text-sec)] max-w-xl">Long-form pieces on where technology and intelligence are heading. Filter, search, read.</p>
        </Reveal>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 sticky top-3 z-30">
        <div className="glass border border-[var(--border)] rounded-3xl md:rounded-full p-3 md:p-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between shadow-sm">
          <div className="flex gap-1.5" data-testid="category-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                data-testid={`filter-${c.toLowerCase()}`}
                className={`btn-pill px-4 h-9 text-sm font-medium transition-colors ${
                  category === c ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--text-sec)] hover:text-[var(--text)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <form onSubmit={submitSearch} className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--text)] transition-colors">
            <Search size={14} className="ml-4 text-[var(--text-sec)] shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              data-testid="search-input"
              className="bg-transparent px-3 h-10 text-sm w-full md:w-64 focus:outline-none min-w-0"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); setTimeout(fetchBlogs, 0); }} className="p-2 shrink-0">
                <X size={12} />
              </button>
            )}
            <button type="submit" data-testid="search-submit" className="btn-pill bg-[var(--text)] text-[var(--bg)] px-5 h-10 text-sm font-medium mr-0.5 shrink-0">Go</button>
          </form>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        {loading ? (
          <div className="text-center py-24 text-sm text-[var(--text-sec)]">Loading…</div>
        ) : blogs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="font-display font-bold text-3xl mb-3">Nothing matches.</div>
            <div className="text-sm text-[var(--text-sec)]">Try a different query or category.</div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" data-testid="blog-list-grid">
            {blogs.map((b, i) => (
              <BlogCard key={b.id} blog={b} variant="tall" index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

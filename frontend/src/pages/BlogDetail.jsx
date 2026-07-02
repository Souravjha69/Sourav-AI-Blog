import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, MessageCircle, ArrowLeft, Share2 } from "lucide-react";
import { getBlogBySlug } from "@/lib/staticData";
import { IS_STATIC_SITE } from "@/lib/config";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { BlogCard } from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState({ name: "", content: "" });
  const [posting, setPosting] = useState(false);
  const heroRef = useRef();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const found = getBlogBySlug(slug);
    if (found) setBlog(found);
    else toast.error("Article not found");
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const like = async () => {
    if (liked) return;
    if (IS_STATIC_SITE) {
      toast.info("Likes are read-only on this static preview.");
      return;
    }
    setLiked(true);
    try {
      const { data } = await api.post(`/blogs/${slug}/like`);
      setBlog((b) => ({ ...b, likes: data.likes }));
    } catch {
      setLiked(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.name || !comment.content) return;
    if (IS_STATIC_SITE) {
      toast.info("Comments are read-only on this static preview.");
      return;
    }
    setPosting(true);
    try {
      const { data } = await api.post(`/blogs/${slug}/comments`, comment);
      setBlog((b) => ({ ...b, comments: [...(b.comments || []), data] }));
      setComment({ name: "", content: "" });
      toast.success("Comment posted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setPosting(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch { toast.error("Could not copy"); }
  };

  if (!blog) return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-sec)]">Loading…</div>;

  return (
    <>
      <div className="progress-bar" style={{ width: `${progress}%` }} data-testid="reading-progress" />

      {/* HERO */}
      <section className="pt-20 px-3 md:px-6">
        <div ref={heroRef} className="relative h-[70vh] md:h-[78vh] rounded-[32px] md:rounded-[40px] overflow-hidden max-w-[1400px] mx-auto">
          <motion.div style={{ y, scale }} className="absolute inset-0">
            <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
          </motion.div>
          <div className="relative h-full flex flex-col justify-end p-6 md:p-14 text-white">
            <Link to="/blogs" className="inline-flex items-center gap-2 mb-8 text-sm font-medium w-fit bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-colors" data-testid="back-to-blogs">
              <ArrowLeft size={14} /> Back to Archive
            </Link>
            <div className="inline-flex items-center gap-2 mb-5 w-fit">
              <span className="text-xs font-medium uppercase tracking-wide bg-white/90 text-black px-3 py-1.5 rounded-full">{blog.category}</span>
              <span className="text-xs font-medium text-white/70">{blog.read_time} min read</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-4xl mb-6"
              data-testid="blog-title"
            >
              {blog.title}
            </motion.h1>
            <p className="text-base md:text-lg text-white/85 max-w-2xl mb-8">{blog.excerpt}</p>
            {blog.author && (
              <div className="flex items-center gap-3">
                <img src={blog.author.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-medium">{blog.author.name}</div>
                  <div className="text-xs text-white/60">{new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-[1300px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-2 order-2 lg:order-1">
            <div className="lg:sticky lg:top-28 flex lg:flex-col gap-3">
              <button onClick={like} data-testid="like-btn" className={`flex items-center gap-2 text-sm font-medium rounded-full border border-[var(--border)] px-4 h-11 hover:border-[var(--text)] transition-colors ${liked ? "text-[var(--accent)] border-[var(--accent)]" : ""}`}>
                <Heart size={15} fill={liked ? "currentColor" : "none"} />
                <span data-testid="like-count">{blog.likes}</span>
              </button>
              <button onClick={share} data-testid="share-btn" className="flex items-center gap-2 text-sm font-medium rounded-full border border-[var(--border)] px-4 h-11 hover:border-[var(--text)] transition-colors">
                <Share2 size={15} /> Share
              </button>
              <a href="#comments" className="flex items-center gap-2 text-sm font-medium rounded-full border border-[var(--border)] px-4 h-11 hover:border-[var(--text)] transition-colors">
                <MessageCircle size={15} /> {blog.comments?.length || 0}
              </a>
            </div>
          </aside>
          <article className="lg:col-span-8 order-1 lg:order-2 prose-article" data-testid="blog-content">
            {blog.content.split(/\n\n+/).map((para, i) => {
              if (para.startsWith("## ")) return <h2 key={i}>{para.slice(3)}</h2>;
              return <p key={i}>{para}</p>;
            })}
            {blog.tags?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-wrap gap-2">
                {blog.tags.map((t) => (
                  <span key={t} className="text-xs font-medium rounded-full border border-[var(--border)] px-3.5 py-1.5">#{t}</span>
                ))}
              </div>
            )}
          </article>
          <aside className="lg:col-span-2 order-3">
            {blog.author && (
              <div className="lg:sticky lg:top-28 rounded-3xl border border-[var(--border)] p-5">
                <div className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--text-sec)] mb-3">Author</div>
                <Link to={`/author/${blog.author.id}`} className="block group" data-testid="author-link">
                  <img src={blog.author.avatar_url} alt="" className="w-full aspect-square object-cover rounded-2xl mb-3 group-hover:scale-[1.02] transition-transform" />
                  <div className="font-display font-semibold text-lg">{blog.author.name}</div>
                  <div className="text-xs text-[var(--text-sec)] mb-2">{blog.author.role}</div>
                  <div className="text-sm text-[var(--text-sec)] leading-relaxed">{blog.author.bio}</div>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* COMMENTS */}
      <section id="comments" className="max-w-[860px] mx-auto px-6 md:px-12 py-16 border-t border-[var(--border)]">
        <Reveal>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Conversation</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-12">
            {blog.comments?.length || 0} comment{(blog.comments?.length || 0) !== 1 ? "s" : ""}
          </h2>
        </Reveal>
        <div className="space-y-6 mb-12">
          {(blog.comments || []).map((c) => (
            <div key={c.id} className="rounded-2xl bg-[var(--surface-2)] p-5" data-testid={`comment-${c.id}`}>
              <div className="text-sm font-semibold mb-1.5">{c.name} <span className="text-[var(--text-sec)] font-normal">· {new Date(c.created_at).toLocaleDateString()}</span></div>
              <p className="text-sm text-[var(--text-sec)] leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submitComment} className="space-y-4 border-t border-[var(--border)] pt-8">
          <input
            required
            value={comment.name}
            onChange={(e) => setComment({ ...comment, name: e.target.value })}
            placeholder="Your name"
            data-testid="comment-name"
            className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] px-4 h-12 text-sm outline-none transition-colors"
          />
          <textarea
            required
            rows={4}
            value={comment.content}
            onChange={(e) => setComment({ ...comment, content: e.target.value })}
            placeholder="Add to the conversation…"
            data-testid="comment-content"
            className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] p-4 text-sm outline-none resize-none transition-colors"
          />
          <button type="submit" disabled={posting} data-testid="comment-submit" className="btn-pill bg-[var(--text)] text-[var(--bg)] px-8 h-12 text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-50">
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      </section>

      {/* RELATED */}
      {blog.related?.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 border-t border-[var(--border)]">
          <Reveal className="mb-12">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Keep reading</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Related articles.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {blog.related.map((b, i) => <BlogCard key={b.id} blog={b} variant="default" index={i} />)}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}

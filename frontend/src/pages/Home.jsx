import { useEffect, useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Search, PenLine, ShieldCheck, Sparkles, Send, Heart, Flame } from "lucide-react";
import { getBlogs, getAuthors, getCategories } from "@/lib/staticData";
import { BlogCard } from "@/components/BlogCard";
import HeroScene from "@/components/HeroScene";
import Footer from "@/components/Footer";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";
import AnimatedCounter from "@/components/AnimatedCounter";

const TOPICS = ["Artificial Intelligence", "Systems Engineering", "LLMs & Agents", "Infra & DX", "Open Source", "Security", "Compilers", "Product Design"];

const STEPS = [
  { icon: Search, title: "Research & reporting", desc: "Every piece starts with primary sources — papers, changelogs, and conversations with the people building the thing." },
  { icon: PenLine, title: "Draft & structure", desc: "A working draft takes shape. We optimize for one clear idea per article, not word count." },
  { icon: ShieldCheck, title: "Technical review", desc: "A second engineer checks every claim, code sample, and diagram before it goes further." },
  { icon: Sparkles, title: "Edit & polish", desc: "Editorial passes tighten the language and cut anything that doesn't earn its place." },
  { icon: Send, title: "Publish & distribute", desc: "It ships to the archive, the newsletter, and wherever our readers already are." },
];

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setBlogs(getBlogs({ limit: 24 }));
    setAuthors(getAuthors());
    setCategories(getCategories());
  }, []);

  const featured = blogs.slice(0, 3);
  const rest = blogs.slice(3);
  const topArticles = [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const totalLikes = blogs.reduce((s, b) => s + (b.likes || 0), 0);
  const totalComments = blogs.reduce((s, b) => s + (b.comments?.length || 0), 0);
  const heroImage = blogs[0]?.cover_image || "https://images.pexels.com/photos/12198534/pexels-photo-12198534.jpeg";

  return (
    <div id="top">
      {/* HERO */}
      <section className="relative pt-20 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden min-h-[78vh] md:min-h-[85vh] flex flex-col">
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-0 opacity-80 pointer-events-none mix-blend-screen">
            <Suspense fallback={null}><HeroScene /></Suspense>
          </div>

          <div className="relative flex-1 flex flex-col justify-end px-6 md:px-14 pb-12 md:pb-16 pt-28">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 mb-6 self-start bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C9CFF] animate-pulse" />
              <span className="text-white text-xs font-medium tracking-wide">Tech &amp; AI Journal — Est. 2024</span>
            </motion.div>

            <SplitHeading
              text="Ideas at the edge of tech and intelligence."
              as="h1"
              className="font-display font-bold text-white text-[12vw] sm:text-6xl md:text-7xl lg:text-[5.2rem] leading-[1.02] tracking-tight max-w-4xl mb-6"
            />

            <Reveal delay={0.5}>
              <p className="text-white/80 text-lg md:text-xl max-w-xl mb-9 leading-relaxed">
                Long-form essays and field reports on the software, models, and systems shaping what comes next. Written by builders, for builders.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/blogs" data-testid="hero-explore-cta" className="btn-pill group inline-flex items-center gap-2 bg-white text-black px-7 h-13 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                  Start reading <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#about" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
                  <ArrowDown size={14} className="animate-bounce" /> Learn more
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ABOUT + STATS */}
      <section id="about" className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <Reveal className="md:col-span-6">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">About sourav.log</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-[1.1] mb-6">
              A publication for people who build, not just talk about it.
            </h2>
            <p className="text-[var(--text-sec)] text-base md:text-lg leading-relaxed max-w-lg mb-6">
              sourav.log covers the parts of technology and AI that actually matter to practitioners — systems design,
              applied research, and the quiet decisions behind the tools you use every day. No sponsored posts, no fluff.
            </p>
            <p className="text-[var(--text-sec)] text-sm leading-relaxed max-w-lg">
              Built and written end-to-end by{" "}
              <a href="https://souravdev-ochre.vercel.app/" target="_blank" rel="noreferrer" className="text-[var(--text)] font-medium hover-line">
                Sourav Kumar Jha
              </a>, a Full Stack &amp; AI Developer —{" "}
              <a href="https://github.com/Souravjha69" target="_blank" rel="noreferrer" className="hover-line">GitHub</a>{" · "}
              <a href="https://www.linkedin.com/in/souravitachi/" target="_blank" rel="noreferrer" className="hover-line">LinkedIn</a>
            </p>
          </Reveal>

          <RevealStagger className="md:col-span-6 md:col-start-7 grid grid-cols-2 gap-6 md:gap-10" stagger={0.1}>
            {[
              { value: blogs.length, label: "Articles published" },
              { value: authors.length, label: "Contributing writers" },
              { value: totalLikes, label: "Reader likes" },
              { value: totalComments, label: "Comments exchanged" },
            ].map((s) => (
              <RevealItem key={s.label}>
                <div className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-2">
                  <AnimatedCounter value={s.value} suffix="+" />
                </div>
                <div className="text-sm text-[var(--text-sec)]">{s.label}</div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* TOPICS MARQUEE */}
      <div className="border-y border-[var(--border)] overflow-hidden py-7">
        <div className="marquee-slow whitespace-nowrap flex gap-12">
          {[...TOPICS, ...TOPICS].map((t, i) => (
            <span key={i} className="text-[var(--text-sec)] text-sm md:text-base font-medium inline-flex items-center gap-3">
              {t} <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <Reveal className="flex items-end justify-between mb-12 md:mb-14">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Featured</div>
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight">Start here.</h2>
          </div>
          <Link to="/blogs" data-testid="view-all-featured" className="hidden md:inline-flex items-center gap-1 text-sm font-medium hover-line">
            All articles <ArrowRight size={14} />
          </Link>
        </Reveal>

        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featured.map((b, i) => (
              <BlogCard key={b.id} blog={b} variant={i === 0 ? "hero" : "default"} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* TOP ARTICLES */}
      {topArticles.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32 border-t border-[var(--border)]">
          <Reveal className="flex items-end justify-between mb-12 md:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
                <Flame size={14} /> Top Articles
              </div>
              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight">Most read on tech &amp; AI.</h2>
            </div>
          </Reveal>

          <RevealStagger className="divide-y divide-[var(--border)]" stagger={0.07}>
            {topArticles.map((b, i) => (
              <RevealItem key={b.id}>
                <Link to={`/blog/${b.slug}`} data-testid={`top-article-${b.slug}`} className="group flex items-center gap-3 sm:gap-5 md:gap-8 py-6 first:pt-0">
                  <span className="font-display font-bold text-xl sm:text-3xl md:text-4xl text-[var(--border)] group-hover:text-[var(--accent)] transition-colors w-7 sm:w-12 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                    <img src={b.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--text-sec)] mb-1">{b.category} · {b.read_time} min read</div>
                    <h3 className="font-display font-semibold text-base sm:text-lg md:text-xl tracking-tight leading-snug line-clamp-2 sm:truncate group-hover:text-[var(--accent)] transition-colors">
                      {b.title}
                    </h3>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[var(--text-sec)] shrink-0">
                    <Heart size={14} /> {b.likes}
                  </div>
                  <ArrowRight size={16} className="hidden md:block shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}

      {/* EDITORIAL PROCESS */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <Reveal className="md:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden aspect-[4/5]">
              <img
                src="https://images.pexels.com/photos/28767589/pexels-photo-28767589.jpeg"
                alt="How we work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 md:right-6 bg-[var(--bg)] border border-[var(--border)] rounded-full w-32 h-32 md:w-36 md:h-36 flex items-center justify-center text-center p-4 shadow-lg">
              <span className="font-display font-semibold text-sm leading-tight">Always free to read</span>
            </div>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">How we work</div>
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-[1.1] mb-10 max-w-lg">
                From idea to published, in five steps.
              </h2>
            </Reveal>
            <RevealStagger className="divide-y divide-[var(--border)]" stagger={0.08}>
              {STEPS.map((s, i) => (
                <RevealItem key={s.title} className="flex items-start gap-5 py-6 first:pt-0">
                  <div className="w-11 h-11 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                    <s.icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-[var(--text-sec)]">0{i + 1}</span>
                      <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-sec)] leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </section>

      {/* MORE TO READ */}
      {rest.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <Reveal className="mb-12 md:mb-14">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">The archive</div>
            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight">More to read.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {rest.slice(0, 6).map((b, i) => (
              <BlogCard key={b.id} blog={b} variant="tall" index={i} />
            ))}
          </div>
          {categories.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Link to="/blogs" className="btn-pill inline-flex items-center gap-2 border border-[var(--border)] px-7 py-3.5 text-sm font-semibold hover:border-[var(--text)] transition-colors">
                Browse full archive <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      )}

      <Footer />
    </div>
  );
}

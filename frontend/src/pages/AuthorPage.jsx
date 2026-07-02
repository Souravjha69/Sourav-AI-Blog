import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Github, Linkedin, Globe, Twitter } from "lucide-react";
import { getAuthorById } from "@/lib/staticData";
import { BlogCard } from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const SOCIAL_ICONS = { linkedin: Linkedin, github: Github, website: Globe, twitter: Twitter };

export default function AuthorPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { setData(getAuthorById(id)); }, [id]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-sec)]">Loading…</div>;
  const { author, blogs } = data;

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 max-w-[1300px] mx-auto px-6 md:px-12">
        <Reveal>
          <Link to="/blogs" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover-line">
            <ArrowLeft size={14} /> Back
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <Reveal className="md:col-span-4">
            <img src={author.avatar_url} alt={author.name} className="w-full aspect-square object-cover rounded-[32px]" data-testid="author-avatar" />
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-8">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">{author.role}</div>
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-6" data-testid="author-name">{author.name}</h1>
            <p className="text-lg md:text-xl text-[var(--text-sec)] max-w-2xl mb-6 leading-relaxed">{author.bio}</p>
            <div className="flex items-center gap-4">
              {["linkedin", "github", "website", "twitter"].map((key) => {
                const url = author[key];
                if (!url) return null;
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={key} data-testid={`author-${key}`}
                     className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--text)] transition-colors">
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-[var(--border)]">
        <Reveal className="mb-12">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Written by {author.name.split(" ")[0]}</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">{blogs.length} article{blogs.length !== 1 ? "s" : ""}.</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((b, i) => <BlogCard key={b.id} blog={b} variant="tall" index={i} />)}
        </div>
      </section>
      <Footer />
    </>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function BlogCard({ blog, variant = "default", index = 0 }) {
  const sizes = {
    hero: "aspect-[16/10]",
    tall: "aspect-[4/5]",
    default: "aspect-[4/3]",
    wide: "aspect-[16/9]",
    square: "aspect-square",
  };
  const titleSizes = {
    hero: "text-2xl md:text-3xl",
    tall: "text-xl md:text-2xl",
    default: "text-lg md:text-xl",
    wide: "text-xl md:text-2xl",
    square: "text-lg md:text-xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/blog/${blog.slug}`} data-testid={`blog-card-${blog.slug}`} className="group block card-lift">
        <div className={`relative overflow-hidden rounded-3xl bg-[var(--surface-2)] ${sizes[variant]}`}>
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="text-[11px] font-medium uppercase tracking-wide bg-white/90 text-black px-3 py-1.5 rounded-full backdrop-blur">
              {blog.category}
            </span>
          </div>
          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight size={16} className="text-black" />
          </div>
        </div>
        <div className="pt-5">
          <div className="text-xs font-medium text-[var(--text-sec)] mb-2">
            {blog.read_time} min read · {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
          <h3 className={`font-display font-semibold ${titleSizes[variant]} leading-snug tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors`}>
            {blog.title}
          </h3>
          {(variant === "hero" || variant === "default") && (
            <p className="text-sm text-[var(--text-sec)] leading-relaxed line-clamp-2">{blog.excerpt}</p>
          )}
          {blog.author && (
            <div className="mt-4 flex items-center gap-2.5">
              <img src={blog.author.avatar_url} alt="" className="w-6 h-6 object-cover rounded-full" />
              <span className="text-xs font-medium text-[var(--text-sec)]">{blog.author.name}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

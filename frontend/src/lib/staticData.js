// Reads baked-in JSON (frontend/src/data/*.json) instead of calling a live
// backend. Regenerate that JSON with backend/scripts/export_static_data.py
// after editing posts locally, then commit + push to publish.
import blogsData from "@/data/blogs.json";
import authorsData from "@/data/authors.json";
import categoriesData from "@/data/categories.json";

function withAuthor(blog) {
  return { ...blog, author: authorsData.find((a) => a.id === blog.author_id) || null };
}

function byCreatedAtDesc(a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
}

export function getBlogs({ category, search, limit = 20, skip = 0 } = {}) {
  let blogs = blogsData.filter((b) => b.published);
  if (category && category.toLowerCase() !== "all") {
    blogs = blogs.filter((b) => b.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    blogs = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  return [...blogs].sort(byCreatedAtDesc).slice(skip, skip + limit).map(withAuthor);
}

export function getBlogBySlug(slug) {
  const blog = blogsData.find((b) => b.slug === slug);
  if (!blog) return null;
  const related = blogsData
    .filter((b) => b.category === blog.category && b.id !== blog.id && b.published)
    .slice(0, 3)
    .map(withAuthor);
  return { ...withAuthor(blog), related };
}

export function getAuthors() {
  return authorsData;
}

export function getAuthorById(id) {
  const author = authorsData.find((a) => a.id === id);
  if (!author) return null;
  const blogs = blogsData
    .filter((b) => b.author_id === id && b.published)
    .sort(byCreatedAtDesc);
  return { author, blogs };
}

export function getCategories() {
  return categoriesData;
}

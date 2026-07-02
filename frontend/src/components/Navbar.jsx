import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowUpRight, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { IS_STATIC_SITE } from "@/lib/config";
import Logo from "@/components/Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/blogs", label: "Articles" },
  { to: "/blogs?category=AI", label: "AI" },
  { to: "/blogs?category=Tech", label: "Tech" },
  { to: "/authors", label: "Authors" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  if (isAdmin) return null;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 pt-3"
    >
      <div
        className={`max-w-[1400px] mx-auto flex items-center justify-between transition-all duration-500 rounded-full ${
          scrolled ? "glass shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-5 h-14" : "px-5 h-16"
        }`}
        style={{ border: scrolled ? "1px solid var(--border)" : "1px solid transparent" }}
      >
        <Link to="/" data-testid="nav-logo" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className="hover-line text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] hover:border-[var(--text)] transition-colors shrink-0"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {!IS_STATIC_SITE && (
            <Link
              to="/login"
              data-testid="nav-login"
              className="btn-pill hidden md:flex items-center gap-1 bg-[var(--text)] text-[var(--bg)] px-5 h-9 text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Admin <ArrowUpRight size={14} />
            </Link>
          )}
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)]"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden max-w-[1400px] mx-auto mt-2 glass rounded-3xl border border-[var(--border)] p-4 flex flex-col gap-1"
        >
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} className="px-3 py-3 rounded-2xl text-sm font-medium hover:bg-[var(--surface-2)]">
              {l.label}
            </Link>
          ))}
          {!IS_STATIC_SITE && (
            <Link to="/login" data-testid="nav-login-mobile" className="mt-2 px-3 py-3 rounded-2xl text-sm font-medium bg-[var(--text)] text-[var(--bg)] text-center">
              Admin
            </Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

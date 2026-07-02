import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowUpRight, Github, Linkedin, Globe } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { IS_STATIC_SITE } from "@/lib/config";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import Logo from "@/components/Logo";

const SOCIALS = [
  { icon: Github, href: "https://github.com/Souravjha69", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/souravitachi/", label: "LinkedIn" },
  { icon: Globe, href: "https://souravdev-ochre.vercel.app/", label: "Portfolio" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (IS_STATIC_SITE) {
      toast.info("Newsletter signups aren't available on this static preview.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/newsletter", { email });
      toast.success("You're on the list.");
      setEmail("");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="mt-24 md:mt-32 px-3 md:px-6 pb-3 md:pb-6">
      <div className="max-w-[1400px] mx-auto rounded-[32px] md:rounded-[40px] bg-[var(--text)] text-[var(--bg)] px-6 md:px-16 py-16 md:py-24 relative overflow-hidden">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 md:gap-8 relative">
            <div className="col-span-2 md:col-span-7">
              <div className="text-xs font-medium uppercase tracking-[0.2em] opacity-60 mb-4">Newsletter</div>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] tracking-tight mb-6">
                Signal, not noise.
              </h2>
              <p className="opacity-70 mb-8 max-w-md">
                A monthly dispatch on where technology and intelligence are heading. No spam, unsubscribe anytime.
              </p>
              <form onSubmit={submit} className="flex max-w-md rounded-full border border-white/20 p-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  data-testid="newsletter-email"
                  className="flex-1 bg-transparent pl-5 h-12 text-sm placeholder:opacity-50 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={busy}
                  data-testid="newsletter-submit"
                  className="btn-pill bg-[var(--bg)] text-[var(--text)] px-6 text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50 shrink-0"
                >
                  {busy ? "..." : "Subscribe"}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 md:col-start-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] opacity-60 mb-4">Read</div>
              <ul className="space-y-3 text-sm">
                <li><Link to="/blogs" className="hover-line opacity-90 hover:opacity-100">All Articles</Link></li>
                <li><Link to="/blogs?category=Tech" className="hover-line opacity-90 hover:opacity-100">Tech</Link></li>
                <li><Link to="/blogs?category=AI" className="hover-line opacity-90 hover:opacity-100">AI</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-[0.2em] opacity-60 mb-4">About</div>
              <ul className="space-y-3 text-sm">
                <li><Link to="/authors" className="hover-line opacity-90 hover:opacity-100">Writers</Link></li>
                {!IS_STATIC_SITE && <li><Link to="/login" className="hover-line opacity-90 hover:opacity-100">Admin</Link></li>}
              </ul>
            </div>
          </div>

          <div className="mt-10 md:mt-28 pt-6 md:pt-8 border-t border-white/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Logo size="sm" inverted />
              <span className="text-sm opacity-70">
                © 2026 Sourav Kumar Jha —{" "}
                <span className="hidden sm:inline">Built &amp; written by </span>
                <a href="https://souravdev-ochre.vercel.app/" target="_blank" rel="noreferrer" className="hover-line opacity-100 font-medium">
                  <span className="sm:hidden">All rights reserved</span>
                  <span className="hidden sm:inline">Sourav Kumar Jha</span>
                </a>
                <span className="hidden sm:inline">.</span>
              </span>
            </div>
            <div className="flex items-center gap-5">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} data-testid={`social-${s.label.toLowerCase()}`}
                   className="opacity-70 hover:opacity-100 transition-opacity">
                  <s.icon size={17} />
                </a>
              ))}
              <a href="#top" className="inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100 transition-opacity">
                Back to top <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import Logo from "@/components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen pt-20 px-3 md:px-6 pb-6">
      <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-2 rounded-[32px] md:rounded-[40px] overflow-hidden border border-[var(--border)]">
        <div className="hidden md:flex bg-[var(--text)] text-[var(--bg)] p-14 flex-col justify-between">
          <Reveal>
            <Logo inverted />
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="font-display font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
              Write. Publish. Reach.
            </h2>
            <p className="max-w-md opacity-70 leading-relaxed">Your personal editorial workspace. Draft long-form pieces and curate the archive — only you can sign in.</p>
          </Reveal>
          <div className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">Restricted access</div>
        </div>
        <div className="flex items-center justify-center p-8 md:p-16 bg-[var(--surface)]">
          <Reveal className="w-full max-w-sm">
            <form onSubmit={submit}>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Admin</div>
              <h1 className="font-display font-bold text-4xl md:text-5xl leading-none tracking-tight mb-2">Sign in.</h1>
              <p className="text-[var(--text-sec)] mb-8">Editorial workspace access.</p>
              <label className="block text-xs font-medium uppercase tracking-[0.15em] text-[var(--text-sec)] mb-2">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="username" data-testid="login-email"
                     className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] h-12 px-4 text-sm outline-none mb-6 transition-colors" />
              <label className="block text-xs font-medium uppercase tracking-[0.15em] text-[var(--text-sec)] mb-2">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" data-testid="login-password"
                     className="w-full bg-transparent rounded-2xl border border-[var(--border)] focus:border-[var(--text)] h-12 px-4 text-sm outline-none mb-6 transition-colors" />
              {error && <div className="text-[var(--danger)] text-sm mb-4" data-testid="login-error">{error}</div>}
              <button type="submit" disabled={busy} data-testid="login-submit"
                      className="btn-pill w-full bg-[var(--text)] text-[var(--bg)] h-12 text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {busy ? "…" : <>Enter <ArrowRight size={14} /></>}
              </button>
              <Link to="/" className="mt-6 block text-center text-xs font-medium text-[var(--text-sec)] hover-line">← Back to journal</Link>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

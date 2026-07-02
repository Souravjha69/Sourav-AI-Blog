import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, FileText, PlusSquare, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 h-11 rounded-2xl text-sm font-medium transition-colors ${
      isActive ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--text-sec)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
    }`;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[250px_1fr] bg-[var(--bg)]">
      <aside className="border-r border-[var(--border)] flex flex-col p-4">
        <Link to="/" className="mb-8 flex items-center gap-2 px-4 py-2">
          <Logo size="sm" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-sec)]">CMS</span>
        </Link>
        <nav className="space-y-1 flex-1" data-testid="admin-nav">
          <NavLink to="/admin" end className={linkClass} data-testid="nav-dashboard"><LayoutDashboard size={15} /> Dashboard</NavLink>
          <NavLink to="/admin/blogs" className={linkClass} data-testid="nav-admin-blogs"><FileText size={15} /> Articles</NavLink>
          <NavLink to="/admin/blogs/new" className={linkClass} data-testid="nav-new-blog"><PlusSquare size={15} /> New Article</NavLink>
        </nav>
        <div className="mt-auto border-t border-[var(--border)] pt-4 space-y-1">
          <div className="px-4 py-2">
            <div className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-sec)]">Signed in</div>
            <div className="text-xs truncate">{user?.email}</div>
          </div>
          <Link to="/" target="_blank" className="flex items-center gap-3 px-4 h-10 rounded-2xl text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
            <ExternalLink size={15} /> View Site
          </Link>
          <button onClick={logout} data-testid="admin-logout" className="w-full flex items-center gap-3 px-4 h-10 rounded-2xl text-sm font-medium text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
      <main className="p-6 md:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

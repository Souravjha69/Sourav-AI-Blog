import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import AuthorPage from "@/pages/AuthorPage";
import AuthorsList from "@/pages/AuthorsList";
import Login from "@/pages/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBlogs from "@/pages/admin/AdminBlogs";
import AdminBlogEditor from "@/pages/admin/AdminBlogEditor";
import "@/App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[var(--text-sec)]">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <SmoothScroll>
            <div className="grain min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/authors" element={<AuthorsList />} />
                <Route path="/author/:id" element={<AuthorPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="blogs/new" element={<AdminBlogEditor />} />
                  <Route path="blogs/edit/:id" element={<AdminBlogEditor />} />
                </Route>
              </Routes>
            </div>
            <Toaster theme="system" position="bottom-right" />
          </SmoothScroll>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

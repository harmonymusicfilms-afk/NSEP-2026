import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/stores';

// Public layout with header and footer
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Student dashboard layout with sidebar
export function StudentLayout() {
  const { isStudentLoggedIn } = useAuthStore();

  if (!isStudentLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="student" />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

// Admin dashboard layout with sidebar
export function AdminLayout() {
  const { isAdminLoggedIn } = useAuthStore();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="admin" />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

// Simple centered layout for auth pages
export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}

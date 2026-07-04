'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page does not have admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <AdminNavbar />
        <main className="lg:ml-64 pt-20 pb-4 px-4 sm:pt-24 sm:pb-6 sm:px-6 lg:pt-24 lg:pb-8 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Menu, X, LogOut, ExternalLink,
  LayoutDashboard, Layers, FileText, Calendar, GraduationCap,
  MessageSquare, Image, Users, CalendarCheck, ClipboardList, Settings, ShoppingBag, ShoppingCart
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Layers },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/workshops', label: 'Workshops', icon: GraduationCap },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNavbar() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-50 rounded-lg">
            <Menu className="w-5 h-5 text-text" />
          </button>
          <h2 className="font-playfair text-lg font-bold text-text capitalize">
            {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-text/50 hover:text-primary border border-gray-200 rounded-lg transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Site
          </Link>
          <span className="hidden sm:block text-xs text-text/40">{user?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center relative">
                  <NextImage
                    src="/logo.jpg"
                    alt="Divya Urja Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <span className="font-playfair text-sm font-bold text-text">Admin</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="w-5 h-5 text-text" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-text/60 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

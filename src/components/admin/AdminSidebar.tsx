'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Layers, FileText, Calendar, GraduationCap,
  MessageSquare, Image, Users, CalendarCheck, ClipboardList, Settings, ShoppingBag,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Layers },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/workshops', label: 'Workshops', icon: GraduationCap },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 hidden lg:block">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center relative">
          <NextImage
            src="/logo.jpg"
            alt="Divya Urja Logo"
            width={36}
            height={36}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div>
          <h2 className="font-playfair text-sm font-bold text-text leading-tight">Divya Urja</h2>
          <p className="text-[9px] text-primary font-medium tracking-wider uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text/60 hover:bg-gray-50 hover:text-text'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Calendar,
  GraduationCap,
  MessageSquare,
  Image,
  Users,
  CalendarCheck,
  ClipboardList,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Calculator,
  Tag,
} from 'lucide-react';

interface MenuGroup {
  groupLabel: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const menuGroups: MenuGroup[] = [
  {
    groupLabel: 'Pipeline & Commerce',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
      { href: '/admin/leads', label: 'Client Leads', icon: Users },
      { href: '/admin/orders', label: 'Store Orders', icon: ShoppingCart },
      { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
    ],
  },
  {
    groupLabel: 'Catalogue & Content',
    items: [
      { href: '/admin/services', label: 'Services', icon: Layers },
      { href: '/admin/products', label: 'Products', icon: ShoppingBag },
      { href: '/admin/offers', label: 'Special Offers', icon: Tag },
      { href: '/admin/workshops', label: 'Workshops', icon: GraduationCap },
      { href: '/admin/events', label: 'Events', icon: Calendar },
      { href: '/admin/blogs', label: 'Blogs', icon: FileText },
      { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
      { href: '/admin/gallery', label: 'Gallery', icon: Image },
    ],
  },
  {
    groupLabel: 'Tools & Settings',
    items: [
      { href: '/admin/numerology-calculator', label: 'Numerology Engine', icon: Calculator },
      { href: '/admin/settings', label: 'Website Settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 hidden lg:flex lg:flex-col shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center relative shadow-xs border border-gray-100">
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
          <p className="text-[10px] text-primary font-bold tracking-wider uppercase">Vedic Admin</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {menuGroups.map((group) => (
          <div key={group.groupLabel}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-text/40 uppercase">
              {group.groupLabel}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                        : 'text-text/70 hover:bg-gray-50 hover:text-text'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text/50'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

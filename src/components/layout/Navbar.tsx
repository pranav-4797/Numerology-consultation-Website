'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Sparkles,
  CalendarCheck,
  ShoppingBag,
  Tag,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  HeartHandshake,
  Image as ImageIcon,
  Phone,
} from 'lucide-react';
import { getSectionVisibility } from '@/services/firestore';
import type { SectionVisibility } from '@/services/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { LANG_LABELS, type Lang } from '@/i18n/translations';

interface NavSubItem {
  href: string;
  labelKey: string;
  key: keyof SectionVisibility | null;
  icon: typeof Sparkles;
  badge?: string;
  desc: string;
}

interface NavHub {
  hubKey: string;
  labelKey: string;
  items: NavSubItem[];
}

const NAV_HUBS: NavHub[] = [
  {
    hubKey: 'services',
    labelKey: 'nav.hubServices',
    items: [
      {
        href: '/services',
        labelKey: 'nav.services',
        key: 'services',
        icon: Sparkles,
        desc: 'Numerology, Vastu & energy audits',
      },
      {
        href: '/book',
        labelKey: 'nav.bookConsultation',
        key: null,
        icon: CalendarCheck,
        badge: 'Popular',
        desc: 'Schedule 1-on-1 private consultation',
      },
    ],
  },
  {
    hubKey: 'store',
    labelKey: 'nav.hubStore',
    items: [
      {
        href: '/catalogue',
        labelKey: 'nav.catalogue',
        key: 'catalogue',
        icon: ShoppingBag,
        desc: 'Crystals, Rudraksha, Yantras & Gemstones',
      },
      {
        href: '/offers',
        labelKey: 'nav.offers',
        key: 'offers',
        icon: Tag,
        badge: 'Offers',
        desc: 'Sanctified sets & special discounts',
      },
    ],
  },
  {
    hubKey: 'wisdom',
    labelKey: 'nav.hubWisdom',
    items: [
      {
        href: '/blog',
        labelKey: 'nav.blog',
        key: 'blog',
        icon: BookOpen,
        desc: 'Articles on sacred numbers & Vastu guidance',
      },
      {
        href: '/workshops',
        labelKey: 'nav.workshops',
        key: 'workshops',
        icon: GraduationCap,
        desc: 'Learn ancient holistic science & remedies',
      },
      {
        href: '/events',
        labelKey: 'nav.events',
        key: 'events',
        icon: Calendar,
        desc: 'Upcoming discourses and satsangs',
      },
    ],
  },
  {
    hubKey: 'about',
    labelKey: 'nav.hubAbout',
    items: [
      {
        href: '/about',
        labelKey: 'nav.about',
        key: null,
        icon: Award,
        desc: 'About Guruji, lineage & credentials',
      },
      {
        href: '/testimonials',
        labelKey: 'nav.testimonials',
        key: 'testimonials',
        icon: HeartHandshake,
        desc: '700+ verified client transformations',
      },
      {
        href: '/gallery',
        labelKey: 'nav.gallery',
        key: 'gallery',
        icon: ImageIcon,
        desc: 'Photos from rituals, pujas & sessions',
      },
      {
        href: '/contact',
        labelKey: 'nav.contact',
        key: null,
        icon: Phone,
        desc: 'Visit our center in Pune or connect',
      },
    ],
  },
];

const languages: Lang[] = ['en', 'hi', 'mr'];

function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={`flex items-center gap-1 bg-gray-50/90 border border-gray-200/90 rounded-xl p-1 shadow-2xs ${
        compact ? 'w-full justify-between' : 'ml-1'
      }`}
      role="group"
      aria-label="Language selection"
    >
      <Globe className="w-3.5 h-3.5 text-text/40 ml-1.5 mr-1 shrink-0" />
      <div className={`flex items-center gap-1 ${compact ? 'flex-1' : ''}`}>
        {languages.map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              compact ? 'flex-1 text-center' : ''
            } ${
              lang === code
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-text/60 hover:text-primary hover:bg-gray-100'
            }`}
          >
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<SectionVisibility | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { t } = useLanguage();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getSectionVisibility()
      .then(setVisibility)
      .catch(() => setVisibility(null));
  }, []);

  // Smart auto-hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < 20) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
            if (!isOpen) {
              setIsVisible(false);
              setActiveDropdown(null);
            }
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isOpen]);

  // Close menus upon navigation
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setIsVisible(true);
  }, [pathname]);

  const handleMouseEnter = (hubKey: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(hubKey);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Filter hubs and items based on section visibility
  const filteredHubs = NAV_HUBS.map((hub) => {
    const visibleItems = hub.items.filter((item) => {
      if (!item.key) return true;
      if (!visibility) return true;
      return visibility[item.key];
    });
    return { ...hub, items: visibleItems };
  }).filter((hub) => hub.items.length > 0);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow relative shrink-0 ring-1 ring-amber-500/20">
              <Image
                src="/logo.jpg"
                alt="Divya Urja Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div>
              <span className="font-playfair text-base sm:text-lg font-bold text-gray-900 leading-tight block">
                Divya Urja
              </span>
              <span className="text-[9px] sm:text-[10px] text-primary font-semibold tracking-wider uppercase block">
                Numerology • Vastu • Energy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Clustered Contextual Hubs */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Home link */}
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                pathname === '/'
                  ? 'text-primary font-bold bg-primary/5'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Contextual Hub Dropdowns */}
            {filteredHubs.map((hub) => {
              const isHubActive = hub.items.some((it) => pathname.startsWith(it.href));
              const isDropdownOpen = activeDropdown === hub.hubKey;

              return (
                <div
                  key={hub.hubKey}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(hub.hubKey)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => setActiveDropdown(isDropdownOpen ? null : hub.hubKey)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                      isHubActive
                        ? 'text-primary font-bold bg-primary/5'
                        : isDropdownOpen
                        ? 'text-primary bg-gray-50'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                    aria-expanded={isDropdownOpen}
                  >
                    <span>{t(hub.labelKey)}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Dropdown Card */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-0 top-full pt-2 z-50 min-w-[280px]"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-2xl shadow-xl shadow-gray-900/10 p-2 overflow-hidden ring-1 ring-amber-500/10">
                          {hub.items.map((item) => {
                            const isItemActive = pathname === item.href;
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                  isItemActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-amber-50/60 text-gray-800 hover:text-primary'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                    isItemActive
                                      ? 'bg-primary text-white shadow-2xs'
                                      : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold">{t(item.labelKey)}</span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Controls: Language Selector & Primary Booking CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <LanguageToggle />
            </div>

            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-102 active:scale-98 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('nav.bookConsultation')}</span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-80px)] overflow-y-auto bg-white border-t border-gray-200/90 shadow-xl"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Language selection in mobile drawer */}
              <div className="pb-1 md:hidden">
                <LanguageToggle compact />
              </div>

              {/* Home Link */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                  pathname === '/'
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{t('nav.home')}</span>
              </Link>

              {/* Clustered Hub Sections in Mobile */}
              {filteredHubs.map((hub) => (
                <div key={hub.hubKey} className="pt-2 border-t border-gray-100">
                  <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                    {t(hub.labelKey)}
                  </span>
                  <div className="space-y-1">
                    {hub.items.map((item) => {
                      const isActive = pathname === item.href;
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ItemIcon className="w-4 h-4 text-primary shrink-0" />
                            <span>{t(item.labelKey)}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

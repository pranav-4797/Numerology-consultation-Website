'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { getSectionVisibility } from '@/services/firestore';
import type { SectionVisibility } from '@/services/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { LANG_LABELS, type Lang } from '@/i18n/translations';

const allNavLinks: { href: string; labelKey: string; key: keyof SectionVisibility | null }[] = [
  { href: '/', labelKey: 'nav.home', key: null },
  { href: '/about', labelKey: 'nav.about', key: null },
  { href: '/services', labelKey: 'nav.services', key: 'services' },
  { href: '/workshops', labelKey: 'nav.workshops', key: 'workshops' },
  { href: '/events', labelKey: 'nav.events', key: 'events' },
  { href: '/blog', labelKey: 'nav.blog', key: 'blog' },
  { href: '/gallery', labelKey: 'nav.gallery', key: 'gallery' },
  { href: '/testimonials', labelKey: 'nav.testimonials', key: 'testimonials' },
  { href: '/catalogue', labelKey: 'nav.catalogue', key: 'catalogue' },
  { href: '/offers', labelKey: 'nav.offers', key: 'offers' },
  { href: '/contact', labelKey: 'nav.contact', key: null },
];

const languages: Lang[] = ['en', 'hi', 'mr'];

function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={`flex items-center gap-1 bg-gray-50/90 border border-gray-200 rounded-xl p-1 ${
        compact ? 'w-full justify-between' : 'ml-1'
      }`}
      role="group"
      aria-label="Language"
    >
      <Globe className="w-4 h-4 text-text/40 ml-1.5 mr-1 shrink-0" />
      <div className={`flex items-center gap-1 ${compact ? 'flex-1' : ''}`}>
        {languages.map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
  const [visibility, setVisibility] = useState<SectionVisibility | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { t } = useLanguage();

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

          // Always keep visible near the top
          if (currentScrollY < 20) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
            // Scrolling down -> hide navbar (unless mobile menu is open)
            if (!isOpen) {
              setIsVisible(false);
            }
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up -> show navbar
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

  // Ensure navbar shows and mobile menu closes upon route navigation
  useEffect(() => {
    setIsOpen(false);
    setIsVisible(true);
  }, [pathname]);

  // Filter nav links based on visibility settings
  const navLinks = allNavLinks.filter((link) => {
    if (!link.key) return true; // Home, About, Contact always show
    if (!visibility) return true; // Show all while loading
    return visibility[link.key];
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-primary/10 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow relative shrink-0">
              <Image
                src="/logo.jpg"
                alt="Divya Urja Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <h1 className="font-playfair text-base sm:text-lg font-bold text-text leading-tight">
                Divya Urja
              </h1>
              <p className="text-[9px] sm:text-[10px] text-primary font-medium tracking-wider uppercase">
                Numerology & Vastu
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-text/70 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {t(link.labelKey)}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-secondary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Language + CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all"
            >
              {t('nav.bookConsultation')}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-text" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-text" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-80px)] overflow-y-auto bg-white border-t border-primary/10 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="px-2 pb-2 md:hidden">
                <LanguageToggle compact />
              </div>
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text/70 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <Link
                  href="/book"
                  onClick={() => setIsOpen(false)}
                  className="block mt-3 px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-semibold rounded-xl text-center shadow-lg"
                >
                  {t('nav.bookConsultation')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

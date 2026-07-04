'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/context/LanguageContext';

const services = [
  'Numerology',
  'Vastu Energy Science',
  'Crystal Therapy',
  'Name Correction',
  'Switch Words',
  'Yantra Numerology',
];

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);

const YouTubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

export default function Footer() {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

  const quickLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/services', label: t('nav.services') },
    { href: '/workshops', label: t('nav.workshops') },
    { href: '/events', label: t('nav.events') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const socialLinks = [
    { url: settings.facebook, icon: <FacebookIcon />, label: 'Facebook' },
    { url: settings.instagram, icon: <InstagramIcon />, label: 'Instagram' },
    { url: settings.youtube, icon: <YouTubeIcon />, label: 'YouTube' },
  ].filter((s) => s.url);

  return (
    <footer className="bg-gradient-to-b from-text to-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center relative">
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
                <h3 className="font-playfair text-lg font-bold">Divya Urja</h3>
                <p className="text-[10px] text-secondary tracking-wider uppercase">
                  Numerology & Vastu
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t('footer.tagline')}</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-lg font-semibold mb-5 text-secondary">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-playfair text-lg font-semibold mb-5 text-secondary">
              {t('footer.ourServices')}
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-playfair text-lg font-semibold mb-5 text-secondary">
              {t('footer.contactUs')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-400">{settings.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-400">{settings.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Divya Urja Numerology & Vastu Consultancy. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/contact" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link href="/contact" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

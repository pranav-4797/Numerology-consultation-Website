'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ShoppingCart,
  Compass,
  Calendar,
  BookOpen,
  MessageCircle,
  Home,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { LanguageProvider } from '@/context/LanguageContext';

export default function NotFound() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1E293B]">
        <Navbar />

        <main className="flex-1 pt-24 sm:pt-28 pb-16 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            {/* Luminous Mandala / Spiritual Aura Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative inline-flex items-center justify-center mb-6"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500/20 via-primary/10 to-amber-500/30 flex items-center justify-center ring-8 ring-amber-500/10 shadow-lg">
                <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-primary animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="absolute -top-1 -right-1 p-2 rounded-full bg-amber-500 text-white shadow-md">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>

            {/* Error Code & Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200">
                Error 404 • Path Not Found
              </span>
              <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-3">
                Seeking a Divine Path?
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
                The cosmic energy of this page has shifted or the resource has concluded its journey.
                Allow us to guide you back to your harmonious path.
              </p>
            </motion.div>

            {/* Main Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Explore Sacred Catalogue</span>
              </Link>
            </motion.div>

            {/* Quick Explore Destination Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left"
            >
              <Link
                href="/services"
                className="group p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-primary/50 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                  Consultation Services
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Vastu audits, Numerology charts, and Energy balancing sessions.
                </p>
              </Link>

              <Link
                href="/catalogue"
                className="group p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-amber-700 transition-colors">
                  Energized Remedies
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Consecrated Crystals, Rudraksha, Yantras, and Bracelets.
                </p>
              </Link>

              <Link
                href="/blog"
                className="group p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors">
                  Spiritual Wisdom
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  In-depth articles on sacred numbers, Vastu tips, and astrology.
                </p>
              </Link>
            </motion.div>
          </div>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </LanguageProvider>
  );
}

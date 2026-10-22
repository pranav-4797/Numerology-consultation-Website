'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Filter, Gift, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';
import OfferCard from '@/components/ui/OfferCard';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import type { Offer } from '@/types';

export default function PublicOffersPage() {
  const { data: offers, loading } = useFirestoreCollection<Offer>('offers');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activeOffers = offers.filter((o) => o.active);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(activeOffers.map((o) => o.category).filter(Boolean) as string[]))];

  const filteredOffers = activeOffers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.itemName.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      o.category === selectedCategory ||
      (selectedCategory === 'products' && o.type === 'product') ||
      (selectedCategory === 'services' && o.type === 'service');

    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loader text="Loading special offers..." />;

  return (
    <div className="min-h-screen bg-background">
      {/* Festive Hero Banner */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-amber-950 via-gray-900 to-amber-900 overflow-hidden border-b border-amber-500/20">
        {/* Background festive glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/40 rounded-full text-amber-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-6 shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Exclusive Festive & Special Offers 🪔</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Limited Time <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-secondary bg-clip-text text-transparent">Diwali & Special Deals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-amber-100/80 max-w-2xl mx-auto leading-relaxed"
          >
            Elevate your energy, home Vastu, and life path with heavy discounts on consultation services, energized crystals, and spiritual products.
          </motion.p>
        </div>
      </section>

      {/* Filter & Listing Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 pb-6 border-b border-gray-200/80">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
              <input
                type="text"
                placeholder="Search offers or products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-base sm:text-sm min-h-[48px] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <Filter className="w-4 h-4 text-amber-600 shrink-0 hidden sm:block" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl min-h-[44px] flex items-center transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                All Offers ({activeOffers.length})
              </button>

              <button
                onClick={() => setSelectedCategory('products')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === 'products'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                Products
              </button>

              <button
                onClick={() => setSelectedCategory('services')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === 'services'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                Services
              </button>

              {categories
                .filter((c) => c !== 'all' && c !== 'products' && c !== 'services')
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white text-text/70 border border-gray-200 hover:border-amber-400 hover:text-amber-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          </div>

          {/* Grid */}
          {filteredOffers.length === 0 ? (
            <EmptyState
              title="No Active Offers Found"
              description="Check back soon for upcoming Diwali specials and festive discounts!"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredOffers.map((offer, index) => (
                <OfferCard key={offer.id} offer={offer} index={index} />
              ))}
            </div>
          )}

          {/* Back Home link */}
          <div className="mt-16 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white text-text/70 font-semibold rounded-xl hover:bg-gray-50 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

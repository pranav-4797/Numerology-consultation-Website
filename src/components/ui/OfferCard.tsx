'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, Calendar, ArrowRight, Sparkles, ShoppingBag, CalendarCheck } from 'lucide-react';
import type { Offer } from '@/types';
import { formatDate } from '@/utils/helpers';

interface OfferCardProps {
  offer: Offer;
  index?: number;
}

export default function OfferCard({ offer, index = 0 }: OfferCardProps) {
  const discountPercent =
    offer.discountPercent ??
    (offer.originalPrice > offer.discountedPrice
      ? Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100)
      : 0);

  const savings = offer.originalPrice - offer.discountedPrice;

  // Determine CTA link
  let ctaLink = '/contact';
  let ctaText = 'Claim Offer';
  let Icon = Sparkles;

  if (offer.type === 'product') {
    ctaLink = offer.itemId ? `/checkout?product=${offer.itemId}` : `/checkout?offer=${offer.id}`;
    ctaText = 'Buy Now';
    Icon = ShoppingBag;
  } else if (offer.type === 'service') {
    ctaLink = offer.itemId ? `/book?service=${offer.itemId}` : '/book';
    ctaText = 'Book Consultation';
    Icon = CalendarCheck;
  } else if (offer.type === 'custom') {
    ctaLink = `/checkout?offer=${offer.id}`;
    ctaText = 'Claim Special Offer';
    Icon = Sparkles;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 border border-amber-200/50 flex flex-col relative"
    >
      {/* Top Banner / Badge */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gray-100">
        {offer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-primary/20 to-amber-600/30 flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-primary/40 animate-pulse" />
          </div>
        )}

        {/* Dark Overlay gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Festive Badge Top Left */}
        {offer.badge && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 tracking-wider border border-amber-300/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{offer.badge}</span>
          </div>
        )}

        {/* Discount Percentage Pill Top Right */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-red-400/30 tracking-wider">
            {discountPercent}% OFF
          </div>
        )}

        {/* Item Category / Name Overlay Bottom Left */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-300 drop-shadow">
            {offer.category || (offer.type === 'product' ? 'Product Offer' : offer.type === 'service' ? 'Service Deal' : 'Special Offer')}
          </div>
          <h3 className="font-playfair text-xl font-bold text-white drop-shadow line-clamp-1">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtitle / Item Name */}
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>{offer.itemName}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-text/70 leading-relaxed mb-4 line-clamp-2">
            {offer.description}
          </p>

          {/* Validity dates if specified */}
          {offer.endDate && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl mb-4">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Offer valid till {formatDate(offer.endDate)}</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA Section */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold text-primary">
              ₹{offer.discountedPrice.toLocaleString('en-IN')}
            </span>
            {offer.originalPrice > offer.discountedPrice && (
              <span className="text-sm font-semibold text-text/40 line-through">
                ₹{offer.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {savings > 0 && (
              <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <Link
            href={ctaLink}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <Icon className="w-4 h-4" />
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

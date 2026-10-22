'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Product } from '@/types';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  bracelets: { label: 'Bracelet', color: 'bg-pink-100 text-pink-700' },
  crystals: { label: 'Crystal', color: 'bg-purple-100 text-purple-700' },
  yantras: { label: 'Yantra', color: 'bg-amber-100 text-amber-700' },
  rudraksha: { label: 'Rudraksha', color: 'bg-red-100 text-red-700' },
  pendants: { label: 'Pendant', color: 'bg-blue-100 text-blue-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

interface ProductCardProps {
  product: Product;
  index: number;
  whatsappNumber: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, index, whatsappNumber, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const category = CATEGORY_LABELS[product.category] || CATEGORY_LABELS.other;

  const handleCardClick = () => {
    router.push(`/catalogue/${product.id}`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    router.push(`/checkout?product=${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    toast.success(`Added "${product.name}" to cart`);
  };

  const originalPrice = product.originalPrice || Math.round(product.price * 1.35);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 select-none">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-secondary/30" />
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.color}`}>
          {category.label}
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-600 px-3 py-1 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Featured / Discount Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {product.featured && (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-white shadow-xs">
              ✨ Featured
            </div>
          )}
          {discountPercent > 0 && (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-xs">
              {discountPercent}% OFF
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating stars (Amazon style) */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex text-amber-400 text-xs">
              {'★★★★★'}
            </div>
            <span className="text-[11px] font-bold text-gray-700">4.9</span>
            <span className="text-[10px] text-gray-600">(120+)</span>
          </div>

          <h3 className="font-playfair text-base sm:text-lg font-bold text-text mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-text/60 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs line-through text-gray-600">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 hover:shadow-md hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              title="Add to cart"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

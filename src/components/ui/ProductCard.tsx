'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
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
  const category = CATEGORY_LABELS[product.category] || CATEGORY_LABELS.other;

  const handleBuyNow = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in buying *${product.name}* (₹${product.price.toLocaleString('en-IN')}). Please share more details.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-bold bg-red-500 px-4 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/90 text-white">
            ✨ Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-playfair text-lg font-bold text-text mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-text/50 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            Buy Now
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

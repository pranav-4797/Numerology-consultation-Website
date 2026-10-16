'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Zap,
  MessageCircle,
  Share2,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Heart,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  whatsappNumber: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORY_NAMES: Record<string, string> = {
  bracelets: 'Healing Bracelet',
  crystals: 'Sacred Crystal',
  yantras: 'Vedic Yantra',
  rudraksha: 'Holy Rudraksha',
  pendants: 'Spiritual Pendant',
  other: 'Divine Essential',
};

export default function ProductDetailClient({
  product,
  relatedProducts,
  whatsappNumber,
}: ProductDetailClientProps) {
  const router = useRouter();

  // Multi-image list
  const imageList =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pincode, setPincode] = useState('411001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'benefits' | 'specs'>('details');

  // Compute pricing
  const originalPrice = product.originalPrice || Math.round(product.price * 1.35);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // Cart operations
  const addToCart = (qty = quantity, redirect = false) => {
    try {
      const saved = localStorage.getItem('divyaurja_cart');
      const cart: CartItem[] = saved ? JSON.parse(saved) : [];
      const existing = cart.find((item) => item.product.id === product.id);

      let updatedCart: CartItem[];
      if (existing) {
        updatedCart = cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        updatedCart = [...cart, { product, quantity: qty }];
      }

      localStorage.setItem('divyaurja_cart', JSON.stringify(updatedCart));

      if (redirect) {
        router.push(`/checkout?product=${product.id}`);
      } else {
        toast.success(`Added ${qty} × "${product.name}" to cart!`, {
          action: {
            label: 'View Cart',
            onClick: () => router.push('/catalogue'),
          },
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not update cart');
    }
  };

  const handleBuyNow = () => {
    addToCart(quantity, true);
  };

  const handleShareClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Divya Urja`,
          text: `Check out ${product.name} at Divya Urja for ₹${product.price.toLocaleString('en-IN')}:`,
          url,
        });
        return;
      } catch {
        // Fallback to modal if user canceled or rejected share dialog
      }
    }
    setShareModalOpen(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppOrder = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = encodeURIComponent(
      `🙏 *Namaste Guruji!* I am interested in ordering:\n\n` +
        `📦 *Product:* ${product.name}\n` +
        `💰 *Price:* ₹${product.price.toLocaleString('en-IN')}\n` +
        `🔢 *Quantity:* ${quantity}\n` +
        `🔗 *Product Link:* ${currentUrl}\n\n` +
        `Please guide me with the energized dispatch & payment details.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // Keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageList.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageList.length]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B]">
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/catalogue" className="hover:text-primary transition-colors">
              Catalogue
            </Link>
            <span>/</span>
            <span className="capitalize text-gray-700 font-medium">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-[150px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs transition-colors shadow-2xs"
              title="Share this product"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <span>Share</span>
            </button>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Products</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-24 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ========================================================= */}
          {/* LEFT: Multi-Photo Interactive Gallery & Carousel (5 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">
              {/* Main Image Stage */}
              <div className="relative aspect-square w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center group select-none">
                {imageList.length > 0 ? (
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 50 && activeImageIndex > 0) {
                        setActiveImageIndex(activeImageIndex - 1);
                      } else if (info.offset.x < -50 && activeImageIndex < imageList.length - 1) {
                        setActiveImageIndex(activeImageIndex + 1);
                      }
                    }}
                    className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center p-3"
                  >
                    <img
                      src={imageList[activeImageIndex]}
                      alt={`${product.name} photo ${activeImageIndex + 1}`}
                      className="w-full h-full object-contain max-h-[500px] transition-transform duration-500 hover:scale-105"
                      loading="eager"
                    />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                    <Sparkles className="w-16 h-16 text-secondary/30 mb-2 animate-pulse" />
                    <span className="text-sm font-medium">Sacred Product Image</span>
                  </div>
                )}

                {/* Badges on main image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    100% Energized
                  </span>
                  {product.featured && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-white shadow-xs">
                      ✨ Bestseller
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(
                      !isWishlisted ? 'Added to your favorites!' : 'Removed from favorites'
                    );
                  }}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 shadow-md transition-all hover:scale-110"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </button>

                {/* Left/Right Swipe Navigation Buttons */}
                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : imageList.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-transform hover:scale-110 focus:outline-hidden"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev < imageList.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-transform hover:scale-110 focus:outline-hidden"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Counter indicator */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs font-semibold backdrop-blur-xs">
                      {activeImageIndex + 1} / {imageList.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-white border-2 transition-all p-1 ${
                        activeImageIndex === idx
                          ? 'border-primary shadow-md scale-105'
                          : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Swipe Instruction for Mobile */}
              <div className="text-center text-xs text-gray-500 lg:hidden">
                👆 Swipe left / right to view photos
              </div>

              {/* Trust Badges Bar under Gallery */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">100% Authentic</span>
                  <span className="text-[10px] text-gray-600">Lab Tested</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Vedic Energized</span>
                  <span className="text-[10px] text-gray-600">Prana Pratishtha</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                  <Truck className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Free Delivery</span>
                  <span className="text-[10px] text-gray-600">Pan-India</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER: Product Title, Rating, Highlights & Tabs (4 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Category / Brand Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {CATEGORY_NAMES[product.category] || product.category}
                </span>
                <span className="text-xs text-gray-600">• Divya Urja Certified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-primary font-medium mt-1">
                Spiritual Remedy & Astrological Harmonizer
              </p>
            </div>

            {/* Amazon-Style Rating Box */}
            <div className="flex items-center gap-2 text-sm border-y border-gray-200/80 py-2.5">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-gray-900">4.9</span>
              <span className="text-gray-400">|</span>
              <span className="text-primary hover:underline cursor-pointer text-xs sm:text-sm">
                128 verified ratings
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                50+ bought in past month
              </span>
            </div>

            {/* Price section (Amazon style) */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-red-600 font-semibold text-lg">-{discountPercent}%</span>
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span>M.R.P.:</span>
                <span className="line-through text-gray-600">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-green-700 font-medium">
                  You Save ₹{(originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Inclusive of all taxes. Free sanctified packaging & prayer energized energization
                certificate included.
              </p>
            </div>

            {/* Key Highlights / "About this item" */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                Key Highlights & Vedic Blessings
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>Consecrated Prana Pratishtha:</strong> Cleansed with Gangajal, Panchamrit,
                    and energized with planetary Beej Mantras.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>Astrological Alignment:</strong> Harmonizes negative planetary energies,
                    clears financial blockages, and attracts positive aura.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>100% Lab Tested:</strong> Natural earth-mined stones and authentic Rudraksha
                    beads with genuine energetic resonance.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>
                    <strong>Custom Consultation Support:</strong> Includes personalized instructions on
                    auspicious day and mantra for wearing.
                  </span>
                </li>
              </ul>
            </div>

            {/* Tabbed Info (Details / Benefits / Specs) */}
            <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              <div className="flex border-b border-gray-200 bg-gray-50/80">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-colors truncate text-center ${
                    activeTab === 'details'
                      ? 'border-b-2 border-primary text-primary bg-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`flex-1 py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-colors truncate text-center ${
                    activeTab === 'benefits'
                      ? 'border-b-2 border-primary text-primary bg-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`flex-1 py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-colors truncate text-center ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-primary text-primary bg-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Specifications
                </button>
              </div>

              <div className="p-4 text-xs sm:text-sm text-gray-700 leading-relaxed min-h-[140px]">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <p className="text-xs text-gray-600">
                      Every piece is individually inspected and attuned by our certified master
                      astrologers and energy consultants before shipping to your sacred space.
                    </p>
                  </div>
                )}

                {activeTab === 'benefits' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">Spiritual & Life Enhancements:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary-dark font-medium">
                        ✨ Wealth & Prosperity Magnet
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/10 text-secondary font-medium">
                        🛡️ Evil Eye & Negative Shield
                      </div>
                      <div className="p-2 rounded-lg bg-green-50 text-green-800 font-medium">
                        🧘 Mind Calm & Emotional Balance
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-800 font-medium">
                        🎯 Focus, Memory & Career Growth
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-1.5 font-semibold text-gray-500 w-1/3">Category</td>
                        <td className="py-1.5 text-gray-900 capitalize">{product.category}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-semibold text-gray-500">Energized By</td>
                        <td className="py-1.5 text-gray-900">Divya Urja Vedic Priests</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-semibold text-gray-500">Suitable For</td>
                        <td className="py-1.5 text-gray-900">Men, Women, Students & Homes</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-semibold text-gray-500">In The Box</td>
                        <td className="py-1.5 text-gray-900">Product + Sacred Vibhuti + Guide</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-semibold text-gray-500">Stock Status</td>
                        <td className="py-1.5">
                          <span
                            className={`font-semibold ${
                              product.inStock ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            {product.inStock ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: Amazon-Style Buy Box & Order Portal (3 cols)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-4">
              {/* Price & Stock */}
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-green-700 font-medium mt-0.5">
                  FREE Delivery across India
                </div>
              </div>

              {/* Delivery Estimation / Pincode */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Deliver to:</span>
                  <input
                    type="text"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeChecked(e.target.value.length === 6);
                    }}
                    placeholder="Pincode"
                    className="w-18 px-1.5 py-0.5 border border-gray-300 rounded text-center text-xs font-semibold focus:outline-primary"
                  />
                </div>
                {pincodeChecked && (
                  <p className="text-green-700 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Fast Dispatch within 24-48 hrs
                  </p>
                )}
              </div>

              {/* Stock Indicator */}
              <div>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Currently Unavailable
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden w-fit shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-center min-w-[40px]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Amazon Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Add to Cart (Golden yellow Amazon button) */}
                <button
                  onClick={() => addToCart(quantity, false)}
                  disabled={!product.inStock}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-xl font-bold text-sm text-gray-900 bg-gradient-to-b from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#F0B800] border border-[#FCD200] shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 text-gray-900" />
                  Add to Cart
                </button>

                {/* 2. Buy Now (Vibrant orange Amazon button) */}
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-xl font-bold text-sm text-white bg-gradient-to-b from-[#FFA41C] to-[#FF8F00] hover:from-[#FF8F00] hover:to-[#E67A00] border border-[#FF8F00] shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Buy Now
                </button>

                {/* 3. WhatsApp Order Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 min-h-[48px] rounded-xl font-semibold text-xs text-white bg-[#25D366] hover:bg-[#20BD5A] shadow-xs hover:shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order via WhatsApp
                </button>
              </div>


              {/* Share Product Direct Trigger */}
              <button
                onClick={handleShareClick}
                className="w-full text-center text-xs font-semibold text-primary hover:underline pt-1 flex items-center justify-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                Share this item with family & friends
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RELATED / RECOMMENDED PRODUCTS: Amazon "Customers Also Viewed" */}
        {/* ========================================================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-playfair text-gray-900">
                  Customers who viewed this item also viewed
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Recommended spiritual remedies and energizing essentials
                </p>
              </div>
              <Link
                href="/catalogue"
                className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                See all products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct, idx) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  index={idx}
                  whatsappNumber={whatsappNumber}
                  onAddToCart={(p) => {
                    const saved = localStorage.getItem('divyaurja_cart');
                    const cart: CartItem[] = saved ? JSON.parse(saved) : [];
                    const existing = cart.find((item) => item.product.id === p.id);
                    const updated = existing
                      ? cart.map((it) =>
                          it.product.id === p.id ? { ...it, quantity: it.quantity + 1 } : it
                        )
                      : [...cart, { product: p, quantity: 1 }];
                    localStorage.setItem('divyaurja_cart', JSON.stringify(updated));
                    toast.success(`Added "${p.name}" to cart!`);
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ========================================================= */}
      {/* SHARE MODAL / DIALOG                                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-playfair">
                  Share this Sacred Product
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Share divine blessings, healing energies, and this product link with others
                </p>
              </div>

              {/* Product Mini Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-200/80">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white"
                  />
                )}
                <div className="truncate flex-1">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-xs font-semibold text-primary">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Share Channels */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : '';
                    const text = encodeURIComponent(
                      `Check out ${product.name} on Divya Urja (₹${product.price.toLocaleString('en-IN')}): ${url}`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500 text-white font-semibold text-xs hover:bg-green-600 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>

                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Blessed ${product.name} on Divya Urja: ${url}`
                      )}`,
                      '_blank'
                    );
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1DA1F2] text-white font-semibold text-xs hover:bg-[#1a94df] transition-colors shadow-xs"
                >
                  Twitter / X
                </button>
              </div>

              {/* Copy URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Direct Link:</label>
                <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="w-full bg-transparent px-2 text-xs text-gray-600 focus:outline-hidden truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Action Bar (Amazon Style) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 flex items-center gap-2 shadow-lg safe-area-pb">
        <button
          onClick={handleWhatsAppOrder}
          className="p-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors shrink-0 shadow-xs flex items-center justify-center min-h-[48px] min-w-[48px]"
          title="WhatsApp Order"
          aria-label="Order via WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => addToCart(quantity, false)}
          disabled={!product.inStock}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-xs text-gray-900 bg-gradient-to-b from-[#FFD814] to-[#F7CA00] border border-[#FCD200] shadow-xs active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-xs text-white bg-gradient-to-b from-[#FFA41C] to-[#FF8F00] border border-[#FF8F00] shadow-xs active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}

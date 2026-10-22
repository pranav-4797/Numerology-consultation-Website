'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Sparkles, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EmptyState from '@/components/ui/EmptyState';
import { getProducts, getSiteSettings } from '@/services/firestore';
import type { Product, ProductCategory } from '@/types';

const CATEGORIES: { key: ProductCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Products', emoji: '✨' },
  { key: 'bracelets', label: 'Bracelets', emoji: '📿' },
  { key: 'crystals', label: 'Crystals', emoji: '💎' },
  { key: 'yantras', label: 'Yantras', emoji: '🔯' },
  { key: 'rudraksha', label: 'Rudraksha', emoji: '📿' },
  { key: 'pendants', label: 'Pendants', emoji: '🧿' },
  { key: 'other', label: 'Other', emoji: '🎁' },
];

interface CartItem {
  product: Product;
  quantity: number;
}

interface CatalogueClientProps {
  initialProducts: Product[];
  initialWhatsapp?: string;
}

const INTENTIONS = [
  { id: 'all', label: 'All Intentions', emoji: '✨', keywords: [] },
  { id: 'wealth', label: 'Wealth & Abundance', emoji: '💰', keywords: ['wealth', 'money', 'pyrite', 'citrine', 'lakshmi', 'kuber', 'prosperity', 'abundance', 'fortune'] },
  { id: 'protection', label: 'Protection & Aura', emoji: '🛡️', keywords: ['protection', 'evil eye', 'tourmaline', 'shani', 'nazar', 'shield', 'negative', 'aura', 'raksha'] },
  { id: 'health', label: 'Health & Peace', emoji: '🧘', keywords: ['peace', 'health', 'amethyst', 'quartz', 'healing', 'stress', 'calm', 'sleep', 'chakra'] },
  { id: 'career', label: 'Career & Focus', emoji: '🎯', keywords: ['career', 'focus', 'tiger eye', 'success', 'job', 'study', 'confidence', 'business'] },
];

export default function CatalogueClient({ initialProducts, initialWhatsapp = '919822492488' }: CatalogueClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [activeIntention, setActiveIntention] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('divyaurja_cart');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showCart, setShowCart] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsapp);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist cart to localStorage
  const saveCart = useCallback((items: CartItem[]) => {
    setCart(items);
    try {
      localStorage.setItem('divyaurja_cart', JSON.stringify(items));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProducts(), getSiteSettings()])
      .then(([productsData, settings]) => {
        if (!isMounted) return;
        setProducts(productsData);
        if (settings.whatsapp) setWhatsappNumber(settings.whatsapp);
      })
      .catch((err) => console.error('Error refreshing products:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesIntention = true;
    if (activeIntention !== 'all') {
      const selectedIntentionObj = INTENTIONS.find((i) => i.id === activeIntention);
      if (selectedIntentionObj && selectedIntentionObj.keywords.length > 0) {
        const textToSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        matchesIntention = selectedIntentionObj.keywords.some((kw) => textToSearch.includes(kw));
      }
    }

    return matchesCategory && matchesSearch && matchesIntention;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      saveCart(cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      saveCart([...cart, { product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    saveCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    router.push('/checkout');
  };

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Spiritual <span className="text-secondary">Catalogue</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-300 max-w-2xl mx-auto">
            Authentic, lab-tested, and energized items to enhance positivity, alignment, and energy flow in your life.
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Energized Products"
              title="Sacred Products for Holistic Wellbeing"
              subtitle="Every product is certified, hand-selected, and energetically cleansed before delivery."
            />
          </ScrollReveal>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
              <input
                type="text"
                placeholder="Search products by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeCategory === cat.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white text-text/70 border border-gray-100 hover:border-primary/20 hover:bg-primary/5'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Intention Quick-Pills (Wealth, Protection, Health, Career) */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            <span className="text-xs font-bold text-text/40 uppercase tracking-wider pl-1 pr-1 hidden sm:inline">
              Intent:
            </span>
            {INTENTIONS.map((intention) => (
              <button
                key={intention.id}
                onClick={() => setActiveIntention(intention.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  activeIntention === intention.id
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
                    : 'bg-white/90 text-text/60 border border-gray-200/80 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <span>{intention.emoji}</span>
                <span>{intention.label}</span>
              </button>
            ))}
          </div>

          {/* Floating Cart Trigger - raised to bottom-20 on mobile to clear bottom nav */}
          {cartCount > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowCart(true)}
              className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 px-4 py-3 sm:px-5 sm:py-3.5 bg-primary text-white font-semibold rounded-2xl shadow-2xl hover:bg-primary/90 transition-all flex items-center gap-2.5 sm:gap-3 border border-white/20 cursor-pointer text-xs sm:text-sm active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-text font-bold text-xs rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
              <span>View Cart (₹{cartTotal.toLocaleString('en-IN')})</span>
            </motion.button>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description={
                searchQuery
                  ? `No products matched "${searchQuery}". Try a different keyword.`
                  : 'No items in this category yet. Please check back soon!'
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAddToCart={addToCart}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="font-playfair text-xl font-bold text-text">Your Cart</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-text/40 hover:text-text rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Standard Delivery Notice - No Free Delivery */}
              <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/50 flex items-center justify-between text-xs text-amber-950 font-medium">
                <span className="flex items-center gap-1.5">
                  <span>📦</span>
                  <span>Standard Delivery (₹100) applied at checkout</span>
                </span>
                <span className="font-semibold text-primary">Sacred Care</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
                  >
                    <img
                      src={product.image || '/logo.jpg'}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-text/50 capitalize mb-1">{product.category}</p>
                      <p className="text-sm font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="px-2 py-1 text-text/60 hover:bg-gray-100 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-semibold text-text">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="px-2 py-1 text-text/60 hover:bg-gray-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between text-base font-bold text-text">
                  <span>Total Amount</span>
                  <span className="text-primary text-xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MessageCircle, Trash2, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { getProducts } from '@/services/firestore';
import { getSiteSettings } from '@/services/firestore';
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

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('919822492488');

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('divyaurja_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Persist cart to localStorage
  const saveCart = useCallback((items: CartItem[]) => {
    setCart(items);
    try {
      localStorage.setItem('divyaurja_cart', JSON.stringify(items));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, settings] = await Promise.all([
          getProducts(),
          getSiteSettings(),
        ]);
        setProducts(productsData);
        if (settings.whatsapp) setWhatsappNumber(settings.whatsapp);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

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

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;
    const items = cart
      .map((item) => `• ${item.product.name} x${item.quantity} — ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`)
      .join('\n');
    const message = encodeURIComponent(
      `Hi, I'd like to order the following items:\n\n${items}\n\n*Total: ₹${cartTotal.toLocaleString('en-IN')}*\n\nPlease share payment and delivery details.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-gray-300 font-medium">Sacred Numerology Essentials</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            <span className="text-secondary">Catalogue</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Discover powerful numerology bracelets, healing crystals, yantras, and sacred items to enhance your spiritual journey.
          </motion.p>
        </div>
      </section>

      {/* Category Filter + Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loader text="Loading products..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Available"
              description="Our catalogue is being updated. Check back soon for amazing numerology products!"
            />
          ) : (
            <>
              <ScrollReveal>
                <SectionHeading
                  badge="Shop Now"
                  title="Numerology Essentials"
                  subtitle="Handpicked sacred items charged with numerological energy to bring harmony, prosperity, and protection into your life."
                />
              </ScrollReveal>

              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {CATEGORIES.map((cat) => {
                  const count = cat.key === 'all'
                    ? products.length
                    : products.filter((p) => p.category === cat.key).length;
                  if (cat.key !== 'all' && count === 0) return null;
                  return (
                    <motion.button
                      key={cat.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        activeCategory === cat.key
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-white text-text/60 border border-gray-200 hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      {cat.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-text/40'
                      }`}>
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Product Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      whatsappNumber={whatsappNumber}
                      onAddToCart={addToCart}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-text/40 text-lg">No products in this category yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-bold text-text">Your Cart</h3>
                    <p className="text-xs text-text/40">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text/50" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-text/10 mx-auto mb-3" />
                    <p className="text-text/40">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-secondary/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-text truncate">{item.product.name}</h4>
                        <p className="text-xs text-text/40">₹{item.product.price.toLocaleString('en-IN')} each</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-sm font-bold text-text/50 hover:border-primary hover:text-primary transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold text-text w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-sm font-bold text-text/50 hover:border-primary hover:text-primary transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <span className="text-sm font-bold text-primary">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text/50">Total</span>
                    <span className="text-xl font-bold text-text">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={handleCheckoutWhatsApp}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                  </button>
                  <p className="text-[11px] text-text/30 text-center">
                    Payment details will be shared on WhatsApp after placing the order.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

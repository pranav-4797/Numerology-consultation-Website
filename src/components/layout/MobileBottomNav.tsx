'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, ShoppingBag, ShoppingCart, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const { lang } = useLanguage();
  const [cartCount, setCartCount] = useState(0);

  // Read live cart count from localStorage
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = localStorage.getItem('divyaurja_cart');
        if (saved) {
          const items = JSON.parse(saved);
          const total = items.reduce((sum: number, it: { quantity?: number }) => sum + (it.quantity || 1), 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    // Poll gently every 2s for local changes across tabs/modals
    const timer = setInterval(updateCount, 2000);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(timer);
    };
  }, []);

  const whatsappNumber = settings.whatsapp || '919822492488';
  const whatsappMsg = encodeURIComponent(
    '🙏 Namaste Guruji! I am visiting Divya Urja and would like guidance regarding consultation and spiritual remedies.'
  );

  const labels = {
    en: { home: 'Home', services: 'Services', store: 'Store', cart: 'Cart', chat: 'WhatsApp' },
    hi: { home: 'मुख्य', services: 'सेवाएं', store: 'दुकान', cart: 'कार्ट', chat: 'व्हाट्सएप' },
    mr: { home: 'मुख्य', services: 'सेवा', store: 'दुकान', cart: 'कार्ट', chat: 'व्हाट्सअ‍ॅप' },
  }[lang] || { home: 'Home', services: 'Services', store: 'Store', cart: 'Cart', chat: 'WhatsApp' };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${
            pathname === '/' ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">{labels.home}</span>
        </Link>

        {/* 2. Services */}
        <Link
          href="/services"
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${
            pathname.startsWith('/services') ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${pathname.startsWith('/services') ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">{labels.services}</span>
        </Link>

        {/* 3. Sacred Store */}
        <Link
          href="/catalogue"
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${
            pathname.startsWith('/catalogue') && pathname !== '/checkout'
              ? 'text-primary font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag
            className={`w-5 h-5 ${
              pathname.startsWith('/catalogue') && pathname !== '/checkout'
                ? 'stroke-[2.5px]'
                : 'stroke-[1.8px]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">{labels.store}</span>
        </Link>

        {/* 4. Cart / Checkout */}
        <Link
          href="/checkout"
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${
            pathname === '/checkout' ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${pathname === '/checkout' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 min-w-[16px] h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs animate-scale">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">{labels.cart}</span>
        </Link>

        {/* 5. WhatsApp Guruji */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 text-green-600 hover:text-green-700 transition-colors"
          aria-label="Chat with Guruji on WhatsApp"
        >
          <div className="p-1 rounded-full bg-green-500 text-white shadow-2xs">
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-green-700 tracking-tight">{labels.chat}</span>
        </a>
      </div>
    </nav>
  );
}

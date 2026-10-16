'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '@/utils/cookies';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Delay 1.5 seconds so it doesn't immediately flash on first page render
    const timer = setTimeout(() => {
      const consent = getCookieConsent();
      if (!consent) {
        setShowBanner(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent('all');
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    setCookieConsent('essential');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-[#1F2937]/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 relative">
            {/* Close button */}
            <button
              onClick={handleEssentialOnly}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Fast Caching & Preferences
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Instant Load
                  </span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  We use cookies and local storage to cache spiritual remedies, cart items, and
                  language preferences so pages load instantaneously on your sacred visit.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
              <button
                onClick={handleEssentialOnly}
                className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
              >
                Essential Only
              </button>

              <button
                onClick={handleAcceptAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Accept & Enable ⚡ Fast Caching</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

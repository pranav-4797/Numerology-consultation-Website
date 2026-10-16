'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '@/utils/cookies';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const consent = getCookieConsent();
      if (!consent) {
        setShowBanner(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent('all');
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookieConsent('essential');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-md text-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-200/80 relative">
            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  Cookie & Privacy Preferences
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We use cookies and local storage to remember your preferences, cart items, and provide faster page loading.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                onClick={handleDecline}
                className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-colors"
              >
                Essential Only
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

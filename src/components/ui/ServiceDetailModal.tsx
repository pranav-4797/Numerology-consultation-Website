'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ServiceDetailModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text/50" />
            </button>

            {/* Image */}
            {service.image && (
              <div className="mb-6 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center max-h-52">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={400}
                  height={208}
                  className="w-full h-auto max-h-52 object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* Service Details */}
            <h3 className="font-playfair text-2xl font-bold text-text mb-3 pr-8">
              {service.title}
            </h3>

            {service.fees && (
              <div className="flex items-center gap-1 text-primary font-bold mb-4">
                <IndianRupee className="w-4 h-4" />
                <span>{service.fees}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text/40 mb-1.5">Description</h4>
                <p className="text-sm text-text/70 leading-relaxed whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>

              {service.benefits && service.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text/40 mb-2">Key Benefits</h4>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-text/70">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-text/60 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/book?service=${service.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all"
              >
                {t('nav.bookConsultation')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

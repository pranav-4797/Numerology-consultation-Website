'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee } from 'lucide-react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import ServiceDetailModal from '@/components/ui/ServiceDetailModal';
import { useLanguage } from '@/context/LanguageContext';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const { t } = useLanguage();
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-gray-100"
      >
        {/* Image - shows full image, click to enlarge */}
        <div className="relative">
          {service.image ? (
            <ImageLightbox
              src={service.image}
              alt={service.title}
              className="w-full h-auto max-h-64 object-contain bg-gray-50"
              containerClassName="relative overflow-hidden"
            />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="font-playfair text-4xl text-primary/30">{service.title.charAt(0)}</span>
            </div>
          )}
          {service.featured && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-secondary text-text text-xs font-bold rounded-full shadow-lg z-10">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 
            onClick={() => setDetailOpen(true)}
            className="font-playfair text-xl font-bold text-text mb-3 hover:text-primary transition-colors cursor-pointer"
          >
            {service.title}
          </h3>
          <p 
            onClick={() => setDetailOpen(true)}
            className="text-sm text-text/60 leading-relaxed mb-4 line-clamp-3 cursor-pointer hover:text-text/80 transition-colors"
          >
            {service.description}
          </p>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div>
              {service.fees && (
                <span className="flex items-center gap-0.5 text-sm font-bold text-primary mb-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {service.fees}
                </span>
              )}
              <button
                onClick={() => setDetailOpen(true)}
                className="text-xs font-semibold text-primary/60 hover:text-primary transition-colors block text-left cursor-pointer"
              >
                Learn More & Benefits
              </button>
            </div>
            <Link
              href={`/book?service=${service.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 group-hover:gap-3 transition-all whitespace-nowrap"
            >
              {t('nav.bookConsultation')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <ServiceDetailModal
        service={service}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

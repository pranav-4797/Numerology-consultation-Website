'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee } from 'lucide-react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { useLanguage } from '@/context/LanguageContext';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const { t } = useLanguage();
  return (
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
        <h3 className="font-playfair text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-text/60 leading-relaxed mb-4 line-clamp-3">
          {service.description}
        </p>
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {service.fees ? (
            <span className="flex items-center gap-0.5 text-base font-bold text-primary">
              <IndianRupee className="w-4 h-4" />
              {service.fees}
            </span>
          ) : (
            <span />
          )}
          <Link
            href={`/book?service=${service.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 group-hover:gap-3 transition-all whitespace-nowrap"
          >
            {t('nav.bookConsultation')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

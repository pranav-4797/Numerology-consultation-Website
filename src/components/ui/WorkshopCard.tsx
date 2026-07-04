'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, IndianRupee } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/helpers';
import ImageLightbox from '@/components/ui/ImageLightbox';
import WorkshopRegisterModal from '@/components/ui/WorkshopRegisterModal';
import { useLanguage } from '@/context/LanguageContext';
import type { Workshop } from '@/types';

interface WorkshopCardProps {
  workshop: Workshop;
  index?: number;
}

export default function WorkshopCard({ workshop, index = 0 }: WorkshopCardProps) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const seatsFull = !workshop.availableSeats || workshop.availableSeats <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-gray-100"
      >
        {/* Image - shows full poster, click to enlarge */}
        <div className="relative">
          {workshop.image ? (
            <ImageLightbox
              src={workshop.image}
              alt={workshop.title}
              className="w-full h-auto max-h-72 sm:max-h-80 object-contain bg-gray-50"
              containerClassName="overflow-hidden"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary/30" />
            </div>
          )}
          {/* Date Badge */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
            <p className="text-xs font-bold text-primary">{formatDate(workshop.date)}</p>
          </div>
          {seatsFull && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm">
              {t('workshop.seatsFull')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h3 className="font-playfair text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3 group-hover:text-primary transition-colors">
            {workshop.title}
          </h3>
          <p className="text-sm text-text/60 leading-relaxed mb-3 sm:mb-4 line-clamp-2">
            {workshop.description}
          </p>

          <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 text-sm text-text/50">
              <Clock className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span>{formatTime(workshop.time)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text/50">
              <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className="truncate">{workshop.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text/50">
              <Users className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className={seatsFull ? 'text-red-500 font-semibold' : ''}>
                {seatsFull
                  ? t('workshop.seatsFull')
                  : `${workshop.availableSeats} ${t('workshop.seatsAvailable')}`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3">
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-primary">
              <IndianRupee className="w-4 h-4" />
              {workshop.fees}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              disabled={seatsFull}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                seatsFull
                  ? 'bg-gray-100 text-text/30 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {seatsFull ? t('workshop.seatsFull') : t('workshop.registerNow')}
            </button>
          </div>
        </div>
      </motion.div>

      <WorkshopRegisterModal workshop={workshop} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

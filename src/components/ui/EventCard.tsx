'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/helpers';
import ImageLightbox from '@/components/ui/ImageLightbox';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-gray-100"
    >
      {/* Poster - shows full image, click to enlarge */}
      <div className="relative">
        {event.poster ? (
          <ImageLightbox
            src={event.poster}
            alt={event.title}
            className="w-full h-auto max-h-72 sm:max-h-80 object-contain bg-gray-50"
            containerClassName="overflow-hidden"
          />
        ) : (
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-secondary/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="font-playfair text-lg sm:text-xl font-bold text-text mb-2 sm:mb-3 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-text/60 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 text-sm text-text/50">
            <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text/50">
            <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text/50">
            <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

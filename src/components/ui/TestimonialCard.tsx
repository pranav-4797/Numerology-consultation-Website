'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export default function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-gray-100"
    >
      {/* Quote Icon */}
      <div className="absolute top-6 right-6">
        <Quote className="w-8 h-8 text-primary/10" />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < testimonial.rating ? 'text-secondary fill-secondary' : 'text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Review */}
      <p className="text-sm text-text/70 leading-relaxed mb-6 line-clamp-4">
        &ldquo;{testimonial.review}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/10"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-sm">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-text">{testimonial.name}</h4>
          <p className="text-xs text-text/40">Verified Client</p>
        </div>
      </div>
    </motion.div>
  );
}

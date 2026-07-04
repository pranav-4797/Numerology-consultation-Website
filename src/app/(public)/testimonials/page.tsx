'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TestimonialCard from '@/components/ui/TestimonialCard';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { getTestimonials } from '@/services/firestore';
import type { Testimonial } from '@/types';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-secondary">Testimonials</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear from our clients whose lives have been transformed through our guidance.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loader text="Loading testimonials..." />
          ) : testimonials.length === 0 ? (
            <EmptyState title="No Testimonials Yet" description="Client testimonials will appear here soon!" />
          ) : (
            <>
              <ScrollReveal>
                <SectionHeading badge="Client Stories" title="What Our Clients Say" subtitle="Real experiences and transformations shared by our valued clients." />
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <TestimonialCard key={t.id} testimonial={t} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

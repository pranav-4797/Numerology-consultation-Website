'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import WorkshopCard from '@/components/ui/WorkshopCard';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { getWorkshops } from '@/services/firestore';
import type { Workshop } from '@/types';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
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
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-secondary">Workshops</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-300 max-w-2xl mx-auto">
            Learn the powerful techniques of Numerology, Vastu, and occult sciences from expert practitioners.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loader text="Loading workshops..." />
          ) : workshops.length === 0 ? (
            <EmptyState title="No Workshops Scheduled" description="Stay tuned for upcoming workshops! Follow us on social media for updates." />
          ) : (
            <>
              <ScrollReveal>
                <SectionHeading badge="Learn & Grow" title="Upcoming Workshops" subtitle="Hands-on learning experiences to master ancient sciences and transform your life." />
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {workshops.map((workshop, i) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

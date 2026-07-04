'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GalleryGrid from '@/components/ui/GalleryGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { getGalleryImages } from '@/services/firestore';
import type { GalleryImage } from '@/types';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGalleryImages();
        setImages(data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
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
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-secondary">Gallery</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-300 max-w-2xl mx-auto">
            Glimpses from our workshops, events, and consultations.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loader text="Loading gallery..." />
          ) : images.length === 0 ? (
            <EmptyState title="No Images Yet" description="Gallery images will be added soon!" />
          ) : (
            <>
              <ScrollReveal>
                <SectionHeading badge="Visual Journey" title="Our Gallery" subtitle="A visual showcase of our work and events." />
              </ScrollReveal>
              <GalleryGrid images={images} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

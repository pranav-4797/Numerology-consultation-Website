'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '@/components/ui/BlogCard';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import EmptyState from '@/components/ui/EmptyState';
import { getBlogs } from '@/services/firestore';
import type { Blog } from '@/types';

interface BlogClientProps {
  initialBlogs: Blog[];
}

export default function BlogClient({ initialBlogs }: BlogClientProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);

  useEffect(() => {
    if (initialBlogs.length === 0) {
      getBlogs()
        .then((data) => setBlogs(data.filter((b) => b.status !== 'draft')))
        .catch((err) => console.error('Error fetching blogs client side:', err));
    }
  }, [initialBlogs]);

  return (
    <>
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Our <span className="text-secondary">Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Insights, tips, and wisdom from the world of Numerology, Vastu, and spiritual sciences.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogs.length === 0 ? (
            <EmptyState
              title="No Articles Yet"
              description="We are working on valuable content. Check back soon!"
            />
          ) : (
            <>
              <ScrollReveal>
                <SectionHeading
                  badge="Knowledge Hub"
                  title="Latest Articles"
                  subtitle="Deep insights and practical wisdom from our experts."
                />
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, i) => (
                  <BlogCard key={blog.id} blog={blog} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

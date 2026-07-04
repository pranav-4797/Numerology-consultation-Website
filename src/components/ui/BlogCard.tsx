'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDate, truncateText } from '@/utils/helpers';
import type { Blog } from '@/types';

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-gray-100"
    >
      <Link href={`/blog/${blog.slug}`}>
        {/* Cover Image - shows full image */}
        <div className="relative overflow-hidden">
          {blog.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto max-h-64 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="font-playfair text-5xl text-primary/20">{blog.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-text/40 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(blog.publishedAt)}</span>
          </div>
          <h3 className="font-playfair text-lg font-bold text-text mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-sm text-text/60 leading-relaxed mb-4">
            {truncateText(blog.excerpt, 120)}
          </p>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
            Read Article <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

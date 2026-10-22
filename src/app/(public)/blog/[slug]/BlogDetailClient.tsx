'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { getBlogBySlug } from '@/services/firestore';
import { formatDate } from '@/utils/helpers';
import { renderMarkdown, isHtmlContent } from '@/utils/markdown';
import Loader from '@/components/ui/Loader';
import type { Blog } from '@/types';

interface BlogDetailClientProps {
  initialBlog?: Blog | null;
  slug?: string;
}

export default function BlogDetailClient({ initialBlog, slug: propSlug }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<Blog | null>(initialBlog ?? null);
  const [loading, setLoading] = useState<boolean>(!initialBlog);

  useEffect(() => {
    // If we already have the initialBlog, no need to fetch
    if (initialBlog) {
      setLoading(false);
      return;
    }

    // Extract slug from prop or browser URL as fallback
    let currentSlug = propSlug;
    if (!currentSlug && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      currentSlug = pathParts[pathParts.length - 1];
    }
    if (currentSlug) {
      currentSlug = decodeURIComponent(currentSlug);
    }

    async function fetchBlog() {
      try {
        if (!currentSlug) return;
        const data = await getBlogBySlug(currentSlug);
        setBlog(data && data.status !== 'draft' ? data : null);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    }

    if (currentSlug && currentSlug !== 'placeholder') {
      fetchBlog();
    } else {
      setLoading(false);
    }
  }, [initialBlog, propSlug]);

  if (loading) return <Loader text="Loading article..." />;

  if (!blog) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[#FDFBF7]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mb-4 ring-8 ring-amber-500/5">
            <Calendar className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Article No Longer Available</h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            The spiritual wisdom article you are seeking has been archived, renamed, or moved. Explore our latest published articles or remedies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> All Articles
            </Link>
            <Link
              href="/catalogue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
            >
              Spiritual Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(blog.publishedAt)}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
          >
            {blog.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            {blog.excerpt}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Cover Image */}
          {blog.coverImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden mb-12 shadow-xl -mt-20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 sm:h-96 object-cover"
              />
            </motion.div>
          )}

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: isHtmlContent(blog.content) ? blog.content : renderMarkdown(blog.content),
            }}
          />

          {/* Actions */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: blog.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-text/60 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const isMobile = useIsMobile();

  // On mobile, fade in without translating (x/y) to prevent scroll stuttering
  const variants = {
    up: { hidden: { opacity: 0, y: isMobile ? 0 : 40 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: isMobile ? 0 : -40 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: isMobile ? 0 : -40 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: isMobile ? 0 : 40 }, visible: { opacity: 1, x: 0 } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: isMobile ? '0px' : '-50px' }}
      transition={{ duration: isMobile ? 0.35 : 0.6, ease: 'easeOut', delay: isMobile ? 0 : delay }}
      variants={variants[direction]}
      className={className}
    >
      {children}
    </motion.div>
  );
}


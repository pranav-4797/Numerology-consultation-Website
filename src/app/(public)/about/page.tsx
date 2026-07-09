'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Target, Eye, BookOpen, Trophy, Sparkles, X, Calendar, Hash, User, ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { useIsMobile } from '@/hooks/useIsMobile';

const achievements = [
  '700+ Happy Clients Worldwide',
  '8+ Years of Dedicated Practice',
  'Certified Vedic Numerologist',
  'Published Author & Speaker',
  'Workshop Leader & Mentor',
  'Expert in 12+ Occult Sciences',
];

const specializations = [
  { icon: Sparkles, title: 'Vedic Numerology', desc: 'Ancient numerical science for life guidance.' },
  { icon: Target, title: 'Vastu Energy Science', desc: 'Harmonizing spaces for positive energy flow.' },
  { icon: BookOpen, title: 'Crystal Therapy', desc: 'Healing through the power of natural crystals.' },
  { icon: Award, title: 'Name Correction', desc: 'Aligning your name with your destiny numbers.' },
];

const certificates = [
  {
    title: 'Advanced Professional Course in Vastu Energy Science',
    caption: 'Mastery in balancing cosmic and earth energies to create harmonious, high-vibe spaces.',
    image: '/certificates/vastu-energy-science.jpg',
    regNo: 'VES-26',
    date: 'April 3, 2026',
    instructor: 'Dr. Rohit Gadkari (PHD Gold Medalist)',
  },
  {
    title: 'Advanced Name Placement Course',
    caption: 'Professional training in name vibrations, cosmic alignment, and destiny number styling.',
    image: '/certificates/advanced-name-placement.jpg',
    regNo: 'B-24-107',
    date: 'May 15, 2025',
    instructor: 'Dr. Rohit Gadkari (Ace Numerologist)',
  },
  {
    title: 'Advanced Name Correction Course',
    caption: 'Comprehensive training in tuning spelling vibrations to unlock positive life transitions.',
    image: '/certificates/advance-name-correction.jpg',
    regNo: 'B-24-145',
    date: 'May 1, 2025',
    instructor: 'Dr. Rohit Gadkari (PHD Gold Medalist)',
  },
  {
    title: 'Advanced Numerology Course Trophy',
    caption: 'Appreciation award recognizing excellence and completion in ancient numerology sciences.',
    image: '/certificates/advanced-numerology-trophy.jpg',
    regNo: 'N/A',
    date: 'December 15, 2024',
    instructor: 'Dr. Rohit Gadkari (Ace Numerologist, Ph.D Gold Medalist)',
  },
];

export default function AboutPage() {
  const isMobile = useIsMobile();
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/80 rounded-full mb-6 border border-white/10"
          >
            About Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            The Journey of <span className="text-secondary">Divya Urja</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Bridging the gap between ancient wisdom and modern life through the transformative power of numbers and energy.
          </motion.p>
        </div>
      </section>

      {/* Consultant Profile */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="w-full h-[480px] rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={isMobile ? undefined : { rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="w-72 h-72 border border-primary/10 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={isMobile ? undefined : { rotate: -360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                      className="w-52 h-52 border border-secondary/20 rounded-full flex items-center justify-center"
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-primary/50" />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="absolute -bottom-4 left-6 px-5 py-3 bg-white rounded-xl shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">700+</p>
                    <p className="text-xs text-text/50">Happy Clients</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
                Meet The Consultant
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text mb-6 leading-tight">
                Dedicated to Transforming Lives Through
                <span className="text-primary"> Ancient Sciences</span>
              </h2>
              <p className="text-text/60 leading-relaxed mb-5">
                With over 8 years of dedicated practice and research in the field of Numerology,
                Vastu Shastra, and allied occult sciences, our consultant has been a guiding light
                for over 700 individuals and businesses.
              </p>
              <p className="text-text/60 leading-relaxed mb-5">
                Specializing in Vedic Numerology, Name Correction, Switch Words, Yantra Numerology,
                Crystal Therapy, and comprehensive Vastu consultations, every session is crafted
                to address your unique challenges and aspirations.
              </p>
              <p className="text-text/60 leading-relaxed mb-8">
                The mission is simple: to empower you with the knowledge and tools from ancient
                wisdom traditions that can bring lasting positive change to every aspect of your life.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Numerology', 'Vastu', 'Crystal Therapy', 'Switch Words'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-lg border border-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal delay={0}>
              <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10 h-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-text mb-4">Our Mission</h3>
                <p className="text-text/60 leading-relaxed">
                  To make the profound wisdom of Numerology and Vastu accessible to everyone,
                  providing personalized guidance that helps individuals and businesses align
                  with their highest potential. We strive to be the bridge between ancient knowledge
                  and contemporary life challenges.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="p-10 rounded-3xl bg-gradient-to-br from-secondary/5 to-secondary/0 border border-secondary/10 h-full">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-text mb-4">Our Vision</h3>
                <p className="text-text/60 leading-relaxed">
                  To create a world where everyone lives in harmony with their numbers and their
                  spaces. We envision a future where the ancient sciences of Numerology and Vastu
                  are recognized as essential tools for personal and professional growth, making
                  positive energy accessible to all.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Expertise"
              title="Areas of Specialization"
              subtitle="Comprehensive mastery across multiple branches of ancient wisdom and energy sciences."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-xl border border-gray-100 transition-all text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-text mb-2">{item.title}</h3>
                  <p className="text-sm text-text/50">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Credentials */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Credentials"
              title="Professional Certifications"
              subtitle="Verified academic achievements and awards in Vastu and Vedic Numerology."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certificates.map((cert, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div
                  onClick={() => setSelectedCert(cert)}
                  className="group cursor-pointer bg-background rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="px-4 py-2 bg-white/95 text-text text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Eye className="w-4 h-4 text-primary" /> View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2">
                      {cert.regNo !== 'N/A' ? 'Certificate' : 'Trophy Award'}
                    </span>
                    <h3 className="font-playfair text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-text/60 leading-relaxed mb-4 flex-grow italic">
                      "{cert.caption}"
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-text/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {cert.date}
                      </span>
                      <span className="font-medium text-primary flex items-center gap-0.5 hover:underline">
                        Verify <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-12"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Section */}
              <div className="md:col-span-7 bg-gray-900 flex items-center justify-center p-6 md:p-12 aspect-[4/3] md:aspect-auto md:min-h-[500px]">
                <img
                  src={selectedCert.image}
                  alt={selectedCert.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Details Section */}
              <div className="md:col-span-5 p-8 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-gray-100">
                <div>
                  <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full mb-4">
                    {selectedCert.regNo !== 'N/A' ? 'Verified Certificate' : 'Recognition Award'}
                  </span>
                  <h3 className="font-playfair text-xl font-bold text-text mb-3">
                    {selectedCert.title}
                  </h3>
                  <p className="text-xs text-text/60 leading-relaxed italic mb-6">
                    "{selectedCert.caption}"
                  </p>

                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-text/40 uppercase tracking-wider font-semibold">Issued By</p>
                        <p className="text-xs text-text font-medium">{selectedCert.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-text/40 uppercase tracking-wider font-semibold">Date of Issuance</p>
                        <p className="text-xs text-text font-medium">{selectedCert.date}</p>
                      </div>
                    </div>

                    {selectedCert.regNo !== 'N/A' && (
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-text/40 uppercase tracking-wider font-semibold">Registration Number</p>
                          <p className="text-xs font-mono text-text font-medium">{selectedCert.regNo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-8 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-text/50">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Government ISO 9001:2015 Compliant
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 hover:shadow-primary/20"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-br from-text via-gray-900 to-text">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Achievements"
              title="Milestones & Recognition"
              light
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{achievement}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

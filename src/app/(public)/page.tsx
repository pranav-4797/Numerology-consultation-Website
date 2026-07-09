'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Star, Shield, Award, Heart, Users,
  CheckCircle, ArrowRight, Phone,
} from 'lucide-react';
import Hero from '@/components/ui/Hero';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ServiceCard from '@/components/ui/ServiceCard';
import WorkshopCard from '@/components/ui/WorkshopCard';
import EventCard from '@/components/ui/EventCard';
import TestimonialCard from '@/components/ui/TestimonialCard';
import Loader from '@/components/ui/Loader';
import { getServices, getWorkshops, getEvents, getTestimonials } from '@/services/firestore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Service, Workshop, Event, Testimonial } from '@/types';

const whyChooseUs = [
  {
    icon: Star,
    title: '8+ Years Experience',
    description: 'Over 8 years of expertise in Numerology, Vastu, and holistic sciences.',
  },
  {
    icon: Shield,
    title: 'Trusted by 700+ Clients',
    description: 'Proven track record of transforming lives with accurate consultations.',
  },
  {
    icon: Award,
    title: 'Certified Practitioner',
    description: 'Certified in multiple modalities of Numerology and Vastu Shastra.',
  },
  {
    icon: Heart,
    title: 'Personalized Approach',
    description: 'Every consultation is tailored to your unique energy and circumstances.',
  },
  {
    icon: Users,
    title: 'Workshops & Training',
    description: 'Learn the ancient sciences through our comprehensive workshops.',
  },
  {
    icon: CheckCircle,
    title: '100% Confidential',
    description: 'Your personal data and consultation details are always kept private.',
  },
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, w, e, t] = await Promise.all([
          getServices(),
          getWorkshops(),
          getEvents(),
          getTestimonials(),
        ]);
        setServices(s.slice(0, 6));
        setWorkshops(w.slice(0, 3));
        setEvents(e.slice(0, 3));
        setTestimonials(t.slice(0, 6));
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Hero
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        ctaText="Book a Consultation"
        ctaLink="/book"
      />

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="w-full h-96 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative shadow-sm group">
                  <img
                    src="/certificates/advance-numerology-course.jpg"
                    alt="Certificate of Completion"
                    className="w-full h-full object-contain p-4 group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 px-6 py-4 bg-white rounded-2xl shadow-xl border border-gray-100">
                  <p className="text-3xl font-bold text-primary">8+</p>
                  <p className="text-xs text-text/50">Years Experience</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
                About Us
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text mb-6 leading-tight">
                Guiding You Towards a
                <span className="text-primary"> Harmonious Life</span>
              </h2>
              <p className="text-text/60 leading-relaxed mb-6">
                At Divya Urja, we blend the ancient wisdom of Vedic Numerology and Vastu Shastra
                with modern analytical techniques to provide you with accurate, actionable guidance
                for every aspect of your life.
              </p>
              <p className="text-text/60 leading-relaxed mb-8">
                Our founder brings over 8 years of dedicated practice and research in occult sciences,
                having helped over 700 clients across India and worldwide to unlock their true potential.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Know More <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Our Services"
              title="Ancient Wisdom, Modern Solutions"
              subtitle="Explore our comprehensive range of numerology and vastu consultancy services designed to bring harmony and success into your life."
            />
          </ScrollReveal>

          {loading ? (
            <Loader />
          ) : services.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  View All Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-text/50">Services coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-text via-gray-900 to-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              badge="Why Choose Us"
              title="Your Trusted Spiritual Guide"
              subtitle="We combine deep knowledge with compassionate guidance to help you navigate life's journey."
              light
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Workshops */}
      {!loading && workshops.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeading
                badge="Workshops"
                title="Upcoming Workshops"
                subtitle="Learn the powerful techniques of Numerology and Vastu from expert practitioners."
              />
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {workshops.map((workshop, i) => (
                <WorkshopCard key={workshop.id} workshop={workshop} index={i} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/workshops"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                View All Workshops <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {!loading && events.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeading
                badge="Events"
                title="Upcoming Events"
                subtitle="Join our exciting events and connect with like-minded seekers of spiritual growth."
              />
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                View All Events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {!loading && testimonials.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeading
                badge="Testimonials"
                title="What Our Clients Say"
                subtitle="Real stories from people whose lives have been transformed through our guidance."
              />
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={isMobile ? undefined : { x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40"
          />
          <motion.div
            animate={isMobile ? undefined : { x: [0, -100, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Take the first step towards a harmonious and prosperous life.
              Book your personalized consultation today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform"
              >
                Book Consultation <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
              >
                <Phone className="w-5 h-5" /> {settings.phone}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

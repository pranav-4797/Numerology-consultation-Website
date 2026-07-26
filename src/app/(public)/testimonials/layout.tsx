import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Reviews & Testimonials',
  description:
    'Read real client reviews, ratings, and transformation stories after Numerology consultation, Name Correction, and Vastu remedies by Divya Urja.',
  keywords: [
    'divya urja client reviews',
    'numerologist feedback and ratings',
    'name correction success stories',
    'vastu consultant client testimonials',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/testimonials',
  },
  openGraph: {
    title: 'Client Reviews & Testimonials | Divya Urja Consultation',
    description:
      'Discover genuine ratings and experiences from clients whose lives changed positively with our guidance.',
    url: 'https://divyaurja.in/testimonials',
  },
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

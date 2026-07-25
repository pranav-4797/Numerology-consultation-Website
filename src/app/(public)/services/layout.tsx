import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Numerology & Vastu Consultation Services | Divya Urja',
  description:
    'Explore comprehensive consultation services: Name Numerology Correction, Vastu Shastra Audit, Loshu Grid Report, Mobile Numerology, Crystal Therapy, and Switch Words remedies.',
  keywords: [
    'numerology consultation services',
    'vastu shastra audit pune',
    'name numerology correction',
    'loshu grid analysis report',
    'mobile numerology reading',
    'crystal therapy remedies',
    'switch words consultation',
    'yantra numerology',
    'vedic numerology consultation',
    'business name numerology',
    'baby name numerology',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/services',
  },
  openGraph: {
    title: 'Numerology & Vastu Consultation Services | Divya Urja',
    description:
      'Professional Numerology, Vastu Shastra, and Energy Science consultations. Transform your career, health, and relationships with tailored Remedies.',
    url: 'https://divyaurja.in/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

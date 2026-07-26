import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Occult Science & Numerology Insights Blog',
  description:
    'Read insightful blogs on Numerology, Loshu Grid calculations, Vastu Shastra remedies, Name Correction guides, Switch Words, and spiritual wellbeing.',
  keywords: [
    'numerology blog',
    'loshu grid calculation guide',
    'vastu remedies for home',
    'occult science articles',
    'name correction tips',
    'lucky number calculator guide',
    'mobile numerology science',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/blog',
  },
  openGraph: {
    title: 'Occult Science & Numerology Insights Blog | Divya Urja',
    description:
      'Educational articles and practical guidance on Numerology, Vastu Shastra, and sacred energy science.',
    url: 'https://divyaurja.in/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

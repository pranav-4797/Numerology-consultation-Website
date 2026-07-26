import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spiritual Catalogue | Certified Crystals, Yantras & Rudraksha',
  description:
    'Shop authentic energized spiritual items: natural gemstone bracelets, Shree Yantra, Rudraksha beads, directional Vastu remedies, and healing crystals.',
  keywords: [
    'buy certified crystal bracelets',
    'shree yantra numerology',
    'rudraksha online india',
    'energized gemstone remedies',
    'vastu pyramid online shop',
    'healing crystals for positivity',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/catalogue',
  },
  openGraph: {
    title: 'Spiritual Catalogue | Certified Crystals, Yantras & Rudraksha | Divya Urja',
    description:
      'Shop lab-certified, energized spiritual products for wealth, health, peace, and planetary balance.',
    url: 'https://divyaurja.in/catalogue',
  },
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

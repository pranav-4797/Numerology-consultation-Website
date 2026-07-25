import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery & Media | Divya Urja Events & Awards',
  description:
    'Browse photos of Divya Urja consultations, awards, certificates, seminars, workshops, and client interactions.',
  keywords: [
    'divya urja photo gallery',
    'numerology award ceremony photos',
    'vastu consultant events gallery',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/gallery',
  },
  openGraph: {
    title: 'Photo Gallery & Media | Divya Urja Events & Awards',
    description:
      'Highlights and memories from our consultation sessions, seminars, workshops, and award recognitions.',
    url: 'https://divyaurja.in/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

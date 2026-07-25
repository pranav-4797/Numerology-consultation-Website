import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spiritual Events & Occult Webinars | Divya Urja',
  description:
    'Discover upcoming spiritual events, interactive Q&A sessions, webinars, and community gatherings hosted by Divya Urja.',
  keywords: [
    'spiritual events pune',
    'numerology webinar online',
    'vastu shastra live event',
    'occult science gathering',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/events',
  },
  openGraph: {
    title: 'Spiritual Events & Occult Webinars | Divya Urja',
    description:
      'Stay updated with upcoming live sessions, offline seminars, and interactive spiritual events.',
    url: 'https://divyaurja.in/events',
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

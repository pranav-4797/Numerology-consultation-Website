import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Numerology & Vastu Workshops | Learn Occult Science',
  description:
    'Join upcoming workshops and live masterclasses on Numerology, Loshu Grid analysis, Vastu Shastra principles, and Energy Science.',
  keywords: [
    'numerology workshop',
    'learn vastu shastra course',
    'loshu grid training masterclass',
    'occult science classes online',
    'name numerology learning course',
    'basic to advance numerology course pune',
    'professional vastu consultant training',
    'mobile numerology live workshop',
    'certified numerologist certification course',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/workshops',
  },
  openGraph: {
    title: 'Numerology & Vastu Workshops | Learn Occult Science | Divya Urja',
    description:
      'Master the secret power of numbers and directional frequencies through interactive certified workshops.',
    url: 'https://divyaurja.in/workshops',
  },
};

export default function WorkshopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

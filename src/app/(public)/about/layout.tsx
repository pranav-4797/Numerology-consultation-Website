import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Divya Urja | Leading Numerologist & Vastu Practitioner',
  description:
    'Learn about Divya Urja, dedicated to empowering lives through Vedic Numerology, Vastu Shastra, Loshu Grid analysis, and Energy Science guidance.',
  keywords: [
    'about divya urja',
    'expert numerologist pune',
    'vastu consultant story',
    'holistic energy science guide',
    'vedic numerology practitioner india',
    'loshu grid expert profile',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/about',
  },
  openGraph: {
    title: 'About Divya Urja | Leading Numerologist & Vastu Practitioner',
    description:
      'Empowering individuals and families through ancient sacred wisdom, energy science, and scientific Numerology remedies.',
    url: 'https://divyaurja.in/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

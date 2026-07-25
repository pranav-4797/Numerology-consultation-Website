import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Numerology & Vastu Consultation Online | Divya Urja',
  description:
    'Schedule your 1-on-1 expert Numerology or Vastu Shastra consultation with Divya Urja. Select your preferred date, time slot, and service online.',
  keywords: [
    'book numerology consultation',
    'online numerology appointment',
    'vastu consultant appointment pune',
    'book name correction consultation',
    'loshu grid appointment online',
    'numerology report consultation fees',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/book',
  },
  openGraph: {
    title: 'Book Numerology & Vastu Consultation Online | Divya Urja',
    description:
      'Schedule your 1-on-1 consultation with expert Numerology & Vastu practitioners. Quick, secure booking.',
    url: 'https://divyaurja.in/book',
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

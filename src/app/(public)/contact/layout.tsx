import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Divya Urja | Numerology & Vastu Consultancy Pune',
  description:
    'Get in touch with Divya Urja for online and offline Numerology and Vastu consultation inquiries. Phone, WhatsApp, email, and clinic location.',
  keywords: [
    'contact divya urja',
    'numerology expert phone number',
    'vastu consultant contact pune',
    'numerologist contact information',
    'book consultation inquiry',
  ],
  alternates: {
    canonical: 'https://divyaurja.in/contact',
  },
  openGraph: {
    title: 'Contact Divya Urja | Numerology & Vastu Consultancy Pune',
    description:
      'Reach out to our experts for consultation booking, queries, and spiritual remedies support.',
    url: 'https://divyaurja.in/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

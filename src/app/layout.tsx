import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://divyaurja.in'),
  title: {
    default: 'Divya Urja | Best Numerology Consultation & Vastu Shastra Expert',
    template: '%s | Divya Urja',
  },
  description:
    'Transform your life with authentic Numerology Consultation, Vastu Shastra Audit, Name Correction & Loshu Grid Analysis in Pune and Online across India.',
  keywords: [
    'numerology consultation',
    'online numerology consultation',
    'best numerologist in india',
    'best numerologist in pune',
    'vastu shastra consultation',
    'vastu expert online',
    'name numerology correction',
    'loshu grid analysis',
    'vedic numerology consultation',
    'mobile numerology reading',
    'occult science guidance',
    'business name numerology',
    'baby name numerology',
    'marriage numerology compatibility',
    'signature numerology analysis',
    'car number numerology',
    'house number numerology',
    'crystal therapy remedies',
    'switch words consultation',
    'yantra numerology',
    'rudraksha consultation',
    'divya urja',
    'divya urja numerology',
    'divya urja vastu',
    'driver conductor number numerology',
    'psychic destiny number report',
    'loshu grid missing number remedies',
    'vastu shastra for home',
    'vastu for office and factory',
    'energy science consultant',
    'gemstone recommendation numerology',
    'lucky numbers and colors consultation',
    'personal year predictions',
    'pythagorean numerology consultation',
    'chaldean numerology expert',
    'astrology and numerology guidance',
    'top numerologist in maharashtra',
    'numerology consultation fees',
    'book numerology consultation online',
  ],
  alternates: {
    canonical: 'https://divyaurja.in',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://divyaurja.in',
    siteName: 'Divya Urja Numerology & Vastu Consultancy',
    title: 'Divya Urja | Premier Numerology & Vastu Shastra Consultancy',
    description:
      'Transform your life with ancient wisdom. Expert Numerology, Vastu Shastra, Name Correction, and holistic energy consultancy services.',
    images: [
      {
        url: 'https://divyaurja.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Divya Urja Numerology & Vastu Consultancy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divya Urja | Best Numerology & Vastu Shastra Guidance',
    description:
      'Transform your life with ancient wisdom. Expert Numerology, Vastu, Name Correction, and holistic energy science.',
    images: ['https://divyaurja.in/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  name: 'Divya Urja Numerology & Vastu Consultancy',
  url: 'https://divyaurja.in',
  logo: 'https://divyaurja.in/logo.jpg',
  image: 'https://divyaurja.in/og-image.png',
  description:
    'Premier Numerology, Vastu Shastra, Crystal Therapy, Name Correction, and Occult Science Consultancy in Pune, Maharashtra, India. Online & In-person consultations available worldwide.',
  telephone: '+919822492488',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '18.5204',
    longitude: '73.8567',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
  areaServed: ['Pune', 'Maharashtra', 'India', 'Worldwide'],
  founder: {
    '@type': 'Person',
    name: 'Divya Urja Lead Consultant',
    jobTitle: 'Senior Numerologist & Vastu Expert',
  },
  knowsAbout: [
    'Numerology',
    'Vastu Shastra',
    'Loshu Grid',
    'Name Numerology Correction',
    'Occult Science',
    'Crystal Remedies',
    'Mobile Numerology',
    'Energy Science',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Numerology Consultation and how can it help me?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Numerology consultation is the study of numbers derived from your birthdate and name to reveal your personality traits, life purpose, career opportunities, and destiny. Divya Urja offers personalized Numerology consultations including Loshu Grid analysis, Driver-Conductor number compatibility, Name Correction, and tailored remedies.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Vastu Shastra Consultation improve home and office energy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Vastu Shastra balances five natural elements (Earth, Water, Fire, Air, Space) within a living or working space. Divya Urja's Vastu expert provides non-demolition remedies, directional alignment, and energy science guidance for maximum peace, health, and prosperity.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can Name Correction in Numerology bring success?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, aligning your name spelling with your birth number and friendly planetary frequencies helps remove obstacles, enhances career growth, improves health, and attracts positive energy. We provide customized Name Numerology correction for individuals, babies, and business brand names.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer online Numerology and Vastu consultations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Divya Urja provides both online (via phone/video call/PDF reports) and in-person consultations in Pune and across the globe.',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0F766E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="font-poppins antialiased bg-background text-text">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                fontFamily: 'var(--font-poppins)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

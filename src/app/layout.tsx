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
    'commercial vastu consultant pune',
    'industrial vastu audit maharashtra',
    'non demolition vastu remedies',
    'directional energy balancing',
    'vastu pyramid placement',
    'main door vastu guidelines',
    'lucky mobile number selection',
    'flat number numerology check',
    'natural gemstone recommendation',
    'shree yantra placement guide',
    'energized crystal bracelets pune',
    'aura cleansing remedies',
    'chakra balancing consultation',
    'numerologist near me',
    'vastu consultant near me',
    'best occult science expert pune',
    'kothrud numerology consultant',
    'baner vastu expert',
    'wakad numerology consultation',
    'pimpri chinchwad vastu shastra',
    'soul urge number calculation',
    'karmic debt number analysis',
    'master number reading',
    'brand name spelling correction',
    'company name vibration analysis',
    'lucky name calculator online',
    'relationship compatibility by birthdate',
    'online numerology pdf report',
    'vastu for main door direction',
    'vastu for main gate colour',
    'vastu for bedroom',
    'vastu for kitchen',
    'vastu for pooja room',
    'vastu for toilet and bathroom',
    'vastu for staircase',
    'vastu for balcony',
    'vastu for study room',
    'vastu for children room',
    'vastu for terrace garden',
    'vastu for overhead water tank',
    'vastu for parking area',
    'vastu for swimming pool',
    'east facing house vastu',
    'west facing house vastu',
    'south facing house vastu',
    'north facing house vastu',
    'vastu for flat in Pune',
    'vastu for duplex home',
    'vastu for irregular shaped plot',
    'vastu dosh remedies without demolition',
    'vastu compliant apartment Pune',
    'vastu for cash locker direction',
    'vastu for office cabin',
    'vastu for shop entrance',
    'vastu for factory layout',
    'vastu for hospital and clinic',
    'vastu for restaurant',
    'vastu for rented house',
    'soul urge number meaning',
    'expression number meaning',
    'personality number numerology',
    'birth number vs destiny number difference',
    'compound number numerology',
    'karmic debt numbers 13 14 16 19',
    'master numbers 11 22 33 meaning',
    'numerology number 1 meaning',
    'numerology number 2 meaning',
    'numerology number 3 meaning',
    'numerology number 4 meaning',
    'numerology number 5 meaning',
    'numerology number 6 meaning',
    'numerology number 7 meaning',
    'numerology number 8 meaning',
    'numerology number 9 meaning',
    'numerology chart reading guide',
    'birthday number numerology',
    'personal month numerology',
    'personal day number today',
    'life path number calculator',
    'what is my life path number',
    'destiny number calculator',
    'name number calculator free',
    'numerology compatibility calculator',
    'numerology chart generator',
    'lucky number calculator by name',
    'mobile number numerology calculator',
    'car number numerology calculator',
    'house number numerology calculator',
    'loshu grid calculator online',
    'angel numbers meaning 111 222 333',
    'angel number 444 meaning',
    'angel number 1111 meaning',
    'numerology for wedding date selection',
    'shubh muhurat numerology',
    'numerology for engagement date',
    'numerology for property purchase',
    'numerology for new business launch date',
    'flat number numerology',
    'office number numerology',
    'numerology for exam success',
    'numerology for baby naming ceremony',
    'numerology for career change',
    'numerology for job interview success',
    'house warming muhurat vastu',
    'numerology for startup business name',
    'signature analysis for success',
    'numerology for financial growth',
    'numerology remedies for obstacles in life',
    'numerology for choosing wedding venue',
    'best numerologist in Pimpri Chinchwad',
    'vastu expert in Kothrud Pune',
    'numerologist in Camp Pune',
    'online numerologist India',
    'numerology consultation Mumbai',
    'vastu consultant Nashik',
    'numerology consultant Maharashtra',
    'home visit vastu consultant Pune',
    'corporate vastu consultant Pune',
    'vastu consultant for NRI clients',
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
    'Loshu Grid Analysis',
    'Name Numerology Correction',
    'Occult Science',
    'Crystal Remedies',
    'Mobile Numerology',
    'Energy Science',
    'Switch Words Remedies',
    'Yantra Numerology',
    'Vastu for Home and Bedroom',
    'Vastu for Office and Factory',
    'Life Path and Destiny Number Calculation',
    'Master Numbers and Karmic Debt Analysis',
    'Shubh Muhurat and Wedding Date Selection',
    'Signature Analysis for Financial Success',
    'Residential and Commercial Vastu Audit',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Consultancy Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Numerology Consultation',
          description: 'Comprehensive Driver-Conductor, Loshu Grid & Name Correction audit.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Vastu Shastra Audit',
          description: 'Non-demolition elemental energy balancing for residential and commercial spaces.',
        },
      },
    ],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Divya Urja',
  url: 'https://divyaurja.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://divyaurja.in/catalogue?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
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
    {
      '@type': 'Question',
      name: 'What is Mobile Numerology and why is it important?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mobile Numerology analyzes the total vibration and number combinations in your mobile phone number. Choosing a lucky mobile number aligned with your birth date attracts career success, business leads, and positive communication energy.',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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

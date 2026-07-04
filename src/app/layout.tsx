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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://divyaurja.com'),
  title: {
    default: 'Divya Urja Numerology & Vastu Consultancy',
    template: '%s | Divya Urja',
  },
  description:
    'Transform your life with ancient wisdom. Expert Numerology, Vastu Shastra, Crystal Therapy, Name Correction, and holistic consultancy services in Pune, India.',
  keywords: [
    'numerology',
    'vastu shastra',
    'vastu consultancy',
    'crystal therapy',
    'name correction',
    'switch words',
    'yantra numerology',
    'vedic numerology',
    'pune',
    'india',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Divya Urja Numerology & Vastu Consultancy',
    title: 'Divya Urja Numerology & Vastu Consultancy',
    description:
      'Transform your life with ancient wisdom. Expert Numerology, Vastu Shastra, and holistic consultancy services.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Divya Urja Numerology & Vastu Consultancy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divya Urja Numerology & Vastu Consultancy',
    description:
      'Transform your life with ancient wisdom. Expert Numerology, Vastu, and holistic consultancy.',
  },
  robots: {
    index: true,
    follow: true,
  },
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

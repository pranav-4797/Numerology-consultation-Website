import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import CookieConsent from '@/components/ui/CookieConsent';
import { LanguageProvider } from '@/context/LanguageContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="min-h-screen pt-14 sm:pt-18 lg:pt-20 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
      <CookieConsent />
    </LanguageProvider>
  );
}

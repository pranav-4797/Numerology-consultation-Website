import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { LanguageProvider } from '@/context/LanguageContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
    </LanguageProvider>
  );
}

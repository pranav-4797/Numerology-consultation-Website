import { getProducts, getSiteSettings } from '@/services/firestore';
import CatalogueClient from './CatalogueClient';
import type { Product } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function CataloguePage() {
  let products: Product[] = [];
  let whatsapp = '919822492488';

  try {
    const [p, settings] = await Promise.all([getProducts(), getSiteSettings()]);
    products = p;
    if (settings.whatsapp) whatsapp = settings.whatsapp;
  } catch (error) {
    console.error('Error server-side fetching catalogue products:', error);
  }

  return <CatalogueClient initialProducts={products} initialWhatsapp={whatsapp} />;
}

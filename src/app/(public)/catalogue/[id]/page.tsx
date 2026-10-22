import type { Metadata } from 'next';
import { getProductById, getProducts, getSiteSettings } from '@/services/firestore';
import ProductDetailClient from './ProductDetailClient';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    const list = (products || []).map((p) => ({ id: p.id }));
    if (!list.some((item) => item.id === 'placeholder')) {
      list.push({ id: 'placeholder' });
    }
    return list;
  } catch (error) {
    console.error('Error generating static params for catalogue products:', error);
    return [{ id: 'placeholder' }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = id && id !== 'placeholder' ? await getProductById(id) : null;
    if (!product) {
      return {
        title: 'Spiritual Product Details | Divya Urja Catalogue',
        description: 'Explore energized Rudraksha, Crystals, Yantras and Gemstone remedies at Divya Urja.',
      };
    }

    const title = `${product.name} | Buy Online | Divya Urja`;
    const description = (product.description || '').slice(0, 160);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.image ? [{ url: product.image }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.image ? [product.image] : [],
      },
    };
  } catch {
    return {
      title: 'Spiritual Product Details | Divya Urja',
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let whatsapp = '919822492488';

  try {
    const [prodData, allProducts, settings] = await Promise.all([
      id && id !== 'placeholder' ? getProductById(id) : Promise.resolve(null),
      getProducts(),
      getSiteSettings(),
    ]);

    product = prodData;
    if (settings?.whatsapp) whatsapp = settings.whatsapp;

    if (allProducts && allProducts.length > 0) {
      // Find similar products in the same category, excluding the current one
      relatedProducts = allProducts
        .filter((p) => p.id !== id && (product ? p.category === product.category : true))
        .slice(0, 4);

      // If not enough in same category, pad with other products
      if (relatedProducts.length < 4) {
        const remaining = allProducts
          .filter((p) => p.id !== id && !relatedProducts.some((r) => r.id === p.id))
          .slice(0, 4 - relatedProducts.length);
        relatedProducts = [...relatedProducts, ...remaining];
      }
    }
  } catch (error) {
    console.error('Error fetching product detail:', error);
  }

  return (
    <ProductDetailClient
      initialProduct={product}
      productId={id}
      initialRelatedProducts={relatedProducts}
      whatsappNumber={whatsapp}
    />
  );
}

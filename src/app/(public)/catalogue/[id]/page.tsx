import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    if (!products || products.length === 0) return [{ id: 'placeholder' }];
    return products.map((p) => ({ id: p.id }));
  } catch (error) {
    console.error('Error generating static params for catalogue products:', error);
    return [{ id: 'placeholder' }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return {
        title: 'Product Not Found | Divya Urja',
      };
    }

    const title = `${product.name} | Buy Online | Divya Urja`;
    const description = product.description.slice(0, 160);

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
      getProductById(id),
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

  if (!product) {
    if (id === 'placeholder') {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold font-playfair mb-2">Product Details</h2>
          <p className="text-gray-500 text-sm mb-4">Please select an item from our sacred catalogue.</p>
          <a
            href="/catalogue"
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            Browse Catalogue
          </a>
        </div>
      );
    }
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      whatsappNumber={whatsapp}
    />
  );
}

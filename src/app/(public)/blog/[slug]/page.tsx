import BlogDetailClient from './BlogDetailClient';

// generateStaticParams is required for output: 'export' mode.
// Blog pages are rendered client-side, so we provide a minimal placeholder.
// All blog detail pages are dynamically fetched via client-side Firestore queries.
export async function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}

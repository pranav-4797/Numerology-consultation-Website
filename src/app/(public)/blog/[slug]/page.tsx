import { getBlogs, getBlogBySlug } from '@/services/firestore';
import BlogDetailClient from './BlogDetailClient';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const blogs = await getBlogs();
    const published = blogs.filter((b) => b.status !== 'draft');
    if (published.length === 0) return [{ slug: 'placeholder' }];
    return published.map((b) => ({ slug: b.slug }));
  } catch (error) {
    console.error('Error generating static params for blog:', error);
    return [{ slug: 'placeholder' }];
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let blog = null;
  if (slug && slug !== 'placeholder') {
    try {
      blog = await getBlogBySlug(slug);
      if (blog && blog.status === 'draft') {
        blog = null;
      }
    } catch (error) {
      console.error(`Error server-fetching blog slug "${slug}":`, error);
    }
  }

  return <BlogDetailClient initialBlog={blog} />;
}

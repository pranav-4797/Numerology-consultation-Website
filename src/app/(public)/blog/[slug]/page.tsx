import { getBlogs, getBlogBySlug } from '@/services/firestore';
import BlogDetailClient from './BlogDetailClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const blogs = await getBlogs();
    const published = (blogs || []).filter((b) => b.status !== 'draft');
    const list = published.map((b) => ({ slug: encodeURIComponent(b.slug) }));
    if (!list.some((item) => item.slug === 'placeholder')) {
      list.push({ slug: 'placeholder' });
    }
    return list;
  } catch (error) {
    console.error('Error generating static params for blog:', error);
    return [{ slug: 'placeholder' }];
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let blog = null;
  const decodedSlug = slug ? decodeURIComponent(slug) : '';
  if (decodedSlug && decodedSlug !== 'placeholder') {
    try {
      blog = await getBlogBySlug(decodedSlug);
      if (blog && blog.status === 'draft') {
        blog = null;
      }
    } catch (error) {
      console.error(`Error server-fetching blog slug "${decodedSlug}":`, error);
    }
  }

  return <BlogDetailClient initialBlog={blog} slug={decodedSlug} />;
}

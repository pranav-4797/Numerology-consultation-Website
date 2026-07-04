import { MetadataRoute } from 'next';
import { getBlogs } from '@/services/firestore';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://divyaurja.com';

  // Base routes
  const routes = [
    '',
    '/about',
    '/services',
    '/workshops',
    '/events',
    '/blog',
    '/gallery',
    '/testimonials',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Blog routes
  try {
    const blogs = await getBlogs();
    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.publishedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
    return routes;
  }
}

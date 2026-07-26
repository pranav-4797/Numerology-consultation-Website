import { MetadataRoute } from 'next';
import { getBlogs } from '@/services/firestore';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://divyaurja.in';

  // Base routes
  const routes = [
    '',
    '/about',
    '/services',
    '/book',
    '/workshops',
    '/events',
    '/blog',
    '/gallery',
    '/testimonials',
    '/catalogue',
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
    const published = blogs.filter((b) => b.status !== 'draft');
    const blogRoutes = published.map((blog) => {
      let lastModifiedDate = new Date();
      if (blog.publishedAt) {
        const parsed = new Date(blog.publishedAt);
        if (!isNaN(parsed.getTime())) {
          lastModifiedDate = parsed;
        }
      }
      return {
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: lastModifiedDate.toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
    return routes;
  }
}

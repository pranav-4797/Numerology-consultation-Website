import { getBlogs } from '@/services/firestore';
import BlogClient from './BlogClient';
import type { Blog } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function BlogPage() {
  let blogs: Blog[] = [];
  try {
    const rawBlogs = await getBlogs();
    blogs = rawBlogs.filter((b) => b.status !== 'draft');
  } catch (error) {
    console.error('Error server-side fetching blogs:', error);
  }

  return <BlogClient initialBlogs={blogs} />;
}

import { getServices, getWorkshops, getEvents, getTestimonials } from '@/services/firestore';
import HomePageClient from './HomePageClient';
import type { Service, Workshop, Event, Testimonial } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function HomePage() {
  let services: Service[] = [];
  let workshops: Workshop[] = [];
  let events: Event[] = [];
  let testimonials: Testimonial[] = [];

  try {
    const [s, w, e, t] = await Promise.all([
      getServices(),
      getWorkshops(),
      getEvents(),
      getTestimonials(),
    ]);
    services = s.slice(0, 6);
    workshops = w.slice(0, 3);
    events = e.slice(0, 3);
    testimonials = t.slice(0, 6);
  } catch (error) {
    console.error('Error server-side fetching homepage data:', error);
  }

  return (
    <HomePageClient
      initialServices={services}
      initialWorkshops={workshops}
      initialEvents={events}
      initialTestimonials={testimonials}
    />
  );
}

import { getServices } from '@/services/firestore';
import ServicesClient from './ServicesClient';
import type { Service } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function ServicesPage() {
  let services: Service[] = [];
  try {
    services = await getServices();
  } catch (error) {
    console.error('Error server-side fetching services:', error);
  }

  return <ServicesClient initialServices={services} />;
}

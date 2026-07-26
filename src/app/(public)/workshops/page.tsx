import { getWorkshops } from '@/services/firestore';
import WorkshopsClient from './WorkshopsClient';
import type { Workshop } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function WorkshopsPage() {
  let workshops: Workshop[] = [];
  try {
    workshops = await getWorkshops();
  } catch (error) {
    console.error('Error server-side fetching workshops:', error);
  }

  return <WorkshopsClient initialWorkshops={workshops} />;
}

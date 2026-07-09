import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Service,
  Workshop,
  Event,
  Blog,
  Testimonial,
  GalleryImage,
  ContactSubmission,
  Appointment,
  WorkshopRegistration,
  SiteSettings,
  LeadStatus,
  Product,
  Certificate,
} from '@/types';

// ─── Generic Helpers ────────────────────────────────────────

async function getCollection<T>(
  collectionName: string,
  orderField: string = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): Promise<T[]> {
  const q = query(collection(db, collectionName), orderBy(orderField, direction));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T;
}

async function createDocument(collectionName: string, data: Record<string, unknown>): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
  });
  return docRef.id;
}

async function updateDocument(collectionName: string, id: string, data: Record<string, unknown>): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// ─── Services ───────────────────────────────────────────────

export const getServices = () => getCollection<Service>('services');
export const getFeaturedServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'), where('featured', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
};
export const getServiceById = (id: string) => getDocById<Service>('services', id);
export const createService = (data: Record<string, unknown>) => createDocument('services', data);
export const updateService = (id: string, data: Record<string, unknown>) => updateDocument('services', id, data);
export const deleteService = (id: string) => deleteDocument('services', id);

// ─── Workshops ──────────────────────────────────────────────

export const getWorkshops = () => getCollection<Workshop>('workshops');
export const getUpcomingWorkshops = async (): Promise<Workshop[]> => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'workshops'),
    where('date', '>=', today),
    orderBy('date', 'asc'),
    limit(6)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Workshop));
};
export const getWorkshopById = (id: string) => getDocById<Workshop>('workshops', id);
export const createWorkshop = (data: Record<string, unknown>) => createDocument('workshops', data);
export const updateWorkshop = (id: string, data: Record<string, unknown>) => updateDocument('workshops', id, data);
export const deleteWorkshop = (id: string) => deleteDocument('workshops', id);

// ─── Events ─────────────────────────────────────────────────

export const getEvents = () => getCollection<Event>('events');
export const getUpcomingEvents = async (): Promise<Event[]> => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'events'),
    where('date', '>=', today),
    orderBy('date', 'asc'),
    limit(6)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
};
export const getEventById = (id: string) => getDocById<Event>('events', id);
export const createEvent = (data: Record<string, unknown>) => createDocument('events', data);
export const updateEvent = (id: string, data: Record<string, unknown>) => updateDocument('events', id, data);
export const deleteEvent = (id: string) => deleteDocument('events', id);

// ─── Blogs ──────────────────────────────────────────────────

export const getBlogs = () => getCollection<Blog>('blogs', 'publishedAt');
export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Blog;
};
export const getBlogById = (id: string) => getDocById<Blog>('blogs', id);
export const createBlog = (data: Record<string, unknown>) => createDocument('blogs', data);
export const updateBlog = (id: string, data: Record<string, unknown>) => updateDocument('blogs', id, data);
export const deleteBlog = (id: string) => deleteDocument('blogs', id);

// ─── Testimonials ───────────────────────────────────────────

export const getTestimonials = () => getCollection<Testimonial>('testimonials');
export const getTestimonialById = (id: string) => getDocById<Testimonial>('testimonials', id);
export const createTestimonial = (data: Record<string, unknown>) => createDocument('testimonials', data);
export const updateTestimonial = (id: string, data: Record<string, unknown>) =>
  updateDocument('testimonials', id, data);
export const deleteTestimonial = (id: string) => deleteDocument('testimonials', id);

// ─── Gallery ────────────────────────────────────────────────

export const getGalleryImages = () => getCollection<GalleryImage>('gallery');
export const createGalleryImage = (data: Record<string, unknown>) => createDocument('gallery', data);
export const deleteGalleryImage = (id: string) => deleteDocument('gallery', id);

// ─── Contacts / Leads ──────────────────────────────────────

export const getContacts = () => getCollection<ContactSubmission>('contacts');
export const createContact = (data: Record<string, unknown>) => createDocument('contacts', data);
export const deleteLead = (id: string) => deleteDocument('contacts', id);
export const markLeadAsContacted = (id: string, contacted: boolean) => updateDocument('contacts', id, { contacted });
export const updateLead = (id: string, data: Record<string, unknown>) => updateDocument('contacts', id, data);
export const updateLeadStatus = (id: string, status: LeadStatus) =>
  updateDocument('contacts', id, { status, contacted: status !== 'new' });
export const updateLeadNotes = (id: string, notes: string) => updateDocument('contacts', id, { notes });
export const updateLeadFollowUp = (id: string, followUpDate: string) =>
  updateDocument('contacts', id, { followUpDate });

// ─── Appointments ───────────────────────────────────────────

export const getAppointments = () => getCollection<Appointment>('appointments');
export const createAppointment = (data: Record<string, unknown>) => createDocument('appointments', data);
export const updateAppointment = (id: string, data: Record<string, unknown>) =>
  updateDocument('appointments', id, data);
export const deleteAppointment = (id: string) => deleteDocument('appointments', id);

// ─── Workshop Registrations ─────────────────────────────────

export const getRegistrations = () => getCollection<WorkshopRegistration>('registrations');
export const updateRegistration = (id: string, data: Record<string, unknown>) =>
  updateDocument('registrations', id, data);
export const deleteRegistration = (id: string) => deleteDocument('registrations', id);

/**
 * Registers a participant for a workshop and decrements the seat count
 * atomically. Throws 'SEATS_FULL' if no seats remain.
 */
export async function registerForWorkshop(
  workshopId: string,
  data: { name: string; phone: string; email: string }
): Promise<void> {
  const workshopRef = doc(db, 'workshops', workshopId);
  const registrationRef = doc(collection(db, 'registrations'));

  await runTransaction(db, async (transaction) => {
    const workshopSnap = await transaction.get(workshopRef);
    if (!workshopSnap.exists()) throw new Error('WORKSHOP_NOT_FOUND');

    const workshop = workshopSnap.data() as Workshop;
    if (!workshop.availableSeats || workshop.availableSeats <= 0) {
      throw new Error('SEATS_FULL');
    }

    transaction.update(workshopRef, { availableSeats: workshop.availableSeats - 1 });
    transaction.set(registrationRef, {
      workshopId,
      workshopTitle: workshop.title,
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: 'registered',
      paid: false,
      createdAt: Timestamp.now().toDate().toISOString(),
    });
  });
}

// ─── Products (Catalogue) ───────────────────────────────────

export const getProducts = () => getCollection<Product>('products');
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const q = query(collection(db, 'products'), where('category', '==', category), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};
export const getProductById = (id: string) => getDocById<Product>('products', id);
export const createProduct = (data: Record<string, unknown>) => createDocument('products', data);
export const updateProduct = (id: string, data: Record<string, unknown>) => updateDocument('products', id, data);
export const deleteProduct = (id: string) => deleteDocument('products', id);

// ─── Certificates ───────────────────────────────────────────

export const getCertificates = () => getCollection<Certificate>('certificates');
export const getCertificateById = (id: string) => getDocById<Certificate>('certificates', id);
export const createCertificate = (data: Record<string, unknown>) => createDocument('certificates', data);
export const updateCertificate = (id: string, data: Record<string, unknown>) => updateDocument('certificates', id, data);
export const deleteCertificate = (id: string) => deleteDocument('certificates', id);

// ─── Dashboard Stats ────────────────────────────────────────

export async function getDashboardStats() {
  const [blogs, events, workshops, contacts, products] = await Promise.all([
    getDocs(collection(db, 'blogs')),
    getDocs(collection(db, 'events')),
    getDocs(collection(db, 'workshops')),
    getDocs(collection(db, 'contacts')),
    getDocs(collection(db, 'products')),
  ]);
  return {
    totalPosts: blogs.size,
    totalEvents: events.size,
    totalWorkshops: workshops.size,
    totalLeads: contacts.size,
    totalProducts: products.size,
  };
}

// ─── Site Settings (Section Visibility) ─────────────────────

export interface SectionVisibility {
  services: boolean;
  workshops: boolean;
  events: boolean;
  blog: boolean;
  gallery: boolean;
  testimonials: boolean;
  catalogue: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  services: true,
  workshops: true,
  events: true,
  blog: true,
  gallery: true,
  testimonials: true,
  catalogue: true,
};

export async function getSectionVisibility(): Promise<SectionVisibility> {
  const docRef = doc(db, 'siteSettings', 'visibility');
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return DEFAULT_VISIBILITY;
  return { ...DEFAULT_VISIBILITY, ...snapshot.data() } as SectionVisibility;
}

export async function updateSectionVisibility(data: Partial<SectionVisibility>): Promise<void> {
  const docRef = doc(db, 'siteSettings', 'visibility');
  await setDoc(docRef, data, { merge: true });
}

// ─── Site Settings (General: contact, social, hero) ─────────

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone: '+91 98224 92488',
  whatsapp: '919822492488',
  email: 'info@divyaurja.com',
  address: 'Pune, Maharashtra, India',
  workingHours: 'Mon - Sat: 10AM - 7PM',
  facebook: '',
  instagram: '',
  youtube: 'https://www.youtube.com/@divyaurja',
  heroTitle: 'Unlock Your Destiny Through Numbers',
  heroSubtitle:
    'Discover the hidden power of Numerology, Vastu Shastra, and ancient energy sciences. Transform your life, career, and relationships with personalized expert guidance.',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const docRef = doc(db, 'siteSettings', 'general');
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return DEFAULT_SITE_SETTINGS;
  return { ...DEFAULT_SITE_SETTINGS, ...snapshot.data() } as SiteSettings;
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'siteSettings', 'general');
  await setDoc(docRef, data, { merge: true });
}

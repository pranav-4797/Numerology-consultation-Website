export interface Service {
  id: string;
  title: string;
  image: string;
  description: string;
  benefits: string[];
  featured: boolean;
  fees?: string;
  createdAt: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  fees: string;
  availableSeats: number;
  image: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  poster: string;
  createdAt: string;
}

export type BlogStatus = 'draft' | 'published';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status?: BlogStatus; // older posts without this field are treated as published
  publishedAt: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  review: string;
  rating: number;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  createdAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  service: string;
  contacted: boolean;
  status?: LeadStatus; // older leads without this field fall back to contacted flag
  notes?: string;
  followUpDate?: string;
  createdAt: string;
}

export type Lead = ContactSubmission;

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  serviceTitle: string;
  fees: string;
  date: string;
  timeSlot: string;
  message: string;
  status: AppointmentStatus;
  paid: boolean;
  createdAt: string;
}

export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled';

export interface WorkshopRegistration {
  id: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  phone: string;
  email: string;
  status: RegistrationStatus;
  paid: boolean;
  createdAt: string;
}

export interface SiteSettings {
  phone: string;
  whatsapp: string; // digits with country code, e.g. 919822492488
  email: string;
  address: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  youtube: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalEvents: number;
  totalWorkshops: number;
  totalLeads: number;
}

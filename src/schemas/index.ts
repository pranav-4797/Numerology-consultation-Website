import { z } from 'zod';

export const serviceSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  benefits: z.string().min(5, 'Enter at least one benefit'),
  featured: z.boolean(),
  fees: z.string().optional(),
});

export const workshopSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(2, 'Venue is required'),
  fees: z.string().min(1, 'Fees is required'),
  availableSeats: z.number().min(1, 'At least 1 seat required'),
});

export const eventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(2, 'Location is required'),
});

export const blogSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
});

export const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  review: z.string().min(10, 'Review must be at least 10 characters'),
  rating: z.number().min(1).max(5, 'Rating must be 1-5'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  serviceId: z.string().min(1, 'Please select a service'),
  birthdate: z.string().min(1, 'Please select your birthdate'),
  message: z.string().optional(),
});

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
});

export const siteSettingsSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
  whatsapp: z
    .string()
    .min(10, 'Enter WhatsApp number with country code, digits only')
    .regex(/^\d+$/, 'Digits only, e.g. 919822492488'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(3, 'Address is required'),
  workingHours: z.string().min(3, 'Working hours are required'),
  facebook: z.string().url('Enter a valid URL').or(z.literal('')),
  instagram: z.string().url('Enter a valid URL').or(z.literal('')),
  youtube: z.string().url('Enter a valid URL').or(z.literal('')),
  heroTitle: z.string().min(5, 'Hero title is required'),
  heroSubtitle: z.string().min(5, 'Hero subtitle is required'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be at least ₹1'),
  category: z.enum(['bracelets', 'crystals', 'yantras', 'rudraksha', 'pendants', 'other'], {
    message: 'Please select a category',
  }),
  inStock: z.boolean(),
  featured: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
export type WorkshopFormData = z.infer<typeof workshopSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type BlogFormData = z.infer<typeof blogSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ProductFormData = z.infer<typeof productSchema>;

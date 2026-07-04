'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { contactSchema, type ContactFormData } from '@/schemas';
import { createContact } from '@/services/firestore';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      await createContact({ ...data, service: 'General Inquiry', contacted: false, status: 'new' });
      toast.success(t('contact.success'));
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(t('contact.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.fullName')}
        </label>
        <input
          id="contact-name"
          type="text"
          {...register('name')}
          placeholder={t('contact.fullNamePlaceholder')}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-text mb-1.5">
            {t('contact.phone')}
          </label>
          <input
            id="contact-phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-text mb-1.5">
            {t('contact.email')}
          </label>
          <input
            id="contact-email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.message')}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          {...register('message')}
          placeholder={t('contact.messagePlaceholder')}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
        {errors.message && (
          <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('contact.sending')}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('contact.send')}
          </>
        )}
      </button>
    </form>
  );
}

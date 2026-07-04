'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save, Phone, Share2, Home } from 'lucide-react';
import { siteSettingsSchema, type SiteSettingsFormData } from '@/schemas';
import { getSiteSettings, updateSiteSettings } from '@/services/firestore';
import { invalidateSiteSettingsCache } from '@/hooks/useSiteSettings';
import Loader from '@/components/ui/Loader';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

  useEffect(() => {
    getSiteSettings()
      .then((settings) => reset(settings))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SiteSettingsFormData) => {
    setSaving(true);
    try {
      await updateSiteSettings(data);
      invalidateSiteSettingsCache();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-2xl font-bold text-text">Site Settings</h1>
        <p className="text-sm text-text/50">
          Update contact details, social links, and homepage hero text — changes reflect on the
          public website without touching code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="font-playfair text-lg font-bold text-text">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
              <input {...register('phone')} placeholder="+91 98224 92488" className={inputClass} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                WhatsApp Number <span className="text-text/40">(digits only, with country code)</span>
              </label>
              <input {...register('whatsapp')} placeholder="919822492488" className={inputClass} />
              {errors.whatsapp && (
                <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input {...register('email')} placeholder="info@divyaurja.com" className={inputClass} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Working Hours</label>
              <input {...register('workingHours')} placeholder="Mon - Sat: 10AM - 7PM" className={inputClass} />
              {errors.workingHours && (
                <p className="text-xs text-red-500 mt-1">{errors.workingHours.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Address</label>
              <input {...register('address')} placeholder="Pune, Maharashtra, India" className={inputClass} />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="font-playfair text-lg font-bold text-text">Social Links</h2>
          </div>
          <p className="text-xs text-text/40 mb-4">Leave a field empty to hide that icon on the website.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Facebook URL</label>
              <input {...register('facebook')} placeholder="https://facebook.com/..." className={inputClass} />
              {errors.facebook && (
                <p className="text-xs text-red-500 mt-1">{errors.facebook.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Instagram URL</label>
              <input {...register('instagram')} placeholder="https://instagram.com/..." className={inputClass} />
              {errors.instagram && (
                <p className="text-xs text-red-500 mt-1">{errors.instagram.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">YouTube URL</label>
              <input {...register('youtube')} placeholder="https://www.youtube.com/@divyaurja" className={inputClass} />
              {errors.youtube && (
                <p className="text-xs text-red-500 mt-1">{errors.youtube.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Homepage Hero */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <Home className="w-5 h-5 text-primary" />
            <h2 className="font-playfair text-lg font-bold text-text">Homepage Hero</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Hero Title</label>
              <input {...register('heroTitle')} className={inputClass} />
              {errors.heroTitle && (
                <p className="text-xs text-red-500 mt-1">{errors.heroTitle.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Hero Subtitle</label>
              <textarea rows={3} {...register('heroSubtitle')} className={`${inputClass} resize-none`} />
              {errors.heroSubtitle && (
                <p className="text-xs text-red-500 mt-1">{errors.heroSubtitle.message}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

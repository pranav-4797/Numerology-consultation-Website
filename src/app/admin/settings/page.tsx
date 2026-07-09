'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save, Phone, Share2, Home, Award, Plus, Trash2, Edit, X, Eye, Upload } from 'lucide-react';
import { siteSettingsSchema, certificateSchema, type SiteSettingsFormData, type CertificateFormData } from '@/schemas';
import { getSiteSettings, updateSiteSettings, getCertificates, createCertificate, updateCertificate, deleteCertificate } from '@/services/firestore';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { invalidateSiteSettingsCache } from '@/hooks/useSiteSettings';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Certificate } from '@/types';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'certificates'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Certificates State
  const { data: certificates, loading: loadingCerts } = useFirestoreCollection<Certificate>('certificates');
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certImageFile, setCertImageFile] = useState<File | null>(null);
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [deleteCertModal, setDeleteCertModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deletingCert, setDeletingCert] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

  const certForm = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
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

  const openCreateCert = () => {
    certForm.reset({ title: '', caption: '', regNo: 'N/A', date: '', instructor: '' });
    setEditingCertId(null);
    setCertImageFile(null);
    setShowCertForm(true);
  };

  const openEditCert = (cert: Certificate) => {
    certForm.setValue('title', cert.title);
    certForm.setValue('caption', cert.caption);
    certForm.setValue('regNo', cert.regNo);
    certForm.setValue('date', cert.date);
    certForm.setValue('instructor', cert.instructor);
    setEditingCertId(cert.id);
    setCertImageFile(null);
    setShowCertForm(true);
  };

  const onCertSubmit = async (data: CertificateFormData) => {
    setCertSubmitting(true);
    try {
      let image = '';
      if (certImageFile) {
        image = await compressAndConvertToBase64(certImageFile);
      }

      const payload: Record<string, unknown> = { ...data };
      if (image) payload.image = image;
      else if (!editingCertId) payload.image = '';

      if (editingCertId) {
        await updateCertificate(editingCertId, payload);
        toast.success('Certificate updated successfully');
      } else {
        if (!image) {
          toast.error('Certificate image is required');
          setCertSubmitting(false);
          return;
        }
        await createCertificate(payload);
        toast.success('Certificate added successfully');
      }
      setShowCertForm(false);
      certForm.reset();
      setCertImageFile(null);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setCertSubmitting(false);
    }
  };

  const handleCertDelete = async () => {
    setDeletingCert(true);
    try {
      await deleteCertificate(deleteCertModal.id);
      toast.success('Certificate deleted successfully');
    } catch {
      toast.error('Failed to delete certificate');
    } finally {
      setDeletingCert(false);
      setDeleteCertModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Site Settings</h1>
          <p className="text-sm text-text/50">
            Update settings, contact details, social links, and manage certifications.
          </p>
        </div>
        {activeTab === 'certificates' && (
          <button
            onClick={openCreateCert}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 self-start"
          >
            <Plus className="w-4 h-4" /> Add Certificate
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-text/40 hover:text-text/60'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'border-primary text-primary'
              : 'border-transparent text-text/40 hover:text-text/60'
          }`}
        >
          Certificates & Awards
        </button>
      </div>

      {activeTab === 'general' ? (
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
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/10"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      ) : (
        /* Certificates Tab */
        <div className="space-y-6">
          {loadingCerts ? (
            <Loader />
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <Award className="w-12 h-12 text-primary/30 mb-4" />
              <h3 className="font-playfair text-lg font-bold text-text mb-2">No Certificates Added</h3>
              <p className="text-sm text-text/50 max-w-sm mb-6">
                Upload your credentials, ISO certifications, or academic awards to show them on the public About page.
              </p>
              <button
                onClick={openCreateCert}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
              >
                Add First Certificate
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start"
                >
                  <div className="w-24 h-18 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                    <img src={cert.image} alt={cert.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full mb-1">
                      {cert.regNo !== 'N/A' ? 'Certificate' : 'Trophy Award'}
                    </span>
                    <h3 className="font-playfair text-sm font-bold text-text truncate">{cert.title}</h3>
                    <p className="text-xs text-text/50 truncate italic mb-2">"{cert.caption}"</p>
                    <p className="text-[10px] text-text/40 font-medium">
                      Date: {cert.date} | Reg: {cert.regNo}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditCert(cert)}
                      className="p-2 hover:bg-gray-50 text-text/60 hover:text-primary rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCertModal({ open: true, id: cert.id })}
                      className="p-2 hover:bg-gray-50 text-text/60 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {showCertForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowCertForm(false)}
                  className="absolute top-6 right-6 p-2 text-text/40 hover:text-text/60 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  <h2 className="font-playfair text-xl font-bold text-text">
                    {editingCertId ? 'Edit Certificate' : 'Add Certificate'}
                  </h2>
                </div>

                <form onSubmit={certForm.handleSubmit(onCertSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Certificate Title</label>
                    <input
                      {...certForm.register('title')}
                      placeholder="e.g. Advanced Professional Course in Vastu Energy Science"
                      className={inputClass}
                    />
                    {certForm.formState.errors.title && (
                      <p className="text-xs text-red-500 mt-1">{certForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Short Caption</label>
                    <input
                      {...certForm.register('caption')}
                      placeholder="e.g. Expertise in balancing spatial energy systems."
                      className={inputClass}
                    />
                    {certForm.formState.errors.caption && (
                      <p className="text-xs text-red-500 mt-1">{certForm.formState.errors.caption.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Date of Issuance</label>
                      <input
                        {...certForm.register('date')}
                        placeholder="e.g. May 15, 2025 or April 2026"
                        className={inputClass}
                      />
                      {certForm.formState.errors.date && (
                        <p className="text-xs text-red-500 mt-1">{certForm.formState.errors.date.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Registration Number</label>
                      <input
                        {...certForm.register('regNo')}
                        placeholder="e.g. B-24-107 or N/A"
                        className={inputClass}
                      />
                      {certForm.formState.errors.regNo && (
                        <p className="text-xs text-red-500 mt-1">{certForm.formState.errors.regNo.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Issued By / Instructor</label>
                    <input
                      {...certForm.register('instructor')}
                      placeholder="e.g. Dr. Rohit Gadkari (PHD Gold Medalist)"
                      className={inputClass}
                    />
                    {certForm.formState.errors.instructor && (
                      <p className="text-xs text-red-500 mt-1">{certForm.formState.errors.instructor.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Certificate Image</label>
                    <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 transition-colors relative bg-gray-50/50">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-10 w-10 text-text/30" />
                        <div className="flex text-sm text-text/60">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-semibold text-primary hover:text-primary/95 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setCertImageFile(file);
                              }}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-[10px] text-text/30">PNG, JPG, JPEG up to 1MB (auto-compressed)</p>
                        {certImageFile && (
                          <p className="text-xs font-semibold text-green-600 mt-2 flex items-center justify-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Selected: {certImageFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCertForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-text/70 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={certSubmitting}
                      className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/10"
                    >
                      {certSubmitting ? 'Saving...' : editingCertId ? 'Save Changes' : 'Add Certificate'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirm Modal */}
          <DeleteConfirmModal
            isOpen={deleteCertModal.open}
            onClose={() => setDeleteCertModal({ open: false, id: '' })}
            onConfirm={handleCertDelete}
            title="Delete Certificate"
            message="Are you sure you want to delete this certificate? This action cannot be undone."
            loading={deletingCert}
          />
        </div>
      )}
    </div>
  );
}

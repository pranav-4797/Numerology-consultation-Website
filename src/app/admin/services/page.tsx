'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { serviceSchema, type ServiceFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createService, updateService, deleteService } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Service } from '@/types';

export default function AdminServicesPage() {
  const { data: services, loading } = useFirestoreCollection<Service>('services');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const openCreate = () => {
    reset({ title: '', description: '', benefits: '', featured: false, fees: '' });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setValue('title', service.title);
    setValue('description', service.description);
    setValue('benefits', service.benefits.join(', '));
    setValue('featured', service.featured);
    setValue('fees', service.fees ?? '');
    setEditingId(service.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await compressAndConvertToBase64(imageFile);
      }

      const benefitsArray = data.benefits.split(',').map((b) => b.trim()).filter(Boolean);
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        benefits: benefitsArray,
        featured: data.featured,
        fees: data.fees ?? '',
      };
      if (imageUrl) payload.image = imageUrl;

      if (editingId) {
        await updateService(editingId, payload);
        toast.success('Service updated successfully');
      } else {
        if (!imageUrl) payload.image = '';
        await createService(payload);
        toast.success('Service created successfully');
      }
      setShowForm(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteService(deleteModal.id);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Services</h1>
          <p className="text-sm text-text/50">{services.length} services</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Create'} Service</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Title</label>
                <input {...register('title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea rows={4} {...register('description')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Benefits (comma separated)</label>
                <input {...register('benefits')} placeholder="Benefit 1, Benefit 2, ..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.benefits && <p className="text-xs text-red-500 mt-1">{errors.benefits.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Consultation Fees (₹) <span className="text-text/40">— optional, shown on booking page</span>
                </label>
                <input {...register('fees')} placeholder="e.g. 2100" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('featured')} id="featured" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="featured" className="text-sm text-text">Featured Service</label>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {services.length === 0 ? (
        <EmptyState title="No Services" description="Create your first service to get started." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Featured</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text">{s.title}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {s.featured ? (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">Yes</span>
                      ) : (
                        <span className="text-xs text-text/30">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors"><Edit className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: s.id })} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Service" />
    </div>
  );
}

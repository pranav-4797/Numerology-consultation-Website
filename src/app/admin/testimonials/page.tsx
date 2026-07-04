'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';
import { testimonialSchema, type TestimonialFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Testimonial } from '@/types';

export default function AdminTestimonialsPage() {
  const { data: testimonials, loading } = useFirestoreCollection<Testimonial>('testimonials');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
  });

  const openCreate = () => {
    reset({ name: '', review: '', rating: 5 });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setValue('name', t.name);
    setValue('review', t.review);
    setValue('rating', t.rating);
    setEditingId(t.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setSubmitting(true);
    try {
      let photo = '';
      if (imageFile) {
        photo = await compressAndConvertToBase64(imageFile);
      }

      const payload: Record<string, unknown> = { ...data };
      if (photo) payload.photo = photo;
      else if (!editingId) payload.photo = '';

      if (editingId) {
        await updateTestimonial(editingId, payload);
        toast.success('Testimonial updated');
      } else {
        await createTestimonial(payload);
        toast.success('Testimonial added');
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
      await deleteTestimonial(deleteModal.id);
      toast.success('Testimonial deleted');
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
          <h1 className="font-playfair text-2xl font-bold text-text">Testimonials</h1>
          <p className="text-sm text-text/50">{testimonials.length} testimonials</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Add'} Testimonial</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Client Name</label>
                <input {...register('name')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Review</label>
                <textarea rows={4} {...register('review')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                {errors.review && <p className="text-xs text-red-500 mt-1">{errors.review.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} {...register('rating', { valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Saving...' : editingId ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}

      {testimonials.length === 0 ? (
        <EmptyState title="No Testimonials" description="Add client testimonials." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Rating</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Review</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text">{t.name}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex gap-0.5">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary" />)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text/50 max-w-xs truncate hidden md:table-cell">{t.review}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(t)} className="p-2 hover:bg-primary/10 rounded-lg"><Edit className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: t.id })} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Testimonial" />
    </div>
  );
}

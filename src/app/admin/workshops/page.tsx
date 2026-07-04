'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { workshopSchema, type WorkshopFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createWorkshop, updateWorkshop, deleteWorkshop } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import { formatDate } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Workshop } from '@/types';

export default function AdminWorkshopsPage() {
  const { data: workshops, loading } = useFirestoreCollection<Workshop>('workshops');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WorkshopFormData>({
    resolver: zodResolver(workshopSchema),
  });

  const openCreate = () => {
    reset({ title: '', description: '', date: '', time: '', venue: '', fees: '', availableSeats: 0 });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (workshop: Workshop) => {
    setValue('title', workshop.title);
    setValue('description', workshop.description);
    setValue('date', workshop.date);
    setValue('time', workshop.time);
    setValue('venue', workshop.venue);
    setValue('fees', workshop.fees);
    setValue('availableSeats', workshop.availableSeats);
    setEditingId(workshop.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (data: WorkshopFormData) => {
    setSubmitting(true);
    try {
      let image = '';
      if (imageFile) {
        image = await compressAndConvertToBase64(imageFile);
      }

      const payload: Record<string, unknown> = { ...data };
      if (image) payload.image = image;
      else if (!editingId) payload.image = '';

      if (editingId) {
        await updateWorkshop(editingId, payload);
        toast.success('Workshop updated');
      } else {
        await createWorkshop(payload);
        toast.success('Workshop created');
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
      await deleteWorkshop(deleteModal.id);
      toast.success('Workshop deleted');
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
          <h1 className="font-playfair text-2xl font-bold text-text">Workshops</h1>
          <p className="text-sm text-text/50">{workshops.length} workshops</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Workshop
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Create'} Workshop</h2>
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
                <textarea rows={3} {...register('description')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Date</label>
                  <input type="date" {...register('date')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Time</label>
                  <input type="time" {...register('time')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Venue</label>
                <input {...register('venue')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Fees (₹)</label>
                  <input {...register('fees')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.fees && <p className="text-xs text-red-500 mt-1">{errors.fees.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Seats</label>
                  <input type="number" {...register('availableSeats', { valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.availableSeats && <p className="text-xs text-red-500 mt-1">{errors.availableSeats.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Saving...' : editingId ? 'Update Workshop' : 'Create Workshop'}
              </button>
            </form>
          </div>
        </div>
      )}

      {workshops.length === 0 ? (
        <EmptyState title="No Workshops" description="Create your first workshop." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Seats</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {workshops.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text">{w.title}</td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden sm:table-cell">{formatDate(w.date)}</td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden md:table-cell">{w.availableSeats}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(w)} className="p-2 hover:bg-primary/10 rounded-lg"><Edit className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: w.id })} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Workshop" />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { eventSchema, type EventFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createEvent, updateEvent, deleteEvent } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import { formatDate } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Event } from '@/types';

export default function AdminEventsPage() {
  const { data: events, loading } = useFirestoreCollection<Event>('events');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const openCreate = () => {
    reset({ title: '', description: '', date: '', time: '', location: '' });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (event: Event) => {
    setValue('title', event.title);
    setValue('description', event.description);
    setValue('date', event.date);
    setValue('time', event.time);
    setValue('location', event.location);
    setEditingId(event.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    try {
      let poster = '';
      if (imageFile) {
        poster = await compressAndConvertToBase64(imageFile);
      }

      const payload: Record<string, unknown> = { ...data };
      if (poster) payload.poster = poster;
      else if (!editingId) payload.poster = '';

      if (editingId) {
        await updateEvent(editingId, payload);
        toast.success('Event updated');
      } else {
        await createEvent(payload);
        toast.success('Event created');
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
      await deleteEvent(deleteModal.id);
      toast.success('Event deleted');
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
          <h1 className="font-playfair text-2xl font-bold text-text">Events</h1>
          <p className="text-sm text-text/50">{events.length} events</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Create'} Event</h2>
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
                <label className="block text-sm font-medium text-text mb-1">Location</label>
                <input {...register('location')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Event Poster</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState title="No Events" description="Create your first event." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-text">{e.title}</td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden sm:table-cell">{formatDate(e.date)}</td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden md:table-cell">{e.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(e)} className="p-2 hover:bg-primary/10 rounded-lg"><Edit className="w-4 h-4 text-primary" /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: e.id })} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Event" />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Trash2, Phone, MessageCircle, Calendar, Clock, IndianRupee, Mail, Sparkles, Search, Edit, X,
} from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { updateAppointment, deleteAppointment } from '@/services/firestore';
import { formatDate, formatTime, getWhatsAppUrl } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  getChaldeanNameDetails,
  getPythagoreanNameDetails,
  getPersonalityNumber,
  getDestinyNumber,
  getZodiacSign,
} from '@/utils/numerology';

const STATUS_META: Record<AppointmentStatus, { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', badge: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', badge: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-gray-200 text-gray-600' },
};

const STATUS_ORDER: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

export default function AdminAppointmentsPage() {
  const { data: appointments, loading } = useFirestoreCollection<Appointment>('appointments', 'createdAt');
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);
  const [spellingQuery, setSpellingQuery] = useState('');
  
  // Search & Edit States
  const [searchQuery, setSearchQuery] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean; item: Appointment | null }>({ open: false, item: null });
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', birthdate: '' });
  const [editingItem, setEditingItem] = useState(false);

  const filtered = (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter))
    .filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.serviceTitle?.toLowerCase().includes(q)
      );
    });

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: appointments.filter((a) => a.status === s).length }),
    {} as Record<AppointmentStatus, number>
  );

  const handleOpenEdit = (item: Appointment) => {
    setEditModal({ open: true, item });
    setEditForm({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      birthdate: item.birthdate || '',
    });
  };

  const handleEditSubmit = async () => {
    if (!editModal.item) return;
    setEditingItem(true);
    try {
      const updates: Record<string, any> = {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
      };

      if (editForm.birthdate) {
        updates.birthdate = editForm.birthdate;
        updates.personalityNumber = getPersonalityNumber(editForm.birthdate);
        updates.destinyNumber = getDestinyNumber(editForm.birthdate);
        updates.zodiacSign = getZodiacSign(editForm.birthdate);
      }

      await updateAppointment(editModal.item.id, updates);
      toast.success('Consultation updated successfully');
      setEditModal({ open: false, item: null });
    } catch {
      toast.error('Failed to update consultation');
    } finally {
      setEditingItem(false);
    }
  };

  const handleStatusChange = async (appointment: Appointment, status: AppointmentStatus) => {
    try {
      await updateAppointment(appointment.id, { status });
      toast.success(`Status: ${STATUS_META[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePaidToggle = async (appointment: Appointment) => {
    try {
      await updateAppointment(appointment.id, { paid: !appointment.paid });
      toast.success(appointment.paid ? 'Marked as unpaid' : 'Marked as paid');
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAppointment(deleteModal.id);
      toast.success('Appointment deleted');
    } catch {
      toast.error('Failed to delete appointment');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold text-text">Appointments</h1>
        <p className="text-sm text-text/50">
          Consultation bookings from the website. Confirm the slot, then mark paid once payment is settled offline.
        </p>
      </div>

      {/* Spelling Correction Tool */}
      <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-white rounded-2xl p-6 border border-primary/10 shadow-sm mb-8">
        <h2 className="font-playfair text-lg font-bold text-text mb-1 flex items-center gap-1.5">
          <span>🔮 Name Spelling &amp; Numerology Calculator</span>
        </h2>
        <p className="text-xs text-text/60 mb-4">
          Type any name below to instantly see its Chaldean and Pythagorean letter breakdowns, total sum, and reduced destiny vibration. Perfect for spelling corrections!
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <input
            type="text"
            placeholder="Type name here (e.g. PRANAV)"
            value={spellingQuery}
            onChange={(e) => setSpellingQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
          />
          {spellingQuery && (
            <div className="flex-1 w-full space-y-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100">
              {/* Chaldean Breakdown */}
              <div className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-primary">Chaldean System</span>
                  <span className="text-[11px] font-bold text-text/70 bg-primary/10 px-2 py-0.5 rounded-full">
                    Sum: {getChaldeanNameDetails(spellingQuery).sum} &rarr; Reduced: {getChaldeanNameDetails(spellingQuery).reduced}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 font-mono">
                  {getChaldeanNameDetails(spellingQuery).letters.map((l, idx) => (
                    <span key={idx} className="bg-white border border-gray-200/60 px-2 py-1 rounded shadow-xs flex flex-col items-center">
                      <span className="font-bold text-text text-sm">{l.char}</span>
                      <span className="text-[9px] text-text/40 font-semibold">{l.val}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pythagorean Breakdown */}
              <div className="text-xs border-t border-gray-100/80 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-secondary">Pythagorean System</span>
                  <span className="text-[11px] font-bold text-text/70 bg-secondary/10 px-2 py-0.5 rounded-full">
                    Sum: {getPythagoreanNameDetails(spellingQuery).sum} &rarr; Reduced: {getPythagoreanNameDetails(spellingQuery).reduced}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 font-mono">
                  {getPythagoreanNameDetails(spellingQuery).letters.map((l, idx) => (
                    <span key={idx} className="bg-white border border-gray-200/60 px-2 py-1 rounded shadow-xs flex flex-col items-center">
                      <span className="font-bold text-text text-sm">{l.char}</span>
                      <span className="text-[9px] text-text/40 font-semibold">{l.val}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text/60 hover:border-primary/40'
          }`}
        >
          All ({appointments.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text/60 hover:border-primary/40'
            }`}
          >
            {STATUS_META[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search Panel */}
      <div className="mb-8 w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by client name, email, phone, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text/30 text-text font-medium"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Appointments"
          description="When visitors book a consultation on the website, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-playfair text-lg font-bold text-text truncate">{appointment.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">
                    {appointment.serviceTitle || 'Consultation'}
                  </span>
                </div>
                <select
                  value={appointment.status}
                  onChange={(e) => handleStatusChange(appointment, e.target.value as AppointmentStatus)}
                  className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                  ))}
                </select>
              </div>

              {/* Slot / Numerology Profile */}
              {appointment.birthdate ? (
                <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-text">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> 
                    <span>Birthdate: {formatDate(appointment.birthdate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-white p-1.5 rounded border border-gray-200/60 text-center">
                      <span className="block text-[10px] text-text/40 font-medium">Personality No.</span>
                      <span className="text-xs font-bold text-primary">{appointment.personalityNumber}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-200/60 text-center">
                      <span className="block text-[10px] text-text/40 font-medium">Destiny No.</span>
                      <span className="text-xs font-bold text-secondary">{appointment.destinyNumber}</span>
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-gray-200/60 text-center font-bold text-text/80">
                    <span>✨ {appointment.zodiacSign}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
                  {appointment.date && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
                      <Calendar className="w-4 h-4 text-primary" /> {formatDate(appointment.date)}
                    </div>
                  )}
                  {appointment.timeSlot && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
                      <Clock className="w-4 h-4 text-primary" /> {formatTime(appointment.timeSlot)}
                    </div>
                  )}
                </div>
              )}

              {/* Contact + fee */}
              <div className="space-y-2 mb-3 flex-grow">
                <a href={`mailto:${appointment.email}`} className="flex items-center gap-2 text-sm text-text/60 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> <span className="truncate">{appointment.email}</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-text/60">
                  <Phone className="w-4 h-4" /> {appointment.phone}
                </div>
                {appointment.fees && (
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <IndianRupee className="w-4 h-4" /> {appointment.fees}
                  </div>
                )}
                {appointment.message && (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-text/70 italic border border-gray-100">
                    &quot;{appointment.message}&quot;
                  </div>
                )}

                {/* Name Numerology */}
                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 text-xs">
                  <span className="block font-semibold text-text mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    <span>Name Numerology: <strong className="text-secondary">{appointment.name}</strong></span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-text/70 font-medium">
                    <div className="bg-white/60 p-1.5 rounded border border-gray-100">
                      <span className="block text-[8px] text-text/40 font-semibold uppercase">Chaldean</span>
                      <span>Sum {getChaldeanNameDetails(appointment.name).sum} &rarr; <strong className="text-primary text-xs font-bold">{getChaldeanNameDetails(appointment.name).reduced}</strong></span>
                    </div>
                    <div className="bg-white/60 p-1.5 rounded border border-gray-100">
                      <span className="block text-[8px] text-text/40 font-semibold uppercase">Pythagorean</span>
                      <span>Sum {getPythagoreanNameDetails(appointment.name).sum} &rarr; <strong className="text-secondary text-xs font-bold">{getPythagoreanNameDetails(appointment.name).reduced}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paid toggle */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={appointment.paid}
                  onChange={() => handlePaidToggle(appointment)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className={`text-xs font-semibold ${appointment.paid ? 'text-green-600' : 'text-text/50'}`}>
                  {appointment.paid ? 'Paid' : 'Payment pending (offline)'}
                </span>
              </label>

              {/* Quick actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <a
                  href={getWhatsAppUrl(
                    appointment.phone.replace(/[^\d]/g, ''),
                    appointment.birthdate
                      ? `Hello ${appointment.name}, thank you for booking a ${appointment.serviceTitle} consultation. Your Numerology Profile shows Personality No: ${appointment.personalityNumber}, Destiny No: ${appointment.destinyNumber}, Zodiac Sign: ${appointment.zodiacSign}. We will contact you soon.`
                      : `Hello ${appointment.name}, your ${appointment.serviceTitle} consultation on ${appointment.date ? formatDate(appointment.date) : ''} at ${appointment.timeSlot ? formatTime(appointment.timeSlot) : ''} is confirmed.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold rounded-lg hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={`tel:${appointment.phone.replace(/\s+/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
                <button
                  onClick={() => handleOpenEdit(appointment)}
                  title="Edit appointment"
                  className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, id: appointment.id })}
                  title="Delete appointment"
                  className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />

      {editModal.open && editModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setEditModal({ open: false, item: null })}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-text/40"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-playfair text-xl font-bold text-text mb-5">Edit Consultation Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-1.5">Birthdate (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editForm.birthdate}
                  onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditModal({ open: false, item: null })}
                className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-text/60 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={editingItem}
                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {editingItem && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Trash2, Phone, MessageCircle, Calendar, Clock, IndianRupee, Mail,
} from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { updateAppointment, deleteAppointment } from '@/services/firestore';
import { formatDate, formatTime, getWhatsAppUrl } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_META: Record<AppointmentStatus, { label: string; badge: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', badge: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', badge: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-gray-200 text-gray-600' },
};

const STATUS_ORDER: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointmentsPage() {
  const { data: appointments, loading } = useFirestoreCollection<Appointment>('appointments', 'createdAt');
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: appointments.filter((a) => a.status === s).length }),
    {} as Record<AppointmentStatus, number>
  );

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
    </div>
  );
}

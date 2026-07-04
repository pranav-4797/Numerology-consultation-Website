'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Phone, MessageCircle, Download } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { updateRegistration, deleteRegistration } from '@/services/firestore';
import { formatDate, getWhatsAppUrl } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { WorkshopRegistration, RegistrationStatus } from '@/types';

const STATUS_META: Record<RegistrationStatus, { label: string; badge: string }> = {
  registered: { label: 'Registered', badge: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Confirmed', badge: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-gray-200 text-gray-600' },
};

const STATUS_ORDER: RegistrationStatus[] = ['registered', 'confirmed', 'cancelled'];

function exportToCsv(registrations: WorkshopRegistration[]) {
  const header = ['Name', 'Phone', 'Email', 'Workshop', 'Status', 'Paid', 'Registered On'];
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = registrations.map((r) =>
    [r.name, r.phone, r.email, r.workshopTitle, r.status, r.paid ? 'Yes' : 'No', formatDate(r.createdAt)]
      .map(escape)
      .join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workshop-registrations-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminRegistrationsPage() {
  const { data: registrations, loading } = useFirestoreCollection<WorkshopRegistration>('registrations', 'createdAt');
  const [workshopFilter, setWorkshopFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const workshops = useMemo(() => {
    const titles = new Map<string, string>();
    registrations.forEach((r) => titles.set(r.workshopId, r.workshopTitle));
    return Array.from(titles.entries()).map(([id, title]) => ({ id, title }));
  }, [registrations]);

  const filtered =
    workshopFilter === 'all' ? registrations : registrations.filter((r) => r.workshopId === workshopFilter);

  const handleStatusChange = async (registration: WorkshopRegistration, status: RegistrationStatus) => {
    try {
      await updateRegistration(registration.id, { status });
      toast.success(`Status: ${STATUS_META[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePaidToggle = async (registration: WorkshopRegistration) => {
    try {
      await updateRegistration(registration.id, { paid: !registration.paid });
      toast.success(registration.paid ? 'Marked as unpaid' : 'Marked as paid');
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRegistration(deleteModal.id);
      toast.success('Registration deleted');
    } catch {
      toast.error('Failed to delete registration');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  const paidCount = filtered.filter((r) => r.paid).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Workshop Registrations</h1>
          <p className="text-sm text-text/50">
            {filtered.length} registrations · {paidCount} paid. Payments are coordinated offline via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={workshopFilter}
            onChange={(e) => setWorkshopFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All workshops</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
          <button
            onClick={() => exportToCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Registrations"
          description="When visitors register for a workshop on the website, they will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Participant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Workshop</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Paid</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden lg:table-cell">Registered</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-text">{r.name}</p>
                      <p className="text-xs text-text/50">{r.phone}</p>
                      <p className="text-xs text-text/50 truncate max-w-[180px]">{r.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text/60 hidden md:table-cell max-w-[200px] truncate">
                      {r.workshopTitle}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as RegistrationStatus)}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.paid}
                          onChange={() => handlePaidToggle(r)}
                          className="w-4 h-4 accent-green-600"
                        />
                        <span className={`text-xs font-semibold ${r.paid ? 'text-green-600' : 'text-text/40'}`}>
                          {r.paid ? 'Paid' : 'Pending'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden lg:table-cell">{formatDate(r.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppUrl(
                            r.phone.replace(/[^\d]/g, ''),
                            `Hello ${r.name}, thank you for registering for "${r.workshopTitle}". Here are the payment details:`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="p-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${r.phone.replace(/\s+/g, '')}`}
                          title="Call"
                          className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setDeleteModal({ open: true, id: r.id })}
                          title="Delete"
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Registration"
        message="Deleting a registration does not restore the workshop seat automatically. Continue?"
      />
    </div>
  );
}

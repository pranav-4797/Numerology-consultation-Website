'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Trash2, Mail, Phone, Calendar, MessageCircle, StickyNote, Save, AlarmClock, Search, Edit, X,
} from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import {
  deleteLead, updateLeadStatus, updateLeadNotes, updateLeadFollowUp, updateLead,
} from '@/services/firestore';
import { formatDate, getWhatsAppUrl } from '@/utils/helpers';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Lead, LeadStatus } from '@/types';

const STATUS_META: Record<LeadStatus, { label: string; badge: string; select: string }> = {
  new: { label: 'New', badge: 'bg-blue-100 text-blue-700', select: 'border-blue-200 text-blue-700' },
  contacted: { label: 'Contacted', badge: 'bg-amber-100 text-amber-700', select: 'border-amber-200 text-amber-700' },
  converted: { label: 'Converted', badge: 'bg-green-100 text-green-700', select: 'border-green-200 text-green-700' },
  closed: { label: 'Closed', badge: 'bg-gray-200 text-gray-600', select: 'border-gray-300 text-gray-600' },
};

const STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'converted', 'closed'];

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

function getLeadStatus(lead: Lead): LeadStatus {
  return lead.status ?? (lead.contacted ? 'contacted' : 'new');
}

function isOverdue(followUpDate?: string): boolean {
  if (!followUpDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return followUpDate < today;
}

export default function AdminLeadsPage() {
  const { data: leads, loading } = useFirestoreCollection<Lead>('contacts', 'createdAt');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  // Search & Edit States
  const [searchQuery, setSearchQuery] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean; item: Lead | null }>({ open: false, item: null });
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [editingItem, setEditingItem] = useState(false);

  const filtered = (filter === 'all' ? leads : leads.filter((l) => getLeadStatus(l) === filter))
    .filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.service?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q)
      );
    });

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: leads.filter((l) => getLeadStatus(l) === s).length }),
    {} as Record<LeadStatus, number>
  );

  const handleOpenEdit = (item: Lead) => {
    setEditModal({ open: true, item });
    setEditForm({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
    });
  };

  const handleEditSubmit = async () => {
    if (!editModal.item) return;
    setEditingItem(true);
    try {
      await updateLead(editModal.item.id, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
      });
      toast.success('Lead updated successfully');
      setEditModal({ open: false, item: null });
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setEditingItem(false);
    }
  };

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    try {
      await updateLeadStatus(lead.id, status);
      toast.success(`Status: ${STATUS_META[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (lead: Lead) => {
    const notes = notesDraft[lead.id] ?? lead.notes ?? '';
    setSavingNotes(lead.id);
    try {
      await updateLeadNotes(lead.id, notes);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(null);
    }
  };

  const handleFollowUpChange = async (lead: Lead, date: string) => {
    try {
      await updateLeadFollowUp(lead.id, date);
      toast.success(date ? 'Follow-up date set' : 'Follow-up date cleared');
    } catch {
      toast.error('Failed to set follow-up date');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLead(deleteModal.id);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Contact Leads</h1>
          <p className="text-sm text-text/50">Track inquiries through your pipeline: New → Contacted → Converted → Closed.</p>
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
          All ({leads.length})
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
            placeholder="Search by lead name, email, phone, or service..."
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
          title={filter === 'all' ? 'No Leads Yet' : `No ${STATUS_META[filter as LeadStatus]?.label ?? ''} Leads`}
          description="When people contact you through the website, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((lead) => {
            const status = getLeadStatus(lead);
            const overdue = isOverdue(lead.followUpDate);
            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col h-full ${
                  overdue ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-playfair text-lg font-bold text-text truncate">{lead.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full ${
                      lead.service === 'General Inquiry' ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {lead.service}
                    </span>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                    className={`text-xs font-semibold px-2 py-1.5 rounded-lg border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${STATUS_META[status].select}`}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>

                {/* Contact details */}
                <div className="space-y-2 mb-3">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-text/60 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" /> <span className="truncate">{lead.email}</span>
                  </a>
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <Phone className="w-4 h-4" /> {lead.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl text-sm text-text/80 italic border border-gray-100 mb-4">
                  &quot;{lead.message}&quot;
                </div>

                {/* Follow-up date */}
                <div className="flex items-center gap-2 mb-3">
                  <AlarmClock className={`w-4 h-4 flex-shrink-0 ${overdue ? 'text-red-500' : 'text-primary/70'}`} />
                  <label className="text-xs text-text/50 whitespace-nowrap">Follow-up:</label>
                  <input
                    type="date"
                    defaultValue={lead.followUpDate ?? ''}
                    onChange={(e) => handleFollowUpChange(lead, e.target.value)}
                    className={`flex-grow px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      overdue ? 'border-red-300 text-red-600' : 'border-gray-200'
                    }`}
                  />
                  {overdue && (
                    <span className="text-[10px] font-semibold text-red-500 uppercase whitespace-nowrap">Overdue</span>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-4 flex-grow">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-primary/70" />
                    <span className="text-xs font-medium text-text/50">Notes</span>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      placeholder="Add notes about this lead..."
                      defaultValue={lead.notes ?? ''}
                      onChange={(e) => setNotesDraft((d) => ({ ...d, [lead.id]: e.target.value }))}
                      className="flex-grow px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => handleSaveNotes(lead)}
                      disabled={savingNotes === lead.id}
                      title="Save notes"
                      className="self-start p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <a
                    href={getWhatsAppUrl(lead.phone.replace(/[^\d]/g, ''), `Hello ${lead.name}, thank you for contacting Divya Urja regarding ${lead.service}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold rounded-lg hover:bg-[#25D366]/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button
                    onClick={() => handleOpenEdit(lead)}
                    title="Edit lead"
                    className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, id: lead.id })}
                    title="Delete lead"
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Lead" message="Are you sure you want to delete this lead? This action cannot be undone." />

      {editModal.open && editModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setEditModal({ open: false, item: null })}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-text/40"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-playfair text-xl font-bold text-text mb-5">Edit Lead Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-1.5">Lead Name</label>
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

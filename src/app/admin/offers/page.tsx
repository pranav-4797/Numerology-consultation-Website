'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, X, Tag, Sparkles, Image as ImageIcon,
  CheckCircle, XCircle, Calendar, Percent, ShoppingBag, Layers, Search
} from 'lucide-react';
import { offerSchema, type OfferFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createOffer, updateOffer, deleteOffer, getProducts, getServices } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Offer, Product, Service } from '@/types';

export default function AdminOffersPage() {
  const { data: offers, loading } = useFirestoreCollection<Offer>('offers');
  const { data: products } = useFirestoreCollection<Product>('products');
  const { data: services } = useFirestoreCollection<Service>('services');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      type: 'custom',
      active: true,
      featured: true,
      originalPrice: 0,
      discountedPrice: 0,
      badge: 'SPECIAL OFFER',
    },
  });

  const offerType = watch('type');
  const origPrice = watch('originalPrice') ?? 0;
  const discPrice = watch('discountedPrice') ?? 0;

  const discountPercent =
    origPrice > discPrice && origPrice > 0
      ? Math.round(((origPrice - discPrice) / origPrice) * 100)
      : 0;

  const openCreate = () => {
    reset({
      title: '',
      subtitle: '',
      badge: 'DIWALI OFFER 🪔',
      type: 'custom',
      itemId: '',
      itemName: '',
      description: '',
      originalPrice: 1999,
      discountedPrice: 999,
      startDate: '',
      endDate: '',
      active: true,
      featured: true,
      category: 'Diwali Special',
    });
    setEditingId(null);
    setImageFile(null);
    setExistingImage('');
    setShowForm(true);
  };

  const openEdit = (offer: Offer) => {
    setValue('title', offer.title);
    setValue('subtitle', offer.subtitle || '');
    setValue('badge', offer.badge || '');
    setValue('type', offer.type);
    setValue('itemId', offer.itemId || '');
    setValue('itemName', offer.itemName);
    setValue('description', offer.description);
    setValue('originalPrice', offer.originalPrice);
    setValue('discountedPrice', offer.discountedPrice);
    setValue('startDate', offer.startDate || '');
    setValue('endDate', offer.endDate || '');
    setValue('active', offer.active);
    setValue('featured', offer.featured);
    setValue('category', offer.category || '');
    setEditingId(offer.id);
    setImageFile(null);
    setExistingImage(offer.image || '');
    setShowForm(true);
  };

  const handleTypeOrItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue('itemId', selectedId);

    if (offerType === 'product') {
      const prod = products.find((p) => p.id === selectedId);
      if (prod) {
        setValue('itemName', prod.name);
        setValue('originalPrice', prod.price);
        if (!existingImage && prod.image) setExistingImage(prod.image);
        if (!watch('title')) setValue('title', `${prod.name} Special Deal`);
      }
    } else if (offerType === 'service') {
      const serv = services.find((s) => s.id === selectedId);
      if (serv) {
        setValue('itemName', serv.title);
        const parsedFee = parseInt((serv.fees || '').replace(/\D/g, ''), 10);
        if (parsedFee) setValue('originalPrice', parsedFee);
        if (!existingImage && serv.image) setExistingImage(serv.image);
        if (!watch('title')) setValue('title', `${serv.title} Offer`);
      }
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    setSubmitting(true);
    try {
      let image = existingImage;
      if (imageFile) {
        image = await compressAndConvertToBase64(imageFile);
      }

      const payload = {
        ...data,
        discountPercent,
        image: image || '',
      };

      if (editingId) {
        await updateOffer(editingId, payload);
        toast.success('Offer updated successfully');
      } else {
        await createOffer(payload);
        toast.success('Special Offer created');
      }
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      await updateOffer(offer.id, { active: !offer.active });
      toast.success(offer.active ? 'Offer deactivated' : 'Offer activated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOffer(deleteModal.id);
      toast.success('Offer deleted');
    } catch {
      toast.error('Failed to delete offer');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  const filteredOffers = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (o.badge && o.badge.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-600" />
            Special & Festive Offers
          </h1>
          <p className="text-sm text-text/50">
            Create and manage Diwali discounts, festival sales, and special pricing for products and services.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Offer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
        <input
          type="text"
          placeholder="Search offers by title or item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h2 className="font-playfair text-xl font-bold text-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {editingId ? 'Edit Special Offer' : 'Create Special Offer'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-text" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Offer Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Offer Title</label>
                  <input
                    {...register('title')}
                    placeholder="e.g. Diwali Crystal Bracelet Deal 🪔"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Badge Tag</label>
                  <input
                    {...register('badge')}
                    placeholder="e.g. DIWALI OFFER, FESTIVAL DEAL"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Type & Item Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Offer Type</label>
                  <select
                    {...register('type')}
                    onChange={(e) => {
                      register('type').onChange(e);
                      setValue('itemId', '');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="custom">Custom Package Offer</option>
                    <option value="product">Store Product</option>
                    <option value="service">Consultation Service</option>
                  </select>
                </div>

                {offerType === 'product' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Select Store Product</label>
                    <select
                      onChange={handleTypeOrItemSelect}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {offerType === 'service' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Select Service</label>
                    <select
                      onChange={handleTypeOrItemSelect}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">-- Choose Service --</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.fees || 'Fee on request'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Item / Package Name</label>
                  <input
                    {...register('itemName')}
                    placeholder="e.g. 7 Chakra Energized Bracelet"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {errors.itemName && <p className="text-xs text-red-500 mt-1">{errors.itemName.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Offer Description</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  placeholder="Details about what the offer includes, benefits, and special instructions..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    {...register('originalPrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Discounted Price (₹)</label>
                  <input
                    type="number"
                    {...register('discountedPrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-bold text-amber-700"
                  />
                </div>
                <div className="flex flex-col justify-center items-center bg-white p-2 rounded-lg border border-amber-300">
                  <span className="text-[10px] text-text/50 uppercase font-semibold">Calculated Discount</span>
                  <span className="text-lg font-black text-emerald-600">{discountPercent}% OFF</span>
                </div>
              </div>

              {/* Category & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Category</label>
                  <input
                    {...register('category')}
                    placeholder="e.g. Diwali Special"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Offer Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-amber-100 file:text-amber-800 file:font-medium"
                />
                {existingImage && !imageFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-text/40">Current image preview:</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existingImage} alt="Current" className="w-12 h-12 object-cover rounded-lg border" />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                  <input type="checkbox" {...register('active')} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                  Active (Visible on Website)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                  <input type="checkbox" {...register('featured')} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                  Featured (Highlight on Homepage)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-200 text-text/70 text-sm font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Offer' : 'Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredOffers.length === 0 ? (
        <EmptyState title="No Offers Found" description="Click 'Create New Offer' to publish your first festive discount." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto -mx-px">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Offer Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Pricing (Actual vs Offer)</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Badge</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOffers.map((o) => {
                  const percent =
                    o.discountPercent ??
                    (o.originalPrice > o.discountedPrice
                      ? Math.round(((o.originalPrice - o.discountedPrice) / o.originalPrice) * 100)
                      : 0);

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {o.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={o.image} alt={o.title} className="w-10 h-10 object-cover rounded-lg shrink-0 border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-text text-sm">{o.title}</div>
                            <div className="text-xs text-text/50">{o.itemName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 text-gray-700">
                          {o.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-700">₹{o.discountedPrice}</span>
                          {o.originalPrice > o.discountedPrice && (
                            <span className="text-xs text-text/40 line-through">₹{o.originalPrice}</span>
                          )}
                          {percent > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {percent}% OFF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          {o.badge || 'SPECIAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(o)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full transition-colors ${
                            o.active
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {o.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {o.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(o)} className="p-2 hover:bg-amber-50 rounded-lg text-amber-700">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: o.id })}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        title="Delete Special Offer"
      />
    </div>
  );
}

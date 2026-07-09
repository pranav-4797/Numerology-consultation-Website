'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { productSchema, type ProductFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createProduct, updateProduct, deleteProduct } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Product, ProductCategory } from '@/types';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'crystals', label: 'Crystals' },
  { value: 'yantras', label: 'Yantras' },
  { value: 'rudraksha', label: 'Rudraksha' },
  { value: 'pendants', label: 'Pendants' },
  { value: 'other', label: 'Other' },
];

export default function AdminProductsPage() {
  const { data: products, loading } = useFirestoreCollection<Product>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const openCreate = () => {
    reset({ name: '', description: '', price: 0, category: 'bracelets', inStock: true, featured: false });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('inStock', product.inStock);
    setValue('featured', product.featured);
    setEditingId(product.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (data: ProductFormData) => {
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
        await updateProduct(editingId, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
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
      await deleteProduct(deleteModal.id);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
      toast.success(`Product marked as ${!product.inStock ? 'in stock' : 'out of stock'}`);
    } catch {
      toast.error('Failed to update stock status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Products</h1>
          <p className="text-sm text-text/50">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Create'} Product</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Product Name</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Numerology Healing Bracelet"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Describe the product and its benefits..."
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Price (₹)</label>
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="999"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="inStock"
                    {...register('inStock')}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-text">In Stock</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register('featured')}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-text">Featured</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <EmptyState title="No Products" description="Add your first product to the catalogue." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text/20 text-xs">IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{p.name}</p>
                          {p.featured && (
                            <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text/50 hidden sm:table-cell capitalize">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-text hidden md:table-cell">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          p.inStock
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        {p.inStock ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> In Stock</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> Out of Stock</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary/10 rounded-lg">
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, id: p.id })} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-500" />
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
        title="Delete Product"
      />
    </div>
  );
}

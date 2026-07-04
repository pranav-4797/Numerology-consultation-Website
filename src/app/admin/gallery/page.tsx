'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, Trash2, X } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createGalleryImage, deleteGalleryImage } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { GalleryImage } from '@/types';

export default function AdminGalleryPage() {
  const { data: images, loading } = useFirestoreCollection<GalleryImage>('gallery');
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; image: GalleryImage | null }>({ open: false, image: null });
  const [deleting, setDeleting] = useState(false);

  const openUpload = () => {
    setImageFile(null);
    setCaption('');
    setShowForm(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    setSubmitting(true);
    try {
      const url = await compressAndConvertToBase64(imageFile);
      await createGalleryImage({ url, caption });
      toast.success('Image uploaded to gallery');
      setShowForm(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.image) return;
    setDeleting(true);
    try {
      // Delete from Firestore (image is stored as Base64 in the document)
      await deleteGalleryImage(deleteModal.image.id);
      toast.success('Image deleted from gallery');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, image: null });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Gallery</h1>
          <p className="text-sm text-text/50">{images.length} images</p>
        </div>
        <button onClick={openUpload} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload Image
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">Upload Image</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Select Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Caption (Optional)</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Workshop in Pune" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" disabled={submitting || !imageFile} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Uploading...' : 'Upload to Gallery'}
              </button>
            </form>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <EmptyState title="Gallery Empty" description="Upload images to display in the public gallery." />
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img) => (
            <div key={img.id} className="relative group break-inside-avoid rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <Image src={img.url} alt={img.caption || 'Gallery Image'} width={400} height={300} className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <button onClick={() => setDeleteModal({ open: true, image: img })} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {img.caption && <p className="text-white text-sm font-medium">{img.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, image: null })} onConfirm={handleDelete} loading={deleting} title="Delete Image" message="Are you sure you want to delete this image? It will be permanently removed from storage." />
    </div>
  );
}

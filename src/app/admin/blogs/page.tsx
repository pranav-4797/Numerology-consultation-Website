'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, X, Eye, Pencil, Image as ImageIcon,
  Bold, Italic, Heading2, List, Globe, FileText,
} from 'lucide-react';
import { blogSchema, type BlogFormData } from '@/schemas';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { createBlog, updateBlog, deleteBlog } from '@/services/firestore';
import { compressAndConvertToBase64 } from '@/utils/imageUtils';
import { generateSlug, formatDate } from '@/utils/helpers';
import { renderMarkdown, isHtmlContent } from '@/utils/markdown';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import type { Blog, BlogStatus } from '@/types';

function getBlogStatus(blog: Blog): BlogStatus {
  return blog.status ?? 'published';
}

export default function AdminBlogsPage() {
  const { data: blogs, loading } = useFirestoreCollection<Blog>('blogs', 'publishedAt');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const submitStatusRef = useRef<BlogStatus>('published');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
  });

  const contentValue = watch('content') ?? '';
  const { ref: contentFieldRef, ...contentField } = register('content');

  const openCreate = () => {
    reset({ title: '', excerpt: '', content: '' });
    setEditingId(null);
    setImageFile(null);
    setEditorTab('write');
    setShowForm(true);
  };

  const openEdit = (blog: Blog) => {
    setValue('title', blog.title);
    setValue('excerpt', blog.excerpt);
    setValue('content', blog.content);
    setEditingId(blog.id);
    setImageFile(null);
    setEditorTab('write');
    setShowForm(true);
  };

  /** Inserts markdown text at the current cursor position in the content textarea. */
  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current;
    const current = contentValue;
    if (!textarea) {
      setValue('content', current + snippet, { shouldValidate: true });
      return;
    }
    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? current.length;
    const next = current.slice(0, start) + snippet + current.slice(end);
    setValue('content', next, { shouldValidate: true });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  const handleInlineImage = async (file: File | null) => {
    if (!file) return;
    try {
      const base64 = await compressAndConvertToBase64(file);
      insertAtCursor(`\n\n![image](${base64})\n\n`);
      toast.success('Image inserted');
    } catch {
      toast.error('Failed to process image');
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    const status = submitStatusRef.current;
    setSubmitting(true);
    try {
      let coverImage = '';
      if (imageFile) {
        coverImage = await compressAndConvertToBase64(imageFile);
      }

      const slug = generateSlug(data.title);
      const payload: Record<string, unknown> = {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        status,
      };
      if (status === 'published') payload.publishedAt = new Date().toISOString();
      else if (!editingId) payload.publishedAt = new Date().toISOString(); // keeps ordering sane for drafts
      if (coverImage) payload.coverImage = coverImage;

      if (editingId) {
        await updateBlog(editingId, payload);
        toast.success(status === 'published' ? 'Article published' : 'Draft saved');
      } else {
        if (!coverImage) payload.coverImage = '';
        await createBlog(payload);
        toast.success(status === 'published' ? 'Article published' : 'Draft saved');
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

  const toggleStatus = async (blog: Blog) => {
    const next: BlogStatus = getBlogStatus(blog) === 'published' ? 'draft' : 'published';
    try {
      const payload: Record<string, unknown> = { status: next };
      if (next === 'published') payload.publishedAt = new Date().toISOString();
      await updateBlog(blog.id, payload);
      toast.success(next === 'published' ? 'Article published' : 'Moved to drafts');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBlog(deleteModal.id);
      toast.success('Blog deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  if (loading) return <Loader />;

  const drafts = blogs.filter((b) => getBlogStatus(b) === 'draft').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Blogs</h1>
          <p className="text-sm text-text/50">
            {blogs.length} articles{drafts > 0 ? ` · ${drafts} draft${drafts > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-xl font-bold">{editingId ? 'Edit' : 'Create'} Article</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Title</label>
                  <input {...register('title')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-text/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary file:font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Excerpt</label>
                <textarea rows={2} {...register('excerpt')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt.message}</p>}
              </div>

              {/* Markdown editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-text">Content (Markdown)</label>
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        editorTab === 'write' ? 'bg-white shadow-sm text-primary' : 'text-text/50'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        editorTab === 'preview' ? 'bg-white shadow-sm text-primary' : 'text-text/50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'write' ? (
                  <>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 border-b-0 rounded-t-xl bg-gray-50">
                      <button type="button" title="Heading" onClick={() => insertAtCursor('\n## ')} className="p-1.5 hover:bg-white rounded-md text-text/60"><Heading2 className="w-4 h-4" /></button>
                      <button type="button" title="Bold" onClick={() => insertAtCursor('**bold text**')} className="p-1.5 hover:bg-white rounded-md text-text/60"><Bold className="w-4 h-4" /></button>
                      <button type="button" title="Italic" onClick={() => insertAtCursor('*italic text*')} className="p-1.5 hover:bg-white rounded-md text-text/60"><Italic className="w-4 h-4" /></button>
                      <button type="button" title="List" onClick={() => insertAtCursor('\n- item one\n- item two\n')} className="p-1.5 hover:bg-white rounded-md text-text/60"><List className="w-4 h-4" /></button>
                      <button type="button" title="Insert image" onClick={() => inlineImageInputRef.current?.click()} className="p-1.5 hover:bg-white rounded-md text-text/60"><ImageIcon className="w-4 h-4" /></button>
                      <input
                        ref={inlineImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { handleInlineImage(e.target.files?.[0] || null); e.target.value = ''; }}
                      />
                      <span className="ml-auto text-[10px] text-text/40 pr-1">Markdown supported · # heading · **bold** · - list</span>
                    </div>
                    <textarea
                      rows={14}
                      {...contentField}
                      ref={(el) => { contentFieldRef(el); textareaRef.current = el; }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-b-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y font-mono"
                      placeholder={'## Introduction\n\nWrite your article here...\n\n- Key point one\n- Key point two'}
                    />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-xl px-6 py-4 min-h-[22rem] max-h-[28rem] overflow-y-auto bg-gray-50/50">
                    {contentValue.trim() ? (
                      isHtmlContent(contentValue) ? (
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentValue }} />
                      ) : (
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(contentValue) }} />
                      )
                    ) : (
                      <p className="text-sm text-text/40 italic">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  onClick={() => { submitStatusRef.current = 'draft'; }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5 disabled:opacity-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="submit"
                  onClick={() => { submitStatusRef.current = 'published'; }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <EmptyState title="No Articles" description="Write your first blog post." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider hidden md:table-cell">Published</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blogs.map((b) => {
                  const status = getBlogStatus(b);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-text max-w-xs truncate">{b.title}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(b)}
                          title={status === 'published' ? 'Click to move to drafts' : 'Click to publish'}
                          className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full transition-colors ${
                            status === 'published'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-text/50 hidden sm:table-cell">{b.slug}</td>
                      <td className="px-6 py-4 text-sm text-text/50 hidden md:table-cell">{formatDate(b.publishedAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(b)} className="p-2 hover:bg-primary/10 rounded-lg"><Edit className="w-4 h-4 text-primary" /></button>
                          <button onClick={() => setDeleteModal({ open: true, id: b.id })} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
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

      <DeleteConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: '' })} onConfirm={handleDelete} loading={deleting} title="Delete Article" />
    </div>
  );
}

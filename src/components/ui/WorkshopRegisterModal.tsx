'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, IndianRupee, Calendar, Clock, MapPin, Info } from 'lucide-react';
import { registrationSchema, type RegistrationFormData } from '@/schemas';
import { registerForWorkshop } from '@/services/firestore';
import { formatDate, formatTime } from '@/utils/helpers';
import { useLanguage } from '@/context/LanguageContext';
import type { Workshop } from '@/types';

interface WorkshopRegisterModalProps {
  workshop: Workshop;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

export default function WorkshopRegisterModal({ workshop, isOpen, onClose }: WorkshopRegisterModalProps) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const handleClose = () => {
    setSuccess(false);
    reset();
    onClose();
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setSubmitting(true);
    try {
      await registerForWorkshop(workshop.id, data);
      setSuccess(true);
      toast.success(t('register.success'));
    } catch (error) {
      if (error instanceof Error && error.message === 'SEATS_FULL') {
        toast.error(t('register.seatsFull'));
      } else {
        console.error('Registration error:', error);
        toast.error(t('book.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text/50" />
            </button>

            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-text mb-3">{t('register.success')}</h3>
                <p className="text-sm text-text/60 mb-6">{t('register.paymentNote')}</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  OK
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-playfair text-xl font-bold text-text mb-1 pr-8">{t('register.title')}</h3>
                <p className="text-sm font-semibold text-primary mb-4">{workshop.title}</p>

                {/* Workshop summary */}
                <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-5">
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <Calendar className="w-4 h-4 text-primary/70" /> {formatDate(workshop.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <Clock className="w-4 h-4 text-primary/70" /> {formatTime(workshop.time)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <MapPin className="w-4 h-4 text-primary/70" /> {workshop.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-primary">
                    <IndianRupee className="w-4 h-4" /> {workshop.fees}
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">{t('contact.fullName')}</label>
                    <input type="text" {...register('name')} placeholder={t('contact.fullNamePlaceholder')} className={inputClass} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">{t('contact.phone')}</label>
                    <input type="tel" {...register('phone')} placeholder="+91 98765 43210" className={inputClass} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">{t('contact.email')}</label>
                    <input type="email" {...register('email')} placeholder="your@email.com" className={inputClass} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-secondary/10 border border-secondary/20 rounded-xl">
                    <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-text/70">{t('register.paymentNote')}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('register.registering')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t('register.confirm')}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

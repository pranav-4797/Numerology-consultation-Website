'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Calendar, CheckCircle, IndianRupee, Sparkles, Info, ArrowRight,
} from 'lucide-react';
import { appointmentSchema, type AppointmentFormData } from '@/schemas';
import { getServices, createAppointment } from '@/services/firestore';
import { useLanguage } from '@/context/LanguageContext';
import Loader from '@/components/ui/Loader';
import type { Service } from '@/types';

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

export default function BookAppointmentPage() {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Split Birthdate selection states for better UX
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { serviceId: '', birthdate: '', message: '' },
  });

  const selectedServiceId = watch('serviceId');
  const birthdate = watch('birthdate');
  const selectedIds = selectedServiceId ? selectedServiceId.split(',') : [];
  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const selectedService = selectedServices[0];

  const totalFees = selectedServices.reduce((sum, s) => {
    if (!s.fees) return sum;
    const numericFee = parseFloat(s.fees.replace(/[^\d.]/g, ''));
    return isNaN(numericFee) ? sum : sum + numericFee;
  }, 0);

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
        // Preselect service from ?service=<id> query param
        const params = new URLSearchParams(window.location.search);
        const preselect = params.get('service');
        if (preselect && data.some((s) => s.id === preselect)) {
          setValue('serviceId', preselect);
        }
      })
      .catch((error) => console.error('Error fetching services:', error))
      .finally(() => setLoading(false));
  }, [setValue]);

  // Combined Date Handler
  const handleDobChange = (type: 'day' | 'month' | 'year', value: string) => {
    let day = dobDay;
    let month = dobMonth;
    let year = dobYear;

    if (type === 'day') {
      setDobDay(value);
      day = value;
    } else if (type === 'month') {
      setDobMonth(value);
      month = value;
    } else if (type === 'year') {
      setDobYear(value);
      year = value;
    }

    if (day && month && year) {
      const combined = `${year}-${month}-${day}`;
      setValue('birthdate', combined, { shouldValidate: true });
    } else {
      setValue('birthdate', '');
    }
  };

  const getMonths = (l: string) => {
    if (l === 'hi') {
      return [
        'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
        'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
      ];
    }
    if (l === 'mr') {
      return [
        'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
        'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
      ];
    }
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };

  const onSubmit = async (data: AppointmentFormData) => {
    const serviceTitles = selectedServices.map((s) => s.title).join(', ');
    const displayFees = totalFees > 0 ? `₹${totalFees.toLocaleString('en-IN')}` : t('book.feeOnRequest');
    setSubmitting(true);
    try {
      await createAppointment({
        name: data.name,
        phone: data.phone,
        email: data.email,
        serviceId: data.serviceId,
        serviceTitle: serviceTitles,
        fees: displayFees,
        birthdate: data.birthdate,
        message: data.message ?? '',
        status: 'pending',
        paid: false,
      });
      setConfirmed(true);
      toast.success(t('book.success'));
      reset();
      setDobDay('');
      setDobMonth('');
      setDobYear('');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(t('book.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            {t('book.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            {t('book.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {confirmed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-text mb-3">{t('book.success')}</h2>
              <p className="text-sm text-text/60 mb-8">{t('book.paymentNote')}</p>
              <button
                onClick={() => setConfirmed(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                {t('book.title')} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : loading ? (
            <Loader />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Service */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-playfair text-xl font-bold text-text">{t('book.selectService')}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => {
                    const active = selectedIds.includes(service.id);
                    const handleServiceToggle = () => {
                      let newIds: string[];
                      if (active) {
                        newIds = selectedIds.filter((id) => id !== service.id);
                      } else {
                        newIds = [...selectedIds, service.id];
                      }
                      setValue('serviceId', newIds.join(','), { shouldValidate: true });
                    };
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={handleServiceToggle}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${
                          active
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-sm text-text">{service.title}</span>
                          {active && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <span className="mt-1 flex items-center gap-0.5 text-xs text-primary font-semibold">
                          {service.fees ? (
                            <>
                              <IndianRupee className="w-3 h-3" />
                              {service.fees}
                            </>
                          ) : (
                            <span className="text-text/40 font-normal">{t('book.fee')}: {t('book.feeOnRequest')}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.serviceId && <p className="text-xs text-red-500 mt-2">{errors.serviceId.message}</p>}
              </div>

              {/* Step 2: Date of Birth */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="font-playfair text-xl font-bold text-text">
                    {t('book.birthdate')}
                  </h2>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-text mb-1.5">{t('book.birthdate')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Day Selector */}
                    <select
                      value={dobDay}
                      onChange={(e) => handleDobChange('day', e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">{lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'Day'}</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                        const val = d < 10 ? `0${d}` : `${d}`;
                        return (
                          <option key={d} value={val}>
                            {d}
                          </option>
                        );
                      })}
                    </select>

                    {/* Month Selector */}
                    <select
                      value={dobMonth}
                      onChange={(e) => handleDobChange('month', e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">{lang === 'hi' ? 'महीना' : lang === 'mr' ? 'महिना' : 'Month'}</option>
                      {getMonths(lang).map((m, idx) => {
                        const val = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
                        return (
                          <option key={m} value={val}>
                            {m}
                          </option>
                        );
                      })}
                    </select>

                    {/* Year Selector */}
                    <select
                      value={dobYear}
                      onChange={(e) => handleDobChange('year', e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">{lang === 'hi' ? 'वर्ष' : lang === 'mr' ? 'वर्ष' : 'Year'}</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y.toString()}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.birthdate && <p className="text-xs text-red-500 mt-2">{errors.birthdate.message}</p>}
                </div>

              </div>

              {/* Step 3: Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="font-playfair text-xl font-bold text-text mb-5">{t('book.yourDetails')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">{t('contact.fullName')}</label>
                    <input type="text" {...register('name')} placeholder={t('contact.fullNamePlaceholder')} className={inputClass} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">{t('book.notes')}</label>
                    <textarea rows={3} {...register('message')} placeholder={t('book.notesPlaceholder')} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Payment note + summary */}
              <div className="flex items-start gap-3 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl">
                <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-text/70">
                  {selectedServices.length > 0 && (
                    <p className="font-semibold text-text mb-1">
                      {t('book.fee')}: {totalFees > 0 ? `₹${totalFees.toLocaleString('en-IN')}` : t('book.feeOnRequest')}
                    </p>
                  )}
                  <p>{t('book.paymentNote')}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('book.booking')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('book.confirm')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

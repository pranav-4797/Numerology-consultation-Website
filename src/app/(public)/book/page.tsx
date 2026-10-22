'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  User,
  CheckCircle,
  IndianRupee,
  Info,
  ArrowRight,
  ArrowLeft,
  Compass,
  ShieldCheck,
  PhoneCall,
  ShoppingBag,
} from 'lucide-react';
import { appointmentSchema, type AppointmentFormData } from '@/schemas';
import { getServices, createAppointment } from '@/services/firestore';
import { useLanguage } from '@/context/LanguageContext';
import Loader from '@/components/ui/Loader';
import type { Service } from '@/types';
import { calculateBirthNumber } from '@/services/numerology/birthNumber';
import { calculateConductorNumber } from '@/services/numerology/destinyNumber';

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base sm:text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]';

const PLANETARY_RULERS: Record<number, { en: string; hi: string; mr: string; gem: string }> = {
  1: { en: 'Sun (Surya) • Radiance & Leadership', hi: 'सूर्य देव • आत्मबल एवं नेतृत्व', mr: 'सूर्य देव • आत्मबल आणि नेतृत्व', gem: 'Ruby (माणिक्य)' },
  2: { en: 'Moon (Chandra) • Peace & Intuition', hi: 'चंद्र देव • मनःशांति एवं अंतर्ज्ञान', mr: 'चंद्र देव • मनःशांती आणि अंतर्ज्ञान', gem: 'Pearl (मोती)' },
  3: { en: 'Jupiter (Brihaspati) • Wisdom & Growth', hi: 'बृहस्पति देव • ज्ञान एवं समृद्धि', mr: 'बृहस्पति देव • ज्ञान आणि समृद्धी', gem: 'Yellow Sapphire (पुखराज)' },
  4: { en: 'Rahu • Vision & Ambition', hi: 'राहु • तीव्र बुद्धि एवं पराक्रम', mr: 'राहु • तीव्र बुद्धी आणि प्रगती', gem: 'Hessonite (गोमेद)' },
  5: { en: 'Mercury (Budh) • Intellect & Speech', hi: 'बुध देव • वाणी, व्यापार एवं बुद्धि', mr: 'बुध देव • वाणी, बुद्धी आणि व्यापार', gem: 'Emerald (पन्ना)' },
  6: { en: 'Venus (Shukra) • Abundance & Art', hi: 'शुक्र देव • ऐश्वर्य एवं कला', mr: 'शुक्र देव • ऐश्वर्य आणि कला', gem: 'Diamond / Opal (हिरा)' },
  7: { en: 'Ketu • Spirituality & Healing', hi: 'केतु • अध्यात्म एवं गूढ़ ज्ञान', mr: 'केतु • अध्यात्म आणि गूढ विद्या', gem: "Cat's Eye (लहसुनिया)" },
  8: { en: 'Saturn (Shani) • Karma & Discipline', hi: 'शनि देव • कर्म, न्याय एवं धैर्य', mr: 'शनि देव • कर्म, न्याय आणि धैर्य', gem: 'Blue Sapphire (नीलम)' },
  9: { en: 'Mars (Mangal) • Courage & Vitality', hi: 'मंगल देव • ऊर्जा, साहस एवं विजय', mr: 'मंगळ देव • ऊर्जा, धैर्य आणि विजय', gem: 'Red Coral (मूंगा)' },
};

function getZodiac(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries (मेष)';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus (वृषभ)';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini (मिथुन)';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer (कर्क)';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo (सिंह)';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo (कन्या)';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra (तुला)';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio (वृश्चिक)';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius (धनु)';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn (मकर)';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius (कुंभ)';
  return 'Pisces (मीन)';
}

export default function BookAppointmentPage() {
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Split Birthdate selection states
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { serviceId: '', birthdate: '', message: '' },
    mode: 'onTouched',
  });

  const selectedServiceId = watch('serviceId');
  const birthdate = watch('birthdate');
  const selectedIds = useMemo(
    () => (selectedServiceId ? selectedServiceId.split(',').filter(Boolean) : []),
    [selectedServiceId]
  );
  const selectedServices = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [services, selectedIds]
  );

  const totalFees = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
      if (!s.fees) return sum;
      const numericFee = parseFloat(s.fees.replace(/[^\d.]/g, ''));
      return isNaN(numericFee) ? sum : sum + numericFee;
    }, 0);
  }, [selectedServices]);

  // Dynamic Cosmic Numbers calculation
  const cosmicProfile = useMemo(() => {
    const d = parseInt(dobDay, 10);
    const m = parseInt(dobMonth, 10);
    const y = parseInt(dobYear, 10);
    if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) {
      return null;
    }
    const driver = calculateBirthNumber(d);
    const conductor = calculateConductorNumber({ day: d, month: m, year: y });
    const zodiac = getZodiac(d, m);
    const driverRuler = PLANETARY_RULERS[driver] || PLANETARY_RULERS[1];
    const conductorRuler = PLANETARY_RULERS[conductor] || PLANETARY_RULERS[1];

    return {
      driver,
      conductor,
      zodiac,
      driverRulerText: driverRuler[lang] || driverRuler.en,
      conductorRulerText: conductorRuler[lang] || conductorRuler.en,
      gemstone: driverRuler.gem,
    };
  }, [dobDay, dobMonth, dobYear, lang]);

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
        const params = new URLSearchParams(window.location.search);
        const preselect = params.get('service');
        if (preselect && data.some((s) => s.id === preselect)) {
          setValue('serviceId', preselect, { shouldValidate: true });
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

  const handleStep1Next = () => {
    if (selectedIds.length === 0) {
      toast.error(t('book.selectAtLeastOne'));
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleStep2Next = async () => {
    const valid = await trigger('birthdate');
    if (!valid || !birthdate) {
      toast.error(t('book.birthdatePlaceholder'));
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 380, behavior: 'smooth' });
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
        personalityNumber: cosmicProfile?.driver ?? null,
        destinyNumber: cosmicProfile?.conductor ?? null,
        zodiacSign: cosmicProfile?.zodiac ?? null,
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
      {/* Hero with Celestial Radiance */}
      <section className="relative py-20 sm:py-24 bg-gradient-to-br from-text via-gray-900 to-text overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Divya Urja Consultation</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          >
            {t('book.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto"
          >
            {t('book.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FDFBF7] min-h-[600px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {confirmed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-primary/20 text-center max-w-2xl mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-amber-400 to-teal-500" />
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-text mb-3">
                {t('book.success')}
              </h2>
              <p className="text-sm sm:text-base text-text/70 mb-6 max-w-lg mx-auto">
                {t('book.paymentNote')}
              </p>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl mb-8 text-left text-xs sm:text-sm text-amber-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('book.confidentialNotice')}</p>
                  <p className="text-amber-900/80 mt-0.5">
                    Our team will verify your appointment slot and WhatsApp you the direct video/in-person consultation details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmed(false);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {t('book.title')} <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-text font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>{t('nav.hubStore')}</span>
                </Link>
              </div>
            </motion.div>
          ) : loading ? (
            <div className="py-20 flex justify-center">
              <Loader />
            </div>
          ) : (
            <div>
              {/* Progressive Wizard Stepper */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
                  {/* Step 1 Pill */}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`flex items-center justify-center sm:justify-start gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all ${
                      currentStep === 1
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : selectedIds.length > 0
                        ? 'bg-white text-text border-primary/30 hover:border-primary'
                        : 'bg-white text-text/50 border-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 1 ? 'bg-white text-primary' : 'bg-gray-100 text-text'
                    }`}>
                      1
                    </span>
                    <span className="hidden sm:inline">{t('book.step1')}</span>
                    <span className="sm:hidden">Service</span>
                  </button>

                  {/* Step 2 Pill */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIds.length > 0) setCurrentStep(2);
                    }}
                    disabled={selectedIds.length === 0}
                    className={`flex items-center justify-center sm:justify-start gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentStep === 2
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : birthdate
                        ? 'bg-white text-text border-primary/30 hover:border-primary'
                        : 'bg-white text-text/50 border-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 2 ? 'bg-white text-primary' : 'bg-gray-100 text-text'
                    }`}>
                      2
                    </span>
                    <span className="hidden sm:inline">{t('book.step2')}</span>
                    <span className="sm:hidden">Birthdate</span>
                  </button>

                  {/* Step 3 Pill */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIds.length > 0 && birthdate) setCurrentStep(3);
                    }}
                    disabled={selectedIds.length === 0 || !birthdate}
                    className={`flex items-center justify-center sm:justify-start gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentStep === 3
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-white text-text/50 border-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 3 ? 'bg-white text-primary' : 'bg-gray-100 text-text'
                    }`}>
                      3
                    </span>
                    <span className="hidden sm:inline">{t('book.step3')}</span>
                    <span className="sm:hidden">Confirm</span>
                  </button>
                </div>
              </div>

              {/* Form and Wizard Steps */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* STEP 1: Select Consultation */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-text">
                              {t('book.selectService')}
                            </h2>
                            <p className="text-xs sm:text-sm text-text/60">
                              Choose one or more areas of guidance for your session.
                            </p>
                          </div>
                        </div>
                        {selectedIds.length > 0 && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            {selectedIds.length} Selected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
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
                              className={`group text-left p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                                active
                                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20'
                                  : 'border-gray-100 bg-white hover:border-primary/40 hover:shadow-sm'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-base text-text group-hover:text-primary transition-colors">
                                    {service.title}
                                  </h3>
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                      active
                                        ? 'bg-primary text-white'
                                        : 'border border-gray-300 text-transparent'
                                    }`}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                </div>
                                <p className="text-xs text-text/60 line-clamp-2 mb-3">
                                  {service.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between">
                                <span className="text-xs text-text/50 font-medium">{t('book.fee')}:</span>
                                <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
                                  {service.fees ? (
                                    <>
                                      <IndianRupee className="w-3.5 h-3.5" />
                                      {service.fees}
                                    </>
                                  ) : (
                                    <span className="text-xs font-semibold text-amber-800">
                                      {t('book.feeOnRequest')}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {errors.serviceId && (
                        <p className="text-xs text-red-500 mb-4">{errors.serviceId.message}</p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-text/60">
                          {selectedServices.length > 0 ? (
                            <span>
                              Total: <strong className="text-text font-bold text-sm">
                                {totalFees > 0 ? `₹${totalFees.toLocaleString('en-IN')}` : t('book.feeOnRequest')}
                              </strong>
                            </span>
                          ) : (
                            <span>Please select at least one consultation</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleStep1Next}
                          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.01]"
                        >
                          <span>{t('book.next')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Cosmic Birth Details & Live Calculator Preview */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6"
                    >
                      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-text">
                            {t('book.birthdate')}
                          </h2>
                          <p className="text-xs sm:text-sm text-text/60">
                            Your exact date of birth reveals your planetary rulers and core numerological matrix.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          {t('book.birthdatePlaceholder')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Day */}
                          <div>
                            <select
                              value={dobDay}
                              onChange={(e) => handleDobChange('day', e.target.value)}
                              className={`${inputClass} cursor-pointer font-medium`}
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
                          </div>

                          {/* Month */}
                          <div>
                            <select
                              value={dobMonth}
                              onChange={(e) => handleDobChange('month', e.target.value)}
                              className={`${inputClass} cursor-pointer font-medium`}
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
                          </div>

                          {/* Year */}
                          <div>
                            <select
                              value={dobYear}
                              onChange={(e) => handleDobChange('year', e.target.value)}
                              className={`${inputClass} cursor-pointer font-medium`}
                            >
                              <option value="">{lang === 'hi' ? 'वर्ष' : lang === 'mr' ? 'वर्ष' : 'Year'}</option>
                              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                <option key={y} value={y.toString()}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {errors.birthdate && (
                          <p className="text-xs text-red-500 mt-2">{errors.birthdate.message}</p>
                        )}
                      </div>

                      {/* LIVE COSMIC PREVIEW CARD */}
                      <AnimatePresence>
                        {cosmicProfile ? (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-teal-500/10 border border-primary/25 relative overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-4 text-primary">
                              <Compass className="w-5 h-5 animate-spin-slow" />
                              <span className="text-xs uppercase tracking-wider font-bold">
                                {t('book.cosmicReady')}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              {/* Driver Number */}
                              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-200/60 shadow-xs">
                                <span className="text-xs text-text/60 font-medium block">
                                  {t('book.driverLabel')}
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="font-playfair text-3xl font-extrabold text-primary">
                                    {cosmicProfile.driver}
                                  </span>
                                  <span className="text-xs font-semibold text-text/80 truncate">
                                    {cosmicProfile.driverRulerText}
                                  </span>
                                </div>
                              </div>

                              {/* Conductor Number */}
                              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-teal-200/60 shadow-xs">
                                <span className="text-xs text-text/60 font-medium block">
                                  {t('book.conductorLabel')}
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="font-playfair text-3xl font-extrabold text-teal-700">
                                    {cosmicProfile.conductor}
                                  </span>
                                  <span className="text-xs font-semibold text-text/80 truncate">
                                    {cosmicProfile.conductorRulerText}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-primary/15 text-xs text-text/75">
                              <span>
                                <strong>Rashi:</strong> {cosmicProfile.zodiac}
                              </span>
                              <span>
                                <strong>Vedic Gemstone:</strong> {cosmicProfile.gemstone}
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-xs text-text/60 flex items-center gap-2.5">
                            <Info className="w-4 h-4 text-text/40 flex-shrink-0" />
                            <span>Select your full Day, Month, and Year to compute your Driver and Conductor numbers in real-time.</span>
                          </div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="inline-flex items-center gap-2 px-5 py-3 text-text/70 hover:text-text font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{t('book.prev')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleStep2Next}
                          disabled={!birthdate}
                          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span>{t('book.next')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Client Details, Summary & Confirm */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Summary Review Card */}
                      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-text">
                              {t('book.yourDetails')}
                            </h2>
                            <p className="text-xs sm:text-sm text-text/60">
                              Please review your consultation booking details below.
                            </p>
                          </div>
                        </div>

                        {/* Booking Summary Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] border border-amber-200/60 mb-6 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="text-xs text-text/50 font-medium block">Consultation(s)</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {selectedServices.map((s) => (
                                  <span
                                    key={s.id}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-text shadow-2xs"
                                  >
                                    {s.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-text/50 font-medium block">{t('book.fee')}</span>
                              <span className="text-base font-bold text-primary">
                                {totalFees > 0 ? `₹${totalFees.toLocaleString('en-IN')}` : t('book.feeOnRequest')}
                              </span>
                            </div>
                          </div>

                          {cosmicProfile && (
                            <div className="pt-3 border-t border-amber-200/40 flex items-center justify-between text-xs text-text/75">
                              <span>
                                <strong>DOB:</strong> {birthdate}
                              </span>
                              <span>
                                <strong>Blueprint:</strong> Driver {cosmicProfile.driver} • Conductor {cosmicProfile.conductor} ({cosmicProfile.zodiac})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-text mb-1.5">
                              {t('contact.fullName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register('name')}
                              placeholder={t('contact.fullNamePlaceholder')}
                              className={inputClass}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-text mb-1.5">
                                {t('contact.phone')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  {...register('phone')}
                                  placeholder="+91 98765 43210"
                                  className={inputClass}
                                />
                                <PhoneCall className="w-4 h-4 text-text/30 absolute right-3.5 top-3.5" />
                              </div>
                              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-text mb-1.5">
                                {t('contact.email')} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                {...register('email')}
                                placeholder="your@email.com"
                                className={inputClass}
                              />
                              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-text mb-1.5">
                              {t('book.notes')}
                            </label>
                            <textarea
                              rows={3}
                              {...register('message')}
                              placeholder={t('book.notesPlaceholder')}
                              className={`${inputClass} resize-none`}
                            />
                          </div>
                        </div>

                        {/* Security & Confidentiality Pill */}
                        <div className="mt-6 flex items-start gap-3 p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-900">
                          <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">{t('book.confidentialNotice')}</p>
                            <p className="text-teal-800/80 mt-0.5">{t('book.paymentNote')}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex items-center gap-2 px-5 py-3 text-text/70 hover:text-text font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{t('book.prev')}</span>
                          </button>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary via-primary to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
                          >
                            {submitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t('book.booking')}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span>{t('book.confirm')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

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
import { getPersonalityNumber, getDestinyNumber, getZodiacSign } from '@/utils/numerology';

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

const getTraits = (lang: string) => {
  if (lang === 'hi') {
    return {
      personality: {
        1: { title: 'नेता (Leader)', desc: 'स्वतंत्र, महत्वाकांक्षी और दृढ़ इच्छाशक्ति वाले।' },
        2: { title: 'शांतिदूत (Peacemaker)', desc: 'सहयोगी, संवेदनशील और राजनयिक।' },
        3: { title: 'रचनात्मक (Creative)', desc: 'अभिव्यंजक, आनंदमयी और सामाजिक।' },
        4: { title: 'निर्माता (Builder)', desc: 'व्यावहारिक, अनुशासित और काम के प्रति समर्पित।' },
        5: { title: 'खोजी (Explorer)', desc: 'साहसी, ऊर्जावान और स्वतंत्रता प्रिय।' },
        6: { title: 'संरक्षक (Nurturer)', desc: 'जिम्मेदार, देखभाल करने वाले और कलात्मक।' },
        7: { title: 'जिज्ञासु (Seeker)', desc: 'विश्लेषणात्मक, आध्यात्मिक और अंतर्मुखी।' },
        8: { title: 'विजेता (Achiever)', desc: 'लक्ष्य-उन्मुख, शक्तिशाली और भौतिक रूप से सफल।' },
        9: { title: 'परोपकारी (Humanitarian)', desc: 'सहानुभूतिशील, आदर्शवादी और उदार।' },
      },
      destiny: {
        1: { title: 'नेतृत्व मार्ग', desc: 'आत्मनिर्भरता, नवाचार और नेतृत्व का मार्ग।' },
        2: { title: 'सामंजस्य मार्ग', desc: 'सहयोग, कूटनीति और साझेदारी का मार्ग।' },
        3: { title: 'अभिव्यक्ति मार्ग', desc: 'संचार, रचनात्मकता और आनंद फैलाने का मार्ग।' },
        4: { title: 'स्थिरता मार्ग', desc: 'मजबूत नींव रखने, अनुशासन और सेवा का मार्ग।' },
        5: { title: 'परिवर्तन मार्ग', desc: 'बहुमुखी प्रतिभा, रोमांच और जीवन के अनुभवों का मार्ग।' },
        6: { title: 'सेवा मार्ग', desc: 'पारिवारिक जिम्मेदारी, प्रेम और उपचार का मार्ग।' },
        7: { title: 'ज्ञान मार्ग', desc: 'बुद्धि, ध्यान और आध्यात्मिक खोज का मार्ग।' },
        8: { title: 'सफलता मार्ग', desc: 'अधिकार, वित्तीय प्रबंधन और संगठन का मार्ग।' },
        9: { title: 'मानवता मार्ग', desc: 'सार्वभौमिक प्रेम, करुणा और वैश्विक चेतना का मार्ग।' },
      }
    };
  }
  if (lang === 'mr') {
    return {
      personality: {
        1: { title: 'नेता (Leader)', desc: 'स्वतंत्र, महत्त्वाकांक्षी आणि दृढनिश्चयी.' },
        2: { title: 'शांततादूत (Peacemaker)', desc: 'सहकारी, संवेदनशील आणि मुत्सद्दी.' },
        3: { title: 'सर्जनशील (Creative)', desc: 'अभिव्यक्त करणारा, आनंदी आणि सामाजिक.' },
        4: { title: 'निर्माता (Builder)', desc: 'व्यावहारिक, शिस्तप्रिय आणि तपशीलवार काम करणारे.' },
        5: { title: 'संशोधक (Explorer)', desc: 'धाडसी, गतिमान आणि स्वातंत्र्यप्रिय.' },
        6: { title: 'पालक (Nurturer)', desc: 'जबाबदार, काळजीवाहू आणि कलात्मक.' },
        7: { title: 'जिज्ञासू (Seeker)', desc: 'विश्लेषणात्मक, आध्यात्मिक आणि अंतर्मुखी.' },
        8: { title: 'यशस्वी (Achiever)', desc: 'ध्येयवादी, शक्तिशाली आणि भौतिक यश मिळवणारे.' },
        9: { title: 'परोपकारी (Humanitarian)', desc: 'दयाळू, आदर्शवादी आणि उदार.' },
      },
      destiny: {
        1: { title: 'नेतृत्व मार्ग', desc: 'आत्मनिर्भरता, नाविन्य आणि नेतृत्व मिळवण्याचा मार्ग.' },
        2: { title: 'सामंजस्य मार्ग', desc: 'सहकार्य, मुत्सद्देगिरी आणि भागीदारीचा मार्ग.' },
        3: { title: 'अभिव्यक्ती मार्ग', desc: 'संवाद, सर्जनशीलता आणि आनंद पसरवण्याचा मार्ग.' },
        4: { title: 'स्थिरता मार्ग', desc: 'मजबूत पाया रचण्याचा, शिस्त आणि सेवेचा मार्ग.' },
        5: { title: 'बदल मार्ग', desc: 'अष्टपैलू पात्रता, साहस आणि जीवन अनुभवांचा मार्ग.' },
        6: { title: 'सेवा मार्ग', desc: 'कौटुंबिक जबाबदारी, प्रेम आणि सेवा करण्याचा मार्ग.' },
        7: { title: 'ज्ञान मार्ग', desc: 'बुद्धी, ध्यान आणि आध्यात्मिक शोधाचा मार्ग.' },
        8: { title: 'यशस्वी मार्ग', desc: 'अधिकार, आर्थिक नियोजन आणि व्यवस्थापनाचा मार्ग.' },
        9: { title: 'मानवता मार्ग', desc: 'वैश्विक प्रेम, सहानुभूती आणि जागतिक कल्याणाचा मार्ग.' },
      }
    };
  }
  // English default
  return {
    personality: {
      1: { title: 'Leader', desc: 'Independent, ambitious, and strong-willed.' },
      2: { title: 'Peacemaker', desc: 'Cooperative, sensitive, and diplomatic.' },
      3: { title: 'Creative', desc: 'Expressive, joyful, and highly social.' },
      4: { title: 'Builder', desc: 'Practical, disciplined, and detail-oriented.' },
      5: { title: 'Explorer', desc: 'Adventurous, dynamic, and freedom-loving.' },
      6: { title: 'Nurturer', desc: 'Responsible, caring, and harmonious.' },
      7: { title: 'Seeker', desc: 'Analytical, spiritual, and introspective.' },
      8: { title: 'Achiever', desc: 'Goal-oriented, powerful, and successful.' },
      9: { title: 'Humanitarian', desc: 'Compassionate, idealistic, and generous.' },
    },
    destiny: {
      1: { title: 'Leadership', desc: 'Path of self-reliance, innovation, and guiding others.' },
      2: { title: 'Harmony', desc: 'Path of collaboration, diplomacy, and peace-keeping.' },
      3: { title: 'Expression', desc: 'Path of communication, creativity, and spreading joy.' },
      4: { title: 'Stability', desc: 'Path of building strong foundations, discipline, and service.' },
      5: { title: 'Freedom', desc: 'Path of versatility, experiencing life, and adapting to change.' },
      6: { title: 'Service', desc: 'Path of family responsibility, loving nurture, and healing.' },
      7: { title: 'Wisdom', desc: 'Path of study, introspection, and spiritual analysis.' },
      8: { title: 'Abundance', desc: 'Path of power, organizing, and material/financial success.' },
      9: { title: 'Humanitarian', desc: 'Path of universal love, compassion, and global healing.' },
    }
  };
};

export default function BookAppointmentPage() {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const traits = getTraits(lang);

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
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const personalityNumber = birthdate ? getPersonalityNumber(birthdate) : 0;
  const destinyNumber = birthdate ? getDestinyNumber(birthdate) : 0;
  const zodiacSign = birthdate ? getZodiacSign(birthdate) : '';

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

  const onSubmit = async (data: AppointmentFormData) => {
    const service = services.find((s) => s.id === data.serviceId);
    setSubmitting(true);
    try {
      await createAppointment({
        name: data.name,
        phone: data.phone,
        email: data.email,
        serviceId: data.serviceId,
        serviceTitle: service?.title ?? '',
        fees: service?.fees ?? '',
        birthdate: data.birthdate,
        personalityNumber,
        destinyNumber,
        zodiacSign,
        message: data.message ?? '',
        status: 'pending',
        paid: false,
      });
      setConfirmed(true);
      toast.success(t('book.success'));
      reset();
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
                    const active = selectedServiceId === service.id;
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
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
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    {...register('birthdate')}
                    className={inputClass}
                  />
                  {errors.birthdate && <p className="text-xs text-red-500 mt-1">{errors.birthdate.message}</p>}
                </div>

                {/* Dynamically computed Numerology profile */}
                {birthdate && personalityNumber > 0 && destinyNumber > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <h3 className="font-playfair font-bold text-text text-base">
                        {t('book.numerologyDetails')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Personality Number */}
                      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-100/50 flex flex-col items-center text-center shadow-sm">
                        <span className="text-xs font-semibold text-text/50 uppercase tracking-wider">
                          {t('book.personalityNumber')}
                        </span>
                        <span className="text-4xl font-extrabold text-primary my-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
                          {personalityNumber}
                        </span>
                        <span className="text-xs font-bold text-text/80 mb-1">
                          {traits.personality[personalityNumber as keyof typeof traits.personality]?.title}
                        </span>
                        <p className="text-[11px] text-text/60 leading-relaxed">
                          {traits.personality[personalityNumber as keyof typeof traits.personality]?.desc}
                        </p>
                      </div>

                      {/* Destiny Number */}
                      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-100/50 flex flex-col items-center text-center shadow-sm">
                        <span className="text-xs font-semibold text-text/50 uppercase tracking-wider">
                          {t('book.destinyNumber')}
                        </span>
                        <span className="text-4xl font-extrabold text-secondary my-2 bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent drop-shadow-sm">
                          {destinyNumber}
                        </span>
                        <span className="text-xs font-bold text-text/80 mb-1">
                          {traits.destiny[destinyNumber as keyof typeof traits.destiny]?.title}
                        </span>
                        <p className="text-[11px] text-text/60 leading-relaxed">
                          {traits.destiny[destinyNumber as keyof typeof traits.destiny]?.desc}
                        </p>
                      </div>

                      {/* Zodiac Sign */}
                      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-100/50 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-xs font-semibold text-text/50 uppercase tracking-wider">
                          {t('book.zodiacSign')}
                        </span>
                        <span className="text-3xl font-extrabold text-text my-2.5">
                          {zodiacSign === 'Aries' && '♈'}
                          {zodiacSign === 'Taurus' && '♉'}
                          {zodiacSign === 'Gemini' && '♊'}
                          {zodiacSign === 'Cancer' && '♋'}
                          {zodiacSign === 'Leo' && '♌'}
                          {zodiacSign === 'Virgo' && '♍'}
                          {zodiacSign === 'Libra' && '♎'}
                          {zodiacSign === 'Scorpio' && '♏'}
                          {zodiacSign === 'Sagittarius' && '♐'}
                          {zodiacSign === 'Capricorn' && '♑'}
                          {zodiacSign === 'Aquarius' && '♒'}
                          {zodiacSign === 'Pisces' && '♓'}
                          <span className="ml-1 bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">{zodiacSign}</span>
                        </span>
                        <p className="text-[11px] text-text/50 leading-relaxed mt-1">
                          Your sun sign based on Western astrology.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
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
                  {selectedService?.fees && (
                    <p className="font-semibold text-text mb-1">
                      {t('book.fee')}: ₹{selectedService.fees}
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

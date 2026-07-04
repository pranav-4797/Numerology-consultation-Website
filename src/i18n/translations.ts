export type Lang = 'en' | 'hi' | 'mr';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  hi: 'हिं',
  mr: 'मर',
};

type Dictionary = Record<string, string>;

const en: Dictionary = {
  // Navbar
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.services': 'Services',
  'nav.workshops': 'Workshops',
  'nav.events': 'Events',
  'nav.blog': 'Blog',
  'nav.gallery': 'Gallery',
  'nav.testimonials': 'Testimonials',
  'nav.contact': 'Contact',
  'nav.bookConsultation': 'Book Consultation',

  // Footer
  'footer.tagline':
    'Transform your life with the ancient wisdom of Numerology, Vastu Shastra, and holistic energy sciences. Discover your true potential through personalized consultations.',
  'footer.quickLinks': 'Quick Links',
  'footer.ourServices': 'Our Services',
  'footer.contactUs': 'Contact Us',
  'footer.rights': 'All rights reserved.',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',

  // Hero
  'hero.badge': 'Transform Your Life with Ancient Wisdom',
  'hero.exploreServices': 'Explore Services',

  // Contact form
  'contact.fullName': 'Full Name',
  'contact.fullNamePlaceholder': 'Enter your full name',
  'contact.phone': 'Phone Number',
  'contact.email': 'Email Address',
  'contact.message': 'Message',
  'contact.messagePlaceholder': 'Tell us how we can help you...',
  'contact.send': 'Send Message',
  'contact.sending': 'Sending...',
  'contact.success': 'Thank you! We will get back to you soon.',
  'contact.error': 'Something went wrong. Please try again.',

  // Workshop card / registration
  'workshop.seatsAvailable': 'seats available',
  'workshop.seatsFull': 'Seats Full',
  'workshop.registerNow': 'Register Now',
  'register.title': 'Register for this Workshop',
  'register.confirm': 'Confirm Registration',
  'register.registering': 'Registering...',
  'register.success': 'Registration confirmed! We will contact you with payment details.',
  'register.seatsFull': 'Sorry, all seats for this workshop are now full.',
  'register.paymentNote':
    'Fees are payable offline — our team will contact you on WhatsApp with payment details after registration.',

  // Booking
  'book.title': 'Book an Appointment',
  'book.subtitle': 'Choose a service, pick a convenient date and time, and we will confirm your consultation.',
  'book.selectService': 'Choose a Service',
  'book.selectDate': 'Select Date',
  'book.selectTime': 'Select Time Slot',
  'book.yourDetails': 'Your Details',
  'book.notes': 'Anything you would like to share (optional)',
  'book.notesPlaceholder': 'Your questions or specific concerns...',
  'book.fee': 'Consultation Fee',
  'book.feeOnRequest': 'Shared on confirmation',
  'book.paymentNote':
    'Payment is settled at the consultation — our team will share the details after confirming your booking.',
  'book.confirm': 'Confirm Booking',
  'book.booking': 'Booking...',
  'book.success': 'Appointment request received! We will confirm your slot shortly.',
  'book.error': 'Something went wrong. Please try again.',
};

const hi: Dictionary = {
  'nav.home': 'होम',
  'nav.about': 'हमारे बारे में',
  'nav.services': 'सेवाएं',
  'nav.workshops': 'कार्यशालाएं',
  'nav.events': 'कार्यक्रम',
  'nav.blog': 'ब्लॉग',
  'nav.gallery': 'गैलरी',
  'nav.testimonials': 'प्रशंसापत्र',
  'nav.contact': 'संपर्क',
  'nav.bookConsultation': 'परामर्श बुक करें',

  'footer.tagline':
    'अंकशास्त्र, वास्तु शास्त्र और समग्र ऊर्जा विज्ञान के प्राचीन ज्ञान से अपना जीवन बदलें। व्यक्तिगत परामर्श के माध्यम से अपनी वास्तविक क्षमता को पहचानें।',
  'footer.quickLinks': 'त्वरित लिंक',
  'footer.ourServices': 'हमारी सेवाएं',
  'footer.contactUs': 'संपर्क करें',
  'footer.rights': 'सर्वाधिकार सुरक्षित।',
  'footer.privacy': 'गोपनीयता नीति',
  'footer.terms': 'सेवा की शर्तें',

  'hero.badge': 'प्राचीन ज्ञान से अपना जीवन बदलें',
  'hero.exploreServices': 'सेवाएं देखें',

  'contact.fullName': 'पूरा नाम',
  'contact.fullNamePlaceholder': 'अपना पूरा नाम लिखें',
  'contact.phone': 'फोन नंबर',
  'contact.email': 'ईमेल पता',
  'contact.message': 'संदेश',
  'contact.messagePlaceholder': 'बताएं हम आपकी कैसे मदद कर सकते हैं...',
  'contact.send': 'संदेश भेजें',
  'contact.sending': 'भेजा जा रहा है...',
  'contact.success': 'धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।',
  'contact.error': 'कुछ गलत हो गया। कृपया फिर से प्रयास करें।',

  'workshop.seatsAvailable': 'सीटें उपलब्ध',
  'workshop.seatsFull': 'सीटें भर गईं',
  'workshop.registerNow': 'अभी रजिस्टर करें',
  'register.title': 'इस कार्यशाला के लिए रजिस्टर करें',
  'register.confirm': 'रजिस्ट्रेशन कन्फर्म करें',
  'register.registering': 'रजिस्टर हो रहा है...',
  'register.success': 'रजिस्ट्रेशन हो गया! भुगतान विवरण के लिए हम आपसे संपर्क करेंगे।',
  'register.seatsFull': 'क्षमा करें, इस कार्यशाला की सभी सीटें भर चुकी हैं।',
  'register.paymentNote':
    'शुल्क ऑफलाइन देय है — रजिस्ट्रेशन के बाद हमारी टीम WhatsApp पर भुगतान विवरण साझा करेगी।',

  'book.title': 'अपॉइंटमेंट बुक करें',
  'book.subtitle': 'सेवा चुनें, सुविधाजनक तारीख और समय चुनें, और हम आपका परामर्श कन्फर्म करेंगे।',
  'book.selectService': 'सेवा चुनें',
  'book.selectDate': 'तारीख चुनें',
  'book.selectTime': 'समय चुनें',
  'book.yourDetails': 'आपकी जानकारी',
  'book.notes': 'कुछ और बताना चाहें (वैकल्पिक)',
  'book.notesPlaceholder': 'आपके प्रश्न या विशेष चिंताएं...',
  'book.fee': 'परामर्श शुल्क',
  'book.feeOnRequest': 'पुष्टि पर साझा किया जाएगा',
  'book.paymentNote':
    'भुगतान परामर्श के समय होगा — बुकिंग कन्फर्म होने के बाद हमारी टीम विवरण साझा करेगी।',
  'book.confirm': 'बुकिंग कन्फर्म करें',
  'book.booking': 'बुक हो रहा है...',
  'book.success': 'अपॉइंटमेंट अनुरोध मिल गया! हम जल्द ही आपका स्लॉट कन्फर्म करेंगे।',
  'book.error': 'कुछ गलत हो गया। कृपया फिर से प्रयास करें।',
};

const mr: Dictionary = {
  'nav.home': 'मुख्यपृष्ठ',
  'nav.about': 'आमच्याबद्दल',
  'nav.services': 'सेवा',
  'nav.workshops': 'कार्यशाळा',
  'nav.events': 'कार्यक्रम',
  'nav.blog': 'ब्लॉग',
  'nav.gallery': 'गॅलरी',
  'nav.testimonials': 'अभिप्राय',
  'nav.contact': 'संपर्क',
  'nav.bookConsultation': 'सल्लामसलत बुक करा',

  'footer.tagline':
    'अंकशास्त्र, वास्तुशास्त्र आणि समग्र ऊर्जा विज्ञानाच्या प्राचीन ज्ञानाने आपले जीवन बदला. वैयक्तिक सल्लामसलतीद्वारे आपली खरी क्षमता ओळखा.',
  'footer.quickLinks': 'जलद दुवे',
  'footer.ourServices': 'आमच्या सेवा',
  'footer.contactUs': 'संपर्क करा',
  'footer.rights': 'सर्व हक्क राखीव.',
  'footer.privacy': 'गोपनीयता धोरण',
  'footer.terms': 'सेवा अटी',

  'hero.badge': 'प्राचीन ज्ञानाने आपले जीवन बदला',
  'hero.exploreServices': 'सेवा पहा',

  'contact.fullName': 'पूर्ण नाव',
  'contact.fullNamePlaceholder': 'आपले पूर्ण नाव लिहा',
  'contact.phone': 'फोन नंबर',
  'contact.email': 'ईमेल पत्ता',
  'contact.message': 'संदेश',
  'contact.messagePlaceholder': 'आम्ही तुमची कशी मदत करू शकतो ते सांगा...',
  'contact.send': 'संदेश पाठवा',
  'contact.sending': 'पाठवत आहे...',
  'contact.success': 'धन्यवाद! आम्ही लवकरच तुमच्याशी संपर्क साधू.',
  'contact.error': 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',

  'workshop.seatsAvailable': 'जागा उपलब्ध',
  'workshop.seatsFull': 'जागा संपल्या',
  'workshop.registerNow': 'आता नोंदणी करा',
  'register.title': 'या कार्यशाळेसाठी नोंदणी करा',
  'register.confirm': 'नोंदणी निश्चित करा',
  'register.registering': 'नोंदणी होत आहे...',
  'register.success': 'नोंदणी झाली! पेमेंट तपशीलांसाठी आम्ही तुमच्याशी संपर्क साधू.',
  'register.seatsFull': 'क्षमस्व, या कार्यशाळेच्या सर्व जागा भरल्या आहेत.',
  'register.paymentNote':
    'शुल्क ऑफलाइन देय आहे — नोंदणीनंतर आमची टीम WhatsApp वर पेमेंट तपशील पाठवेल.',

  'book.title': 'अपॉइंटमेंट बुक करा',
  'book.subtitle': 'सेवा निवडा, सोयीची तारीख आणि वेळ निवडा, आणि आम्ही तुमची सल्लामसलत निश्चित करू.',
  'book.selectService': 'सेवा निवडा',
  'book.selectDate': 'तारीख निवडा',
  'book.selectTime': 'वेळ निवडा',
  'book.yourDetails': 'तुमची माहिती',
  'book.notes': 'आणखी काही सांगायचे असल्यास (ऐच्छिक)',
  'book.notesPlaceholder': 'तुमचे प्रश्न किंवा विशेष चिंता...',
  'book.fee': 'सल्लामसलत शुल्क',
  'book.feeOnRequest': 'पुष्टीनंतर कळवले जाईल',
  'book.paymentNote':
    'पेमेंट सल्लामसलतीच्या वेळी होईल — बुकिंग निश्चित झाल्यावर आमची टीम तपशील पाठवेल.',
  'book.confirm': 'बुकिंग निश्चित करा',
  'book.booking': 'बुक होत आहे...',
  'book.success': 'अपॉइंटमेंट विनंती मिळाली! आम्ही लवकरच तुमचा स्लॉट निश्चित करू.',
  'book.error': 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
};

export const translations: Record<Lang, Dictionary> = { en, hi, mr };

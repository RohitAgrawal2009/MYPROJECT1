import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ShieldCheck, HeartHandshake, IndianRupee, HelpCircle, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  const faqs = [
    {
      q: 'Does JobBond take any commission cut from the worker’s earnings?',
      q_hi: 'क्या जॉबबॉन्ड श्रमिक की कमाई से कोई कमीशन काटता है?',
      a: 'No. JobBond is committed to zero commission deductions. The entire agreed amount is paid directly by the customer to the worker.',
      a_hi: 'नहीं। जॉबबॉन्ड शून्य कमीशन कटौती के लिए प्रतिबद्ध है। पूरी तय की गई राशि ग्राहक द्वारा सीधे कारीगर को दी जाती है।',
    },
    {
      q: 'How does JobBond protect customer and worker privacy?',
      q_hi: 'जॉबबॉन्ड ग्राहक और श्रमिक की गोपनीयता की रक्षा कैसे करता है?',
      a: 'We do not publicly expose private phone numbers or exact residential addresses. Contact details are shared only after an enquiry or job application is accepted by both parties.',
      a_hi: 'हम सार्वजनिक रूप से मोबाइल नंबर या सटीक घरेलू पते नहीं दिखाते। केवल दोनों पक्षों द्वारा पूछताछ या आवेदन स्वीकार करने के बाद ही संपर्क विवरण साझा किया जाता है।',
    },
    {
      q: 'Can a worker set their own daily and hourly charges?',
      q_hi: 'क्या कारीगर अपनी दैनिक और प्रति घंटा दरें खुद तय कर सकते हैं?',
      a: 'Yes! Workers have complete autonomy to specify their standard daily rate and hourly rates based on their local market and experience.',
      a_hi: 'हाँ! कारीगरों को अपने स्थानीय बाजार और अनुभव के आधार पर अपनी मानक दैनिक और प्रति घंटा दरें तय करने की पूरी आजादी है।',
    },
    {
      q: 'What types of work can be posted on JobBond?',
      q_hi: 'जॉबबॉन्ड पर किस प्रकार के काम पोस्ट किए जा सकते हैं?',
      a: 'Any household, commercial, or agricultural requirements: electrical fixing, plumbing, carpentry, wall painting, home deep cleaning, tutoring, farm labour, shifting helpers, and appliance servicing.',
      a_hi: 'घरेलू, व्यावसायिक या कृषि संबंधी कोई भी कार्य: बिजली मरम्मत, नलसाजी, बढ़ईगीरी, दीवार पेंटिंग, घर की गहरी सफाई, ट्यूशन, कृषि मजदूरी, शिफ्टिंग सहायक और घरेलू उपकरण मरम्मत।',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* About Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Connecting Skills. Creating Opportunities.</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            About JobBond India
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            JobBond was built to bridge the gap between Indian households, agricultural farms, and local skilled & unskilled workers, fostering mutual respect, fair wages, and direct employment without intermediaries.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">100% Fair Wages</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every rupee negotiated belongs to the worker. Zero platform commission ensures affordable hiring for customers and dignified income for craftspeople.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy First</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never collect unnecessary national identity cards in initial onboarding and never expose personal details to spammers or telemarketers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Empowering Trades</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Electricians, plumbers, painters, cleaners, farm operators, and labourers can create a verified digital portfolio and build lifelong local trust.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'hi' ? faq.q_hi : faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {language === 'hi' ? faq.a_hi : faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

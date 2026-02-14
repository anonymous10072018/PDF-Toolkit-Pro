
import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, MessageSquare, Info } from 'lucide-react';
import { useLanguage } from '../App';

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">{t.contact.title}</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden p-8 md:p-16 relative">
          {/* Background Decorative Blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col items-center p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="bg-blue-600 text-white p-4 rounded-2xl mb-6 shadow-xl shadow-blue-200">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{t.contact.emailLabel}</h3>
                <a href="mailto:byndathletics@gmail.com" className="text-2xl font-black text-gray-900 hover:text-blue-600 transition-colors break-all text-center">
                  byndathletics@gmail.com
                </a>
              </div>

              <div className="flex flex-col items-center p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 hover:shadow-lg transition-shadow">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl mb-6 shadow-xl shadow-indigo-200">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{t.contact.callLabel}</h3>
                <a href="tel:09217193772" className="text-2xl font-black text-gray-900 hover:text-indigo-600 transition-colors">
                  09217193772
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Facebook className="w-6 h-6 mr-3 text-blue-600" />
                {t.contact.socialTitle}
              </h3>
              <p className="text-gray-500 font-medium mb-8 text-center max-w-sm leading-relaxed">
                {t.contact.socialDesc}
              </p>
              <a 
                href="https://www.facebook.com/Yuwenwei05" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1"
              >
                {t.contact.socialButton}
              </a>
            </div>

            <div className="mt-12 p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-start">
              <div className="bg-blue-50 p-3 rounded-xl mr-5 flex-shrink-0 text-blue-600">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{t.contact.hoursTitle}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {t.contact.hoursDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

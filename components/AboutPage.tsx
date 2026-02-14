
import React, { useEffect } from 'react';
import { ShieldCheck, Zap, Globe, Users } from 'lucide-react';
import { useLanguage } from '../App';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
           <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-blue-200 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-indigo-200 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">{t.about.mission}</h1>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            {t.about.missionDesc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">{t.about.whyTitle}</h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-2xl mr-4 text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t.about.privacyTitle}</h3>
                    <p className="text-gray-500">{t.about.privacyDesc}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-50 p-3 rounded-2xl mr-4 text-indigo-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t.about.perfTitle}</h3>
                    <p className="text-gray-500">{t.about.perfDesc}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-50 p-3 rounded-2xl mr-4 text-green-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t.about.globalTitle}</h3>
                    <p className="text-gray-500">{t.about.globalDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000" 
                  alt="Modern Office" 
                  className="w-full h-auto rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-black mb-1">{t.about.stat1.split(' ')[0]}</p>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">{t.about.stat1.split(' ').slice(1).join(' ')}</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">{t.about.stat2.split(' ')[0]}</p>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">{t.about.stat2.split(' ').slice(1).join(' ')}</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">{t.about.stat3.split(' ')[0]}</p>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">{t.about.stat3.split(' ').slice(1).join(' ')}</p>
            </div>
            <div>
              <p className="text-4xl font-black mb-1">{t.about.stat4.split(' ')[0]}</p>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">{t.about.stat4.split(' ').slice(1).join(' ')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

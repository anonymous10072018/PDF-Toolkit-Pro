
import React, { useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, ServerCrash, RefreshCw } from 'lucide-react';
import { useLanguage } from '../App';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t.privacyPolicy.title}</h1>
          <p className="text-gray-500 font-medium">{t.privacyPolicy.subtitle}</p>
        </div>

        <div className="prose prose-blue max-w-none space-y-12">
          <section className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-600 text-white p-3 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">{t.privacyPolicy.retentionTitle}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              {t.privacyPolicy.retentionDesc}
            </p>
          </section>

          <section className="p-8 md:p-12 rounded-[2.5rem] border border-gray-100">
             <div className="flex items-center space-x-4 mb-6">
              <div className="bg-indigo-600 text-white p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">{t.privacyPolicy.securityTitle}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium mb-6">
              {t.privacyPolicy.securityDesc}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-center text-gray-700 font-semibold bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                <RefreshCw className="w-4 h-4 mr-3 text-blue-500" /> {t.privacyPolicy.points.purging}
              </li>
              <li className="flex items-center text-gray-700 font-semibold bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                <Lock className="w-4 h-4 mr-3 text-blue-500" /> {t.privacyPolicy.points.encryption}
              </li>
              <li className="flex items-center text-gray-700 font-semibold bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                <EyeOff className="w-4 h-4 mr-3 text-blue-500" /> {t.privacyPolicy.points.noScraping}
              </li>
              <li className="flex items-center text-gray-700 font-semibold bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                <ServerCrash className="w-4 h-4 mr-3 text-blue-500" /> {t.privacyPolicy.points.infra}
              </li>
            </ul>
          </section>

          <section className="bg-blue-50 p-8 md:p-12 rounded-[2.5rem] border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{t.privacyPolicy.updatesTitle}</h2>
            <p className="text-blue-800 leading-relaxed font-medium">
              {t.privacyPolicy.updatesDesc}
            </p>
            <p className="mt-8 text-blue-600 text-sm font-bold uppercase tracking-widest">
              {t.privacyPolicy.lastUpdated}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

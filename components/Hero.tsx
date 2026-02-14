
import React from 'react';
import { useLanguage } from '../App';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wider">{t.hero.badge}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          {t.hero.title} <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">{t.hero.titleHighlight}</span><br className="hidden md:block" /> {t.hero.titleSub}
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => scrollToSection('tools')}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            {t.hero.explore}
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            {t.hero.howItWorks}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

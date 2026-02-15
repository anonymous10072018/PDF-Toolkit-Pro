
import React from 'react';
import { useLanguage } from '../App';
import { Sparkles, ArrowRight, ShieldCheck, FileStack } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-16 pb-28 lg:pt-24 lg:pb-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Title Icon / Logo */}
        <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-1000">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 rotate-6 transform hover:rotate-0 transition-transform duration-500">
            <FileStack className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-md border border-white/90 px-5 py-2.5 rounded-full mb-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex h-5 w-5 rounded-full bg-blue-600/10 items-center justify-center">
            <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
          </div>
          <span className="text-blue-900 text-[10px] font-black uppercase tracking-[0.25em]">{t.hero.badge}</span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black text-gray-900 mb-10 tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {t.hero.title} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 animate-gradient">
            {t.hero.titleHighlight}
          </span><br />
          <span className="text-gray-900/30">{t.hero.titleSub}</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed font-semibold animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-5 sm:space-y-0 sm:space-x-8 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          <button 
            onClick={() => scrollToSection('tools')}
            className="w-full sm:w-auto px-12 py-6 bg-gray-900 text-white rounded-[1.75rem] font-black text-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] hover:bg-blue-600 hover:shadow-blue-200 transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center group"
          >
            {t.hero.explore}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="w-full sm:w-auto px-12 py-6 glass-morphism text-gray-900 rounded-[1.75rem] font-black text-xl hover:bg-white transition-all transform hover:-translate-y-2 active:scale-95 shadow-sm border-white"
          >
            {t.hero.howItWorks}
          </button>
        </div>

        <div className="mt-20 flex items-center justify-center space-x-12 opacity-40 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Enterprise Encrypted</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">AI Assisted</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

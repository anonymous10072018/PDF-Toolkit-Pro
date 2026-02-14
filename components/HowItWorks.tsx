
import React from 'react';
import { UploadCloud, Zap, Download } from 'lucide-react';
import { useLanguage } from '../App';

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      icon: <UploadCloud className="w-8 h-8" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      icon: <Download className="w-8 h-8" />,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{t.howItWorks.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">{t.howItWorks.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 border-t-2 border-dashed border-gray-100 -z-10"></div>
              )}
              <div className={`${step.color} w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-gray-100 group-hover:scale-110 transition-transform duration-500`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

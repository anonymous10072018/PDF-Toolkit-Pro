
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    atOptions?: any;
  }
}

const AdBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const injectAd = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const oldScript = document.getElementById('horizontal-ad-script');
        if (oldScript) oldScript.remove();

        (window as any).atOptions = {
          'key' : 'ead020deef05f09d29f11b1836c45b74',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };

        const script = document.createElement('script');
        script.id = 'horizontal-ad-script';
        script.src = "https://welcomingexpulsion.com/ead020deef05f09d29f11b1836c45b74/invoke.js";
        script.async = true;
        
        containerRef.current.appendChild(script);
      }
    };

    const timer = setTimeout(injectAd, 1500); 
    return () => clearTimeout(timer);
  }, [location.key]);

  return (
    <div className="w-full bg-white border-t border-gray-100 pt-16 pb-12 mt-12 relative z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-6 mb-8 opacity-60">
            <span className="h-[1px] w-12 bg-blue-200"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
              Support Our Mission
            </span>
            <span className="h-[1px] w-12 bg-blue-200"></span>
          </div>
          
          <div className="w-full flex justify-center py-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100/50 shadow-inner max-w-[440px]">
            <div 
              ref={containerRef}
              className="min-h-[50px] w-full max-w-[320px] flex justify-center items-center overflow-hidden"
            >
              <div className="text-gray-300 text-[10px] font-black animate-pulse tracking-[0.5em] uppercase">
                Loading Ad...
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center max-w-sm">
            <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
              Help us keep PDF Toolkit Pro <span className="text-blue-600">free forever</span> by allowing ads to be shown. Your support keeps our high-performance engines running for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;

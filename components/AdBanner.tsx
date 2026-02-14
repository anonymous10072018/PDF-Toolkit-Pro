
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    atOptions?: any;
  }
}

const AdBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'ad-script-invoke-v2';
    
    const injectAd = () => {
      if (containerRef.current && !document.getElementById(scriptId)) {
        // Set the global atOptions required by the ad script
        window.atOptions = {
          'key': 'ead020deef05f09d29f11b1836c45b74',
          'format': 'iframe',
          'height': 50,
          'width': 320,
          'params': {}
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://welcomingexpulsion.com/ead020deef05f09d29f11b1836c45b74/invoke.js";
        script.async = true;
        
        // Append the script directly to our container so it renders within the styled area
        containerRef.current.appendChild(script);
      }
    };

    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(injectAd, 500);

    return () => {
      clearTimeout(timer);
      // Clean up the global variable on unmount if necessary
      // window.atOptions = undefined;
    };
  }, []);

  return (
    <div className="w-full bg-gray-50/50 border-t border-gray-100 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <span className="h-[1px] w-8 bg-gray-200"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Advertisement
            </span>
            <span className="h-[1px] w-8 bg-gray-200"></span>
          </div>
          
          <div 
            ref={containerRef}
            className="min-h-[60px] w-full max-w-[340px] flex justify-center items-center overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md"
          >
            {/* The ad script will inject the iframe here */}
            <div className="text-gray-300 text-[10px] animate-pulse font-medium py-4">
              Loading sponsored content...
            </div>
          </div>
          
          <p className="mt-4 text-[9px] text-gray-400 max-w-xs text-center leading-relaxed font-medium">
            Help keep PDF Toolkit Pro free.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;

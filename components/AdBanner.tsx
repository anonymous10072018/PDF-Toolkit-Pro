
import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Unique ID for the ad script to avoid duplicates
    const scriptId = 'ad-script-invoke-unique';
    const containerId = 'container-cd12c0220b988b73040737746ada55ac';

    // Cleanup function to remove script if component unmounts 
    // (though usually these scripts are intended to be global)
    const injectAd = () => {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://welcomingexpulsion.com/cd12c0220b988b73040737746ada55ac/invoke.js";
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        
        // Append script to the end of body or the container itself
        document.body.appendChild(script);
      }
    };

    // Small timeout to ensure React has fully committed the DOM node
    const timer = setTimeout(() => {
      injectAd();
    }, 500);

    return () => clearTimeout(timer);
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
            id="container-cd12c0220b988b73040737746ada55ac" 
            className="min-h-[120px] w-full max-w-[728px] flex justify-center items-center overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md"
          >
            {/* The ad script will inject content here */}
            <div className="text-gray-300 text-xs animate-pulse font-medium">
              Loading sponsored content...
            </div>
          </div>
          
          <p className="mt-4 text-[9px] text-gray-400 max-w-xs text-center leading-relaxed">
            Ads help us keep PDF Toolkit Pro free for everyone. Thank you for your support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;

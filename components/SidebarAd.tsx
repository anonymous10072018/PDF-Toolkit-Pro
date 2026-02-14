
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarAdProps {
  side: 'left' | 'right';
}

const SidebarAd: React.FC<SidebarAdProps> = ({ side }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const injectAd = () => {
      if (containerRef.current) {
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Remove existing scripts for this side
        const scriptId = `sidebar-v-script-${side}`;
        const oldScript = document.getElementById(scriptId);
        if (oldScript) oldScript.remove();

        // 468x60 Horizontal script used as vertical sky-scraper via rotation
        (window as any).atOptions = {
          'key' : '0167e11382b564e21fa0594f1cd08377',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://welcomingexpulsion.com/0167e11382b564e21fa0594f1cd08377/invoke.js";
        script.async = true;
        
        containerRef.current.appendChild(script);
      }
    };

    const delay = side === 'left' ? 200 : 800;
    const timer = setTimeout(injectAd, delay);
    return () => clearTimeout(timer);
  }, [location.key, side]);

  return (
    <div className="sticky top-40 w-full flex flex-col items-center">
      <div className="flex flex-col items-center group pt-10">
        {/* Sky-scraper slot container */}
        <div 
          className="relative flex items-center justify-center bg-white/40 backdrop-blur-md border border-gray-100 shadow-sm rounded-3xl overflow-hidden transition-all group-hover:border-blue-200 group-hover:shadow-md"
          style={{ height: '468px', width: '60px' }}
        >
          <div 
            ref={containerRef}
            className="absolute transform rotate-90 origin-center flex items-center justify-center bg-transparent"
            style={{ width: '468px', height: '60px' }}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-[10px] text-gray-200 font-black animate-pulse uppercase tracking-widest">
                AD
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAd;

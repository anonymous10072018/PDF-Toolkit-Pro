
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { TOOLS } from '../constants';
import { useLanguage } from '../App';

const ToolGrid: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section id="tools" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-12 h-[3px] bg-blue-600 rounded-full"></span>
              <span className="text-blue-600 text-xs font-black uppercase tracking-[0.5em]">Tools Catalog</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tighter">{t.toolGrid.title}</h2>
            <p className="text-gray-500 font-bold text-xl leading-relaxed">{t.toolGrid.subtitle}</p>
          </div>
          <div className="mt-10 md:mt-0 flex flex-wrap gap-4">
            {['Convert', 'Merge', 'Edit', 'Compress'].map(tag => (
              <span key={tag} className="px-6 py-2.5 glass-morphism text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white shadow-sm">{tag}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {TOOLS.map((tool, idx) => (
            <Link 
              key={tool.id} 
              to={`/tool/${tool.id}`}
              className="tool-card group p-12 rounded-[3.5rem] flex flex-col relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-all duration-700 transform group-hover:-translate-x-4 group-hover:translate-y-4`}>
                <Star className="w-32 h-32 text-gray-900 fill-current" />
              </div>
              
              <div className={`${tool.color} w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mb-12 group-hover:rotate-12 transition-all duration-700 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] group-hover:shadow-blue-200 relative z-10`}>
                {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-10 h-10' })}
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight relative z-10">{tool.title}</h3>
              <p className="text-gray-500 font-semibold leading-relaxed mb-12 flex-grow relative z-10">{tool.description}</p>
              
              <div className="flex items-center text-blue-600 font-black text-xs uppercase tracking-[0.3em] group-hover:translate-x-4 transition-all duration-700 relative z-10">
                <span>{t.toolGrid.useTool}</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:scale-125 transition-transform" />
              </div>

              <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 w-0 group-hover:w-full transition-all duration-700"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolGrid;

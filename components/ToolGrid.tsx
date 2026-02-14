
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TOOLS } from '../constants';
import { useLanguage } from '../App';

const ToolGrid: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section id="tools" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.toolGrid.title}</h2>
            <p className="text-gray-600 max-w-lg">{t.toolGrid.subtitle}</p>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-2">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">Convert</span>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">Merge</span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">Edit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOOLS.map((tool) => (
            <Link 
              key={tool.id} 
              to={`/tool/${tool.id}`}
              className="tool-card group bg-white rounded-3xl p-8 border border-gray-100 transition-all duration-300 flex flex-col"
            >
              <div className={`${tool.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-500 mb-8 flex-grow leading-relaxed">{tool.description}</p>
              <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                <span>{t.toolGrid.useTool}</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolGrid;

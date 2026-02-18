
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileStack, Facebook, Mail, Menu, X, ChevronUp, Sparkles, ChevronRight } from 'lucide-react';
import ToolGrid from './components/ToolGrid';
import Hero from './components/Hero';
import ToolPage from './components/ToolPage';
import HowItWorks from './components/HowItWorks';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdBanner from './components/AdBanner';
import SidebarAd from './components/SidebarAd';
import { Language, translations } from './translations';
import { TOOLS } from './constants';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const SEOWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    let title = "📄 PDF Toolkit Pro - Professional Online PDF & File Tools";
    let description = "Merge, split, compress, and convert PDFs online. Professional-grade toolkit for Word to PDF and unique Booklet PDF creation. Fast, secure, and free.";
    let toolName = "";

    if (location.pathname.startsWith('/tool/')) {
      const toolId = location.pathname.split('/').pop();
      const tool = TOOLS.find(tool => tool.id === toolId);
      if (tool) {
        const seoTitle = t.tools[`${tool.id}SEO`] || t.tools[tool.titleKey];
        title = `${seoTitle} | PDF Toolkit Pro`;
        description = t.tools[tool.descKey];
        toolName = t.tools[tool.titleKey];
      }
    } else if (location.pathname === '/about') {
      title = `About Us | PDF Toolkit Pro`;
    } else if (location.pathname === '/contact') {
      title = `Contact Support | PDF Toolkit Pro`;
    } else if (location.pathname === '/privacy-policy') {
      title = `Privacy Policy | PDF Toolkit Pro`;
    }

    document.title = title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (el) el.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', `https://pdfconverterhub.online${location.pathname}`);

    // Update JSON-LD
    const scriptId = 'json-ld-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": toolName ? "SoftwareApplication" : "WebSite",
      "name": toolName || "PDF Toolkit Pro",
      "url": `https://pdfconverterhub.online${location.pathname}`,
      "description": description,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      }
    };
    script.text = JSON.stringify(schema);

  }, [location.pathname, t, language]);

  return <>{children}</>;
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-[150] p-4 bg-blue-600 text-white rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

const BackgroundMesh = () => (
  <div className="bg-mesh">
    <div className="mesh-blob bg-blue-200 top-[-20%] left-[-10%]"></div>
    <div className="mesh-blob bg-indigo-200 bottom-[-20%] right-[-10%]" style={{ animationDelay: '2s' }}></div>
    <div className="mesh-blob bg-sky-100 top-[30%] left-[40%]" style={{ animationDelay: '4s', width: '600px', height: '600px' }}></div>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isToolPage = location.pathname.startsWith('/tool/');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`${!isToolPage ? 'sticky top-0' : 'relative'} z-[200] w-full transition-all duration-500 px-4 pt-6`}>
      <div className={`max-w-7xl mx-auto rounded-[2.5rem] transition-all duration-500 ${
        isScrolled ? 'glass-morphism shadow-[0_12px_40px_rgba(0,0,0,0.06)] px-10 py-2.5' : 'bg-transparent px-6 py-4'
      }`}>
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl transition-all group-hover:rotate-6 group-hover:scale-110 shadow-lg shadow-blue-200">
              <FileStack className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">PDF Toolkit<span className="text-blue-600">Pro</span></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 mt-1">Enterprise Suite</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => handleScrollTo('tools')} className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all uppercase tracking-widest">{t.nav.tools}</button>
            <Link to="/about" className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${location.pathname === '/about' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'}`}>{t.nav.about}</Link>
            <Link to="/contact" className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${location.pathname === '/contact' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'}`}>{t.nav.contact}</Link>
            <div className="w-px h-6 bg-gray-200/50 mx-4 hidden lg:block"></div>
            <button onClick={() => handleScrollTo('tools')} className="bg-gray-900 text-white px-8 py-3 rounded-[1.25rem] text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all hover:shadow-xl shadow-blue-200 active:scale-95 flex items-center group">
              {t.nav.getStarted}
              <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 p-3 hover:bg-gray-100 rounded-2xl transition-all">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4 mx-4 glass-morphism rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 overflow-hidden border border-white/40">
          <div className="p-8 space-y-4">
            <button onClick={() => handleScrollTo('tools')} className="block w-full py-4 px-6 rounded-2xl text-left text-lg font-black text-gray-900 hover:bg-blue-50 transition-all uppercase tracking-widest">{t.nav.tools}</button>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block py-4 px-6 rounded-2xl text-lg font-black text-gray-900 hover:bg-blue-50 transition-all uppercase tracking-widest">{t.nav.about}</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-4 px-6 rounded-2xl text-lg font-black text-gray-900 hover:bg-blue-50 transition-all uppercase tracking-widest">{t.nav.contact}</Link>
            <button onClick={() => handleScrollTo('tools')} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl uppercase tracking-widest mt-4">
              {t.nav.getStarted}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const languages: Language[] = ['English', 'Spanish', 'French', 'Tagalog'];

  return (
    <footer className="bg-white/60 backdrop-blur-xl border-t border-gray-100 pt-24 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-blue-600 p-2.5 rounded-2xl">
                <FileStack className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900">PDF Toolkit Pro</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium mb-8">
              {t.footer.desc}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/Yuwenwei05" target="_blank" rel="noopener noreferrer" className="bg-white p-3.5 rounded-2xl text-gray-400 hover:text-blue-600 border border-gray-100 shadow-sm transition-all transform hover:-translate-y-1">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="mailto:byndathletics@gmail.com" className="bg-white p-3.5 rounded-2xl text-gray-400 hover:text-red-500 border border-gray-100 shadow-sm transition-all transform hover:-translate-y-1">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">{t.nav.tools}</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {TOOLS.map(tool => (
                <Link key={tool.id} to={`/tool/${tool.id}`} className="text-gray-600 font-bold hover:text-blue-600 text-sm transition-colors flex items-center group">
                  <ChevronRight className="w-3 h-3 mr-2 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  {t.tools[tool.titleKey]}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">{t.footer.company}</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-600 font-bold hover:text-blue-600 text-sm transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="text-gray-600 font-bold hover:text-blue-600 text-sm transition-colors">{t.nav.contact}</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-600 font-bold hover:text-blue-600 text-sm transition-colors">{t.footer.privacy}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-12 flex flex-col md:flex-row justify-between items-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <p>&copy; 2024 PDF Toolkit Pro. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-0">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`hover:text-gray-900 transition-all px-4 py-2 rounded-full border ${language === lang ? 'text-blue-600 border-blue-100 bg-blue-50' : 'border-transparent text-gray-400'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

const App = () => {
  const [language, setLanguage] = useState<Language>('English');
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      <Router>
        <SEOWrapper>
          <div className="min-h-screen flex flex-col relative">
            <BackgroundMesh />
            <Navbar />
            <div className="flex-grow flex flex-col items-center">
              <div className="flex flex-row w-full max-w-[1600px] justify-center px-4 xl:px-8 relative">
                <div className="hidden xl:block w-[120px] flex-shrink-0"><SidebarAd side="left" /></div>
                <main className="flex-grow max-w-5xl relative z-10 py-12 md:py-24">
                  <Routes>
                    <Route path="/" element={<><Hero /><HowItWorks /><ToolGrid /></>} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/tool/:id" element={<ToolPage />} />
                  </Routes>
                </main>
                <div className="hidden xl:block w-[120px] flex-shrink-0"><SidebarAd side="right" /></div>
              </div>
              <AdBanner />
            </div>
            <Footer />
            <ScrollToTop />
          </div>
        </SEOWrapper>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
